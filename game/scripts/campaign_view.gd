extends RefCounted
## Print jobs are ephemeral; only completing the press enters the safe save.
const PDF = preload("res://scripts/campaign_pdf.gd")
const Poster = preload("res://scripts/poster_workshop.gd")
const Card = preload("res://scripts/poster_card.gd")
const Dialogue = preload("res://scripts/dialogue_view.gd")
const DEFAULT := {"first": "state_01", "second": "state_02", "metric": "rate", "question": "missing"}
const FILENAME := "campana-ciudadana-voto-informado.pdf"

static func talk_to_ines(app: Node) -> void:
	if app.Rules.first_missing(app.progress.completed, 3) >= 0: return
	if app.progress.campaign_printed:
		Dialogue.show(app, 2, app.story.campaign.ending)
		app._button("Ver el final del recorrido", func(): ending(app))
		return
	Dialogue.show(app, 2, app.story.campaign.intro, [{"text": "Revisar el cartel para la imprenta", "action": func(): review(app)}])
	if not app.campaign_job.is_empty(): app._text(app.story.campaign.sent)

static func review(app: Node) -> void:
	app._panel("Un cartel para invitar a participar", true)
	app._text(app.story.campaign.review)
	var selection: Dictionary = DEFAULT if app.meeting_poster.is_empty() else app.meeting_poster
	app._text("Usaremos el ejemplo guiado. Puedes crear otro cartel con Mateo antes de enviarlo." if app.meeting_poster.is_empty() else "Usaremos tu cartel publicado con Mateo.")
	app._button(app.story.campaign.send_label if app.campaign_job.is_empty() else app.story.campaign.replace_label, func(): dispatch(app), true)
	app._button("Volver sin cambiar el envío", app._close_panel)
	app.body.add_child(Card.create(app, Poster.compose(app.bundle, app.story, selection)))

static func dispatch(app: Node) -> void:
	if app.Rules.first_missing(app.progress.completed, 3) >= 0 or app.progress.campaign_printed: return
	var selection: Dictionary = (DEFAULT if app.meeting_poster.is_empty() else app.meeting_poster).duplicate(true)
	var bytes := PDF.create(app.bundle, app.story, selection)
	if bytes.is_empty():
		app._panel("El envío necesita otro intento")
		app._text(app.story.campaign.error)
		app._button("Reintentar", func(): dispatch(app))
		return
	app.campaign_job = selection
	app.campaign_pdf = bytes
	app._update_status()
	Dialogue.show(app, 2, app.story.campaign.sent)

static func near_press(app: Node) -> bool:
	if app.house_index != 0 or app.room == null: return false
	var target: Dictionary = app.room.nearest_target(app.player)
	return target.get("kind") == "artifact" and target.get("index") == 0

static func press(app: Node) -> void:
	if not near_press(app): return
	if app.progress.campaign_printed:
		ending(app)
	elif app.campaign_job.is_empty():
		Dialogue.show(app, 0, app.story.campaign.reload_note)
	else:
		app._panel("La prensa de Luz · Último paso")
		app._text(app.story.campaign.press_intro)
		var poster := Poster.compose(app.bundle, app.story, app.campaign_job)
		app._text(poster.finding + "\n" + poster.question)
		app._button(app.story.campaign.print_label, func(): print_job(app), true)

static func print_job(app: Node) -> void:
	if not near_press(app) or app.campaign_pdf.is_empty() or app.Rules.first_missing(app.progress.completed, 3) >= 0: return
	if not app.progress.campaign_printed:
		app.progress.campaign_printed = true
		app._save()
		app._sound("sound.chapter")
		app._update_status()
	ending(app, true)

static func ending(app: Node, reveal: bool = false) -> void:
	app._panel(app.story.campaign.ending_title, true)
	app._text(app.story.campaign.ending if not app.campaign_pdf.is_empty() else app.story.campaign.completed_reload)
	if not app.storage_message.is_empty(): app._text(app.storage_message)
	if not app.campaign_pdf.is_empty():
		app._button(app.story.campaign.download_label, func(): download(app), true)
	app._button("Seguir explorando", app._close_panel)
	if not app.campaign_job.is_empty():
		app._text("Tu voto cuenta. Infórmate y participa.")
		var card := Card.create(app, Poster.compose(app.bundle, app.story, app.campaign_job))
		app.body.add_child(card)
		if reveal and not app.progress.settings.reduced_motion:
			card.modulate.a = 0.0
			app.create_tween().tween_property(card, "modulate:a", 1.0, 0.6)

static func download(app: Node) -> void:
	if app.campaign_pdf.is_empty() or not app.progress.campaign_printed: return
	if OS.has_feature("web"):
		JavaScriptBridge.download_buffer(app.campaign_pdf, FILENAME, "application/pdf")
		app._text("Descarga solicitada. Si tu navegador la bloquea, permite la descarga y pulsa de nuevo el botón.")
		return
	var dialog := FileDialog.new()
	dialog.file_mode = FileDialog.FILE_MODE_SAVE_FILE
	dialog.access = FileDialog.ACCESS_FILESYSTEM
	dialog.filters = PackedStringArray(["*.pdf ; Cartel PDF"])
	dialog.current_file = FILENAME
	dialog.force_native = OS.has_feature("linux")
	app.add_child(dialog)
	dialog.file_selected.connect(func(path: String):
		var file := FileAccess.open(path, FileAccess.WRITE)
		if file == null:
			app._text("No se pudo guardar el archivo. El cartel sigue listo: vuelve a descargarlo y elige otra carpeta.")
		else:
			file.store_buffer(app.campaign_pdf)
			file.flush()
			app._text("PDF guardado en: " + path if file.get_error() == OK else "No se pudo completar el archivo. Intenta guardarlo de nuevo.")
			file.close()
		dialog.queue_free())
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered(Vector2i(900, 600))
