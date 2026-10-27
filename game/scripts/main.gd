extends Node2D

# Godot 4.7: parents own scene connections; resources live under res://,
# progress under user://. Official references are in docs/source_register.md.
const Rules = preload("res://scripts/civic_rules.gd")
const Catalog = preload("res://scripts/asset_catalog.gd")
const RoomScene = preload("res://scenes/room.tscn")
const PosterView = preload("res://scripts/poster_view.gd")
const InterfaceTheme = preload("res://scripts/interface_theme.gd")
const InterfaceShell = preload("res://scripts/interface_shell.gd")
const CampaignView = preload("res://scripts/campaign_view.gd")
const Dialogue = preload("res://scripts/dialogue_view.gd")
const CREAM := Color("f6f0da")
const INK := Color("173b39")
const GOLD := Color("e4ba5c")
const TEAL := Color("467c70")
const SAVE := "user://voces_progress_v1.json"

var catalog := Catalog.new()
var bundle: Dictionary = {}
var story: Dictionary = {}
var progress := Rules.safe_progress({})
var world := Node2D.new()
var player := CharacterBody2D.new()
var player_art := Sprite2D.new()
var audio := AudioStreamPlayer.new()
var music := AudioStreamPlayer.new()
var music_started := false
var dialogue_active := false
var campaign_job: Dictionary = {}
var campaign_pdf := PackedByteArray()
var canvas := CanvasLayer.new()
var overlay := PanelContainer.new()
var body := VBoxContainer.new()
var status := Label.new()
var theme := Theme.new()
var chapter := 0
var step := 0
var valid := false
var storage_message := ""
var anim_time := 0.0
var facing := "down"
var save_path := SAVE
var room: Node2D
var location_id := "plaza"
var house_index := -1
var transitioning := false
var action_button := Button.new()
var awaiting_answer := false
var poster_selection := {"first": "state_01", "second": "state_02", "metric": "count", "question": "missing"}
var meeting_poster: Dictionary = {}
var world_controls := Control.new()
var backdrop := ColorRect.new()
var progress_labels: Array[Label] = []
var hud_labels: Array[Label] = []
var diary_button: Button
var panel_return_focus: WeakRef

func _ready() -> void:
	story = _read_json("res://content/story.json")
	bundle = _read_json("res://content/ccpc.json")
	valid = Rules.validate_bundle(bundle) and Rules.validate_story(story)
	if valid:
		story = Rules.ordered_story(story)
	if FileAccess.file_exists(save_path):
		var saved := _read_json(save_path)
		if saved.get("schema_version") == 1 or saved.get("schema_version") == 2:
			progress = Rules.safe_progress(saved)
		else:
			storage_message = "No se pudo restaurar la partida. Puedes comenzar de nuevo."
	_configure_input()
	_theme()
	add_child(audio)
	add_child(music)
	music.stream = catalog.sound("music.plaza")
	if music.stream is AudioStreamOggVorbis:
		music.stream.loop = true
	music.volume_linear = 0.0
	add_child(world)
	world.position = Vector2(40, 156)
	world.scale = Vector2(2.5, 2.5)
	_build_world()
	add_child(canvas)
	_build_interface()
	if not valid:
		_panel("Contenido no disponible")
		_text("No pudimos validar los datos o la historia incluidos. Vuelve a abrir una copia completa del prototipo o consulta a la persona facilitadora. No mostramos cifras sustitutas.")
		_button("Cerrar", _close_panel)
	else:
		_welcome()

func _read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var parser := JSON.new()
	if parser.parse(FileAccess.get_file_as_string(path)) != OK:
		return {}
	return parser.data if parser.data is Dictionary else {}

func _theme() -> void:
	InterfaceTheme.apply(theme, catalog, progress.settings.large_text)
	if not progress_labels.is_empty():
		InterfaceShell.refresh(self, Rules.first_missing(progress.completed, 3))

func _configure_input() -> void:
	var keys := {"left": KEY_A, "right": KEY_D, "up": KEY_W, "down": KEY_S}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		# Replace old arrow/duplicate bindings when another session is created.
		# https://docs.godotengine.org/en/stable/classes/class_inputmap.html#class-inputmap-method-action-erase-events
		InputMap.action_erase_events(action)
		var event := InputEventKey.new()
		event.physical_keycode = keys[action]
		InputMap.action_add_event(action, event)


