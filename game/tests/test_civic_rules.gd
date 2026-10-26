extends GutTest

func test_classroom_reading_changes_with_source_and_handles_equality() -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/ccpc.json"))
	var content: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/story.json"))
	var activity: Dictionary = content.activities[0]
	assert_eq(Rules.activity_answer(activity, data, content), "sv")
	data.records[0].sv = 1
	data.records[0].nv = 2
	assert_eq(Rules.activity_answer(activity, data, content), "nv")
	data.records[0].sv = 2
	assert_eq(Rules.activity_answer(activity, data, content), "equal")

func test_classroom_content_rejects_missing_or_unknown_rules() -> void:
	var content: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/story.json"))
	assert_true(Rules.validate_story(content))
	content.activities[0].rule = "run_code"
	assert_false(Rules.validate_story(content))

const Rules = preload("res://scripts/civic_rules.gd")

func content() -> Dictionary:
	return JSON.parse_string(FileAccess.get_file_as_string("res://content/story.json"))

func test_story_rejects_broken_learning_and_nested_content() -> void:
	var mutate: Array[Callable] = [
		func(s): s.activities[0].erase("transfer"),
		func(s): s.activities[0].view = "unsupported",
		func(s): s.activities[0].choices.pop_front(),
		func(s): s.activities[0].chapter = "comparison",
		func(s): s.houses[0] = {},
		func(s): s.chapters[0].erase("intro"),
		func(s): s.consultation = {},
		func(s): s.assessment_fixtures.printing.sv = -1,
		func(s): s.consultation.scenarios[0].votes = [999, 5, 3]
	]
	for change in mutate:
		var candidate := content()
		change.call(candidate)
		assert_false(Rules.validate_story(candidate))

func test_near_equal_large_ratios_are_compared_exactly() -> void:
	assert_eq(Rules.compare_records({"sv": 1000000000, "nv": 1000000001}, {"sv": 1000000001, "nv": 1000000002}, "rate"), 1)
	assert_eq(Rules.compare_records({"sv": 3000000000000000, "nv": 3000000000000000}, {"sv": 1000000000000000, "nv": 1000000000000000}, "rate"), 2)

func test_unknown_denominator_and_classified_rate() -> void:
	assert_null(Rules.rate(0, 0))
	assert_almost_eq(Rules.rate(60, 90), 66.6666666667, 0.000001)

func test_poster_caption_uses_the_actual_findings_and_missing_data() -> void:
	var a := {"sv": 20, "nv": 20, "geography_name": "A"}
	var b := {"sv": 60, "nv": 140, "geography_name": "B"}
	assert_eq(Rules.comparison_caption(a, b, content().comparison_artifact), "Más registros: B.\nMayor proporción: A.")
	a.sv = 60
	a.nv = 140
	assert_eq(Rules.comparison_caption(a, b, content().comparison_artifact), "Hay la misma cantidad de registros.\nLa proporción es la misma.")
	a.sv = 0
	a.nv = 0
	assert_true(Rules.comparison_caption(a, b, content().comparison_artifact).contains("Falta información"))

func test_weighted_aggregation() -> void:
	assert_almost_eq(Rules.combined_rate({"sv": 626084, "nv": 441222}, {"sv": 1396335, "nv": 1571676}), 50.1179709054, 0.000001)

func test_changed_records_change_supported_interpretations() -> void:
	var a := {"sv": 30, "nv": 10}
	var b := {"sv": 60, "nv": 140}
	assert_eq(Rules.compare_records(a, b, "count"), 1)
	assert_eq(Rules.compare_records(a, b, "rate"), 0)
	a.sv = 300
	assert_eq(Rules.compare_records(a, b, "count"), 0)
	assert_eq(Rules.compare_records({"sv": 0, "nv": 0}, b, "rate"), 3)

func test_every_choice_preserves_exact_counts() -> void:
	for choice in ["A", "B", "C", "unmarked", "decline"]:
		var result: Dictionary = Rules.consultation(0, choice, content().consultation)
		assert_eq(result.participants, 16 if choice == "decline" else 17)
		assert_eq(result.votes[0], 9 if choice == "A" else 8)

func test_synthetic_tie_and_non_pivotal_vote() -> void:
	assert_eq(Rules.resolve_winners([5, 5, 2]), [0, 1])
	assert_eq(Rules.consultation(1, "decline", content().consultation).winners, [0])
	assert_eq(Rules.consultation(2, "decline", content().consultation).winners, [1])

func test_shared_scenario_changes_result_and_roster_size() -> void:
	var definition: Dictionary = content().consultation
	definition.scenarios[0].votes = [0, 5, 3]
	var result := Rules.consultation(0, "decline", definition)
	assert_eq(result.participants, 8)
	assert_eq(result.winners, [1])
	definition.scenarios.reverse()
	assert_eq(Rules.consultation(0, "decline", definition).votes, [0, 5, 3])

func test_saved_state_never_contains_vote() -> void:
	var saved := Rules.safe_progress({"completed": ["printing", "bad"], "choice": "B", "votes": [8, 6, 3]})
	assert_false(saved.has("choice"))
	assert_false(saved.has("votes"))
	assert_eq(saved.completed, ["printing"])

func test_real_bundle_is_valid() -> void:
	var parsed: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/ccpc.json"))
	assert_true(Rules.validate_bundle(parsed))
	var duplicate: Dictionary = parsed.duplicate(true)
	duplicate.records.append(duplicate.records[0].duplicate())
	assert_false(Rules.validate_bundle(duplicate))
	var corrupt: Dictionary = parsed.duplicate(true)
	corrupt.records[0].participation_pct = 0
	assert_false(Rules.validate_bundle(corrupt))
	corrupt = parsed.duplicate(true)
	corrupt.records[0].erase("participation_pct")
	assert_false(Rules.validate_bundle(corrupt))
	corrupt = parsed.duplicate(true)
	corrupt.source.url = ""
	assert_false(Rules.validate_bundle(corrupt))
	corrupt = parsed.duplicate(true)
	corrupt.source.erase("sha256")
	assert_false(Rules.validate_bundle(corrupt))
	for value in [null, 5, ""]:
		corrupt = parsed.duplicate(true)
		corrupt.records[0].geography_name = value
		assert_false(Rules.validate_bundle(corrupt), "Reject metadata that cannot be rendered")
	corrupt = parsed.duplicate(true)
	corrupt.validation.limits = [5]
	assert_false(Rules.validate_bundle(corrupt))
