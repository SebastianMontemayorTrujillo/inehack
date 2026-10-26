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

func test_door_input_enters_and_exit_input_returns() -> void:
	var game := fresh_game()
	var press := InputEventKey.new()
	press.keycode = KEY_E
	press.pressed = true
	for index in 3:
		game.player.position = Vector2(80 + index * 160, 96)
		await wait_physics_frames(3)
		game._unhandled_key_input(press)
		await wait_physics_frames(2)
		assert_eq(game.location_id, ["printshop", "archive", "hall"][index])
		game.player.position = Vector2(240, 186)
		await wait_physics_frames(3)
		game._unhandled_key_input(press)
		await wait_physics_frames(2)
		assert_eq(game.location_id, "plaza")

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
	assert_true(game.room.artifact_label.text.begins_with("BOLETÍN PUBLICADO · CON FUENTE"))
	assert_true(game.room.artifact_label.text.contains("60 de cada 100"), "The room displays the sourced finding after re-entry")

func after_each() -> void:
	if FileAccess.file_exists("user://rooms_test.json"):
		DirAccess.remove_absolute("user://rooms_test.json")

func test_poster_changes_from_a_claim_to_a_sourced_correction() -> void:
	var game := fresh_game()
	game._enter_house(1)
	await wait_physics_frames(2)
	assert_true(game.room.artifact_label.text.contains("Más registros = mayor proporción"))
	game.progress.completed = ["printing", "comparison"]
	game.room.update_artifacts(game.progress.completed, game.bundle)
	assert_true(game.room.artifact_label.text.contains("Más registros: BAJA CALIFORNIA"))
	assert_true(game.room.artifact_label.text.contains("Mayor proporción: AGUASCALIENTES"))
	assert_true(game.room.artifact_label.text.contains("CCPC 2024"))