func _build_world() -> void:
	player.position = Vector2(240, 176)
	player_art.texture = catalog.texture("character.player")
	player_art.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	player_art.offset = Vector2(0, -6)
	player.add_child(player_art)
	var shape := CircleShape2D.new()
	shape.radius = 5
	var collision := CollisionShape2D.new()
	collision.shape = shape
	player.add_child(collision)
	world.add_child(player)
	if valid:
		_show_location(-1, Vector2(240, 176))

func _show_location(index: int, spawn: Vector2) -> void:
	if room != null:
		world.remove_child(room)
		room.queue_free()
	room = RoomScene.instantiate()
	room.catalog = catalog
	room.story = story
	room.house_index = index
	world.add_child(room)
	world.move_child(room, 0)
	house_index = index
	location_id = "plaza" if index < 0 else story.houses[index].id
	player.position = spawn
	player.velocity = Vector2.ZERO
	facing = "down"
	room.update_artifacts(progress.completed, bundle, meeting_poster, 2 if progress.campaign_printed else 1 if not campaign_job.is_empty() else 0)

func _enter_house(index: int) -> void:
	if not valid or transitioning or index < 0 or index >= 3:
		return
	transitioning = true
	_close_panel()
	_show_location(index, Vector2(240, 155))
	_update_status()
	call_deferred("_end_transition")

func _end_transition() -> void:
	transitioning = false

func _exit_house() -> void:
	if transitioning or house_index < 0:
		return
	var index := house_index
	transitioning = true
	_close_panel()
	_show_location(-1, Vector2(80 + index * 160, 120))
	_update_status()
	call_deferred("_end_transition")

func _interact() -> void:
	if transitioning or overlay.visible or not valid:
		return
	var target: Dictionary = room.nearest_target(player)
	if target.is_empty():
		return
	match target.kind:
		"host": _start_chapter(target.index)
		"artifact":
			if target.index == 0 and "consultation" in progress.completed: CampaignView.press(self)
			elif target.index == 1 and not meeting_poster.is_empty(): _published_poster()
			else: _start_chapter(target.index)

func _accessible_action() -> void:
	_interact()

func _walk_through_door(movement: Vector2, target: Dictionary) -> bool:
	if target.is_empty(): return false
	if target.kind == "door" and movement.y < 0:
		_enter_house(target.index)
		return true
	if target.kind == "exit" and movement.y > 0:
		_exit_house()
		return true
	return false

func _close_panel() -> void:
	awaiting_answer = false
	dialogue_active = false
	overlay.hide()
	backdrop.hide()
	world_controls.focus_behavior_recursive = Control.FOCUS_BEHAVIOR_INHERITED
	world_controls.mouse_behavior_recursive = Control.MOUSE_BEHAVIOR_INHERITED
	for child in body.get_children():
		body.remove_child(child)
		child.queue_free()
	var previous: Control = panel_return_focus.get_ref() if panel_return_focus != null else null
	panel_return_focus = null
	if previous != null and previous.is_inside_tree() and previous is BaseButton and not previous.disabled:
		previous.grab_focus()
	elif action_button.is_inside_tree() and not action_button.disabled:
		action_button.grab_focus()
	else:
		get_viewport().gui_release_focus()

func _build_interface() -> void:
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.theme = theme
	canvas.add_child(root)
	InterfaceShell.build(self, root)
	var shade := InterfaceTheme.panel(CREAM, GOLD, 2, 6)
	shade.set_content_margin_all(24)
	overlay.add_theme_stylebox_override("panel", shade)
	overlay.position = Vector2(160, 136)
	overlay.size = Vector2(960, 555)
	root.add_child(overlay)
	var scroll := ScrollContainer.new()
	scroll.follow_focus = true
	scroll.custom_minimum_size = Vector2(904, 497)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	overlay.add_child(scroll)
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation", 14)
	scroll.add_child(body)
	overlay.hide()
	_update_status()

func _physics_process(delta: float) -> void:
	var target_volume: float = 0.0 if progress.settings.muted else progress.settings.music_volume * (0.5 if dialogue_active else 1.0)
	music.volume_linear = move_toward(music.volume_linear, target_volume, delta * 0.4)
	if valid and not overlay.visible and not transitioning:
		var movement := Input.get_vector("left", "right", "up", "down")
		player.velocity = movement * 65
		player.move_and_slide()
		var limits: Rect2 = room.bounds
		player.position.x = clampf(player.position.x, limits.position.x, limits.end.x)
		player.position.y = clampf(player.position.y, limits.position.y, limits.end.y)
		var target: Dictionary = room.nearest_target(player)
		if _walk_through_door(movement, target): return
		action_button.disabled = target.is_empty() or target.kind not in ["host", "artifact"]
		action_button.text = "Acércate para conversar" if action_button.disabled else "Hablar con " + story.chapters[house_index].npc if target.kind == "host" else "Examinar · E"
		anim_time += delta
		if movement != Vector2.ZERO:
			facing = ("right" if movement.x > 0 else "left") if abs(movement.x) > abs(movement.y) else ("down" if movement.y > 0 else "up")
		var frame := 0 if movement == Vector2.ZERO or progress.settings.reduced_motion else 1 + int(anim_time * 7) % 2
		player_art.texture = catalog.character_frame("character.player", facing, frame)
		player_art.position.y = 0 if progress.settings.reduced_motion or movement == Vector2.ZERO else sin(anim_time * 14) * 0.6


