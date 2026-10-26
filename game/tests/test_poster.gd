extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")

func source() -> Dictionary:
	return JSON.parse_string(FileAccess.get_file_as_string("res://content/ccpc.json"))

func content() -> Dictionary:
	return JSON.parse_string(FileAccess.get_file_as_string("res://content/story.json"))

func test_authored_poster_changes_with_the_selected_places_and_measure() -> void:
	var poster = load("res://scripts/poster_workshop.gd")
	assert_not_null(poster, "The optional authoring workshop must exist")
	if poster == null: return
	var selection := {"first": "state_01", "second": "state_02", "metric": "count", "question": "voices"}
	var result: Dictionary = poster.compose(source(), content(), selection)
	assert_eq(result.finding, "Más registros: BAJA CALIFORNIA.")
	selection.metric = "rate"
	assert_eq(poster.compose(source(), content(), selection).finding, "Mayor proporción: AGUASCALIENTES.")
	selection.first = "state_19"
	result = poster.compose(source(), content(), selection)
	assert_eq(result.records[0].id, "state_19")
	assert_eq(result.question, "¿Cómo escuchamos a quienes todavía no han hablado?")
	assert_eq(poster.states(source()).size(), 32)

func test_authored_poster_handles_equal_missing_and_invalid_selections() -> void:
	var poster = load("res://scripts/poster_workshop.gd")
	assert_not_null(poster)
	if poster == null: return
	var data := source()
	var selection := {"first": "state_01", "second": "state_02", "metric": "rate", "question": "missing"}
	for i in [1, 2]:
		data.records[i].sv = 20
		data.records[i].nv = 20
	assert_eq(poster.compose(data, content(), selection).finding, "La proporción es la misma.")
	data.records[1].sv = 0
	data.records[1].nv = 0
	assert_eq(poster.compose(data, content(), selection).finding, "Falta información para comparar proporciones.")
	data.records[1].sv = 1000000000
	data.records[1].nv = 1000000001
	data.records[2].sv = 1000000001
	data.records[2].nv = 1000000002
	assert_eq(poster.compose(data, content(), selection).finding, "Mayor proporción: BAJA CALIFORNIA.")
	selection.first = "national"
	assert_true(poster.compose(data, content(), selection).is_empty())
	selection.first = selection.second
	assert_true(poster.compose(data, content(), selection).is_empty())
	selection.first = "state_01"
	selection.metric = "political_rank"
	assert_true(poster.compose(data, content(), selection).is_empty())

func test_poster_selection_cannot_enter_the_progress_save() -> void:
	var saved := Rules.safe_progress({"completed": ["printing", "comparison"], "meeting_poster": {"first": "state_19"}})
	assert_false(saved.has("meeting_poster"))
	var candidate := content()
	candidate.poster_workshop.questions[0].text = ""
	assert_false(Rules.validate_story(candidate), "Required workshop wording must be validated")

func test_bundle_rejects_an_unsupported_state_id() -> void:
	var data := source()
	var unsupported: Dictionary = data.records[1].duplicate()
	unsupported.id = "state_99"
	data.records.append(unsupported)
	assert_false(Rules.validate_bundle(data), "The workshop must not invent a 33rd state")

func test_every_state_pair_matches_exact_integer_reference() -> void:
	var poster = load("res://scripts/poster_workshop.gd")
	var records: Array = poster.states(source())
	var story := content()
	for i in records.size():
		for j in range(i + 1, records.size()):
			var a: Dictionary = records[i]
			var b: Dictionary = records[j]
			for metric in ["count", "rate"]:
				# Actual bundled counts fit int64 cross-products; independent of the
				# production continued-fraction comparator used for arbitrary inputs.
				var left: int = int(a.sv) * (int(b.sv) + int(b.nv) if metric == "rate" else 1)
				var right: int = int(b.sv) * (int(a.sv) + int(a.nv) if metric == "rate" else 1)
				var expected: String = story.comparison_artifact["equal_" + metric] if left == right else story.comparison_artifact[metric].replace("{place}", a.geography_name if left > right else b.geography_name)
				assert_eq(poster.compose(source(), story, {"first": a.id, "second": b.id, "metric": metric, "question": "missing"}).finding, expected)
