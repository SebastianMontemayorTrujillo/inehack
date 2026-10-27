extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")
const VIEW_SIZE := Vector2i(1280, 800)

var viewport: SubViewport
var game: Node
var save_path: String

func before_each() -> void:
	# Keep GUT's own buttons out of the game's real GUI focus traversal.
	viewport = SubViewport.new()
	viewport.size = VIEW_SIZE
	viewport.world_2d = World2D.new()
	add_child_autofree(viewport)
	save_path = "user://interface_test_%d.json" % OS.get_process_id()
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = save_path
	game.progress.settings.muted = true
	viewport.add_child(game)
	await wait_process_frames(4)
	game._close_panel()
	game._enter_house(2)
	game.player.position = Vector2(175, 119)
	await wait_physics_frames(3)
	await wait_process_frames(4)

func after_each() -> void:
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)

func press_key(key: Key, shift: bool = false) -> void:
	# Dispatch through Godot's GUI/unhandled-input pipeline, not pressed.emit().
	for pressed in [true, false]:
		var event := InputEventKey.new()
		event.keycode = key
		event.physical_keycode = key
		event.shift_pressed = shift
		event.pressed = pressed
		viewport.push_input(event)
		await wait_process_frames(1)
	await wait_process_frames(3)

func click_center(control: Control) -> void:
	var point := control.get_global_rect().get_center()
	var motion := InputEventMouseMotion.new()
	motion.position = point
	motion.global_position = point
	viewport.push_input(motion, true)
	for pressed in [true, false]:
		var event := InputEventMouseButton.new()
		event.position = point
		event.global_position = point
		event.button_index = MOUSE_BUTTON_LEFT
		event.button_mask = MOUSE_BUTTON_MASK_LEFT if pressed else 0
		event.pressed = pressed
		viewport.push_input(event, true)
		await wait_process_frames(1)
	await wait_process_frames(3)

func caption(control: Control) -> String:
	if control == null:
		return "<no focus>"
	if control is Label or control is Button:
		return control.text.replace("\n", " / ")
	return control.get_class()

func visible_button(root: Node, prefix: String) -> Button:
	for control in root.find_children("*", "Button", true, false):
		if control.is_visible_in_tree() and control.text.begins_with(prefix):
			return control
	fail_test("Missing visible button: " + prefix)
	return null

func open_settings() -> void:
	var settings := visible_button(game.canvas, "Ajustes")
	if settings == null:
		return
	settings.grab_focus()
	await press_key(KEY_SPACE)
	assert_true(game.overlay.visible, "Space opens the selected settings button")
	assert_not_null(visible_button(game.overlay, "Texto ampliado"))

func panel_controls() -> Array[Control]:
	var controls: Array[Control] = []
	for control in game.overlay.find_children("*", "Control", true, false):
		if control.is_visible_in_tree() and control.focus_mode == Control.FOCUS_ALL:
			if not control is BaseButton or not control.disabled:
				controls.append(control)
	return controls

func test_enlarged_completed_hall_hud_fits_without_overflow_or_overlap() -> void:
	game.progress.completed = Rules.CHAPTERS.duplicate()
	game.progress.settings.large_text = true
	game._theme()
	game._update_status()
	await wait_physics_frames(3)
	await wait_process_frames(4)
	assert_eq(viewport.get_visible_rect().size, Vector2(VIEW_SIZE))
	assert_eq(game.location_id, "hall")
	assert_eq(game.progress.completed.size(), 3)
	assert_true(game.status.is_visible_in_tree(), "Progress remains visible at enlarged text")
	assert_not_null(visible_button(game.canvas, "Diario"))
	assert_not_null(visible_button(game.canvas, "Ajustes"))
	assert_false(game.action_button.disabled, "The nearby Inés interaction remains available")
	# Include instructions and headings as well as essential controls. Select by
	# visible content/type, so a layout refactor does not require test-only nodes.
	var controls: Array[Control] = []
	for control in game.canvas.find_children("*", "Control", true, false):
		if control.is_visible_in_tree() and not game.overlay.is_ancestor_of(control):
			if control is Label or control is Button:
				controls.append(control)
	assert_has(controls, game.status)
	assert_has(controls, game.action_button)
	for index in controls.size():
		var control := controls[index]
		var rect := control.get_global_rect()
		assert_true(viewport.get_visible_rect().grow(1).encloses(rect),
			"HUD fits 1280x800: %s; rect=%s" % [caption(control), rect])
		for other in controls.slice(index + 1):
			var overlap := rect.intersection(other.get_global_rect())
			assert_false(overlap.size.x > 1 and overlap.size.y > 1,
				"HUD must not overlap: %s / %s; intersection=%s" % [caption(control), caption(other), overlap])

