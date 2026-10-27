extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")

func panel_text(game: Node) -> String:
	var result := ""
	for child in game.body.find_children("*", "Control", true, false):
		if child is Label or child is Button:
			result += child.text + "\n"
	return result

func press_named(game: Node, caption: String) -> void:
	for child in game.body.find_children("*", "Button", true, false):
		if child is Button and child.text == caption:
			child.pressed.emit()
			return
	fail_test("Missing visible control: " + caption)

func test_authored_poster_publication_survives_navigation_cancel_and_clears_on_reset() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_poster_session.json"
	add_child_autofree(game)
	game.progress.completed = ["printing", "comparison"]
	game._enter_house(1)
	await wait_process_frames(2)
	var position: Vector2 = game.player.position
	game._poster_workshop()
	game.body.get_node("PosterFirst").select(18)
	game.body.get_node("PosterMetric").select(1)
	game.body.get_node("PosterQuestion").select(1)
	press_named(game, "Ver mi cartel")
	assert_true(panel_text(game).contains(game._record("state_19").geography_name))
	press_named(game, "Guardar mi cartel")
	await wait_process_frames(2)
	assert_eq(game.location_id, "archive", "Publication never teleports to the meeting")
	assert_eq(game.player.position, position)
	assert_true(game.room.artifact_label.text.contains(game._record("state_19").geography_name))
	game._enter_house(2)
	await wait_process_frames(2)
	game._start_chapter(2)
	assert_eq(game.location_id, "hall")
	assert_true(panel_text(game).contains("quienes todavía no han hablado"))
	game._enter_house(1)
	await wait_process_frames(2)
	assert_true(game.room.artifact_label.text.contains(game._record("state_19").geography_name), "The physical archive carries the learner's published finding")
	game._start_chapter(1)
	press_named(game, "Ver mi cartel publicado")
	assert_true(panel_text(game).contains(game._record("state_19").geography_name))
	press_named(game, "Cambiar mi cartel")
	game.body.get_node("PosterFirst").select(0)
	press_named(game, "Cancelar y conservar mi publicación")
	assert_eq(game.meeting_poster.first, "state_19")
	game._save()
	var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
	assert_false(saved.has("meeting_poster"))
	game._settings()
	press_named(game, "Reiniciar mi recorrido")
	press_named(game, "Sí, reiniciar")
	assert_true(game.meeting_poster.is_empty())
	await wait_process_frames(2)
	DirAccess.remove_absolute(game.save_path)

func test_tie_does_not_claim_a_winning_project() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_tie_panel.json"
	add_child_autofree(game)
	game.progress.completed = ["printing", "comparison"]
	game.story.consultation.scenarios[0].votes = [5, 5, 2]
	game._results("decline")
	assert_true(panel_text(game).contains("Hay un empate"))
	assert_false(panel_text(game).contains("Ganó un proyecto"))
	await wait_process_frames(2)

func test_poster_layout_keeps_long_names_readable_and_source_navigation_in_place() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_poster_layout.json"
	add_child_autofree(game)
	game.progress.completed = ["printing", "comparison"]
	game.progress.settings.large_text = true
	game._theme()
	# Synthetic long-label fixture; the bundled display names stay unchanged.
	game._record("state_30").geography_name = "VERACRUZ DE IGNACIO DE LA LLAVE"
	game._record("state_16").geography_name = "MICHOACAN DE OCAMPO"
	game.poster_selection = {"first": "state_30", "second": "state_16", "metric": "rate", "question": "voices"}
	game._poster_preview()
	await wait_process_frames(4)
	var card: Control = game.body.get_node("PosterCard")
	var frame: Rect2 = card.get_global_rect()
	var viewport: Rect2 = game.body.get_parent().get_global_rect()
	assert_true(frame.position.x >= viewport.position.x and frame.end.x <= viewport.end.x, "The whole poster fits horizontally in its scroll viewport")
	for control in card.find_children("*", "Control", true, false):
		var rect: Rect2 = control.get_global_rect()
		assert_true(rect.position.x >= frame.position.x - 1 and rect.end.x <= frame.end.x + 1, "Poster content stays inside its paper at enlarged text: " + str(control.name))
	assert_true(panel_text(game).contains("VERACRUZ DE IGNACIO DE LA LLAVE"))
	assert_true(panel_text(game).contains("NS: sin información"))
	var position: Vector2 = game.player.position
	press_named(game, "Datos exactos y fuente del cartel")
	await wait_process_frames(4)
	assert_true(panel_text(game).contains(game.bundle.source.sha256))
	assert_true(panel_text(game).contains(game.bundle.source.url))
	assert_eq(game.location_id, "plaza")
	assert_eq(game.player.position, position)
	assert_lt(game.overlay.size.x, 1000.0, "The source returns to the normal panel width")
	press_named(game, "Volver a mi cartel")
	await wait_process_frames(4)
	assert_not_null(game.body.get_node_or_null("PosterCard"))
	assert_eq(game.poster_selection.first, "state_30")
	assert_true(game.meeting_poster.is_empty(), "Viewing sources never publishes a draft")

