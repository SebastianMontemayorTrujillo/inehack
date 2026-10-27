extends RefCounted

const InterfaceStyle = preload("res://scripts/interface_theme.gd")
const MUTED := Color("c6d4c5")

static func build(app: Node, root: Control) -> void:
	app.world_controls.name = "WorldControls"
	root.add_child(app.world_controls)
	app.world_controls.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	app.world_controls.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var hud: Control = app.world_controls
	var title := label(app, hud, "VOCES DE LA PLAZA", Rect2(40, 16, 590, 40), 32, InterfaceStyle.CREAM, true)
	title.name = "GameTitle"
	label(app, hud, "VILLA BRISA · UNA REUNIÓN POR PREPARAR", Rect2(40, 62, 600, 28), 17, MUTED)
	for i in 3:
		var badge := PanelContainer.new()
		badge.position = Vector2(680 + i * 192, 20)
		badge.size = Vector2(176, 60)
		var box := InterfaceStyle.panel(Color("183f3b"), Color("5c7c69"), 1, 6)
		box.set_content_margin_all(8)
		badge.add_theme_stylebox_override("panel", box)
		badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hud.add_child(badge)
		var text := Label.new()
		text.name = "Progress" + str(i + 1)
		text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		text.add_theme_font_size_override("font_size", 17)
		text.add_theme_color_override("font_color", MUTED)
		badge.add_child(text)
		app.progress_labels.append(text)
	rule(hud, Rect2(40, 94, 1200, 2), Color("526e5d"))
	app.status.position = Vector2(40, 102)
	app.status.size = Vector2(1200, 50)
	app.status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	app.status.add_theme_font_size_override("font_size", 19)
	app.status.add_theme_color_override("font_color", InterfaceStyle.GOLD)
	hud.add_child(app.status)
	rule(hud, Rect2(40, 679, 1200, 2), Color("526e5d"))
	var nav := HBoxContainer.new()
	nav.position = Vector2(40, 690)
	nav.add_theme_constant_override("separation", 10)
	hud.add_child(nav)
	for item in [["Diario · J", app._journal], ["Ajustes", app._settings]]:
		var button := Button.new()
		button.text = item[0]
		button.pressed.connect(item[1])
		nav.add_child(button)
		if item[0] == "Diario · J": app.diary_button = button
	app.action_button.position = Vector2(40, 744)
	app.action_button.custom_minimum_size = Vector2(430, 44)
	app.action_button.theme_type_variation = "PrimaryButton"
	app.action_button.pressed.connect(app._accessible_action)
	hud.add_child(app.action_button)
	label(app, hud, "W A S D", Rect2(510, 695, 140, 30), 22, InterfaceStyle.GOLD, true)
	label(app, hud, "Caminar y cruzar puertas", Rect2(660, 697, 580, 28), 20, InterfaceStyle.CREAM)
	label(app, hud, "E / ENTER", Rect2(510, 733, 140, 30), 20, InterfaceStyle.GOLD, true)
	label(app, hud, "Hablar o examinar de cerca", Rect2(660, 735, 580, 28), 20, InterfaceStyle.CREAM)
	label(app, hud, "Tab: controles   ·   J: diario   ·   Esc: cerrar panel", Rect2(510, 770, 730, 24), 16, MUTED)
	app.backdrop.name = "DialogBackdrop"
	app.backdrop.color = Color(0.025, 0.07, 0.065, 0.66)
	app.backdrop.mouse_filter = Control.MOUSE_FILTER_STOP
	root.add_child(app.backdrop)
	app.backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	app.backdrop.hide()

static func refresh(app: Node, missing: int) -> void:
	var names := ["Boletín", "Cartel", "Reunión"]
	for i in app.progress_labels.size():
		var complete: bool = app.Rules.CHAPTERS[i] in app.progress.completed
		var state := "Listo" if complete else "Ahora" if i == missing else "Pendiente"
		var text: Label = app.progress_labels[i]
		text.text = "%d · %s\n%s" % [i + 1, names[i], state]
		text.add_theme_color_override("font_color", InterfaceStyle.GOLD if complete or i == missing else MUTED)
		text.add_theme_font_size_override("font_size", 20 if app.progress.settings.large_text else 17)
	app.status.add_theme_font_size_override("font_size", 22 if app.progress.settings.large_text else 19)
	for node in app.hud_labels:
		node.add_theme_font_size_override("font_size", int(node.get_meta("base_font_size")) + (2 if app.progress.settings.large_text else 0))

static func label(app: Node, parent: Control, value: String, rect: Rect2, size: int, color: Color, bold: bool = false) -> Label:
	var node := Label.new()
	node.text = value
	node.position = rect.position
	node.size = rect.size
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	node.add_theme_font_size_override("font_size", size)
	node.add_theme_color_override("font_color", color)
	node.set_meta("base_font_size", size)
	app.hud_labels.append(node)
	if bold:
		var font: Font = app.catalog.font("font.bold")
		if font != null: node.add_theme_font_override("font", font)
	parent.add_child(node)
	return node

static func rule(parent: Control, rect: Rect2, color: Color) -> void:
	var node := ColorRect.new()
	node.position = rect.position
	node.size = rect.size
	node.color = color
	node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(node)
