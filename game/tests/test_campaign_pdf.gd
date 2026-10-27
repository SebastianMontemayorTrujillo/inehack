extends GutTest

func _data(name: String) -> Dictionary:
	return JSON.parse_string(FileAccess.get_file_as_string("res://content/" + name + ".json"))

func test_campaign_pdf_returns_repeatable_bytes_and_rejects_invalid_inputs() -> void:
	var writer = load("res://scripts/campaign_pdf.gd")
	assert_not_null(writer)
	if writer == null: return
	var selection := {"first": "state_01", "second": "state_02", "metric": "count", "question": "voices"}
	var bytes: PackedByteArray = writer.create(_data("ccpc"), _data("story"), selection)
	assert_gt(bytes.size(), 10000)
	assert_eq(bytes.slice(0, 8).get_string_from_ascii(), "%PDF-1.7")
	assert_eq(bytes, writer.create(_data("ccpc"), _data("story"), selection))
	assert_true(writer.create({}, _data("story"), selection).is_empty())
	assert_true(writer.create(_data("ccpc"), {}, selection).is_empty())
	selection.second = selection.first
	assert_true(writer.create(_data("ccpc"), _data("story"), selection).is_empty())

func test_pdf_percentage_rounding_preserves_integer_precision_and_decimal_carries() -> void:
	var writer = load("res://scripts/campaign_pdf.gd")
	assert_eq(writer._percentage(19999, 20000), "100.00 %")
	assert_eq(writer._percentage(1, 32), "3.13 %")
	assert_eq(writer._percentage(1000000000, 2000000001), "50.00 %")
	assert_eq(writer._percentage(9007199254740990, 9007199254740991), "100.00 %")

func test_pdf_rejects_unsupported_glyphs_overflow_and_bad_selection_without_runtime_errors() -> void:
	var writer = load("res://scripts/campaign_pdf.gd")
	var selection := {"first": "state_01", "second": "state_02", "metric": "count", "question": "voices"}
	var story := _data("story")
	story.poster_workshop.questions[1].text = "No hay glifo: 🗳"
	assert_true(writer.create(_data("ccpc"), story, selection).is_empty())
	story.poster_workshop.questions[1].text = "Texto largo ".repeat(100)
	assert_true(writer.create(_data("ccpc"), story, selection).is_empty())
	selection.metric = "ballot"
	assert_true(writer.create(_data("ccpc"), _data("story"), selection).is_empty())
	selection.metric = "rate"
	selection.question = "invalid"
	assert_true(writer.create(_data("ccpc"), _data("story"), selection).is_empty())

func test_pink_preview_preserves_full_evidence_and_offers_a_bounded_compact_card() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_pink_poster_card.json"
	add_child_autofree(game)
	var poster = load("res://scripts/poster_workshop.gd")
	var card_script = load("res://scripts/poster_card.gd")
	var selection := {"first": "state_01", "second": "state_02", "metric": "rate", "question": "voices"}
	var result: Dictionary = poster.compose(game.bundle, game.story, selection)
	game._panel("Cartel de prueba", true)
	var full: Control = card_script.create(game, result)
	game.body.add_child(full)
	await wait_process_frames(4)
	assert_not_null(full.find_child("PosterSourceURL", true, false))
	assert_eq(full.find_child("PosterInvitation", true, false).text, "Tu voto cuenta.\nInfórmate y participa.")
	assert_eq(full.find_child("PosterValue_state_01", true, false).text, "58.66 %")
	var text := ""
	for label in full.find_children("*", "Label", true, false): text += label.text + "\n"
	for value in ["626,084", "441,222", "29,865", "1,067,306", "1,097,171", "NS: sin información", "Límite:", game.bundle.source.portal_url]:
		assert_string_contains(text, value)
	var full_height: float = full.size.y
	game.body.remove_child(full)
	full.free()
	var compact: Control = card_script.create(game, result, true)
	game.body.add_child(compact)
	await wait_process_frames(4)
	assert_lt(compact.size.y, full_height, "Compact leaves room for the ending actions")
	assert_lte(compact.size.y, 400.0, "The default comparison fits a 400px ending preview")
	assert_null(compact.find_child("PosterSourceURL", true, false), "The caller's Enlarge control opens full evidence")
	assert_eq(compact.find_child("PosterFinding", true, false).text, result.finding)
	assert_eq(compact.find_child("PosterQuestionText", true, false).text, result.question)
	assert_eq(compact.find_child("PosterValue_state_01", true, false).text, "58.66 %")
	for control in compact.find_children("*", "Control", true, false):
		assert_true(control.get_global_rect().position.x >= compact.get_global_rect().position.x - 1
			and control.get_global_rect().end.x <= compact.get_global_rect().end.x + 1, "Compact content stays inside the sheet: " + str(control.name))

func test_compact_card_keeps_enlarged_long_names_and_missing_rates_in_bounds() -> void:
	var game: Node = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://gut_pink_poster_large.json"
	add_child_autofree(game)
	game.progress.settings.large_text = true
	game._theme()
	game._record("state_30").geography_name = "VERACRUZ DE IGNACIO DE LA LLAVE"
	var result: Dictionary = load("res://scripts/poster_workshop.gd").compose(game.bundle, game.story,
		{"first": "state_30", "second": "state_16", "metric": "rate", "question": "voices"})
	result.records[0].sv = 0
	result.records[0].nv = 0
	var card: Control = load("res://scripts/poster_card.gd").create(game, result, true)
	game._panel("Cartel ampliado de prueba", true)
	game.body.add_child(card)
	await wait_process_frames(4)
	assert_null(card.find_child("PosterBar_state_30", true, false), "An unavailable rate has no bar")
	assert_eq(card.find_child("PosterValue_state_30", true, false).text, "Sin datos\nclasificables")
	for control in card.find_children("*", "Control", true, false):
		assert_true(control.get_global_rect().position.x >= card.get_global_rect().position.x - 1
			and control.get_global_rect().end.x <= card.get_global_rect().end.x + 1, "Large compact content stays inside the sheet: " + str(control.name))
	assert_eq(card.find_child("PosterInvitation", true, false).get_theme_font_size("font_size"), 30, "Compact honors the enlarged font setting")