func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_pressed() and not event.is_echo() and event is InputEventKey:
		_start_music()
		if event.keycode == KEY_ESCAPE:
			if overlay.visible:
				_close_panel()
		elif event.keycode == KEY_J and not overlay.visible:
			_journal()
		elif event.keycode in [KEY_E, KEY_ENTER] and not overlay.visible:
			_interact()

func _panel(title: String, spacious: bool = false, conversation: bool = false) -> void:
	awaiting_answer = false
	dialogue_active = conversation
	if not overlay.visible:
		var focused := get_viewport().gui_get_focus_owner()
		panel_return_focus = weakref(focused) if focused != null and world_controls.is_ancestor_of(focused) else null
	for child in body.get_children():
		body.remove_child(child)
		child.queue_free()
	var scroll: ScrollContainer = body.get_parent()
	scroll.custom_minimum_size = Vector2(1032, 680) if spacious else Vector2(904, 497)
	scroll.scroll_vertical = 0
	overlay.position = Vector2(100, 36) if spacious else Vector2(160, 136)
	overlay.size = Vector2(1080, 728) if spacious else Vector2(960, 555)
	var shade := InterfaceTheme.panel(CREAM, GOLD, 2, 6)
	shade.set_content_margin_all(24)
	if conversation:
		shade.bg_color = Color(0.06, 0.16, 0.15, 0.94)
		overlay.position = Vector2(40, 360 if progress.settings.large_text else 420)
		var dialogue_size := Vector2(1200, 416 if progress.settings.large_text else 356)
		scroll.custom_minimum_size = dialogue_size - Vector2(48, 48)
		overlay.set_deferred("size", dialogue_size)
	overlay.add_theme_stylebox_override("panel", shade)
	# Disable the world branch for both keyboard traversal and mouse input.
	# https://docs.godotengine.org/en/stable/classes/class_control.html#class-control-property-focus-behavior-recursive
	world_controls.focus_behavior_recursive = Control.FOCUS_BEHAVIOR_DISABLED
	world_controls.mouse_behavior_recursive = Control.MOUSE_BEHAVIOR_DISABLED
	backdrop.show()
	backdrop.color.a = 0.0 if conversation else 0.66
	overlay.show()
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 16)
	body.add_child(header)
	var label := Label.new()
	label.text = title
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	label.add_theme_font_size_override("font_size", int(theme.default_font_size) + 4 if spacious else 30)
	label.add_theme_font_override("font", catalog.font("font.bold"))
	if conversation: label.add_theme_color_override("font_color", CREAM)
	header.add_child(label)
	var close := Button.new()
	close.text = "Volver al lugar · Esc"
	close.theme_type_variation = "QuietButton"
	close.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	close.pressed.connect(_close_panel)
	header.add_child(close)
	call_deferred("_focus_if_available", weakref(close), weakref(label))

func _focus_if_available(reference: WeakRef, reveal: WeakRef = null) -> void:
	await get_tree().process_frame
	var control: Control = reference.get_ref()
	if control != null and control.is_inside_tree() and not control.is_queued_for_deletion():
		control.grab_focus()
		var visible_control: Control = reveal.get_ref() if reveal != null else control
		if visible_control != null and visible_control.is_inside_tree() and not visible_control.is_queued_for_deletion():
			body.get_parent().ensure_control_visible(visible_control)

func _text(value: String, container: VBoxContainer = null) -> Label:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	if dialogue_active: label.add_theme_color_override("font_color", CREAM)
	(container if container != null else body).add_child(label)
	return label

func _button(title: String, action: Callable, primary: bool = false) -> Button:
	var button := Button.new()
	button.text = title
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	button.custom_minimum_size.y = 46
	if primary: button.theme_type_variation = "PrimaryButton"
	button.pressed.connect(func(): _start_music(); _sound("sound.select"); action.call())
	body.add_child(button)
	return button

