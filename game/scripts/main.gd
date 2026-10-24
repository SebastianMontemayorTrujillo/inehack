extends Node2D

# Godot 4.7: parents own scene connections; resources live under res://,
# progress under user://. Official references are in docs/source_register.md.
const Rules = preload("res://scripts/civic_rules.gd")
const Catalog = preload("res://scripts/asset_catalog.gd")
const CREAM := Color("f6f0da")
const INK := Color("173b39")
const GOLD := Color("e4ba5c")
const TEAL := Color("467c70")
const SAVE := "user://voces_progress_v1.json"
const STOPS := [Vector2(80, 135), Vector2(240, 135), Vector2(400, 135)]

var catalog := Catalog.new()
var bundle: Dictionary = {}
var story: Dictionary = {}
var progress := Rules.safe_progress({})
var world := Node2D.new()
var player := CharacterBody2D.new()
var player_art := Sprite2D.new()
var audio := AudioStreamPlayer.new()
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
var exhibit_marks: Array[Label] = []

func _ready() -> void:
	story = _read_json("res://content/story.json")
	bundle = _read_json("res://content/ccpc.json")
	valid = Rules.validate_bundle(bundle) and story.get("chapters") is Array and story.chapters.size() == 3 and story.get("consultation") is Dictionary
	if FileAccess.file_exists(save_path):
		var saved := _read_json(save_path)
		if saved.get("schema_version") == 1:
			progress = Rules.safe_progress(saved)
		else:
			storage_message = "No se pudo restaurar la partida. Puedes comenzar de nuevo."
	_configure_input()
	_theme()
	add_child(audio)
	add_child(world)
	world.position = Vector2(40, 156)
	world.scale = Vector2(2.5, 2.5)
	_build_world()
	add_child(canvas)
	_build_interface()
	if not valid:
		_panel("Contenido no disponible")
		_text("No pudimos validar los datos o la historia incluidos. Vuelve a abrir una copia completa del prototipo o consulta a la persona facilitadora. No mostramos cifras sustitutas.")
		_button("Cerrar", func(): overlay.hide())
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
	theme.default_font_size = 26 if progress.settings.large_text else 20
	var font: Font = catalog.font("font.regular")
	if font != null:
		theme.default_font = font
	for state in ["normal", "hover", "pressed", "focus", "disabled"]:
		var box := StyleBoxFlat.new()
		box.bg_color = Color("e7dbb9") if state == "normal" else Color("d4bd80")
		if state == "disabled":
			box.bg_color = Color("d0cbbb")
		box.border_color = Color("b77b29") if state == "focus" else Color("6d8774")
		box.set_border_width_all(3 if state == "focus" else 1)
		box.set_corner_radius_all(8)
		box.content_margin_left = 16
		box.content_margin_right = 16
		box.content_margin_top = 9
		box.content_margin_bottom = 9
		theme.set_stylebox(state, "Button", box)
		theme.set_color("font_color" if state == "normal" else "font_" + state + "_color", "Button", INK)
	theme.set_color("font_color", "Label", INK)

func _configure_input() -> void:
	var keys := {"left": [KEY_A, KEY_LEFT], "right": [KEY_D, KEY_RIGHT], "up": [KEY_W, KEY_UP], "down": [KEY_S, KEY_DOWN]}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		for key in keys[action]:
			var event := InputEventKey.new()
			event.physical_keycode = key
			InputMap.action_add_event(action, event)

