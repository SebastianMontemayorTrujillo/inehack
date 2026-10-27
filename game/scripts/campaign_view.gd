extends RefCounted
## Print jobs are ephemeral; only completing the press enters the safe save.
const PDF = preload("res://scripts/campaign_pdf.gd")
const Poster = preload("res://scripts/poster_workshop.gd")
const Card = preload("res://scripts/poster_card.gd")
const Dialogue = preload("res://scripts/dialogue_view.gd")
const Ending = preload("res://scripts/ending_view.gd")
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
	elif app.Rules.first_missing(app.progress.completed, 3) >= 0:
		app._panel("La prensa de Luz")
		app._text(app.story.dialogue.luz_waiting)
	elif app.campaign_job.is_empty():
		app._panel("La prensa de Luz")
		app._text(app.story.campaign.reload_note)
	else:
		app._panel("La prensa de Luz · Último paso")
		app._text(app.story.campaign.press_intro)
		var poster := Poster.compose(app.bundle, app.story, app.campaign_job)
		app._text(poster.finding + "\n" + poster.question)
		app._button(app.story.campaign.print_label, func(): print_job(app), true)

static func print_job(app: Node) -> void:
	if not near_press(app) or app.campaign_pdf.is_empty() or app.Rules.first_missing(app.progress.completed, 3) >= 0: return
	var first_print: bool = not app.progress.campaign_printed
	if first_print:
		app.progress.campaign_printed = true
		app._save()
		app._sound("sound.chapter")
		app._update_status()
	ending(app, first_print)

static func ending(app: Node, reveal: bool = false) -> void:
	if not app.progress.campaign_printed: return
	app._panel(app.story.campaign.ending_title, true)
	# The shell still owns focus containment, backdrop, movement lock and close.
	# Replace its scrolling header with one bounded child; only its poster scrolls.
	for child in app.body.get_children():
		app.body.remove_child(child)
		child.queue_free()
	var shade: StyleBoxFlat = app.overlay.get_theme_stylebox("panel").duplicate()
	shade.bg_color = Ending.PINK
	shade.border_color = Ending.WHITE
	app.overlay.add_theme_stylebox_override("panel", shade)
	var card: Control
	var make_poster := Callable()
	if not app.campaign_job.is_empty():
		var result := Poster.compose(app.bundle, app.story, app.campaign_job)
		card = Card.create(app, result, true)
		make_poster = func(compact: bool): return Card.create(app, result, compact)
	var view := Ending.new()
	view.configure(app, card, reveal, make_poster)
	view.download_requested.connect(func(): download(app))
	view.explore_requested.connect(app._close_panel)
	app.body.add_child(view)

static func download(app: Node) -> void:
	if app.campaign_pdf.is_empty() or not app.progress.campaign_printed: return
	var view: Control = app.body.find_child("EndingView", true, false)
	if view == null or not view.is_visible_in_tree(): return
	# Each save uses the same frozen in-memory job, including while a native
	# dialog is open. Its owning ending also owns dialog cancellation/teardown.
	var bytes: PackedByteArray = app.campaign_pdf.duplicate()
	if OS.has_feature("web"):
		JavaScriptBridge.download_buffer(bytes, FILENAME, "application/pdf")
		view.set_message("Descarga solicitada. Si tu navegador la bloquea, permite la descarga y pulsa de nuevo el botón.")
		return
	if view.find_child("CampaignDownloadDialog", false, false) != null: return
	var dialog := FileDialog.new()
	dialog.name = "CampaignDownloadDialog"
	dialog.file_mode = FileDialog.FILE_MODE_SAVE_FILE
	dialog.access = FileDialog.ACCESS_FILESYSTEM
	dialog.filters = PackedStringArray(["*.pdf ; Cartel PDF"])
	dialog.current_file = FILENAME
	dialog.force_native = OS.has_feature("linux")
	view.add_child(dialog)
	dialog.file_selected.connect(func(path: String):
		var file := FileAccess.open(path, FileAccess.WRITE)
		if file == null:
			view.set_message("No se pudo guardar el archivo. El cartel sigue listo: vuelve a descargarlo y elige otra carpeta.")
		else:
			file.store_buffer(bytes)
			file.flush()
			view.set_message("PDF guardado en: " + path if file.get_error() == OK else "No se pudo completar el archivo. Intenta guardarlo de nuevo.")
			file.close()
		dialog.queue_free())
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered(Vector2i(900, 600))
