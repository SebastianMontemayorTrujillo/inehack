# Exercise the compiled PCK through the pinned editor's external-script runner:
# tools/godot --headless --main-pack build/linux/voces-de-la-plaza.pck --script tests/native_journey.gd
extends SceneTree

var failures: Array[String] = []
var reveal_modes := {"A": "normal", "B": "E", "C": "Enter", "unmarked": "button", "decline": "reduced"}

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
		game.progress.settings.reduced_motion = choice == "decline"
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
		for frame in 4: await process_frame
		var ending: Control = game.body.find_child("EndingView", true, false)
		check(ending != null, "Dedicated FIN control exists: " + choice)
		if ending != null:
			if choice == "A":
				var started := Time.get_ticks_msec()
				check(ending.reveal_running, "First print has a normal reveal")
				while ending.reveal_running and Time.get_ticks_msec() - started <= 2500:
					await process_frame
				check(not ending.reveal_running, "Normal reveal finishes within 2.5 seconds")
			elif choice in ["B", "C"]:
				check(ending.reveal_running, "Key skip begins during reveal: " + choice)
				var event := InputEventKey.new()
				event.keycode = KEY_E if choice == "B" else KEY_ENTER
				event.pressed = true
				Input.parse_input_event(event)
				await process_frame
				event = event.duplicate()
				event.pressed = false
				Input.parse_input_event(event)
				await process_frame
				check(not ending.reveal_running, "Real input event skips reveal: " + choice)
				check(ending.find_child("CampaignDownloadDialog", true, false) == null, "Skip key cannot also activate Download")
			elif choice == "unmarked":
				var skip: BaseButton = _button(ending, "Saltar animación · E / Enter")
				check(skip != null and skip.is_visible_in_tree(), "Visible skip button exists")
				if skip != null: skip.pressed.emit()
				check(not ending.reveal_running, "Skip button ends the reveal")
			else:
				check(not ending.reveal_running, "Reduced motion first print is immediate")
			check(ending.find_child("EndingHeading", true, false).is_visible_in_tree(), "FIN remains visible: " + choice)
			for text in [game.story.campaign.download_label, "Ampliar cartel", "Seguir explorando"]:
				var button := _button(ending, text)
				check(button != null and button.is_visible_in_tree() and not button.disabled, "FIN action available: " + text)
		var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
		var keys := saved.keys()
		keys.sort()
		check(keys == ["campaign_printed", "completed", "hints", "schema_version", "settings"], "Strict save allowlist: " + choice)
		check(saved.schema_version == 2 and saved.hints == [], "Schema and hints preserved: " + choice)
		check(not saved.has("choice") and not saved.has("votes"), "No revealing saved values: " + choice)
		check(not saved.has("campaign_job") and saved.get("campaign_printed") == true, "Poster choices remain memory-only: " + choice)
		var previous_bytes := FileAccess.get_file_as_bytes(game.save_path)
		game._close_panel()
		game.CampaignView.print_job(game)
		await process_frame
		var reopened: Control = game.body.find_child("EndingView", true, false)
		check(reopened != null and not reopened.reveal_running, "Reopening never animates: " + choice)
		check(FileAccess.get_file_as_bytes(game.save_path) == previous_bytes, "Reopening is idempotent: " + choice)
		DirAccess.remove_absolute(game.save_path)
		game.queue_free()
		await process_frame
		# The audio mixer releases stopped playback on its next update.
		await create_timer(0.1).timeout
	await process_frame
	await process_frame
	print("Compiled Linux journeys: %d failures; five consultation paths and normal/E/Enter/button/reduced ending modes exercised (code-call fixture, not GUI travel)" % failures.size())
	for failure in failures:
		push_error(failure)
	quit(0 if failures.is_empty() else 1)

func _button(node: Node, text: String) -> BaseButton:
	for child in node.get_children():
		if child is BaseButton and child.text == text: return child
		var found := _button(child, text)
		if found != null: return found
	return null
