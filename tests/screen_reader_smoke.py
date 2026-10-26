"""Scoped Orca/Chromium smoke on a private X11/D-Bus session.

Run with /usr/bin/python3 tests/screen_reader_smoke.py [--probe | --workshop].
Use --workshop only after the optional-poster source/export is frozen.
Only assistive-* evidence is written persistently. The speech log is Orca's
own output, not a DOM-to-speech emulation. Audio goes to an ALSA null device;
this does not assess pronunciation, listening comfort, or participant usability.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
from pathlib import Path
import signal
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "build/evidence"
X11 = ROOT / ".tools/x11/root/usr"
CHROME = Path(os.environ.get("BROWSER_EXECUTABLE", "/home/seb/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"))
SOURCES = ["web/index.html", "web/app.mjs", "web/views.mjs", "web/logic.mjs",
           "web/poster.mjs", "web/poster-workshop.mjs", "web/styles.css",
           "game/content/story.json", "game/content/ccpc.json"]
WORKSHOP_CASES = ['open', 'first', 'second', 'metric', 'question', 'preview-count',
                  'publish', 'revise', 'preview-rate', 'cancel', 'reopen', 'reset']


def hashes():
    return {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in SOURCES}


NODE = r'''
import { chromium } from './.tools/browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir = process.env.ASSISTIVE_EVIDENCE;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = entry => fs.appendFileSync(`${dir}/assistive-actions.jsonl`, JSON.stringify({time:Date.now()/1000,...entry})+'\n');
const browser = await chromium.launchPersistentContext(process.env.ASSISTIVE_PROFILE, {
  executablePath:process.env.ASSISTIVE_CHROME, headless:false, viewport:null,
  args:['--no-sandbox','--force-renderer-accessibility','--ozone-platform=x11',
        '--window-size=1280,900','--window-position=0,0','--disable-gpu','--no-first-run']
});
const page = browser.pages()[0];
const servedAssets=[], responseTasks=[];
let servedStory;
page.on('response', response => {
  const request=response.request();
  if (request.method()!=='GET' || !['document','script','stylesheet','fetch'].includes(request.resourceType()) ||
      new URL(response.url()).origin!==new URL(process.env.ASSISTIVE_URL).origin) return;
  responseTasks.push((async()=>{
    try {
      const body=await response.body();
      if (new URL(response.url()).pathname.endsWith('/story.json')) servedStory=JSON.parse(body);
      servedAssets.push({url:response.url(),status:response.status(),resourceType:request.resourceType(),
        bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
    } catch(error) { servedAssets.push({url:response.url(),error:error.message}); }
  })());
});
page.on('pageerror', error => log({kind:'pageerror', message:error.message}));
const xd = (...args) => execFileSync(process.env.ASSISTIVE_XDOTOOL, args, {encoding:'utf8'}).trim();
const state = () => page.evaluate(() => {
  const e=document.activeElement, s=getComputedStyle(e);
  return {tag:e.tagName,id:e.id,name:e.name,value:e.value,label:e.labels?.[0]?.textContent.trim(),
    text:e.tagName==='BODY'?'[body]':e.textContent.trim().slice(0,250),
    outline:s.outline,outlineOffset:s.outlineOffset,visible:e.checkVisibility(),
    width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth};
});
async function key(keys, label=keys, wait=850) {
  log({kind:'key',label,keys}); xd('key','--clearmodifiers',keys); await sleep(wait);
  const current=await state(); log({kind:'focus',label,...current}); return current;
}
async function tabTo(selector) {
  for (let i=0;i<60;i++) {
    if (await page.evaluate(sel=>document.activeElement.matches(sel),selector)) return;
    await key('Tab',`tab to ${selector}`,350);
  }
  throw new Error(`Keyboard could not reach ${selector}`);
}
async function activate(selector, label=selector, wait=1300) {
  await tabTo(selector); await key('Return',label,wait);
}
async function feedbackCase(name, selector, expectedState, chapter='printing') {
  const feedback=page.locator(`#activities-${chapter} .feedback`);
  await tabTo(selector);
  log({kind:'feedback-start',case:name,expectedState});
  await key('Return',`feedback case ${name}`,8000);
  log({kind:'feedback-end',case:name,expectedState,text:await feedback.innerText(),
    completion:await page.locator(`#completion-${chapter}`).innerText(),
    correct:await feedback.evaluate(e=>e.classList.contains('correct')),
    supported:await feedback.evaluate(e=>e.classList.contains('supported'))});
}
async function statusCase(name, selector) {
  await tabTo(selector); log({kind:'status-start',case:name});
  await key('Return',`completion case ${name}`,8000);
  log({kind:'status-end',case:name,text:await page.locator('#progress-summary').innerText()});
}
async function posterCase(name, action, inspect) {
  log({kind:'workshop-start',case:name});
  await action();
  log({kind:'workshop-end',case:name,...await inspect(),focus:await state()});
}
const focused = selector => page.evaluate(sel=>document.activeElement.matches(sel),selector);
async function selectPosterOption(selector, value) {
  await tabTo(selector);
  const index=await page.locator(selector).evaluate((e,v)=>[...e.options].findIndex(o=>o.value===v),value);
  if (index<0) throw new Error(`Missing workshop option ${value} in ${selector}`);
  await key('Home',`first option in ${selector}`,150);
  for (let i=0;i<index;i++) await key('Down',`select ${value} in ${selector}`,100);
  await sleep(1300);
  if (await page.locator(selector).inputValue()!==value) throw new Error(`Native selection did not reach ${value}`);
}
async function posterWorkshop() {
  const copy=servedStory?.poster_workshop;
  if (!copy) throw new Error('Workshop requested, but served story has no poster_workshop; verify the refreshed export');
  await posterCase('open',()=>activate('#open-poster-workshop','open optional poster workshop'),async()=>({
    checks:{focus:await focused('#poster-workshop-title'),visible:await page.locator('#poster-workshop').isVisible()},
    speech:[{text:copy.title}]
  }));
  const selections={};
  for (const [index,[field,value,labelKey]] of [
    ['first','state_19','first_label'],['second','state_02','second_label'],
    ['metric','count','metric_label'],['question','voices','question_label']
  ].entries()) {
    const selector=`#poster-${field}`;
    await posterCase(field,async()=>{
      if (index===0) await tabTo(selector);
      else await key('Tab',`next workshop field: ${field}`,1300);
      if (!await focused(selector)) throw new Error(`Workshop tab order did not reach ${selector}`);
      await selectPosterOption(selector,value);
    },async()=>{
      const control=await page.locator(selector).evaluate(e=>({tag:e.tagName,label:e.labels?.[0]?.textContent.trim(),
        value:e.value,selected:e.selectedOptions[0]?.textContent.trim()}));
      selections[field]=control;
      return {checks:{focus:await focused(selector),label:control.label===copy[labelKey],
        selected:control.value===value,select:control.tag==='SELECT'},
        speech:[{text:copy[labelKey]},{text:control.selected}],control};
    });
  }
  const preview=async metric=>{
    await tabTo('#preview-poster');
    await posterCase(`preview-${metric}`,()=>key('Return',`preview ${metric} poster`,8000),async()=>{
      const text=await page.locator('#poster-preview').innerText();
      const title=await page.locator('#poster-preview-title').innerText();
      const required=[selections.first.selected,selections.second.selected,selections.question.selected,copy.limit];
      return {checks:{focus:await focused('#poster-preview-title'),visible:await page.locator('#poster-preview').isVisible(),
        selectedContent:required.every(part=>text.includes(part)),publishEnabled:await page.locator('#carry-poster').isEnabled(),
        finding:title===(metric==='count'?'Más registros: NUEVO LEON.':'Mayor proporción: NUEVO LEON.')},
        speech:[{text:title,exactly:1}],title,text,
        observations:{presentation:'focus on preview finding heading',
          live_region_text:await page.locator('#story-announcements').innerText()}};
    });
  };
  await preview('count');
  await capture('workshop-preview'); await appearance('optional poster preview');
  await tabTo('#carry-poster');
  await posterCase('publish',()=>key('Return','carry authored poster to Ines',8000),async()=>{
    const text=await page.locator('#poster-meeting').innerText();
    const title=await page.locator('#poster-meeting-title').innerText();
    return {checks:{focus:await focused('#poster-meeting-title'),meeting:await page.locator('#house-hall').isVisible(),
      ballotClosed:!await page.locator('#ballot').isVisible(),finding:text.includes('Más registros: NUEVO LEON.'),
      acknowledgement:/In[eé]s/.test(text),memoryNote:text.includes(copy.memory_note)},
      speech:[{text:title,exactly:1}],title,text,
      observations:{presentation:'focus on published finding heading in meeting house',
        live_region_text:await page.locator('#story-announcements').innerText()}};
  });
  await capture('workshop-meeting');
  await key('Escape','leave Ines after carrying poster');
  await activate('[data-house="archive"]','return to archive for poster revision');
  const published=await page.locator('#poster-archive').textContent();
  await activate('#open-poster-workshop','reopen published poster');
  await posterCase('revise',()=>selectPosterOption('#poster-metric','rate'),async()=>({
    checks:{focus:await focused('#poster-metric'),previewRequired:!await page.locator('#carry-poster').isEnabled(),
      publishedUnchanged:await page.locator('#poster-archive').textContent()===published},speech:[{text:copy.rate_label}]
  }));
  await preview('rate');
  await posterCase('cancel',()=>activate('#cancel-poster','cancel revised draft'),async()=>({
    checks:{focus:await focused('#open-poster-workshop'),closed:!await page.locator('#poster-workshop').isVisible(),
      publishedUnchanged:await page.locator('#poster-archive').textContent()===published},
    speech:[{text:await page.locator('#open-poster-workshop').innerText()}]
  }));
  await posterCase('reopen',()=>activate('#open-poster-workshop','verify cancelled draft was discarded'),async()=>({
    checks:{focus:await focused('#poster-workshop-title'),publishedMetricRestored:await page.locator('#poster-metric').inputValue()==='count',
      firstRestored:await page.locator('#poster-first').inputValue()==='state_19',
      secondRestored:await page.locator('#poster-second').inputValue()==='state_02',
      questionRestored:await page.locator('#poster-question').inputValue()==='voices'},speech:[{text:copy.title}]
  }));
  await key('Escape','close optional workshop before ordinary consultation journey');
}
async function resetPosterWorkshop() {
  await posterCase('reset',()=>activate('#reset-progress','reset private test session'),async()=>({
    checks:{focus:await focused('#plaza-title'),progressCleared:/0 de 3/.test(await page.locator('#progress-summary').innerText()),
      postersCleared:await page.locator('#poster-archive, #poster-meeting, #poster-exhibit').evaluateAll(nodes=>
        nodes.length===3 && nodes.every(e=>!e.textContent.trim()))},
    speech:[{text:await page.locator('#plaza-title').innerText()}]
  }));
}
async function capture(name) {
  // CDP screenshots did not paint content reliably after native browser zoom.
  // Capture the actual private X screen, including browser zoom/focus rendering.
  execFileSync('import',['-display',process.env.DISPLAY,'-window','root',`${dir}/assistive-${name}.png`]);
}
async function appearance(label) {
  const report=await page.evaluate(() => {
    const rgba=s=>(s.match(/[\d.]+/g)||[]).map(Number);
    const blend=(a,b)=>a.slice(0,3).map((n,i)=>n*(a[3]??1)+b[i]*(1-(a[3]??1)));
    function background(e) {
      if (!e) return [255,255,255];
      return blend(rgba(getComputedStyle(e).backgroundColor),background(e.parentElement));
    }
    const luminance=c=>c.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
      .reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const rows=[];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.checkVisibility() || e.closest('[aria-hidden="true"]') || e.matches(':disabled')) continue;
      const text=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join(' ');
      if (!text) continue;
      const s=getComputedStyle(e),bg=background(e),fg=blend(rgba(s.color),bg),size=parseFloat(s.fontSize);
      const threshold=size>=24 || (size>=18.6667 && Number(s.fontWeight)>=700) ? 3:4.5;
      rows.push({tag:e.tagName,id:e.id,classes:e.className,text:text.slice(0,130),foreground:fg,background:bg,
        ratio:ratio(fg,bg),threshold,fontSize:size,fontWeight:s.fontWeight,backgroundImage:s.backgroundImage});
    }
    const meaningfulGraphics=[...document.querySelectorAll('.bar-fill')].filter(e=>e.checkVisibility()).map(e=>({
      color:getComputedStyle(e).backgroundColor,adjacent:getComputedStyle(e.parentElement).backgroundColor,
      ratio:ratio(background(e),background(e.parentElement))}));
    return {rows,meaningfulGraphics,width:innerWidth,dpr:devicePixelRatio,
      focus:{outline:getComputedStyle(document.activeElement).outline,
        background:background(document.activeElement.parentElement),
        ratio:ratio(rgba(getComputedStyle(document.activeElement).outlineColor),background(document.activeElement.parentElement))},
      documentWidth:document.documentElement.scrollWidth,
      overflowing:[...document.querySelectorAll('main button,main select,main input,main .choice')]
        .filter(e=>e.checkVisibility()).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right>innerWidth+1})
        .map(e=>({tag:e.tagName,text:e.textContent.trim(),id:e.id}))};
  });
  log({kind:'appearance',label,...report});
}
try {
  await page.goto(process.env.ASSISTIVE_URL); await page.locator('[data-house="printshop"]').waitFor();
  await sleep(1800);
  const windows=xd('search','--onlyvisible','--name','Voces de la Plaza').split('\n');
  xd('windowfocus','--sync',windows.at(-1));
  log({kind:'environment',browser:browser.browser().version(),url:page.url(),display:process.env.DISPLAY});
  await key('Escape','dismiss address suggestions');
  await key('F6','move browser focus into document',1400);
  await key('ctrl+Home','start of document',1200);
  await key('h','Orca next heading',1600);
  await key('h','Orca second heading',1600);
  await key('ctrl+Home','return to document start');
  await capture('plaza');
  await appearance('plaza 100 percent');
  await activate('.settings > summary','open reading settings');
  await key('Tab','text size label');
  await key('Tab','reduce motion label');
  await key('Tab','reset label');
  await activate('[data-house="printshop"]','enter Luz house');
  await activate('[data-start="printing"]','start printing task');
  await key('h','Orca activity heading',1600);
  await activate('.source-details > summary','expand historical source');
  await key('Insert+a','Orca switch from focus to browse for table');
  await key('t','Orca next exact-value table',1600);
  await key('alt+shift+Right','Orca table next column',1600);
  await key('alt+shift+Down','Orca first data row',1600);
  await capture('source-table');
  await tabTo('.activity input[type="radio"]');
  await key('space','select first answer');
  await feedbackCase('correct','.activity button[type="submit"]','correct');
  log({kind:'feedback',text:await page.locator('#activities-printing .feedback').innerText()});
  await key('shift+Tab','return to selected first answer');
  await key('r','Orca next radio: deliberately wrong answer');
  if (await page.evaluate(()=>document.activeElement.value)!=='nv') throw new Error('Wrong-answer fixture did not reach nv');
  await key('space','select wrong answer');
  await feedbackCase('wrong','.activity button[type="submit"]','retry');
  await feedbackCase('wrong-repeat','.activity button[type="submit"]','retry');
  await activate('[data-retry-activity]','retry returns to activity heading');
  await tabTo('.activity input[type="radio"]'); await key('space','select correct answer after retry');
  await feedbackCase('correct-after-retry','.activity button[type="submit"]','correct');
  await feedbackCase('assistance','[data-assist]','supported');
  await capture('feedback');
  await appearance('printing task and source');
  if (process.env.ASSISTIVE_PROBE!=='1') {
    // Expanded journey is intentionally native keyboard input; DOM reads only
    // identify the current focus and inspect rendered results.
    await activate('[data-next-activity]','move to second printing activity');
    for (let i=0;i<2;i++) {
      if (i===1) await feedbackCase('printing-ready','[data-assist]','supported');
      else await activate('[data-assist]','complete printing activity with explicit support',2300);
      if (i===0) await activate('[data-next-activity]','move to printing transfer');
    }
    await statusCase('printing-published','#complete-printing');
    await key('Escape','return from Luz to plaza');
    await activate('[data-house="archive"]','enter Mateo house');
    await activate('[data-start="comparison"]','start comparison task');
    await tabTo('#compare-metric');
    await key('End','switch comparison metric');
    await key('Tab','leave metric select');
    await appearance('comparison task');
    for (let i=0;i<3;i++) {
      if (i===2) await feedbackCase('comparison-ready','[data-assist]','supported','comparison');
      else await activate('[data-assist]','complete comparison activity with explicit support',2300);
      if (i<2) await activate('[data-next-activity]','next comparison activity');
    }
    await statusCase('comparison-published','#complete-comparison');
    if (process.env.ASSISTIVE_WORKSHOP==='1') await posterWorkshop();
    await key('Escape','return from Mateo to plaza');
    await activate('[data-house="hall"]','enter Ines house');
    await capture('project-preview');
    await appearance('three project preview');
    log({kind:'projects',cards:await page.locator('.projects article').evaluateAll(nodes=>nodes.map(e=>{
      const s=getComputedStyle(e),r=e.getBoundingClientRect();
      return {text:e.textContent,width:r.width,height:r.height,color:s.color,background:s.backgroundColor,
        font:s.font,border:s.border,padding:s.padding};
    }))});
    await activate('[data-start="consultation"]','start synthetic consultation');
    log({kind:'ballot-baseline',options:await page.locator('#ballot .choice').evaluateAll(nodes=>nodes.map(e=>{
      const s=getComputedStyle(e),r=e.getBoundingClientRect();
      return {text:e.textContent.trim(),width:r.width,height:r.height,color:s.color,
        background:s.backgroundColor,font:s.font,border:s.border,padding:s.padding,
        checked:e.querySelector('input').checked};
    }))});
    await tabTo('#scenario');
    await key('Tab','ballot group legend and first option');
    // Read each unselected radio using Orca structural navigation. Never choose
    // a ballot: this smoke must not record a participant's decision or result.
    for (let i=0;i<4;i++) await key('r','Orca next unselected ballot option',1300);
    log({kind:'ballot-presentation',checked:await page.locator('#ballot input:checked').count(),
      options:await page.locator('#ballot .choice').evaluateAll(nodes=>nodes.map(e=>{
        const s=getComputedStyle(e),r=e.getBoundingClientRect();
        return {text:e.textContent.trim(),width:r.width,height:r.height,color:s.color,
          background:s.backgroundColor,font:s.font,border:s.border,padding:s.padding};
      }))});
    await capture('ballot-unselected');
    await appearance('consultation unselected');
    for (let i=0;i<5;i++) await key('ctrl+equal','browser zoom increase',200);
    await sleep(1200);
    await key('Tab','reach submit at 200 percent');
    await appearance('actual browser zoom 200 percent');
    await capture('zoom-200');
    for (let i=0;i<3;i++) await key('ctrl+equal','browser zoom increase to 400',200);
    await sleep(1200);
    await key('shift+Tab','return to radio group at 400 percent');
    await appearance('actual browser zoom 400 percent');
    await capture('zoom-400');
    await key('ctrl+0','reset browser zoom');
    await key('Escape','close consultation task');
    await key('Escape','return from Ines to plaza');
    if (process.env.ASSISTIVE_WORKSHOP==='1') await resetPosterWorkshop();
    // Isolated diagnostic fixture, not an app modification or acceptance test.
    // It distinguishes role=status dispatch from generic aria-live dispatch.
    const fixture=`<!doctype html><html lang="es"><title>AT diagnostic control</title>
      <button id="trigger">Actualizar mensajes de prueba</button><p role="status" id="implicit"></p>
      <div aria-live="polite" aria-atomic="true" id="explicit"></div>
      <script>document.querySelector('button').onclick=()=>{
        document.querySelector('#implicit').textContent='CONTROL STATUS: actualización recibida.';
        setTimeout(()=>document.querySelector('#explicit').textContent='CONTROL LIVE: actualización recibida.',3000);
      }<\/script></html>`;
    await page.goto('data:text/html;charset=utf-8,'+encodeURIComponent(fixture));
    await sleep(1200);
    await activate('#trigger','diagnostic status versus plain aria live',10000);
    log({kind:'diagnostic-fixture',text:await page.locator('body').innerText()});
  }
  log({kind:'completed',scope:process.env.ASSISTIVE_PROBE==='1'?'probe':'scoped smoke'});
} catch(error) {
  log({kind:'failure',message:error.stack}); await capture('failure').catch(()=>{}); throw error;
} finally {
  await Promise.all(responseTasks);
  fs.writeFileSync(`${dir}/assistive-served-assets.json`,JSON.stringify(servedAssets,null,2)+'\n');
  await browser.close();
}
'''


def session(args):
    run_dir = Path(args.session)
    env = dict(os.environ)
    processes = []
    handles = []

    def spawn(command, name, **kwargs):
        output = (EVIDENCE / f"assistive-{name}.log").open("w")
        handles.append(output)
        process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=output, stderr=output, **kwargs)
        processes.append(process)
        return process

    try:
        read_fd, write_fd = os.pipe()
        spawn([str(X11 / 'bin/Xvfb'), '-displayfd', str(write_fd), '-screen', '0', '1280x900x24', '-nolisten', 'tcp', '-ac'], "xvfb", pass_fds=(write_fd,))
        os.close(write_fd)
        with os.fdopen(read_fd) as display_stream:
            env['DISPLAY'] = ':' + display_stream.readline().strip()
        if env['DISPLAY'] == ':':
            raise RuntimeError('Xvfb did not allocate a display')
        config = run_dir / 'speech-config'
        config.mkdir()
        (EVIDENCE/'assistive-speechd').mkdir(exist_ok=True)
        (config / 'speechd.conf').write_text('LogLevel 2\nDefaultModule espeak-ng\nAddModule "espeak-ng" "sd_espeak-ng" "/etc/speech-dispatcher/modules/espeak-ng.conf"\nAudioOutputMethod "alsa"\nAudioALSADevice "null"\n')
        (run_dir / 'alsa.conf').write_text('pcm.null { type null }\npcm.!default { type null }\n')
        env['ALSA_CONFIG_PATH'] = str(run_dir / 'alsa.conf')
        spawn(['speech-dispatcher','-s','-C',str(config),'-S',str(run_dir/'speech.sock'),'-P',str(run_dir/'speech.pid'),'-L',str(EVIDENCE/'assistive-speechd'),'-t','0'], 'speechd-launch')
        time.sleep(1)
        subprocess.run(['gsettings','set','org.gnome.desktop.interface','toolkit-accessibility','true'],env=env,check=True)
        orca = spawn(['/usr/bin/orca','--debug-file',str(EVIDENCE/'assistive-orca-debug.log')], 'orca-launch')
        time.sleep(2)
        if orca.poll() is not None:
            raise RuntimeError(f'Orca exited with {orca.returncode}; inspect assistive-orca-launch.log')
        env.update(ASSISTIVE_EVIDENCE=str(EVIDENCE), ASSISTIVE_PROFILE=str(run_dir/'chromium'),
                   ASSISTIVE_CHROME=str(CHROME), ASSISTIVE_XDOTOOL=str(X11/'bin/xdotool'),
                   ASSISTIVE_URL=args.url, ASSISTIVE_PROBE='1' if args.probe else '0',
                   ASSISTIVE_WORKSHOP='1' if args.workshop else '0')
        node = spawn(['node','--input-type=module','-e',NODE], 'browser')
        code = node.wait(timeout=900)
        if code:
            raise RuntimeError(f'Browser smoke exited {code}; inspect assistive-browser.log')
    finally:
        for process in reversed(processes):
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=7)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
        for handle in handles:
            handle.close()


def workshop_results(actions, timed_speech):
    """Evaluate actual Orca windows separately from the seven feedback cases."""
    cases = []
    normalize = lambda text: ' '.join(text.split())
    for end in [action for action in actions if action['kind']=='workshop-end']:
        start = next(action for action in actions if action['kind']=='workshop-start' and action['case']==end['case'])
        output = [line for stamp,line in timed_speech if start['time'] <= stamp <= end['time']]
        combined = normalize('\n'.join(output))
        spoken = []
        for expected in end.get('speech', []):
            text = normalize(expected.get('text') or '')
            count = combined.count(text) if text else 0
            passed = bool(text) and (count==expected['exactly'] if 'exactly' in expected else count>=1)
            spoken.append({**expected,'count':count,'passed':passed})
        cases.append({'case':end['case'],'window_seconds':round(end['time']-start['time'],3),
            'checks':end['checks'],'focus':end['focus'],'observations':end.get('observations', {}),
            'speech_checks':spoken,'speech':output,
            'passed':bool(end['checks']) and all(end['checks'].values()) and bool(spoken) and all(s['passed'] for s in spoken)})
    return cases


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    scope = parser.add_mutually_exclusive_group()
    scope.add_argument('--probe', action='store_true')
    scope.add_argument('--workshop', action='store_true', help='Add optional-poster checks after the refreshed export is frozen')
    parser.add_argument('--url', default=os.environ.get('ASSISTIVE_URL','http://127.0.0.1:8765/web/'))
    parser.add_argument('--session', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.session:
        session(args)
        return
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    # Orca's own launcher refuses a second same-user instance. Never use --replace.
    if subprocess.run(['pgrep','-u',str(os.getuid()),'-x','orca'],capture_output=True).returncode == 0:
        raise SystemExit('An existing Orca is running; refusing to replace it.')
    started = time.time()
    report = {'started_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
              'url':args.url,'source_sha256_before':hashes(),'workshop_requested':args.workshop,
              'runner_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'scope':'real Orca speech generation with native X11 keyboard input; no listening/participant certification'}
    (EVIDENCE/'assistive-actions.jsonl').write_text('')
    with tempfile.TemporaryDirectory(prefix='voces-assistive-') as temp:
        run_dir = Path(temp)
        env = dict(os.environ)
        for key in ['DISPLAY','WAYLAND_DISPLAY','DBUS_SESSION_BUS_ADDRESS','AT_SPI_BUS_ADDRESS',
                    'SESSION_MANAGER','XAUTHORITY','PULSE_SERVER','SPEECHD_ADDRESS','GTK_MODULES']:
            env.pop(key, None)
        for name, folder in [('XDG_CONFIG_HOME','config'),('XDG_DATA_HOME','data'),
                             ('XDG_CACHE_HOME','cache'),('XDG_STATE_HOME','state'),('XDG_RUNTIME_DIR','runtime')]:
            target = run_dir/folder
            target.mkdir(mode=0o700)
            env[name] = str(target)
        env.update(XDG_SESSION_TYPE='x11', XDG_CURRENT_DESKTOP='GNOME', NO_AT_BRIDGE='0', GTK_A11Y='1',
                   LD_LIBRARY_PATH=str(X11/'lib/x86_64-linux-gnu'), SPEECHD_ADDRESS=f'unix_socket:{run_dir}/speech.sock',
                   PULSE_SERVER=f'unix:{run_dir}/no-pulse')
        command = ['dbus-run-session','--','/usr/bin/python3',str(Path(__file__).resolve()),'--session',temp,'--url',args.url]
        if args.probe:
            command.append('--probe')
        if args.workshop:
            command.append('--workshop')
        with (EVIDENCE/'assistive-session.log').open('w') as log:
            process = subprocess.Popen(command,env=env,cwd=ROOT,stdout=log,stderr=log,start_new_session=True)
            report['session_process_group'] = process.pid
            try:
                report['exit_code'] = process.wait(timeout=960)
            except (KeyboardInterrupt, subprocess.TimeoutExpired):
                report['exit_code'] = 'interrupted or timeout'
            finally:
                try:
                    os.killpg(process.pid,signal.SIGTERM)
                except ProcessLookupError:
                    pass
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid,signal.SIGKILL)
                    process.wait()
        report['temporary_directory_removed_on_exit'] = temp
    report['temporary_directory_removed'] = not Path(temp).exists()
    report['remaining_process_group_members'] = [line.strip() for line in subprocess.run(
        ['ps','-eo','pid,pgid,stat,comm'],capture_output=True,text=True,check=True).stdout.splitlines()[1:]
        if line.split()[1] == str(process.pid)]
    report['environment_versions'] = {
        'orca':subprocess.run(['/usr/bin/orca','--version'],capture_output=True,text=True,check=True).stdout.strip(),
        'chromium':subprocess.run([str(CHROME),'--version'],capture_output=True,text=True,check=True).stdout.strip(),
        'os':Path('/etc/os-release').read_text().splitlines()[0],
        'node':subprocess.run(['node','--version'],capture_output=True,text=True,check=True).stdout.strip(),
    }
    report['duration_seconds'] = round(time.time()-started,2)
    report['source_sha256_after'] = hashes()
    report['source_changed_during_run'] = report['source_sha256_before'] != report['source_sha256_after']
    debug = EVIDENCE/'assistive-orca-debug.log'
    if debug.exists():
        lines = debug.read_text(errors='replace').splitlines()
        speech = [line for line in lines if 'SPEECH OUTPUT:' in line]
        (EVIDENCE/'assistive-speech.log').write_text('\n'.join(speech)+'\n')
        report['orca_speech_output_lines'] = len(speech)
        actions = [json.loads(line) for line in (EVIDENCE/'assistive-actions.jsonl').read_text().splitlines()]
        day = datetime.datetime.fromtimestamp(started).date()
        timed_speech = []
        for line in speech:
            match = re.match(r'(\d{2}:\d{2}:\d{2}\.\d+) - SPEECH OUTPUT:', line)
            if match:
                stamp = datetime.datetime.combine(day, datetime.time.fromisoformat(match[1])).timestamp()
                timed_speech.append((stamp,line))
        cases = []
        normalize = lambda text: ' '.join(text.split())
        for end in [action for action in actions if action['kind']=='feedback-end']:
            start = next(action for action in actions if action['kind']=='feedback-start' and action['case']==end['case'])
            output = [line for stamp,line in timed_speech if start['time'] <= stamp <= end['time']]
            count = normalize('\n'.join(output)).count(normalize(end['text'])) if end['text'] else 0
            completion_count = normalize('\n'.join(output)).count(normalize(end['completion'])) if end['completion'] else 0
            state_matches = end['correct'] == (end['expectedState']=='correct') and end['supported'] == (end['expectedState']=='supported')
            cases.append({'case':end['case'],'expected_state':end['expectedState'],'message':end['text'],
                'window_seconds':round(end['time']-start['time'],3),'announcement_count':count,
                'completion_announcement_count':completion_count,
                'answer_state_matches':state_matches,'speech':output,'passed':count==1 and completion_count==1 and state_matches})
        report['feedback_cases'] = cases
        report['feedback_passed'] = len(cases)==(5 if args.probe else 7) and all(case['passed'] for case in cases)
        (EVIDENCE/'assistive-feedback-cases.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2)+'\n')
        completion_cases = []
        for end in [action for action in actions if action['kind']=='status-end']:
            start = next(action for action in actions if action['kind']=='status-start' and action['case']==end['case'])
            output = [line for stamp,line in timed_speech if start['time'] <= stamp <= end['time']]
            count = normalize('\n'.join(output)).count(normalize(end['text'])) if end['text'] else 0
            completion_cases.append({'case':end['case'],'message':end['text'],'announcement_count':count,'speech':output,'passed':count==1})
        report['completion_cases'] = completion_cases
        report['completion_passed'] = args.probe or (len(completion_cases)==2 and all(case['passed'] for case in completion_cases))
        workshop_cases = workshop_results(actions, timed_speech)
        report['workshop_cases'] = workshop_cases
        report['workshop_passed'] = (len(workshop_cases)==len(WORKSHOP_CASES)
            and {case['case'] for case in workshop_cases}==set(WORKSHOP_CASES)
            and all(case['passed'] for case in workshop_cases)) if args.workshop else None
        (EVIDENCE/'assistive-workshop-cases.json').write_text(json.dumps(workshop_cases,ensure_ascii=False,indent=2)+'\n')
    served_file = EVIDENCE/'assistive-served-assets.json'
    if served_file.exists():
        report['served_assets'] = json.loads(served_file.read_text())
    report['session_exit_code'] = report['exit_code']
    report['exit_code'] = 0 if (report['session_exit_code']==0 and report.get('feedback_passed')
        and report.get('completion_passed') and (not args.workshop or report.get('workshop_passed'))) else 1
    report['status'] = 'requested scoped Orca assertions passed; not formal accessibility acceptance' if report['exit_code']==0 else 'failed or incomplete; inspect case results and logs'
    (EVIDENCE/'assistive-run.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    if report['exit_code'] != 0 or not report.get('feedback_passed'):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