func _build_world() -> void:
	var tiles := TileSet.new()
	tiles.tile_size = Vector2i(16, 16)
	var roles := ["terrain.grass", "terrain.path", "terrain.paving", "terrain.water"]
	for i in roles.size():
		var source := TileSetAtlasSource.new()
		source.texture = catalog.texture(roles[i])
		source.texture_region_size = Vector2i(16, 16)
		source.create_tile(Vector2i.ZERO)
		tiles.add_source(source, i)
	var ground := TileMapLayer.new()
	ground.tile_set = tiles
	ground.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	world.add_child(ground)
	for x in 30:
		for y in 13:
			var tile := 2 if y in range(7, 11) else 0
			if x in range(13, 17) or y == 11:
				tile = 1
			if x >= 26 and y < 5:
				tile = 3
			ground.set_cell(Vector2i(x, y), tile, Vector2i.ZERO)
	var buildings := ["building.printshop", "building.archive", "building.hall"]
	var people := ["character.luz", "character.mateo", "character.ines"]
	var props := ["prop.printer", "prop.noticeboard", "prop.ballotbox"]
	for i in 3:
		_sprite(buildings[i], Vector2(STOPS[i].x, 62))
		_sprite(people[i], STOPS[i] - Vector2(20, 12))
		_sprite(props[i], STOPS[i] + Vector2(18, -3))
		var label := Label.new()
		label.text = ["LUZ · IMPRENTA", "MATEO · ARCHIVO", "INÉS · ASAMBLEA"][i]
		label.add_theme_font_size_override("font_size", 7)
		label.add_theme_color_override("font_color", Color("173b39"))
		label.position = Vector2(STOPS[i].x - 40, 98)
		world.add_child(label)
		var obstacle := StaticBody2D.new()
		var collider := CollisionShape2D.new()
		var shape := RectangleShape2D.new()
		shape.size = Vector2(52, 34)
		collider.shape = shape
		obstacle.add_child(collider)
		obstacle.position = Vector2(STOPS[i].x, 65)
		world.add_child(obstacle)
	for p in [Vector2(20, 35), Vector2(145, 46), Vector2(316, 42), Vector2(470, 180)]:
		_sprite("prop.tree", p)
	_sprite("prop.bench", Vector2(170, 178))
	_sprite("prop.bench", Vector2(330, 178))
	for i in 3:
		var exhibit := Label.new()
		exhibit.position = Vector2(STOPS[i].x - 45, 176)
		exhibit.add_theme_font_size_override("font_size", 8)
		exhibit.add_theme_color_override("font_color", INK)
		world.add_child(exhibit)
		exhibit_marks.append(exhibit)
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

func _sprite(role: String, point: Vector2) -> void:
	var sprite := Sprite2D.new()
	sprite.texture = catalog.texture(role)
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.position = point
	world.add_child(sprite)

func _build_interface() -> void:
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.theme = theme
	canvas.add_child(root)
	var heading := Label.new()
	heading.text = "VOCES DE LA PLAZA"
	heading.position = Vector2(40, 20)
	heading.add_theme_font_size_override("font_size", 32)
	heading.add_theme_color_override("font_color", CREAM)
	root.add_child(heading)
	var sub := Label.new()
	sub.text = "Las voces que construyen la plaza · CCPC 2024 · Una aventura para conversar con información"
	sub.position = Vector2(40, 65)
	sub.add_theme_color_override("font_color", Color("d4dfca"))
	root.add_child(sub)
	status.position = Vector2(40, 103)
	status.add_theme_color_override("font_color", GOLD)
	root.add_child(status)
	var nav := HBoxContainer.new()
	nav.position = Vector2(40, 700)
	nav.add_theme_constant_override("separation", 10)
	root.add_child(nav)
	for i in 3:
		var button := Button.new()
		button.text = ["1 · Imprenta", "2 · Archivo", "3 · Asamblea"][i]
		button.pressed.connect(_travel.bind(i))
		nav.add_child(button)
	for item in [["Diario · J", _journal], ["Ajustes", _settings]]:
		var button := Button.new()
		button.text = item[0]
		button.pressed.connect(item[1])
		nav.add_child(button)
	var help := Label.new()
	help.text = "WASD / flechas: caminar   E / Enter: conversar   J: diario   Esc: volver · También puedes viajar con los botones."
	help.position = Vector2(40, 758)
	help.add_theme_font_size_override("font_size", 17)
	help.add_theme_color_override("font_color", CREAM)
	root.add_child(help)
	var shade := StyleBoxFlat.new()
	shade.bg_color = CREAM
	shade.set_corner_radius_all(12)
	shade.set_content_margin_all(24)
	shade.border_color = GOLD
	shade.set_border_width_all(3)
	overlay.add_theme_stylebox_override("panel", shade)
	overlay.position = Vector2(160, 136)
	overlay.size = Vector2(960, 555)
	root.add_child(overlay)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(904, 497)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	overlay.add_child(scroll)
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation", 14)
	scroll.add_child(body)
	_update_status()

func _physics_process(delta: float) -> void:
	if not overlay.visible:
		var movement := Input.get_vector("left", "right", "up", "down")
		player.velocity = movement * 65
		player.move_and_slide()
		player.position.x = clampf(player.position.x, 8, 472)
		player.position.y = clampf(player.position.y, 12, 198)
		anim_time += delta
		if movement != Vector2.ZERO:
			facing = ("right" if movement.x > 0 else "left") if abs(movement.x) > abs(movement.y) else ("down" if movement.y > 0 else "up")
		var frame := 0 if movement == Vector2.ZERO or progress.settings.reduced_motion else 1 + int(anim_time * 7) % 2
		player_art.texture = catalog.character_frame("character.player", facing, frame)
		player_art.position.y = 0 if progress.settings.reduced_motion or movement == Vector2.ZERO else sin(anim_time * 14) * 0.6