func _sound(role: String) -> void:
	if not progress.settings.muted:
		audio.stream = catalog.sound(role)
		if audio.stream != null:
			audio.play()

func _exit_tree() -> void:
	audio.stop()
	audio.stream = null
	music.stop()
	music.stream = null

func _start_music() -> void:
	if not music_started and music.stream != null:
		music_started = true
		music.play()

func _welcome() -> void:
	_panel("Bienvenida a Villa Brisa")
	_text(story.opening)
	_text(story.audience)
	_text(story.get("message", "Comprender los datos nos ayuda a participar con información."))
	_text("Duración orientativa: 10–15 minutos. No hay cronómetro. Camina con WASD y cruza las puertas para visitar las casas. Acércate a cada persona u objeto y pulsa E. Puedes pedir pistas y ampliar el texto.")
	if progress.campaign_printed: _text(story.campaign.completed_reload)
	elif "consultation" in progress.completed: _text(story.campaign.reload_note)
	if not storage_message.is_empty():
		_text(storage_message)
	_button("Entrar a la plaza", _close_panel, true)
	_button("Elegir ajustes de lectura", _settings)

func _record(id: String) -> Dictionary:
	for record in bundle.get("records", []):
		if record.id == id:
			return record
	return {}


func _start_chapter(index: int) -> void:
	if not valid:
		return
	chapter = index
	step = 0
	var missing := Rules.first_missing(progress.completed, index)
	if missing >= 0:
		Dialogue.show(self, index, story.dialogue.before_luz if missing == 0 else story.dialogue.before_mateo)
		return
	if index == 2 and "consultation" in progress.completed:
		CampaignView.talk_to_ines(self)
		return
	if index == 0 and "consultation" in progress.completed:
		Dialogue.show(self, 0, story.campaign.ending if progress.campaign_printed else story.dialogue.luz_queued if not campaign_job.is_empty() else story.campaign.reload_note)
		return
	var message: String = story.chapters[index].intro
	if Rules.CHAPTERS[index] in progress.completed: message = story.dialogue.revisit
	Dialogue.show(self, index, message, [{"text": "Comenzar la actividad", "action": _question}])
	if index == 1: _poster_controls()
	if index == 2 and not meeting_poster.is_empty():
		var poster: Dictionary = preload("res://scripts/poster_workshop.gd").compose(bundle, story, meeting_poster)
		_text("Trajiste esta pregunta: " + poster.question)
		_button("Abrir mi cartel y su fuente", _published_poster)

func _poster_controls() -> void:
	if "comparison" not in progress.completed: return
	_button("Crear mi propio cartel", _poster_workshop)
	if not meeting_poster.is_empty(): _button("Ver mi cartel publicado", _published_poster)

func _poster_workshop() -> void:
	if valid and "comparison" in progress.completed: PosterView.editor(self)

func _poster_preview() -> void:
	if valid and "comparison" in progress.completed: PosterView.preview(self)

func _published_poster() -> void:
	if valid and not meeting_poster.is_empty(): PosterView.preview(self, true)

func _publish_poster(selection: Dictionary) -> void:
	if not valid or "comparison" not in progress.completed: return
	meeting_poster = selection.duplicate()
	_update_status()
	_published_poster()

func _project_preview() -> void:
	_panel("Tres necesidades para la plaza")
	for project in story.consultation.projects:
		_text(project.name + " · " + project.benefit + " " + project.tradeoff)
	_text("Todas las necesidades cuentan. La consulta se abre después del boletín y el cartel.")

func _simple_card(record: Dictionary, counts: bool = false, container: VBoxContainer = null) -> void:
	var heading := _text(record.geography_name.capitalize() + " · CCPC 2024", container)
	heading.add_theme_font_override("font", catalog.font("font.bold"))
	var known: int = int(record.sv) + int(record.nv)
	var pct: Variant = Rules.rate(record.sv, known)
	if counts:
		var common_max: int = maxi(int(_record("state_01").sv), int(_record("state_02").sv))
		_bar(_number(record.sv) + " con participación", 100.0 * record.sv / maxf(1, common_max), container)
	elif pct == null:
		_text("Falta información para comparar la participación.", container)
	else:
		_bar("Con participación: cerca de %d de cada 100 · %s" % [roundi(pct), _percentage(pct)], pct, container)
		if record.id == "national":
			_bar("Sin participación: cerca de %d de cada 100" % roundi(100.0 - pct), 100.0 - pct, container)
			_text("Conteos exactos: %s con participación; %s sin participación." % [_number(record.sv), _number(record.nv)], container)
	_text("Con información conocida: " + _number(known) + ".\nPor separado, no sabemos: " + _number(record.ns) + ".", container)

