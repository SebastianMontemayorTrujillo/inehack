# Exercise the compiled PCK through the pinned editor's external-script runner:
# tools/godot --headless --main-pack build/linux/voces-de-la-plaza.pck --script tests/native_journey.gd
extends SceneTree

var failures: Array[String] = []

func _initialize() -> void:
	call_deferred("run_journeys")

func check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func run_journeys() -> void:
	for choice in ["A", "B", "C", "unmarked", "decline"]:
		var game: Node = load("res://scenes/main.tscn").instantiate()
		game.save_path = "user://native_qa_" + choice + ".json"
		root.add_child(game)
		game.progress.completed = []
		game.progress.hints = []
		game.progress.campaign_printed = false
		check(game.valid, "Compiled data bundle must validate")
		game._start_chapter(0)
		for n in 3:
			game._question()
			game._answer(true, "Interpretación verificada")
		game._start_chapter(1)
		for n in 3:
			game._question()
			game._answer(true, "Interpretación verificada")
		game._start_chapter(2)
		game._question()
		game._results(choice)
		game._finish()
		await process_frame
		check(game.progress.completed == ["printing", "comparison", "consultation"], "Every choice completes: " + choice)
		check(not game.progress.campaign_printed, "Consultation is not yet the printed ending")
		game.CampaignView.dispatch(game)
		check(not game.campaign_pdf.is_empty(), "Compiled font/layout resources create a PDF: " + choice)
		game._enter_house(0)
		game.player.position = Vector2(283, 116)
		# Area overlap is published after the physics tick; wait through the
		# integration and following process phase before activating the press.
		for frame in 4:
			await physics_frame
			await process_frame
		check(game.CampaignView.near_press(game), "The compiled press overlap is ready: " + choice)
		game.CampaignView.print_job(game)
		check(game.progress.campaign_printed, "Every choice reaches the same press ending: " + choice)
		var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
		check(not saved.has("choice") and not saved.has("votes"), "No revealing saved values: " + choice)
		check(not saved.has("campaign_job") and saved.get("campaign_printed") == true, "Poster choices remain memory-only: " + choice)
		DirAccess.remove_absolute(game.save_path)
		game.queue_free()
		await process_frame
		# The audio mixer releases stopped playback on its next update.
		await create_timer(0.1).timeout
	await process_frame
	await process_frame
	print("Compiled Linux journeys: %d failures; five consultation paths exercised" % failures.size())
	for failure in failures:
		push_error(failure)
	quit(0 if failures.is_empty() else 1)