func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_pressed() and not event.is_echo() and event is InputEventKey:
		if event.keycode == KEY_ESCAPE:
			overlay.hide()
		elif event.keycode == KEY_J:
			_journal()
		elif event.keycode in [KEY_E, KEY_ENTER] and not overlay.visible:
			for i in STOPS.size():
				if player.position.distance_to(STOPS[i]) < 48:
					_start_chapter(i)
					break

func _panel(title: String) -> void:
	for child in body.get_children():
		body.remove_child(child)
		child.queue_free()
	overlay.show()
	var label := _text(title)
	label.add_theme_font_size_override("font_size", 30)
	var close := Button.new()
	close.text = "Volver a la plaza · Esc"
	close.pressed.connect(func(): overlay.hide())
	body.add_child(close)
	call_deferred("_focus_if_available", weakref(close))

func _focus_if_available(reference: WeakRef) -> void:
	var control: Control = reference.get_ref()
	if control != null and control.is_inside_tree() and not control.is_queued_for_deletion():
		control.grab_focus()

func _text(value: String) -> Label:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_child(label)
	return label

func _button(title: String, action: Callable) -> Button:
	var button := Button.new()
	button.text = title
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.pressed.connect(func(): _sound("sound.select"); action.call())
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

func _welcome() -> void:
	_panel("Bienvenida a Villa Brisa")
	_text("Hoy se inaugura la exposición «Las voces que construyen la plaza». Ayuda a Luz y Mateo a convertir datos oficiales en historias que cualquiera pueda comprender. Después, acompaña a Inés a una decisión colectiva ficticia.")
	_text(story.get("message", "Comprender los datos nos ayuda a participar con información."))
	_text("Duración orientativa: 10–15 minutos. No hay cronómetro. Puedes explorar, pedir pistas, ampliar el texto o usar los botones para viajar.")
	if not storage_message.is_empty():
		_text(storage_message)
	_button("Entrar a la plaza", func(): overlay.hide())
	_button("Elegir ajustes de lectura", _settings)

func _record(id: String) -> Dictionary:
	for record in bundle.get("records", []):
		if record.id == id:
			return record
	return {}

func _travel(index: int) -> void:
	player.position = STOPS[index] + Vector2(0, 25)
	_start_chapter(index)

func _start_chapter(index: int) -> void:
	if not valid:
		return
	chapter = index
	step = 0
	var id: String = Rules.CHAPTERS[index]
	if index > 0 and Rules.CHAPTERS[index - 1] not in progress.completed:
		_panel("Primero, construyamos la evidencia")
		_text("Visita primero la imprenta y después el archivo. La asamblea comienza con una exposición que todas las personas puedan revisar.")
		return
	_panel(story.chapters[index].title)
	_text(story.chapters[index].npc + ": «" + story.chapters[index].intro + "»")
	if id in progress.completed:
		_text("Este capítulo ya tiene su sello. Puedes volver a explorarlo sin borrar el diario.")
	_button("Investigar: " + story.chapters[index].question, _question)

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

func _bar(title: String, percent: float) -> void:
	_text(title)
	var bar := ProgressBar.new()
	bar.min_value = 0
	bar.max_value = 100
	bar.value = percent
	bar.show_percentage = false
	bar.custom_minimum_size.y = 22
	var fill := StyleBoxFlat.new()
	fill.bg_color = TEAL
	bar.add_theme_stylebox_override("fill", fill)
	body.add_child(bar)

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