func _data_card(record: Dictionary) -> void:
	var classified := int(record.sv) + int(record.nv)
	_text("%s · %d · CCPC\nCon marca de participación (SV): %s\nSin marca (NV): %s\nSin clasificación (NS): %s\nLista nominal analizada (LN): %s" % [record.geography_name, record.year, _number(record.sv), _number(record.nv), _number(record.ns), _number(record.ln)])
	var participation: Variant = Rules.rate(record.sv, classified)
	var unknown: Variant = Rules.rate(record.ns, record.ln)
	if participation != null:
		_bar("Participación entre registros clasificados: " + _percentage(participation), participation)
	else:
		_text("Participación: sin datos clasificables.")
	_text("Denominador: SV + NV = %s. Sin clasificación: %s de LN, con un denominador distinto." % [_number(classified), _percentage(unknown)])
	_text("Fuente: INE, CCPC 2024. Las cifras describen registros agregados; no indican por quién votó cada persona ni sus motivos.")

func _bar(title: String, percent: float, container: VBoxContainer = null) -> void:
	_text(title, container)
	var bar := ProgressBar.new()
	bar.min_value = 0
	bar.max_value = 100
	bar.value = percent
	bar.show_percentage = false
	bar.custom_minimum_size.y = 22
	var track := StyleBoxFlat.new()
	track.bg_color = Color("dfd9c7")
	bar.add_theme_stylebox_override("background", track)
	var fill := StyleBoxFlat.new()
	fill.bg_color = TEAL
	bar.add_theme_stylebox_override("fill", fill)
	(container if container != null else body).add_child(bar)

func _number(value: Variant) -> String:
	var digits := str(int(value))
	var result := ""
	for i in digits.length():
		if i > 0 and (digits.length() - i) % 3 == 0:
			result += ","
		result += digits[i]
	return result

func _percentage(value: Variant) -> String:
	return "Sin datos clasificables" if value == null else "%.2f%%" % float(value)


func _chapter_activities() -> Array:
	return story.activities.filter(func(activity: Dictionary) -> bool: return activity.chapter == Rules.CHAPTERS[chapter])

func _question() -> void:
	if Rules.first_missing(progress.completed, chapter) >= 0:
		_start_chapter(chapter)
		return
	if chapter == 2:
		_consultation()
		return
	var activities := _chapter_activities()
	if activities.is_empty():
		_panel("Actividad no disponible")
		_text("Falta una parte de la historia. Revisa que el paquete esté completo.")
		return
	if step >= activities.size():
		_complete()
		return
	var activity: Dictionary = activities[step]
	_panel("%d de %d · %s" % [step + 1, activities.size(), activity.title])
	if activity.transfer:
		_text(story.fiction_label)
	if activity.view == "national":
		_simple_card(_record("national"))
	elif activity.view in ["count", "rate"]:
		_text("Cartel por revisar: «" + story.comparison_artifact.before + "»")
		_text("Fuente: INE / CCPC 2024. Barras con la misma escala." if activity.view == "count" else "Fuente: INE / CCPC 2024. Comparamos de cada 100 con información conocida.")
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 24)
		body.add_child(row)
		for id in ["state_01", "state_02"]:
			var column := VBoxContainer.new()
			column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			column.add_theme_constant_override("separation", 8)
			row.add_child(column)
			_simple_card(_record(id), activity.view == "count", column)
		if activity.view == "rate":
			var a := _record("state_01")
			var b := _record("state_02")
			var comparison := Rules.compare_records(a, b, "rate")
			if comparison in [0, 1] and roundi(a.participation_pct) == roundi(b.participation_pct):
				_text("Las cifras redondeadas se parecen. Con los conteos exactos, %s tiene una proporción ligeramente mayor." % [a, b][comparison].geography_name)
	elif activity.view == "printing-fixture":
		var example: Dictionary = story.assessment_fixtures.printing
		_text("Con participación: %d · Sin participación: %d · No sabemos: %d" % [example.sv, example.nv, example.ns])
	else:
		for i in 2:
			var example: Dictionary = story.assessment_fixtures.comparison[i]
			_text("Grupo %s: %d participantes de %d · %s" % ["A" if i == 0 else "B", example.sv, int(example.sv) + int(example.nv), _percentage(Rules.rate(example.sv, int(example.sv) + int(example.nv)))])
	_text(activity.prompt).add_theme_font_override("font", catalog.font("font.bold"))
	var answer := Rules.activity_answer(activity, bundle, story)
	if answer == "unavailable":
		_text("Falta información para resolver esta comparación. Revisa la fuente o pide apoyo.")
		_button("Continuar: aquí falta información", _continue_unavailable)
	else:
		awaiting_answer = true
		for choice in activity.choices:
			var title: String = choice.text
			if choice.id in ["state_01", "state_02"]:
				title = _record(choice.id).geography_name
			_button(title, _answer.bind(choice.id == answer, activity.explanation))
	if answer != "unavailable":
		_button("Pedir una pista", func():
			_mark_assisted()
			_text("Pista: " + activity.hint)
			_button("Completar con acompañamiento", func():
				_answer(true, activity.explanation + " Completaste este paso con acompañamiento.")))
	_button("Ver datos y fuente", _question_sources)
	_button("Ver cómo se calculó (opcional)", _optional_math)

