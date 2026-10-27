extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")
const Campaign = preload("res://scripts/campaign_view.gd")
const VIEW_SIZE := Vector2i(1280, 800)

var viewport: SubViewport
var game: Node
var save_path: String

func before_each() -> void:
	viewport = SubViewport.new()
	viewport.size = VIEW_SIZE
	viewport.world_2d = World2D.new()
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child_autofree(viewport)
	save_path = "user://ending_test_%d.json" % OS.get_process_id()
	if FileAccess.file_exists(save_path): DirAccess.remove_absolute(save_path)
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = save_path
	game.progress.settings.muted = true
	viewport.add_child(game)
	game._enter_house(0)
	game.player.position = Vector2(283, 116)
	await wait_physics_frames(3)
	await wait_process_frames(4)
	viewport.notify_mouse_entered()

func after_each() -> void:
	if FileAccess.file_exists(save_path): DirAccess.remove_absolute(save_path)
	for suffix in ["first.pdf", "second.pdf"]:
		if FileAccess.file_exists(save_path + suffix): DirAccess.remove_absolute(save_path + suffix)

func capture(label: String) -> void:
	var directory := OS.get_environment("VOCES_ENDING_CAPTURE_DIR")
	if directory.is_empty() or DisplayServer.get_name() == "headless": return
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute(directory)
	viewport.get_texture().get_image().save_png(directory.path_join(label + ".png"))
	for control in game.body.find_children("*", "Control", true, false):
		if control.is_visible_in_tree() and (control is Button or control.name in ["EndingHeading", "EndingPosterScroll"]):
			print("ENDING_GEOMETRY ", label, " ", control.text if control is Button else control.name, " ", control.get_global_rect())

func key(code: Key) -> void:
	for pressed in [true, false]:
		var event := InputEventKey.new()
		event.keycode = code
		event.physical_keycode = code
		event.pressed = pressed
		viewport.push_input(event)
		await wait_process_frames(1)
	await wait_process_frames(3)

func click(control: Control) -> void:
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

func button(prefix: String) -> Button:
	for control in game.body.find_children("*", "Button", true, false):
		if control.is_visible_in_tree() and control.text.begins_with(prefix): return control
	return null

func copy() -> String:
	var result := ""
	for label in game.body.find_children("*", "Label", true, false):
		if label.is_visible_in_tree(): result += label.text + "\n"
	return result

func prepare_job() -> void:
	game.progress.completed = Rules.CHAPTERS.duplicate()
	Campaign.dispatch(game)
	game._close_panel()
	Campaign.press(game)
	await wait_process_frames(4)

func print_with_gui() -> void:
	var print_button := button(game.story.campaign.print_label)
	assert_not_null(print_button, "The nearby press offers the final print action")
	if print_button == null: return
	print_button.grab_focus()
	await key(KEY_ENTER)
	assert_true(game.progress.campaign_printed, "The actual GUI print action completes the campaign")
	assert_true(game.overlay.visible, "The existing overlay keeps movement locked")
	assert_false(game.dialogue_active, "The machine never impersonates Luz")

func assert_fin() -> void:
	assert_true(copy().contains("FIN"), "The dedicated ending has a visible FIN heading")
	for caption in [game.story.campaign.download_label, "Ampliar cartel", "Seguir explorando"]:
		assert_not_null(button(caption), "Visible final action: " + caption)
	assert_null(button("Saltar"), "The reveal no longer offers skip")

func test_press_waits_without_a_lesson_or_luz_dialogue_at_each_early_stage() -> void:
	for completed in range(4):
		game.progress.completed = Rules.CHAPTERS.slice(0, completed)
		Campaign.press(game)
		await wait_process_frames(4)
		assert_false(game.dialogue_active, "Early press is a neutral machine panel")
		assert_true(copy().contains(game.story.dialogue.luz_waiting if completed < 3 else game.story.campaign.reload_note))
		assert_null(button("Comenzar"), "The press cannot start a lesson")
		assert_null(button(game.story.campaign.print_label), "No print action without Inés's job")
		assert_eq(game.progress.completed.size(), completed)
		assert_false(game.progress.campaign_printed)
		assert_true(game.body.find_children("*", "TextureRect", true, false).is_empty(), "No character portrait on the machine panel")
		await key(KEY_ESCAPE)
		assert_eq(game.location_id, "printshop", "Closing never travels")

