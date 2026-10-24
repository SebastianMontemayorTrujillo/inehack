extends SceneTree

const Rules = preload("res://scripts/civic_rules.gd")
var checks := 0
var failed := false

func check(value: bool, message: String) -> void:
	checks += 1
	if not value:
		failed = true
		push_error(message)

func _initialize() -> void:
	check(Rules.rate(0, 0) == null, "Zero denominator must remain unknown")
	check(is_equal_approx(Rules.rate(60, 90), 66.6666666667), "Unknown classification excluded")
	var a := {"sv": 626084, "nv": 441222}
	var b := {"sv": 1396335, "nv": 1571676}
	check(abs(Rules.combined_rate(a, b) - 50.1179709054) < 0.000001, "Sum counts before division")
	for choice in ["A", "B", "C", "unmarked", "decline"]:
		var result: Dictionary = Rules.consultation(0, choice)
		check(result.participants == (16 if choice == "decline" else 17), "Participation increment")
		check(result.votes[0] == (9 if choice == "A" else 8), "Exact option increment")
	check(Rules.consultation(0, "unmarked").unmarked == 1, "Unmarked counts participation only")
	check(Rules.consultation(0, "decline").votes == [8, 5, 3], "Decline changes no votes")
	check(Rules.resolve_winners([5, 5, 2]) == [0, 1], "Ties cannot favor first option")
	check(Rules.consultation(1, "decline").winners == [0], "Higher participation can keep winner")
	check(Rules.consultation(2, "decline").winners == [1], "Same participation can change winner")
	var saved := Rules.safe_progress({"completed": ["printing"], "choice": "B", "votes": [8, 6, 3], "settings": {"muted": true}})
	check(not saved.has("choice") and not saved.has("votes"), "Never persist ballot or revealing totals")
	check(saved.completed == ["printing"], "Preserve allowed progress")
	print("Civic rules: %d checks passed" % checks)
	quit(1 if failed else 0)
