extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")
const Campaign = preload("res://scripts/campaign_view.gd")

func new_game() -> Node:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_campaign_%d.json" % get_instance_id()
	if FileAccess.file_exists(game.save_path): DirAccess.remove_absolute(game.save_path)
	add_child_autofree(game)
	game.progress = Rules.safe_progress({})
	game.progress.settings.reduced_motion = true
	return game

func test_finale_requires_consultation_and_nearby_press_for_every_choice() -> void:
	for choice in ["A", "B", "C", "unmarked", "decline"]:
		var game := new_game()
		Campaign.dispatch(game)
		assert_true(game.campaign_job.is_empty(), "No job before the three chapters")
		game.progress.completed = ["printing", "comparison"]
		game._results(choice)
		game._finish()
		assert_false(game.progress.campaign_printed, "Consultation is not the ending")
		Campaign.dispatch(game)
		assert_eq(game.campaign_job, Campaign.DEFAULT)
		assert_true(game.campaign_pdf.get_string_from_ascii().begins_with("%PDF-"))
		Campaign.print_job(game)
		assert_false(game.progress.campaign_printed, "Remote printing cannot finish the story")
		game._enter_house(0)
		game.player.position = Vector2(283, 116)
		await wait_physics_frames(3)
		Campaign.press(game)
		var print_button: Button
		for button in game.body.find_children("*", "Button", true, false):
			if button.text == game.story.campaign.print_label: print_button = button
		assert_not_null(print_button)
		if print_button != null: print_button.pressed.emit()
		assert_true(game.progress.campaign_printed)
		assert_eq(game.location_id, "printshop", "Printing does not teleport")
		var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
		assert_eq(saved.keys().size(), 5)
		assert_eq(saved.schema_version, 2.0, "JSON numbers decode as floats")
		assert_true(saved.campaign_printed)
		for forbidden in ["choice", "votes", "campaign_job", "campaign_pdf", "meeting_poster"]:
			assert_false(saved.has(forbidden))
		DirAccess.remove_absolute(game.save_path)
		game.queue_free()
		await wait_process_frames(3)

func test_job_is_frozen_and_failed_replacement_preserves_publication() -> void:
	var game := new_game()
	game.progress.completed = Rules.CHAPTERS.duplicate()
	game.meeting_poster = {"first": "state_19", "second": "state_30", "metric": "count", "question": "voices"}
	Campaign.dispatch(game)
	var bytes: PackedByteArray = game.campaign_pdf.duplicate()
	game.meeting_poster.first = "state_01"
	assert_eq(game.campaign_job.first, "state_19")
	assert_eq(game.campaign_pdf, bytes)
	Campaign.review(game)
	game._close_panel()
	assert_eq(game.campaign_job.first, "state_19", "Cancelling a review preserves the job")
	game.meeting_poster.first = "state_30"
	Campaign.dispatch(game)
	assert_eq(game.campaign_job.first, "state_19", "Invalid replacement preserves the previous job")
	assert_eq(game.campaign_pdf, bytes)
	game.meeting_poster.first = "state_01"
	Campaign.dispatch(game)
	assert_eq(game.campaign_job.first, "state_01")
	assert_ne(game.campaign_pdf, bytes)
	game._save()
	var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
	assert_false(saved.campaign_printed)
	game._settings()
	for button in game.body.find_children("*", "Button", true, false):
		if button.text == "Reiniciar mi recorrido": button.pressed.emit(); break
	for button in game.body.find_children("*", "Button", true, false):
		if button.text == "Sí, reiniciar": button.pressed.emit(); break
	assert_true(game.campaign_job.is_empty())
	assert_true(game.campaign_pdf.is_empty())
	assert_false(game.progress.campaign_printed)
	assert_eq(game.location_id, "plaza")
	DirAccess.remove_absolute(game.save_path)
	await wait_process_frames(3)

func test_music_starts_once_and_mute_is_immediate() -> void:
	var game := new_game()
	assert_false(game.music.playing)
	game._start_music()
	assert_true(game.music.playing)
	await wait_process_frames(3)
	game._enter_house(1)
	await wait_process_frames(2)
	assert_true(game.music.playing, "One persistent player survives a room change")
	game._toggle(true, "muted")
	assert_eq(game.music.volume_linear, 0.0)
	assert_false(game.audio.playing)
	DirAccess.remove_absolute(game.save_path)
	await wait_process_frames(2)

func test_reload_retains_completion_without_reconstructing_a_poster() -> void:
	for printed in [false, true]:
		var game := new_game()
		var path: String = game.save_path
		game.progress.completed = Rules.CHAPTERS.duplicate()
		game.progress.campaign_printed = printed
		game._save()
		game.queue_free()
		await wait_process_frames(3)
		var restored: Node = load("res://scenes/main.tscn").instantiate()
		restored.save_path = path
		add_child_autofree(restored)
		assert_eq(restored.progress.campaign_printed, printed)
		assert_eq(restored.progress.completed, Rules.CHAPTERS)
		assert_true(restored.campaign_job.is_empty())
		assert_true(restored.campaign_pdf.is_empty())
		var text := ""
		for label in restored.body.find_children("*", "Label", true, false): text += label.text
		assert_true(text.contains(restored.story.campaign.completed_reload if printed else restored.story.campaign.reload_note))
		DirAccess.remove_absolute(path)
		restored.queue_free()
		await wait_process_frames(3)

func test_legacy_completion_unlocks_printing_without_claiming_finished() -> void:
	var progress := Rules.safe_progress({"schema_version": 1, "completed": Rules.CHAPTERS, "choice": "A", "campaign_printed": true})
	assert_eq(progress.schema_version, 2)
	assert_false(progress.get("campaign_printed", true))
	assert_false(progress.has("choice"))
	assert_eq(progress.settings.get("music_volume"), 0.2)
	var current := Rules.safe_progress({"schema_version": 2, "completed": Rules.CHAPTERS, "campaign_printed": true, "settings": {"music_volume": 2.0}})
	assert_true(current.get("campaign_printed", false))
	assert_eq(current.settings.get("music_volume"), 1.0)
	assert_false(Rules.safe_progress({"schema_version": 2, "campaign_printed": true}).get("campaign_printed", true))

func test_conversation_uses_bottom_panel_and_early_visit_does_not_travel() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_campaign_dialogue.json"
	add_child_autofree(game)
	game.progress = Rules.safe_progress({})
	game._enter_house(2)
	await wait_process_frames(2)
	var before: Vector2 = game.player.position
	game._start_chapter(2)
	await wait_process_frames(3)
	assert_gt(game.overlay.position.y, 350.0)
	assert_lte(game.overlay.position.y + game.overlay.size.y, 800.0, "Bottom conversation remains inside the viewport")
	assert_true(game.overlay.get_theme_stylebox("panel").bg_color.a < 1.0)
	assert_eq(game.location_id, "hall")
	assert_eq(game.player.position, before)
	assert_false(game.body.find_children("*", "Button", true, false).any(func(button): return button.text == "Comenzar la actividad"))
	game._close_panel()
	assert_false(game.overlay.visible)
	await wait_process_frames(2)