func test_e_and_enter_skip_through_the_real_input_pipeline() -> void:
	for code in [KEY_E, KEY_ENTER]:
		game.progress.campaign_printed = false
		await prepare_job()
		await print_with_gui()
		assert_not_null(button("Saltar"), "The reveal has a visible skip action")
		var before: Vector2 = game.player.position
		# The input handler must work even when the focus is not the skip button.
		viewport.gui_release_focus()
		await key(code)
		assert_fin()
		assert_eq(game.player.position, before)
		assert_true(game.find_children("*", "FileDialog", true, false).is_empty(), "Enter skip cannot also trigger a download")
		await key(KEY_ESCAPE)

func test_reveal_locks_movement_and_final_tab_cycle_is_usable() -> void:
	await prepare_job()
	await print_with_gui()
	var before: Vector2 = game.player.position
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
	assert_eq(game.player.position, before, "Actual WASD cannot move during printing")
	await key(KEY_E)
	var download := button(game.story.campaign.download_label)
	assert_eq(viewport.gui_get_focus_owner(), download, "Skip focuses the download action")
	var expected: Array[Control] = [button("Ampliar cartel"), button("Seguir explorando"), game.body.find_child("EndingPosterScroll", true, false), download]
	for target in expected:
		await key(KEY_TAB)
		assert_eq(viewport.gui_get_focus_owner(), target, "Tab reaches every final control and wraps inside FIN")
	await key(KEY_TAB)
	await key(KEY_ENTER)
	assert_not_null(button("Reducir cartel"), "Enlargement works with keyboard input")
	await key(KEY_ESCAPE)
	assert_false(game.overlay.visible, "Escape also closes an expanded poster")
	assert_eq(game.location_id, "printshop")
	assert_eq(game.player.position, before)

func test_fin_dismissal_restores_the_focused_nearby_action_after_first_print() -> void:
	for close_with_escape in [false, true]:
		game.progress.campaign_printed = false
		game.progress.completed = Rules.CHAPTERS.duplicate()
		Campaign.dispatch(game)
		game._close_panel()
		await wait_physics_frames(3)
		var before: Vector2 = game.player.position
		assert_false(game.action_button.disabled)
		game.action_button.grab_focus()
		await key(KEY_ENTER)
		assert_not_null(button(game.story.campaign.print_label), "The focused nearby action opens the press")
		await print_with_gui()
		await key(KEY_E)
		assert_fin()
		if close_with_escape:
			await key(KEY_ESCAPE)
		else:
			var explore := button("Seguir explorando")
			assert_not_null(explore)
			if explore != null:
				explore.grab_focus()
				await key(KEY_ENTER)
		assert_false(game.overlay.visible)
		assert_eq(game.location_id, "printshop", "Dismissing FIN never travels")
		assert_eq(game.player.position, before)
		assert_false(game.action_button.disabled, "The restored interaction is usable")
		assert_eq(viewport.gui_get_focus_owner(), game.action_button, "First-print close restores the initiating nearby action")
		await key(KEY_ENTER)
		assert_fin()
		assert_true(game.overlay.visible, "The restored focused action reopens FIN")
		await key(KEY_ESCAPE)

