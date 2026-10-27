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