func _mark_assisted() -> void:
	if Rules.CHAPTERS[chapter] not in progress.hints:
		progress.hints.append(Rules.CHAPTERS[chapter])
	_save()

func _continue_unavailable() -> void:
	_mark_assisted()
	awaiting_answer = true
	_answer(true, "Aquí falta información. Revisaste este límite con apoyo; no se registró una interpretación independiente ni un porcentaje inventado.")

func _question_sources() -> void:
	_journal()
	_button("Volver a la pregunta", _question)

func _optional_math() -> void:
	_panel(story.optional_math.title)
	_text(story.optional_math.known)
	_text(story.optional_math.formula)
	_text(story.optional_math.combined)
	_text("Aguascalientes + Baja California: " + _percentage(Rules.combined_rate(_record("state_01"), _record("state_02"))) + ". Se suman las cantidades antes de dividir.")
	var fixtures: Dictionary = story.assessment_fixtures
	var p: Dictionary = fixtures.printing
	_text(story.fiction_label)
	_text("Ejemplo 1: %d ÷ (%d + %d) × 100 = %s." % [p.sv, p.sv, p.nv, _percentage(Rules.rate(p.sv, int(p.sv) + int(p.nv)))])
	_text("Ejemplo 2, grupos reunidos: " + _percentage(Rules.combined_rate(fixtures.comparison[0], fixtures.comparison[1])) + ".")
	_text(story.optional_math.limit)
	_button("Volver a la actividad", _question)

func _answer(correct: bool, explanation: String) -> void:
	if not awaiting_answer:
		return
	_panel("Una evidencia para la plaza" if correct else "Revisemos la interpretación")
	_text(explanation)
	if correct:
		step += 1
		if step >= _chapter_activities().size():
			_complete()
		else:
			_button("Continuar la investigación", _question, true)
	else:
		_sound("sound.corrective")
		_button("Volver a los datos y reintentar", _question)

func _complete() -> void:
	var id: String = Rules.CHAPTERS[chapter]
	if id not in progress.completed:
		progress.completed.append(id)
	_save()
	_update_status()
	_sound("sound.chapter")
	_text("Material listo: " + story.houses[chapter].artifact)
	if id in progress.hints:
		_text("Recorrido con apoyo. Puedes practicar otra vez cuando quieras.")
	_text(story.chapters[chapter].reflection)
	if chapter == 0:
		var record := _record("national")
		_text("Boletín construido: participación nacional entre registros clasificados de 2024: %s. La clasificación desconocida se presenta por separado." % _percentage(record.participation_pct))
	elif chapter == 1:
		var a := _record("state_01")
		var b := _record("state_02")
		_text("Titular corregido:\n" + Rules.comparison_caption(a, b, story.comparison_artifact))
		_text("Cartel corregido: %s tiene %s SV y una tasa de %s; %s tiene %s SV y una tasa de %s. Las cifras no explican los motivos individuales." % [a.geography_name, _number(a.sv), _percentage(a.participation_pct), b.geography_name, _number(b.sv), _percentage(b.participation_pct)])
	else:
		_text("La reunión terminó. Habla con Inés para enviar el cartel a la imprenta y completar tu campaña.")
	_button("Ver mi exposición y las fuentes", _journal, true)
	_button("Volver al lugar", _close_panel)
	if chapter == 1: _poster_controls()