func test_visible_skip_button_and_automatic_reveal_finish() -> void:
	await prepare_job()
	await print_with_gui()
	var skip := button("Saltar")
	assert_not_null(skip)
	var sheet: Control = game.body.find_child("PrintingSheet", true, false)
	assert_not_null(sheet)
	if sheet != null:
		var stage: Control = sheet.get_parent()
		assert_gt(sheet.position.y, stage.size.y * 0.5, "The sheet begins at the press, not above the clipping area")
		assert_almost_eq(sheet.position.x, (stage.size.x - sheet.size.x) / 2, 1.0, "The reveal uses the settled container width")
	await capture("reveal")
	if skip != null: await click(skip)
	assert_fin()
	await capture("fin-normal")
	await key(KEY_ESCAPE)
	game.progress.campaign_printed = false
	await prepare_job()
	await print_with_gui()
	await wait_seconds(2.5)
	assert_fin()

func test_reduced_motion_is_immediate_and_repeat_print_does_not_resave_or_animate() -> void:
	game.progress.settings.reduced_motion = true
	await prepare_job()
	var bytes: PackedByteArray = game.campaign_pdf.duplicate()
	await print_with_gui()
	assert_fin()
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	file.store_string("already saved once")
	file.close()
	game.progress.settings.reduced_motion = false
	Campaign.print_job(game)
	await wait_process_frames(4)
	assert_fin()
	assert_eq(FileAccess.get_file_as_string(save_path), "already saved once", "Completion is saved only once")
	assert_eq(game.campaign_pdf, bytes, "Repeated print retains the frozen PDF")

func test_escape_cancels_reveal_and_reopen_skips_it_without_travel() -> void:
	await prepare_job()
	await print_with_gui()
	var view: Control = game.body.find_child("EndingView", true, false)
	assert_not_null(view)
	if view == null: return
	var tween: Tween = view.reveal_tween
	var before: Vector2 = game.player.position
	await key(KEY_ESCAPE)
	assert_false(game.overlay.visible)
	assert_false(is_instance_valid(view), "Closing releases the entire child control")
	assert_false(tween.is_valid(), "No tween can fire after its ending is closed")
	assert_eq(game.player.position, before)
	assert_true(game.progress.campaign_printed, "Closing a reveal does not undo printing")
	Campaign.press(game)
	await wait_process_frames(4)
	assert_fin()
	var explore := button("Seguir explorando")
	if explore != null: await click(explore)
	assert_false(game.overlay.visible)
	assert_eq(game.player.position, before)
	assert_eq(game.location_id, "printshop")

func test_replacing_the_panel_cancels_the_reveal_without_late_focus_or_callbacks() -> void:
	await prepare_job()
	await print_with_gui()
	var view: Control = game.body.find_child("EndingView", true, false)
	assert_not_null(view)
	if view == null: return
	var tween: Tween = view.reveal_tween
	game._settings()
	await wait_seconds(2.5)
	assert_false(tween.is_valid())
	assert_not_null(button("Texto ampliado"), "A late reveal cannot replace the next panel")
	assert_true(game.overlay.is_ancestor_of(viewport.gui_get_focus_owner()))
	assert_null(game.body.find_child("EndingView", true, false))

func test_large_text_enlargement_and_scroll_keep_fin_and_actions_pinned() -> void:
	game.progress.settings.large_text = true
	game.progress.settings.reduced_motion = true
	game._theme()
	await prepare_job()
	await print_with_gui()
	assert_fin()
	var heading: Control = game.body.find_child("EndingHeading", true, false)
	var enlarge := button("Ampliar cartel")
	assert_not_null(heading)
	assert_not_null(enlarge)
	if heading == null or enlarge == null: return
	assert_eq(heading.get_line_count(), 1, "FIN remains one readable line")
	var fixed: Array[Control] = [heading, button(game.story.campaign.download_label), enlarge, button("Seguir explorando")]
	var positions: Array[Vector2] = []
	for control in fixed: positions.append(control.global_position)
	await capture("fin-large")
	await click(enlarge)
	await capture("fin-expanded")
	var scroll: ScrollContainer = game.body.find_child("EndingPosterScroll", true, false)
	assert_not_null(scroll)
	if scroll == null: return
	var content: Control = scroll.get_child(0)
	assert_gt(content.size.y, scroll.size.y, "Expanded poster has an independent scroll area")
	scroll.grab_focus()
	await key(KEY_END)
	await capture("fin-expanded-scrolled")
	assert_gt(scroll.scroll_vertical, 0, "Keyboard can scroll the actual poster area")
	for index in fixed.size():
		var control := fixed[index]
		assert_eq(control.global_position, positions[index], "Header/action does not move with poster scrolling")
		assert_true(viewport.get_visible_rect().encloses(control.get_global_rect()), "Final header/action remains inside the viewport")
		assert_true(control.is_visible_in_tree())
	assert_lte(game.body.size.y, game.body.get_parent().size.y + 1, "Outer panel does not scroll its heading away")
	await click(enlarge)
	assert_eq(enlarge.text, "Ampliar cartel")
	assert_eq(scroll.scroll_vertical, 0, "Reducing returns to the top of the preview")
	assert_true(game.overlay.visible, "Reducing the poster stays on FIN")
	assert_eq(game.location_id, "printshop")