func test_poster_missing_rate_has_no_zero_bar_and_retains_unknown_count() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_poster_missing.json"
	add_child_autofree(game)
	game.progress.completed = ["printing", "comparison"]
	for record in game.bundle.records:
		if record.id == "state_01":
			record.sv = 0
			record.nv = 0
			record.ns = 10
			record.ln = 10
			record.participation_pct = null
	game.poster_selection.metric = "rate"
	game._poster_preview()
	await wait_process_frames(3)
	assert_eq(game.body.find_children("PosterBar_state_01", "ProgressBar", true, false).size(), 0, "Unknown rate never looks like zero participation")
	assert_true(panel_text(game).contains("Sin datos\nclasificables"))
	assert_true(panel_text(game).contains("Base: 0 · NS: 10"))
	assert_true(panel_text(game).contains(game.story.comparison_artifact.unavailable))

func test_rejected_content_keeps_diary_and_settings_safe() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_rejected_panel.json"
	add_child_autofree(game)
	game.valid = false
	game.story = {"chapters": [{}]}
	game._journal()
	assert_true(panel_text(game).contains("Contenido no disponible"))
	game._settings()
	assert_false(panel_text(game).contains("Reiniciar mi recorrido"))
	await wait_process_frames(2)

func test_journal_status_uses_readable_words_in_both_exports() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_journal_words.json"
	add_child_autofree(game)
	game.progress.completed = ["printing"]
	game._journal()
	assert_true(panel_text(game).contains("Listo: La prensa"))
	assert_true(panel_text(game).contains("Pendiente: El mapa"))
	await wait_process_frames(2)

func test_equal_rounded_labels_explain_the_exact_comparison() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_rounded_panel.json"
	add_child_autofree(game)
	for record in game.bundle.records:
		if record.id in ["state_01", "state_02"]:
			record.sv = 1000 if record.id == "state_01" else 1001
			record.nv = record.sv + 1
			record.ns = 0
			record.ln = record.sv + record.nv
			record.participation_pct = Rules.rate(record.sv, record.ln)
	game.progress.completed = ["printing"]
	game._start_chapter(1)
	game.step = 1
	game._question()
	assert_true(panel_text(game).contains("ligeramente mayor"))
	assert_true(panel_text(game).contains("BAJA CALIFORNIA"))
	await wait_process_frames(2)

func test_complete_story_with_declined_ballot() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_journey_progress.json"
	add_child_autofree(game)
	game.progress = Rules.safe_progress({})
	assert_true(game.valid, "Actual CCPC bundle loads")
	game._start_chapter(0)
	game._question()
	game._answer(false, "Mira otra vez las barras")
	assert_eq(game.step, 0, "Wrong answers keep the retry available")
	for i in 3:
		game._question()
		game._answer(true, "Interpretación")
	assert_has(game.progress.completed, "printing")
	game._start_chapter(1)
	for i in 3:
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
	press_named(game, "Seguir explorando")
	await wait_process_frames(2)
	assert_eq(game.location_id, "plaza", "Prerequisite help never moves the player")
	assert_false(game.overlay.visible, "Continue exploring closes the panel")
	DirAccess.remove_absolute(game.save_path)

func test_missing_printing_prevents_consultation_with_partial_legacy_save() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_partial_save.json"
	add_child_autofree(game)
	game.progress.completed = ["comparison"]
	game._start_chapter(2)
	game._question()
	var texts := panel_text(game)
	assert_false(texts.contains("Depositar boleta"))
	assert_true(texts.contains("imprenta"))
	await wait_process_frames(2)

func test_unavailable_participation_can_continue_with_explicit_support() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_unavailable.json"
	add_child_autofree(game)
	game.progress.completed = []
	for record in game.bundle.records:
		if record.id == "national":
			record.sv = 0
			record.nv = 0
			record.ns = 10
			record.ln = 10
			record.participation_pct = null
			record.unknown_pct = 100.0
	game._start_chapter(0)
	game._question()
	var continuation: Button
	for child in game.body.get_children():
		if child is Button and child.text == "Continuar: aquí falta información":
			continuation = child
	assert_not_null(continuation)
	if continuation != null:
		continuation.pressed.emit()
		assert_eq(game.step, 1)
		assert_has(game.progress.hints, "printing")
	if FileAccess.file_exists(game.save_path):
		DirAccess.remove_absolute(game.save_path)
	await wait_process_frames(2)