func assert_panel_tab_cycle(shift: bool) -> void:
	await open_settings()
	var controls := panel_controls()
	var visited: Array[Control] = []
	var direction := "Shift+Tab" if shift else "Tab"
	var initial: Control = viewport.gui_get_focus_owner()
	assert_true(initial != null and game.overlay.is_ancestor_of(initial), "Opening gives focus to the panel")
	if initial != null:
		visited.append(initial)
	# Enough presses for a full cycle plus its wrap boundary, not just one step.
	for index in controls.size() + 1:
		await press_key(KEY_TAB, shift)
		var focused: Control = viewport.gui_get_focus_owner()
		assert_true(focused != null and game.overlay.is_ancestor_of(focused),
			"%s step %d stays in active panel; focused=%s" % [direction, index + 1, caption(focused)])
		if focused != null and focused not in visited:
			visited.append(focused)
	for control in controls:
		assert_has(visited, control, direction + " reaches panel control: " + caption(control))
	assert_gt(visited.size(), 1, "Tab actually moves focus instead of swallowing every key")

func test_tab_stays_in_active_panel_through_wraparound() -> void:
	await assert_panel_tab_cycle(false)

func test_shift_tab_stays_in_active_panel_through_wraparound() -> void:
	await assert_panel_tab_cycle(true)

func test_tab_cannot_activate_underlying_journal_settings_or_action() -> void:
	var world_buttons: Array[Button] = [visible_button(game.canvas, "Diario"), visible_button(game.canvas, "Ajustes"), game.action_button]
	var position: Vector2 = game.player.position
	for target in world_buttons:
		if target == null:
			continue
		await open_settings()
		# Observe actual activation after keyboard traversal. A correct focus trap
		# never reaches this target; do not force focus behind a working modal.
		watch_signals(target)
		var before_count: int = get_signal_emit_count(target, "pressed")
		for index in panel_controls().size() + world_buttons.size() + 1:
			await press_key(KEY_TAB)
			if viewport.gui_get_focus_owner() == target:
				await press_key(KEY_ENTER)
				break
		assert_eq(get_signal_emit_count(target, "pressed"), before_count,
			"Tab then Enter must not activate underlying " + caption(target))
		assert_not_null(visible_button(game.overlay, "Texto ampliado"), "The active settings panel is preserved")
		assert_eq(game.location_id, "hall")
		assert_eq(game.player.position, position)
		await press_key(KEY_ESCAPE)

