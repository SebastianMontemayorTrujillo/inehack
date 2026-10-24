extends GutTest

const Rules = preload("res://scripts/civic_rules.gd")

func test_unknown_denominator_and_classified_rate() -> void:
	assert_null(Rules.rate(0, 0))
	assert_almost_eq(Rules.rate(60, 90), 66.6666666667, 0.000001)

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
		var result: Dictionary = Rules.consultation(0, choice)
		assert_eq(result.participants, 16 if choice == "decline" else 17)
		assert_eq(result.votes[0], 9 if choice == "A" else 8)

func test_synthetic_tie_and_non_pivotal_vote() -> void:
	assert_eq(Rules.resolve_winners([5, 5, 2]), [0, 1])
	assert_eq(Rules.consultation(1, "decline").winners, [0])
	assert_eq(Rules.consultation(2, "decline").winners, [1])

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
