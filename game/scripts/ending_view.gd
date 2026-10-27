extends Control
## A bounded ending inside the existing modal. Only the poster scrolls.
signal download_requested
signal explore_requested

const PINK := Color("b41476")
const WHITE := Color("ffffff")
const INK := Color("242124")
const PALE := Color("fbeaf3")
const REVEAL_SECONDS := 2.0

var reveal_tween: Tween
var reveal_running := false
var _animate := false
var _layout_frames := 2
var _skip_key: Key = KEY_NONE
var _expanded := false
var _bold: Font
var _poster: Control
var _create_poster: Callable
var _reveal: VBoxContainer
var _final: VBoxContainer
var _sheet: PanelContainer
var _stage: Control
var _skip: Button
var _download: Button
var _enlarge: Button
var _explore: Button
var _summary: Label
var _message: Label
var _poster_scroll: ScrollContainer

func configure(app: Node, poster: Control, animate: bool, poster_factory: Callable) -> void:
	name = "EndingView"
	custom_minimum_size = Vector2(0, 680)
	size_flags_horizontal = Control.SIZE_EXPAND_FILL
	theme = app.theme
	_bold = app.catalog.font("font.bold")
	_poster = poster
	_create_poster = poster_factory
	_animate = animate and not app.progress.settings.reduced_motion and poster != null
	_build_reveal()
	_build_final(app)
	_final.visible = not _animate
	_reveal.visible = _animate
	visibility_changed.connect(_on_visibility_changed)

func _ready() -> void:
	set_process(_animate)
	if _animate:
		reveal_running = true
		_skip.grab_focus()
	else:
		_focus_final.call_deferred()

func _process(_delta: float) -> void:
	# Ancestor containers sort after insertion. Wait for their first layout
	# before measuring the press; otherwise the sheet can start above the clip.
	_layout_frames -= 1
	if _layout_frames == 0:
		set_process(false)
		_start_reveal()

func _column() -> VBoxContainer:
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 14)
	add_child(column)
	column.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	return column

func _build_reveal() -> void:
	_reveal = _column()
	_label(_reveal, "La prensa de Luz", 44, true)
	_label(_reveal, "Tu cartel está saliendo de la prensa.", theme.default_font_size)
	_stage = Control.new()
	_stage.clip_contents = true
	_stage.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_reveal.add_child(_stage)
	_sheet = PanelContainer.new()
	_sheet.name = "PrintingSheet"
	_sheet.hide()
	_sheet.add_theme_stylebox_override("panel", _box(WHITE, PALE, 2, 22))
	_stage.add_child(_sheet)
	var paper := VBoxContainer.new()
	paper.add_theme_constant_override("separation", 20)
	_sheet.add_child(paper)
	var headline := _label(paper, "Tu voto cuenta.\nInfórmate y participa.", 32, true)
	headline.add_theme_color_override("font_color", PINK)
	var invitation := _label(paper, "Una invitación a conversar con información.", 22)
	invitation.add_theme_color_override("font_color", INK)
	var press := PanelContainer.new()
	press.add_theme_stylebox_override("panel", _box(INK, WHITE, 2, 12))
	_stage.add_child(press)
	press.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	press.offset_top = -64
	_label(press, "Imprimiendo tu cartel", 24, true).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var controls := HBoxContainer.new()
	controls.add_theme_constant_override("separation", 14)
	_reveal.add_child(controls)
	_skip = _button(controls, "Saltar animación · E / Enter", skip_reveal)
	_button(controls, "Cerrar · Esc", func(): explore_requested.emit())

func _build_final(app: Node) -> void:
	_final = _column()
	var heading := HBoxContainer.new()
	heading.add_theme_constant_override("separation", 24)
	_final.add_child(heading)
	var fin := _label(heading, "FIN", 64, true)
	fin.name = "EndingHeading"
	fin.autowrap_mode = TextServer.AUTOWRAP_OFF
	fin.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	var title := _label(heading, str(app.story.campaign.ending_title).trim_prefix("FIN · "), 30, true)
	title.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var actions := HBoxContainer.new()
	actions.name = "EndingActions"
	actions.add_theme_constant_override("separation", 12)
	_final.add_child(actions)
	_download = _button(actions, app.story.campaign.download_label, func(): download_requested.emit(), true)
	_download.disabled = app.campaign_pdf.is_empty()
	_enlarge = _button(actions, "Ampliar cartel", _toggle_poster)
	_enlarge.disabled = _poster == null
	_explore = _button(actions, "Seguir explorando", func(): explore_requested.emit())
	_summary = _label(_final, app.story.campaign.completed_reload if app.campaign_pdf.is_empty() else app.story.campaign.ending, theme.default_font_size)
	_message = _label(_final, "", theme.default_font_size)
	_message.name = "EndingDownloadStatus"
	_message.max_lines_visible = 2
	_message.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	_message.hide()
	set_message(app.storage_message)
	if _poster == null: return
	_poster_scroll = ScrollContainer.new()
	_poster_scroll.name = "EndingPosterScroll"
	_poster_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_poster_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	_poster_scroll.follow_focus = true
	_poster_scroll.focus_mode = Control.FOCUS_ALL
	_poster_scroll.draw_focus_border = true
	_poster_scroll.accessibility_name = "Cartel ciudadano; usa las flechas para recorrerlo"
	_poster_scroll.add_theme_stylebox_override("focus", _box(Color.TRANSPARENT, WHITE, 3, 0))
	_poster_scroll.gui_input.connect(_scroll_poster_input)
	_final.add_child(_poster_scroll)
	_poster_scroll.add_child(_poster)

