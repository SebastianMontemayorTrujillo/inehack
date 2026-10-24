class_name CivicRules
extends RefCounted

const SCENARIOS := [[8, 5, 3], [11, 8, 6], [8, 10, 7]]
const CHAPTERS := ["printing", "comparison", "consultation"]

static func rate(numerator: int, denominator: int) -> Variant:
	return 100.0 * numerator / denominator if denominator > 0 else null

static func combined_rate(a: Dictionary, b: Dictionary) -> Variant:
	return rate(int(a.sv) + int(b.sv), int(a.sv) + int(a.nv) + int(b.sv) + int(b.nv))

# 0/1: first/second record, 2: equal, 3: unavailable.
static func compare_records(a: Dictionary, b: Dictionary, metric: String) -> int:
	var first: Variant = int(a.sv) if metric == "count" else rate(a.sv, int(a.sv) + int(a.nv))
	var second: Variant = int(b.sv) if metric == "count" else rate(b.sv, int(b.sv) + int(b.nv))
	if first == null or second == null:
		return 3
	return 2 if first == second else (0 if first > second else 1)

static func resolve_winners(votes: Array) -> Array:
	var winners: Array = []
	var maximum: int = votes.max()
	for i in votes.size():
		if votes[i] == maximum:
			winners.append(i)
	return winners

static func consultation(scenario: int, choice: String) -> Dictionary:
	assert(scenario >= 0 and scenario < SCENARIOS.size())
	assert(choice in ["A", "B", "C", "unmarked", "decline"])
	var votes: Array = SCENARIOS[scenario].duplicate()
	var participants: int = votes[0] + votes[1] + votes[2]
	if choice in ["A", "B", "C"]:
		votes[["A", "B", "C"].find(choice)] += 1
	if choice != "decline":
		participants += 1
	return {"votes": votes, "participants": participants, "eligible": 31,
		"unmarked": 1 if choice == "unmarked" else 0, "winners": resolve_winners(votes)}

static func safe_progress(raw: Dictionary) -> Dictionary:
	var completed: Array = []
	var hints: Array = []
	if raw.get("completed") is Array:
		for id in raw.completed:
			if id in CHAPTERS and id not in completed:
				completed.append(id)
	if raw.get("hints") is Array:
		for id in raw.hints:
			if id in CHAPTERS and id not in hints:
				hints.append(id)
	var settings: Dictionary = raw.get("settings", {}) if raw.get("settings") is Dictionary else {}
	return {"schema_version": 1, "completed": completed, "hints": hints,
		"settings": {"muted": settings.get("muted", false) == true,
		"large_text": settings.get("large_text", false) == true,
		"reduced_motion": settings.get("reduced_motion", false) == true}}

static func validate_bundle(bundle: Dictionary) -> bool:
	if bundle.get("schema_version") != "1.0.0" or not bundle.get("records") is Array:
		return false
	if not bundle.get("source") is Dictionary or str(bundle.source.get("url", "")).is_empty():
		return false
	if not bundle.get("validation") is Dictionary:
		return false
	for key in ["url", "portal_url", "sha256", "dictionary_path", "retrieved_at_utc"]:
		if not bundle.source.get(key) is String or bundle.source[key].is_empty():
			return false
	if not bundle.source.url.begins_with("https://") or not bundle.source.portal_url.begins_with("https://") or bundle.source.sha256.length() != 64:
		return false
	var ids: Array = []
	for record in bundle.records:
		if not record is Dictionary or not record.has_all(["id", "ln", "sv", "nv", "ns", "year", "geography_name", "participation_pct", "unknown_pct"]):
			return false
		if record.id in ids or record.year != 2024:
			return false
		ids.append(record.id)
		for key in ["ln", "sv", "nv", "ns"]:
			var n: Variant = record[key]
			if not (n is int or n is float) or not is_finite(float(n)) or n < 0 or n != floor(float(n)) or n > 9007199254740991:
				return false
		if record.ln != record.sv + record.nv + record.ns:
			return false
		for metric in [["participation_pct", record.sv, record.sv + record.nv], ["unknown_pct", record.ns, record.ln]]:
			var expected: Variant = rate(metric[1], metric[2])
			var actual: Variant = record[metric[0]]
			if expected == null:
				if actual != null:
					return false
			elif not (actual is float or actual is int) or not is_finite(float(actual)) or abs(float(actual) - expected) > 0.000001:
				return false
	return ["national", "state_01", "state_02"].all(func(id: String) -> bool: return id in ids)
