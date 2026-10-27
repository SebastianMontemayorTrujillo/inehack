extends GutTest

var game: Node
var viewport: SubViewport
var save_path: String

func before_each() -> void:
	viewport = SubViewport.new()
	viewport.size = Vector2i(1280, 800)
	viewport.world_2d = World2D.new()
	add_child_autofree(viewport)
	save_path = "user://interaction_%d.json" % get_instance_id()
	if FileAccess.file_exists(save_path): DirAccess.remove_absolute(save_path)
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = save_path
	viewport.add_child(game)
	game._close_panel()
	await wait_process_frames(3)

func after_each() -> void:
	if FileAccess.file_exists(save_path): DirAccess.remove_absolute(save_path)
	await wait_process_frames(4)

func approach(house: int, point: Vector2) -> void:
	game._enter_house(house)
	game.player.position = point
	await wait_physics_frames(4)
	await wait_process_frames(3)

func words(root: Node) -> String:
	var value := ""
	for control in root.find_children("*", "Control", true, false):
		if control is Label or control is Button: value += control.text + "\n"
	return value

func test_early_hosts_direct_to_luz_without_unlocking_or_travel() -> void:
	for index in [1, 2]:
		await approach(index, Vector2(175, 119))
		game._interact()
		var copy := words(game.body)
		assert_true(copy.contains("habla con Luz"))
		assert_true(copy.contains("izquierda"))
		assert_false(copy.contains("Comenzar la actividad"))
		assert_eq(game.house_index, index)
		assert_true(game.progress.completed.is_empty())
		game._close_panel()
	game.progress.completed = ["printing"]
	game._interact()
	assert_true(words(game.body).contains("Mateo"))
	assert_true(words(game.body).contains("centro"))

func test_press_never_starts_luz_lesson() -> void:
	await approach(0, Vector2(283, 119))
	game._interact()
	assert_true(game.overlay.visible)
	assert_false(game.dialogue_active, "The press is an object, not Luz speaking")
	assert_false(words(game.body).contains("Comenzar la actividad"))
	assert_true(words(game.body).contains("Inés"))
	assert_false(game.progress.campaign_printed)
	game._close_panel()
	game.player.position = Vector2(175, 119)
	await wait_physics_frames(4)
	game._interact()
	assert_true(game.dialogue_active)
	assert_true(words(game.body).contains("Comenzar la actividad"))

func test_noticeboard_shows_artifact_and_ballot_cannot_bypass_hosts() -> void:
	await approach(1, Vector2(283, 119))
	game._interact()
	assert_false(game.dialogue_active)
	assert_true(words(game.body).contains(game.story.comparison_artifact.before))
	assert_false(words(game.body).contains("Comenzar la actividad"))
	game._close_panel()
	await approach(2, Vector2(283, 119))
	game._interact()
	assert_false(game.dialogue_active)
	assert_true(words(game.body).contains("Luz"))
	assert_false(game.awaiting_answer)
	assert_true(game.progress.completed.is_empty())

func test_nearby_prompt_matches_button_and_disappears_in_panels_and_out_of_range() -> void:
	await approach(1, Vector2(175, 119))
	var prompt: Control = game.canvas.find_child("InteractionPrompt", true, false)
	assert_not_null(prompt)
	if prompt == null: return
	assert_true(prompt.is_visible_in_tree())
	assert_true(words(prompt).contains("E"))
	assert_true(words(prompt).contains("Hablar con Mateo"))
	assert_true(game.action_button.text.contains("Hablar con Mateo"))
	game._interact()
	await wait_process_frames(2)
	assert_false(prompt.is_visible_in_tree())
	game._close_panel()
	game.player.position = Vector2(283, 119)
	await wait_physics_frames(4)
	assert_true(words(prompt).contains("Revisar cartel"))
	assert_true(game.action_button.text.contains("Revisar cartel"))
	game.player.position = Vector2(240, 160)
	await wait_physics_frames(4)
	assert_false(prompt.is_visible_in_tree())
	assert_true(game.action_button.disabled)

func test_rooms_have_no_floor_labels_and_doors_still_exist() -> void:
	for index in [-1, 0, 1, 2]:
		game._show_location(index, Vector2(240, 160))
		assert_true(game.room.find_children("*", "Label", true, false).is_empty())
		assert_eq(game.room.interactions.size(), 3, "Keep physical doors or host/object/exit areas")

func test_completed_hosts_offer_review_without_changing_frozen_campaign() -> void:
	const Campaign = preload("res://scripts/campaign_view.gd")
	game.progress.completed = ["printing", "comparison", "consultation"]
	await approach(0, Vector2(283, 119))
	Campaign.dispatch(game)
	game._close_panel()
	Campaign.print_job(game)
	var bytes: PackedByteArray = game.campaign_pdf.duplicate()
	var job: Dictionary = game.campaign_job.duplicate(true)
	game._close_panel()
	for index in [0, 2]:
		await approach(index, Vector2(175, 119))
		game._interact()
		var review: Button
		for button in game.body.find_children("*", "Button", true, false):
			if button.text.begins_with("Repasar"): review = button
		assert_not_null(review, "Completed host still permits review")
		if review != null: review.pressed.emit()
		assert_false(game.dialogue_active, "Review opens the activity rather than another speech")
		assert_true(game.progress.campaign_printed)
		assert_eq(game.campaign_job, job)
		assert_eq(game.campaign_pdf, bytes)
		assert_eq(game.house_index, index)
		game._close_panel()