func test_closing_panel_restores_keyboard_world_controls() -> void:
	await open_settings()
	var position: Vector2 = game.player.position
	await press_key(KEY_ESCAPE)
	assert_false(game.overlay.visible, "Escape closes the panel")
	assert_eq(game.location_id, "hall", "Closing does not travel")
	assert_eq(game.player.position, position)
	var focused: Control = viewport.gui_get_focus_owner()
	assert_true(focused != null and game.canvas.is_ancestor_of(focused) and not game.overlay.is_ancestor_of(focused),
		"Closing restores focus to a world control")
	var world_buttons: Array[Button] = [visible_button(game.canvas, "Diario"), visible_button(game.canvas, "Ajustes"), game.action_button]
	var visited: Array[Control] = [focused]
	for index in world_buttons.size() + 1:
		await press_key(KEY_TAB)
		focused = viewport.gui_get_focus_owner()
		if focused != null and focused not in visited:
			visited.append(focused)
	for button in world_buttons:
		assert_has(visited, button, "World control is keyboard reachable after closing: " + caption(button))
	# Activate the nearby interaction with the normal GUI dispatch, then close it.
	game.action_button.grab_focus()
	await press_key(KEY_ENTER)
	assert_true(game.overlay.visible, "The nearby action still works after closing settings")
	await press_key(KEY_ESCAPE)
	var walk := InputEventKey.new()
	walk.keycode = KEY_D
	walk.physical_keycode = KEY_D
	walk.pressed = true
	Input.parse_input_event(walk)
	await wait_physics_frames(8)
	walk = walk.duplicate()
	walk.pressed = false
	Input.parse_input_event(walk)
	await wait_physics_frames(2)
	assert_gt(game.player.position.x, position.x + 2, "WASD movement resumes after closing")
	assert_eq(game.location_id, "hall")

func test_settings_blocks_world_clicks_and_j_until_escape() -> void:
	var journal := visible_button(game.canvas, "Diario")
	var settings := visible_button(game.canvas, "Ajustes")
	if journal == null or settings == null:
		return
	var world_buttons: Array[Button] = [journal, settings, game.action_button]
	var position: Vector2 = game.player.position
	# Opening and reopening by mouse also prove the injected clicks reach the UI.
	viewport.notify_mouse_entered()
	await click_center(settings)
	assert_true(game.overlay.visible, "Clicking Ajustes opens its panel")
	assert_not_null(visible_button(game.overlay, "Texto ampliado"))
	for target in world_buttons:
		watch_signals(target)
	for target in world_buttons:
		await click_center(target)
		assert_signal_not_emitted(target, "pressed", "The open panel blocks clicks on " + caption(target))
		assert_true(game.overlay.visible, "Clicking behind settings cannot close it")
		assert_not_null(visible_button(game.overlay, "Texto ampliado"), "Clicking behind settings cannot replace it")
	await press_key(KEY_J)
	assert_true(game.overlay.visible, "J cannot close the active panel")
	assert_not_null(visible_button(game.overlay, "Texto ampliado"), "J cannot replace settings with the journal")
	assert_eq(game.location_id, "hall")
	assert_eq(game.player.position, position)
	await press_key(KEY_ESCAPE)
	assert_false(game.overlay.visible, "Escape closes settings after blocked mouse/J input")
	assert_eq(viewport.gui_get_focus_owner(), settings, "Escape restores the usable settings trigger")
	# Each of the formerly blocked buttons must work normally after dismissal.
	var expected_controls := ["Créditos y licencias", "Texto ampliado", "Seguir explorando"]
	for index in world_buttons.size():
		var target := world_buttons[index]
		var before_count: int = get_signal_emit_count(target, "pressed")
		await click_center(target)
		assert_eq(get_signal_emit_count(target, "pressed"), before_count + 1,
			"Mouse activation is restored for " + caption(target))
		assert_true(game.overlay.visible)
		assert_not_null(visible_button(game.overlay, expected_controls[index]))
		await press_key(KEY_ESCAPE)
		assert_false(game.overlay.visible)
	await press_key(KEY_J)
	assert_true(game.overlay.visible, "J opens the journal again after dismissal")
	assert_not_null(visible_button(game.overlay, "Créditos y licencias"))
	await press_key(KEY_ESCAPE)
	assert_false(game.overlay.visible)
	assert_eq(game.location_id, "hall", "Dismissal and HUD clicks do not travel")
	assert_eq(game.player.position, position)
