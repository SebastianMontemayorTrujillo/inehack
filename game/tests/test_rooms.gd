extends GutTest

func fresh_game() -> Node:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://rooms_test.json"
	add_child_autofree(game)
	game.progress.completed = []
	game._close_panel()
	return game

func test_all_houses_open_before_quests_and_return_safely() -> void:
	var game := fresh_game()
	for index in 3:
		game._enter_house(index)
		await wait_physics_frames(2)
		assert_eq(game.location_id, ["printshop", "archive", "hall"][index])
		assert_false(game.overlay.visible, "Entry opens a walkable room, not a quiz")
		assert_true(game.room.bounds.has_point(game.player.position))
		game._exit_house()
		await wait_physics_frames(2)
		assert_eq(game.location_id, "plaza")
		assert_true(game.player.position.distance_to(Vector2([80, 240, 400][index], 120)) < 1)
	assert_eq(game.progress.completed, [], "Exploring never grants a learning artifact")

func movement_key(key: Key, pressed: bool) -> void:
	var event := InputEventKey.new()
	event.keycode = key
	event.physical_keycode = key
	event.pressed = pressed
	Input.parse_input_event(event)

func test_walking_through_doors_enters_and_leaves_every_house() -> void:
	var game := fresh_game()
	for index in 3:
		game.player.position = Vector2(80 + index * 160, 120)
		await wait_physics_frames(3)
		movement_key(KEY_W, true)
		await wait_physics_frames(12)
		movement_key(KEY_W, false)
		await wait_physics_frames(2)
		assert_eq(game.location_id, ["printshop", "archive", "hall"][index])
		movement_key(KEY_S, true)
		await wait_physics_frames(42)
		movement_key(KEY_S, false)
		await wait_physics_frames(2)
		assert_eq(game.location_id, "plaza")
		assert_true(game.player.position.y > 116, "Returning outside never immediately re-enters")
	assert_eq(game.progress.completed, [], "Walking never bypasses the learning tasks")

func test_only_wasd_moves_and_escape_cannot_leave_a_house() -> void:
	var game := fresh_game()
	await wait_physics_frames(3)
	for key in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN]:
		var before: Vector2 = game.player.position
		movement_key(key, true)
		await wait_physics_frames(8)
		movement_key(key, false)
		assert_eq(game.player.position, before, "Arrow keys belong to controls, not world movement")
	for key in [KEY_A, KEY_D, KEY_W, KEY_S]:
		var before: Vector2 = game.player.position
		movement_key(key, true)
		await wait_physics_frames(8)
		movement_key(key, false)
		assert_gt(game.player.position.distance_to(before), 2.0, "WASD moves the player")
	game._enter_house(1)
	await wait_physics_frames(3)
	var position: Vector2 = game.player.position
	var escape := InputEventKey.new()
	escape.keycode = KEY_ESCAPE
	escape.pressed = true
	game._unhandled_key_input(escape)
	await wait_physics_frames(2)
	assert_eq(game.location_id, "archive", "Escape does not teleport out")
	assert_eq(game.player.position, position)

func test_world_interactions_require_a_nearby_person_or_exhibit() -> void:
	var game := fresh_game()
	game._enter_house(0)
	await wait_physics_frames(3)
	assert_true(game.action_button.disabled, "Cannot talk across the room")
	game._accessible_action()
	assert_false(game.overlay.visible)
	game.player.position = Vector2(175, 119)
	await wait_physics_frames(3)
	assert_false(game.action_button.disabled)
	game._accessible_action()
	assert_true(game.overlay.visible)
	assert_eq(game.location_id, "printshop")

func test_stationary_door_interactions_do_not_change_location() -> void:
	var game := fresh_game()
	for inside in [false, true]:
		if inside:
			game._enter_house(0)
			await wait_physics_frames(2)
		game.player.position = Vector2(240, 186) if inside else Vector2(80, 96)
		await wait_physics_frames(3)
		var before: Vector2 = game.player.position
		var place: String = game.location_id
		for key in [KEY_E, KEY_ENTER]:
			var press := InputEventKey.new()
			press.keycode = key
			press.pressed = true
			game._unhandled_key_input(press)
			await wait_physics_frames(2)
			assert_eq(game.location_id, place, "Interaction keys never cross a doorway")
			assert_eq(game.player.position, before)
		assert_true(game.action_button.disabled)
		game._accessible_action()
		assert_eq(game.location_id, place)
		assert_false(game.overlay.visible)

func test_preview_progress_revisit_and_escape_close_panel_first() -> void:
	var game := fresh_game()
	game._enter_house(2)
	await wait_physics_frames(2)
	game._start_chapter(2)
	assert_eq(game.progress.completed, [])
	var escape := InputEventKey.new()
	escape.keycode = KEY_ESCAPE
	escape.pressed = true
	game._unhandled_key_input(escape)
	assert_false(game.overlay.visible)
	assert_eq(game.location_id, "hall")
	game.progress.completed = ["printing"]
	game._exit_house()
	await wait_physics_frames(2)
	game._enter_house(0)
	await wait_physics_frames(2)
	assert_has(game.progress.completed, "printing")
	game._journal()
	var copy := panel_text(game)
	assert_true(copy.contains("Listo: La prensa de las voces"))
	assert_true(copy.contains(game._percentage(game._record("national").participation_pct)), "The diary retains the sourced finding after re-entry")
	assert_true(copy.contains("CCPC 2024"))
	await wait_process_frames(3)

func panel_text(game: Node) -> String:
	var copy := ""
	for label in game.body.find_children("*", "Label", true, false): copy += label.text + "\n"
	return copy

func after_each() -> void:
	if FileAccess.file_exists("user://rooms_test.json"):
		DirAccess.remove_absolute("user://rooms_test.json")

func test_poster_changes_from_a_claim_to_a_sourced_correction() -> void:
	var game := fresh_game()
	game._enter_house(1)
	await wait_physics_frames(2)
	game._inspect_artifact(1)
	assert_true(panel_text(game).contains("Más registros = mayor proporción"))
	game.progress.completed = ["printing", "comparison"]
	game._inspect_artifact(1)
	assert_true(panel_text(game).contains("Más registros: BAJA CALIFORNIA"))
	assert_true(panel_text(game).contains("Mayor proporción: AGUASCALIENTES"))
	assert_true(panel_text(game).contains("CCPC 2024"))
	await wait_process_frames(3)
