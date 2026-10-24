extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")

func test_complete_story_with_declined_ballot() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_journey_progress.json"
	add_child_autofree(game)
	game.progress = Rules.safe_progress({})
	assert_true(game.valid, "Actual CCPC bundle loads")
	game._start_chapter(0)
	game._question()
	game._answer(false, "Revisa el denominador")
	assert_eq(game.step, 0, "Wrong answers keep the retry available")
	game._answer(true, "Correcto")
	game._answer(true, "Transferencia")
	assert_has(game.progress.completed, "printing")
	game._start_chapter(1)
	for i in 5:
		game._question()
		game._answer(true, "Evidencia")
	assert_has(game.progress.completed, "comparison")
	game._start_chapter(2)
	game._question()
	game._results("decline")
	game._finish()
	await wait_process_frames(2)
	assert_eq(game.progress.completed, ["printing", "comparison", "consultation"])
	var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
	assert_false(saved.has("choice"))
	assert_false(saved.has("votes"))
	DirAccess.remove_absolute(game.save_path)

func test_blocked_chapter_and_corrupt_save_recover() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_corrupt_progress.json"
	var file := FileAccess.open(game.save_path, FileAccess.WRITE)
	file.store_string("{broken")
	file.close()
	add_child_autofree(game)
	assert_false(game.storage_message.is_empty())
	game._start_chapter(2)
	assert_eq(game.step, 0)
	assert_eq(game.progress.completed, [])
	game._travel(0)
	await wait_process_frames(2)
	assert_eq(game.chapter, 0)
	DirAccess.remove_absolute(game.save_path)