func _question() -> void:
	if chapter == 2:
		_consultation()
		return
	_panel(story.chapters[chapter].question)
	if chapter == 0:
		if step == 0:
			_data_card(_record("national"))
			_text("Para calcular la participación entre los registros que sí podemos clasificar, ¿qué denominador debe usar el boletín?")
			_options(["SV + NV: registros clasificados", "LN: incluir también los desconocidos", "SV: sólo quienes tienen marca"], 0, "NS significa clasificación desconocida. No podemos tratar esos registros como abstención.")
		else:
			_text("Caso nuevo, didáctico y ficticio: SV = 60, NV = 30, NS = 10, LN = 100. ¿Cuál es la participación entre registros clasificados?")
			_options(["60%: dividir entre 100", "66.67%: dividir 60 entre 90", "90%: sumar los clasificados"], 1, "Conserva la misma regla: SV ÷ (SV + NV). Los 10 desconocidos se explican aparte.")
	else:
		if step < 3:
			_data_card(_record("state_01"))
			_data_card(_record("state_02"))
		if step == 0:
			_text("¿Qué entidad tiene más registros con marca de participación?")
			_options([_record("state_01").geography_name, _record("state_02").geography_name, "Tienen el mismo conteo", "No hay datos para comparar"], Rules.compare_records(_record("state_01"), _record("state_02"), "count"), "Compara los conteos SV antes de mirar las tasas.")
		elif step == 1:
			_text("¿Cuál tiene una tasa de participación mayor entre sus registros clasificados?")
			_options([_record("state_01").geography_name, _record("state_02").geography_name, "Tienen la misma tasa", "Sin datos clasificables para comparar"], Rules.compare_records(_record("state_01"), _record("state_02"), "rate"), "Un conteo mayor puede convivir con una tasa menor: los denominadores tienen tamaños distintos.")
		elif step == 2:
			var combined: Variant = Rules.combined_rate(_record("state_01"), _record("state_02"))
			var first_rate: Variant = Rules.rate(_record("state_01").sv, int(_record("state_01").sv) + int(_record("state_01").nv))
			var second_rate: Variant = Rules.rate(_record("state_02").sv, int(_record("state_02").sv) + int(_record("state_02").nv))
			var average: Variant = (first_rate + second_rate) / 2.0 if first_rate != null and second_rate != null else null
			_text("Para reunir las dos entidades, suma los conteos y después divide. ¿Qué tasa corresponde al conjunto?")
			_options([_percentage(average) + ": promedio simple de tasas", _percentage(combined) + ": suma de SV ÷ suma de (SV + NV)"], 1, "Las entidades tienen diferentes denominadores. Promediar sus tasas con el mismo peso cambia la pregunta.")
		elif step == 3:
			_text("Elige el mensaje que puede publicarse en el cartel.")
			_options(["Una tasa menor demuestra menos interés de cada habitante", "Los registros muestran tasas distintas; no explican por sí solos los motivos", "Los conteos revelan qué opción política prefirió la gente"], 1, "Una observación agregada no revela motivaciones individuales ni preferencias partidistas.")
		else:
			_text("Caso nuevo y ficticio: un lugar tiene SV=20 y NV=20; otro SV=60 y NV=140. Al reunirlos, ¿qué tasa se obtiene?")
			_options(["40%: promedio de 50% y 30%", "33.33%: 80 ÷ 240"], 1, "Suma las marcas: 80. Suma los clasificados: 240.")
	_button("Consultar fuente y método", _journal)

func _options(options: Array, correct: int, explanation: String) -> void:
	for i in options.size():
		_button(options[i], _answer.bind(i == correct, explanation))
	_button("Pedir una pista", func():
		if Rules.CHAPTERS[chapter] not in progress.hints:
			progress.hints.append(Rules.CHAPTERS[chapter])
		_save()
		_text("Pista: " + explanation))

func _answer(correct: bool, explanation: String) -> void:
	_panel("Una evidencia para la plaza" if correct else "Revisemos la interpretación")
	_text(explanation)
	if correct:
		step += 1
		if (chapter == 0 and step >= 2) or (chapter == 1 and step >= 5):
			_complete()
		else:
			_button("Continuar la investigación", _question)
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
	_text("Sello del diario: " + story.chapters[chapter].title)
	_text(story.chapters[chapter].reflection)
	if chapter == 0:
		var record := _record("national")
		_text("Boletín construido: participación nacional entre registros clasificados de 2024: %s. La clasificación desconocida se presenta por separado." % _percentage(record.participation_pct))
	elif chapter == 1:
		var a := _record("state_01")
		var b := _record("state_02")
		_text("Cartel corregido: %s tiene %s SV y una tasa de %s; %s tiene %s SV y una tasa de %s. Las cifras no explican los motivos individuales." % [a.geography_name, _number(a.sv), _percentage(a.participation_pct), b.geography_name, _number(b.sv), _percentage(b.participation_pct)])
	else:
		_text("La exposición está completa. Tu recorrido ayudó a traducir datos oficiales en una historia comprensible. La conversación democrática continúa.")
		_text(story.message)
	_button("Ver mi exposición y las fuentes", _journal)
	_button("Volver a la plaza", func(): overlay.hide())