func _consultation() -> void:
	if Rules.first_missing(progress.completed, 2) >= 0:
		_start_chapter(2)
		return
	_panel("Una plaza, varias ideas")
	_text(story.consultation.label)
	_text(story.bridge)
	PosterView.acknowledge(self)
	_text(_scenario_summary(0))
	_text("Tú puedes sumar una voz. Hay recursos para empezar un proyecto; las otras necesidades siguen presentes.")
	for project in story.consultation.projects:
		_text(project.id + " · " + project.name + ": " + project.benefit + " " + project.tradeoff)
	_text("Regla del ejemplo: gana el proyecto con más marcas. Un empate abre una segunda decisión ficticia. Una boleta sin marca suma participación, sin apoyar un proyecto. Puedes decidir no participar y completar la historia con los mismos reconocimientos.")
	for project in story.consultation.projects:
		_button("Elegir " + project.name, _results.bind(project.id))
	_button("Depositar boleta sin marca", _results.bind("unmarked"))
	_button("Decidir no participar", _results.bind("decline"))

func _results(choice: String) -> void:
	if Rules.first_missing(progress.completed, 2) >= 0:
		_start_chapter(2)
		return
	var result := Rules.consultation(0, choice, story.consultation)
	_panel("Resultado del escenario ficticio")
	_text("A: %d · B: %d · C: %d\nParticipantes: %d de %d. Boletas sin marca: %d." % [result.votes[0], result.votes[1], result.votes[2], result.participants, result.eligible, result.unmarked])
	if result.winners.size() > 1:
		_text("Hay un empate. Se abre una segunda decisión ficticia sin favorecer automáticamente un proyecto.")
	else:
		_text("Comienza: " + _project_name(["A", "B", "C"][result.winners[0]]) + ". Las demás necesidades siguen presentes.")
	_text("Tu decisión no se guarda. El reconocimiento de aprendizaje no depende de votar ni de elegir la opción ganadora.")
	_button("Explorar otros resultados inventados", _scenario_examples)
	_text("Después de esta consulta, falta dar seguimiento a lo que se acuerde y a las necesidades pendientes. ¿Qué pregunta quieres llevar a la conversación?")
	for question in ["¿Qué se hizo con el presupuesto?", "¿Cómo se atenderán las necesidades pendientes?", "¿Cuándo revisaremos el avance del proyecto?"]:
		_button(question, _finish)

func _scenario_examples() -> void:
	_panel("Más voces, distintas decisiones")
	_text(story.fiction_label)
	_text(_scenario_summary(1))
	_text(_scenario_summary(2))
	_text("El resultado también depende de las opciones que expresan las personas y de qué necesitan.")
	_text("Una voz cuenta aunque su proyecto no gane. Las necesidades de quienes piensan diferente siguen presentes.")
	_button("Revisar qué sigue", _followup)

func _project_name(id: String) -> String:
	for project in story.consultation.projects:
		if project.id == id:
			return project.name
	return id

func _scenario_summary(index: int) -> String:
	var result := Rules.consultation(index, "decline", story.consultation)
	return "Ejemplo inventado: %d residentes participan. %s: %d; %s: %d; %s: %d." % [result.participants, _project_name("A"), result.votes[0], _project_name("B"), result.votes[1], _project_name("C"), result.votes[2]]

func _followup() -> void:
	_panel("Después de decidir")
	for question in ["¿Qué se hizo con el presupuesto?", "¿Cómo se atenderán las necesidades pendientes?", "¿Cuándo revisaremos el avance del proyecto?"]:
		_button(question, _finish)

func _finish() -> void:
	if Rules.first_missing(progress.completed, 2) >= 0:
		_start_chapter(2)
		return
	chapter = 2
	if "consultation" not in progress.completed: progress.completed.append("consultation")
	_save()
	_update_status()
	CampaignView.talk_to_ines(self)

func _journal() -> void:
	if not valid:
		_panel("Contenido no disponible")
		_text("No pudimos validar la historia o los datos. Abre una copia completa del prototipo para consultar las fuentes.")
		return
	_panel("Diario · Las voces que construyen la plaza")
	_sound("sound.journal")
	_text("Materiales listos: %d de 3. Puedes volver a leer las fuentes y practicar con apoyo." % progress.completed.size())
	_text("Campaña impresa · FIN" if progress.campaign_printed else story.campaign.objective if not campaign_job.is_empty() else "Último paso: Inés enviará tu cartel a la imprenta después de la reunión.")
	if progress.campaign_printed: _button("Ver el final del recorrido", func(): CampaignView.ending(self))
	_poster_controls()
	PosterView.acknowledge(self)
	for item in story.get("chapters", []):
		_text(("Listo: " if item.id in progress.completed else "Pendiente: ") + item.title + "\n" + item.reflection)
	if valid:
		for id in ["national", "state_01", "state_02"]:
			_data_card(_record(id))
		_text("Método: sumar conteos antes de dividir. Tasa = 100 × SV ÷ (SV + NV). Clasificación desconocida = 100 × NS ÷ LN. Un denominador cero significa que no hay datos clasificables, no 0%.")
		_text("Fuente descargada: " + bundle.source.url + "\nSHA-256: " + bundle.source.sha256 + "\nDiccionario: " + bundle.source.dictionary_path)
		for limitation in bundle.validation.get("limits", []):
			_text("• " + limitation)
		_button("Abrir portal oficial CCPC", func(): OS.shell_open(bundle.source.portal_url))
	_text("Los resultados de la consulta son ficticios. Este prototipo no mide cambios en la participación electoral real.")
	_button("Créditos y licencias", _credits)
	if not storage_message.is_empty():
		_text(storage_message)

