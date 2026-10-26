extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")

func panel_text(game: Node) -> String:
	var result := ""
	for child in game.body.get_children():
		if child is Label or child is Button:
			result += child.text + "\n"
	return result

func press_named(game: Node, caption: String) -> void:
	for child in game.body.get_children():
		if child is Button and child.text == caption:
			child.pressed.emit()
			return
	fail_test("Missing visible control: " + caption)

func test_authored_poster_publication_survives_navigation_cancel_and_clears_on_reset() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_poster_session.json"
	add_child_autofree(game)
	game.progress.completed = ["printing", "comparison"]
	game._poster_workshop()
	game.body.get_node("PosterFirst").select(18)
	game.body.get_node("PosterMetric").select(1)
	game.body.get_node("PosterQuestion").select(1)
	press_named(game, "Ver mi cartel")
	assert_true(panel_text(game).contains(game._record("state_19").geography_name))
	press_named(game, "Llevar a la reunión")
	await wait_process_frames(2)
	assert_eq(game.location_id, "hall")
	assert_true(panel_text(game).contains("quienes todavía no han hablado"))
	game._travel(1)
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
	game._travel(0)
	await wait_process_frames(2)
	assert_eq(game.location_id, "printshop")
	assert_false(game.overlay.visible, "Menu travel enters a room instead of automatically starting a quiz")
	DirAccess.remove_absolute(game.save_path)

func test_missing_printing_prevents_consultation_with_partial_legacy_save() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_partial_save.json"
	add_child_autofree(game)
	game.progress.completed = ["comparison"]
	game._start_chapter(2)
	game._question()
	var texts := ""
	for child in game.body.get_children():
		if child is Button:
			texts += child.text + "\n"
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