func _consultation() -> void:
	_panel("Una plaza, varias ideas")
	_text(story.consultation.label)
	_text("Escenario ficticio: 30 residentes con preferencias fijas A12/B10/C8. Participan 16: A8/B5/C3. Tú eres una persona adicional. Hay presupuesto para comenzar un proyecto; los otros siguen siendo necesidades legítimas.")
	for project in story.consultation.projects:
		_text(project.id + " · " + project.name + ": " + project.benefit + " " + project.tradeoff)
	_text("Regla del ejemplo: gana el proyecto con más marcas. Un empate abre una segunda decisión ficticia. Una boleta sin marca suma participación, sin apoyar un proyecto. Puedes decidir no participar y completar la historia con los mismos reconocimientos.")
	for project in story.consultation.projects:
		_button("Elegir " + project.name, _results.bind(project.id))
	_button("Depositar boleta sin marca", _results.bind("unmarked"))
	_button("Decidir no participar", _results.bind("decline"))

func _results(choice: String) -> void:
	var result := Rules.consultation(0, choice)
	_panel("Resultado del escenario ficticio")
	_text("A: %d · B: %d · C: %d\nParticipantes: %d de 31. Boletas sin marca: %d." % [result.votes[0], result.votes[1], result.votes[2], result.participants, result.unmarked])
	if result.winners.size() > 1:
		_text("Hay un empate. Se abre una segunda decisión ficticia sin favorecer automáticamente un proyecto.")
	else:
		_text("Comienza: " + story.consultation.projects[result.winners[0]].name + ". Las demás necesidades siguen presentes.")
	_text("Tu decisión no se guarda. El reconocimiento de aprendizaje no depende de votar ni de elegir la opción ganadora.")
	_text("Para comparar: con más participantes, A11/B8/C6 mantiene a A al frente; A8/B10/C7 da la ventaja a B con el mismo total de 25. La cantidad de participantes no determina por sí sola qué proyecto gana.")
	_text("Ganó un proyecto. Todavía falta revisar cómo se realiza y qué necesidades quedan pendientes. ¿Qué pregunta quieres llevar a la conversación?")
	for question in ["¿Qué se hizo con el presupuesto?", "¿Cómo se atenderán las necesidades pendientes?", "¿Cuándo revisaremos el avance del proyecto?"]:
		_button(question, _finish)

func _finish() -> void:
	_panel("La plaza sigue conversando")
	_complete()

func _journal() -> void:
	_panel("Diario · Las voces que construyen la plaza")
	_sound("sound.journal")
	_text("Capítulos completos: %d de 3. Las pistas se registran por separado de la finalización; terminar no acredita por sí solo dominio independiente." % progress.completed.size())
	for item in story.get("chapters", []):
		_text(("✓ " if item.id in progress.completed else "○ ") + item.title + "\n" + item.reflection)
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
	_text("Todas las acciones tienen botones y se pueden completar con teclado. Tab recorre los controles; Enter o Espacio activa el seleccionado.")
	_button("Reiniciar mi recorrido", func():
		_panel("¿Reiniciar el recorrido?")
		_text("Se borrarán los sellos y las pistas de este dispositivo. Puedes conservar tus ajustes.")
		_button("Sí, reiniciar", func():
			progress.completed = []
			progress.hints = []
			_save()
			_update_status()
			_welcome()))

func _toggle(value: bool, key: String) -> void:
	progress.settings[key] = value
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
	status.text = "EXPOSICIÓN · %d / 3 capítulos · Explora la plaza y conversa con sus habitantes" % progress.completed.size()
	if exhibit_marks.size() != 3:
		return
	exhibit_marks[0].text = "PUBLICA UN BOLETÍN\nConversar con Luz"
	exhibit_marks[1].text = "REVISA EL CARTEL\nConversar con Mateo"
	exhibit_marks[2].text = "COMPARTE UNA PREGUNTA\nConversar con Inés"
	if valid and "printing" in progress.completed:
		exhibit_marks[0].text = "BOLETÍN CON FUENTE\nCCPC 2024 · " + _percentage(_record("national").participation_pct)
	if valid and "comparison" in progress.completed:
		exhibit_marks[1].text = "CARTEL CORREGIDO\nTasa conjunta: " + _percentage(Rules.combined_rate(_record("state_01"), _record("state_02")))
	if "consultation" in progress.completed:
		exhibit_marks[2].text = "LA CONVERSACIÓN SIGUE\n¿Qué necesidades faltan?"