func test_completed_reload_is_honest_and_legacy_progress_does_not_invent_a_pdf() -> void:
	for schema in [1, 2]:
		game.progress = Rules.safe_progress({"schema_version": schema, "completed": Rules.CHAPTERS, "campaign_printed": true})
		Campaign.press(game)
		await wait_process_frames(4)
		assert_true(game.campaign_pdf.is_empty())
		assert_true(game.campaign_job.is_empty())
		if schema == 1:
			assert_false(game.progress.campaign_printed)
			assert_true(copy().contains(game.story.campaign.reload_note))
		else:
			assert_fin()
			assert_true(copy().contains(game.story.campaign.completed_reload))
			var download := button(game.story.campaign.download_label)
			var enlarge := button("Ampliar cartel")
			if download != null: assert_true(download.disabled)
			if enlarge != null: assert_true(enlarge.disabled)
			assert_null(game.body.find_child("PosterCard", true, false))

func test_remote_and_incomplete_print_cannot_mark_completion() -> void:
	await prepare_job()
	game.player.position = Vector2(240, 155)
	await wait_physics_frames(3)
	Campaign.print_job(game)
	assert_false(game.progress.campaign_printed)
	game.player.position = Vector2(283, 116)
	await wait_physics_frames(3)
	game.progress.completed = ["printing", "comparison"]
	Campaign.print_job(game)
	assert_false(game.progress.campaign_printed)
	game.progress.completed = Rules.CHAPTERS.duplicate()
	game.campaign_pdf.clear()
	Campaign.print_job(game)
	assert_false(game.progress.campaign_printed)

func test_download_cancel_and_repeat_saves_keep_identical_frozen_bytes() -> void:
	game.progress.settings.reduced_motion = true
	await prepare_job()
	await print_with_gui()
	var frozen: PackedByteArray = game.campaign_pdf.duplicate()
	var download := button(game.story.campaign.download_label)
	assert_not_null(download)
	if download == null: return
	# GUI activation is real; the filesystem-picker result is supplied at the
	# OS boundary. Actual native-picker interaction belongs to runtime QA.
	for suffix in ["cancel", "first.pdf", "second.pdf"]:
		download.grab_focus()
		await key(KEY_ENTER)
		var dialog: FileDialog = game.body.find_child("CampaignDownloadDialog", true, false)
		assert_not_null(dialog)
		if dialog == null: return
		if suffix == "cancel":
			dialog.canceled.emit()
		else:
			dialog.file_selected.emit(save_path + suffix)
		await wait_process_frames(4)
		assert_true(game.progress.campaign_printed)
		assert_eq(game.campaign_pdf, frozen)
		assert_true(game.overlay.visible)
		assert_lte(game.body.size.y, game.body.get_parent().size.y + 1, "Download status does not move the fixed actions")
	assert_eq(FileAccess.get_file_as_bytes(save_path + "first.pdf"), frozen)
	assert_eq(FileAccess.get_file_as_bytes(save_path + "second.pdf"), frozen)