func _credits() -> void:
	_panel("Créditos y licencias")
	for path in ["res://THIRD_PARTY_NOTICES.txt", "res://GODOT_LICENSE.txt", "res://assets/fonts/OFL.txt"]:
		if FileAccess.file_exists(path):
			_text(FileAccess.get_file_as_string(path))

func _settings() -> void:
	_panel("Ajustes para tu recorrido")
	for setting in [["large_text", "Texto ampliado"], ["muted", "Sin sonido"], ["reduced_motion", "Movimiento reducido"]]:
		var toggle := CheckButton.new()
		toggle.text = setting[1]
		toggle.button_pressed = progress.settings[setting[0]]
		toggle.toggled.connect(_toggle.bind(setting[0]))
		body.add_child(toggle)
	var volume_label := _text("Volumen de la música: %d%%" % roundi(progress.settings.music_volume * 100))
	var volume := HSlider.new()
	volume.name = "MusicVolume"
	volume.accessibility_name = "Volumen de la música"
	volume.min_value = 0
	volume.max_value = 100
	volume.step = 5
	volume.value = progress.settings.music_volume * 100
	volume.custom_minimum_size.y = 40
	volume.value_changed.connect(func(value: float):
		progress.settings.music_volume = value / 100.0
		volume_label.text = "Volumen de la música: %d%%" % roundi(value)
		_start_music()
		_save())
	body.add_child(volume)
	_text("Camina con WASD y cruza las puertas. E o Enter interactúa con una persona u objeto cercano. Tab recorre los controles; Enter o Espacio activa el seleccionado. Esc cierra el panel sin cambiar de lugar.")
	if not valid:
		return
	_button("Reiniciar mi recorrido", func():
		_panel("¿Reiniciar el recorrido?")
		_text("Se borrarán los sellos y las pistas de este dispositivo. Puedes conservar tus ajustes.")
		_button("Sí, reiniciar", func():
			progress.completed = []
			progress.hints = []
			progress.campaign_printed = false
			campaign_job = {}
			campaign_pdf = PackedByteArray()
			meeting_poster = {}
			poster_selection = {"first": "state_01", "second": "state_02", "metric": "count", "question": "missing"}
			_save()
			_show_location(-1, Vector2(240, 176))
			_update_status()
			_welcome()))

func _toggle(value: bool, key: String) -> void:
	progress.settings[key] = value
	if key == "muted" and value:
		audio.stop()
		music.volume_linear = 0.0
	_start_music()
	_theme()
	_save()

func _save() -> void:
	progress = Rules.safe_progress(progress)
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file == null:
		storage_message = "El dispositivo no permite guardar. Puedes completar el recorrido durante esta sesión."
		return
	file.store_string(JSON.stringify(progress))
	file.close()


func _update_status() -> void:
	var place: String = "Plaza" if house_index < 0 else story.houses[house_index].title
	var next := "Habla con Luz"
	var missing := Rules.first_missing(progress.completed, 3)
	if missing == 1:
		next = "Revisa el cartel con Mateo"
	if missing == 2:
		next = "Visita a Inés"
	if missing == -1:
		next = "FIN · Campaña impresa" if progress.campaign_printed else story.campaign.objective if not campaign_job.is_empty() else "Habla con Inés para enviar tu cartel"
	status.text = "%s  ·  %d/4 pasos  ·  %s" % [place, progress.completed.size() + (1 if progress.campaign_printed else 0), next]
	InterfaceShell.refresh(self, missing)
	action_button.text = "Acércate para conversar"
	action_button.disabled = true
	if room != null:
		room.update_artifacts(progress.completed, bundle, meeting_poster, 2 if progress.campaign_printed else 1 if not campaign_job.is_empty() else 0)