func _start_reveal() -> void:
	if not is_inside_tree() or not is_visible_in_tree() or not reveal_running: return
	_sheet.size = Vector2(430, 350)
	_sheet.position = Vector2((_stage.size.x - _sheet.size.x) / 2, _stage.size.y - 64)
	_sheet.show()
	_skip.grab_focus()
	# Binding to this child makes teardown independent of the application's root.
	# https://docs.godotengine.org/en/stable/classes/class_tween.html
	reveal_tween = create_tween()
	reveal_tween.tween_property(_sheet, "position:y", 8.0, REVEAL_SECONDS).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	reveal_tween.finished.connect(skip_reveal)

func _input(event: InputEvent) -> void:
	if not is_visible_in_tree() or not event is InputEventKey: return
	if _skip_key != KEY_NONE and event.keycode == _skip_key:
		get_viewport().set_input_as_handled()
		if not event.pressed: _skip_key = KEY_NONE
		return
	if reveal_running and event.pressed and not event.echo and event.keycode in [KEY_E, KEY_ENTER, KEY_KP_ENTER]:
		_skip_key = event.keycode
		get_viewport().set_input_as_handled()
		skip_reveal()

func skip_reveal() -> void:
	if not is_inside_tree() or not is_visible_in_tree(): return
	_stop_reveal()
	_reveal.hide()
	_final.show()
	_focus_final()

func _focus_final() -> void:
	if not is_inside_tree() or not is_visible_in_tree(): return
	(_explore if _download.disabled else _download).grab_focus()

func _toggle_poster() -> void:
	_expanded = not _expanded
	_enlarge.text = "Reducir cartel" if _expanded else "Ampliar cartel"
	_summary.visible = not _expanded
	_poster_scroll.remove_child(_poster)
	_poster.queue_free()
	_poster = _create_poster.call(not _expanded)
	_poster_scroll.add_child(_poster)
	_poster_scroll.scroll_vertical = 0

func _scroll_poster_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed: return
	match event.keycode:
		KEY_DOWN: _poster_scroll.scroll_vertical += 48
		KEY_UP: _poster_scroll.scroll_vertical -= 48
		KEY_RIGHT: _poster_scroll.scroll_horizontal += 48
		KEY_LEFT: _poster_scroll.scroll_horizontal -= 48
		KEY_PAGEDOWN: _poster_scroll.scroll_vertical += int(_poster_scroll.size.y * 0.8)
		KEY_PAGEUP: _poster_scroll.scroll_vertical -= int(_poster_scroll.size.y * 0.8)
		KEY_HOME: _poster_scroll.scroll_vertical = 0
		KEY_END: _poster_scroll.scroll_vertical = int(_poster_scroll.get_v_scroll_bar().max_value)
		_: return
	_poster_scroll.accept_event()

func set_message(value: String) -> void:
	_message.text = value
	_message.tooltip_text = value
	_message.visible = not value.is_empty()

func _on_visibility_changed() -> void:
	if not is_visible_in_tree(): _stop_reveal()

func _stop_reveal() -> void:
	reveal_running = false
	set_process(false)
	if reveal_tween != null and reveal_tween.is_valid(): reveal_tween.kill()

func _exit_tree() -> void:
	_stop_reveal()

func _label(parent: Control, value: String, font_size: int, bold: bool = false) -> Label:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.add_theme_color_override("font_color", WHITE)
	label.add_theme_font_size_override("font_size", font_size)
	if bold and _bold != null: label.add_theme_font_override("font", _bold)
	parent.add_child(label)
	return label

func _button(parent: Control, value: String, action: Callable, primary: bool = false) -> Button:
	var button := Button.new()
	button.text = value
	button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	button.custom_minimum_size.y = 52
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for state in ["normal", "hover", "pressed", "disabled"]:
		var primary_enabled: bool = primary and state != "disabled"
		var fill := INK if primary_enabled else WHITE if state == "normal" else PALE
		var border := INK if primary_enabled and state == "normal" else WHITE
		button.add_theme_stylebox_override(state, _box(fill, border, 2, 12))
		button.add_theme_color_override("font_color" if state == "normal" else "font_" + state + "_color", WHITE if primary_enabled else INK)
	button.add_theme_color_override("font_focus_color", WHITE if primary else INK)
	var focus := _box(Color.TRANSPARENT, WHITE if primary else INK, 3, 0)
	focus.draw_center = false
	button.add_theme_stylebox_override("focus", focus)
	button.pressed.connect(action)
	parent.add_child(button)
	return button

static func _box(fill: Color, border: Color, width: int, margin: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = border
	style.set_border_width_all(width)
	style.set_content_margin_all(margin)
	return style
