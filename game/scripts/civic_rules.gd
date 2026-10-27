class_name CivicRules
extends RefCounted

const CHAPTERS := ["printing", "comparison", "consultation"]

const ACTIVITY_CONTRACT := {
	"participation-reading": ["printing", "national-participation", "national", false, ["sv", "nv", "equal"]],
	"unknown": ["printing", "unknown", "national", false, ["separate", "nv"]],
	"unknown-transfer": ["printing", "unknown-transfer", "printing-fixture", true, ["unknown", "nv", "sv"]],
	"more-count": ["comparison", "count", "count", false, ["state_01", "state_02", "equal"]],
	"higher-rate": ["comparison", "rate", "rate", false, ["state_01", "state_02", "equal"]],
	"comparison-transfer": ["comparison", "comparison-transfer", "comparison-fixture", true, ["no", "yes"]]
}
const HOUSE_IDS := ["printshop", "archive", "hall"]
const SCENARIO_IDS := ["baseline", "more_same_winner", "more_other_winner"]

static func text_fields(value: Variant, fields: Array) -> bool:
	if not value is Dictionary:
		return false
	for field in fields:
		if not value.get(field) is String or value[field].strip_edges().is_empty():
			return false
	return true

static func same_ids(items: Variant, expected: Array) -> bool:
	if not items is Array or items.size() != expected.size():
		return false
	var seen: Array = []
	for item in items:
		if not item is Dictionary or not item.get("id") in expected or item.id in seen:
			return false
		seen.append(item.id)
	return true

static func safe_count(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value)) and value >= 0 and value <= 9007199254740991 and value == floor(float(value))

static func state_id(value: Variant) -> bool:
	if not value is String or value.length() != 8 or not value.begins_with("state_"):
		return false
	var suffix: String = value.substr(6)
	return suffix.is_valid_int() and int(suffix) >= 1 and int(suffix) <= 32 and suffix == "%02d" % int(suffix)

static func fixture_counts(record: Variant) -> bool:
	if not record is Dictionary:
		return false
	for key in ["sv", "nv", "ns", "ln"]:
		if not safe_count(record.get(key)):
			return false
	return int(record.ln) == int(record.sv) + int(record.nv) + int(record.ns)

static func validate_story(story: Dictionary) -> bool:
	if story.get("schema_version") != "3.0.0" or not text_fields(story, ["title", "exhibit", "message", "opening", "audience", "fiction_label", "bridge"]):
		return false
	if not text_fields(story.get("campaign"), ["intro", "review", "send_label", "replace_label", "sent", "objective", "press_intro", "print_label", "ending_title", "ending", "download_label", "reload_note", "completed_reload", "error"]):
		return false
	if not text_fields(story.get("dialogue"), ["continue_label", "close_label", "before_luz", "before_mateo", "revisit", "luz_queued", "luz_waiting"]):
		return false
	if not same_ids(story.get("activities"), ACTIVITY_CONTRACT.keys()) or not same_ids(story.get("chapters"), CHAPTERS) or not same_ids(story.get("houses"), HOUSE_IDS):
		return false
	for activity in story.activities:
		var contract: Array = ACTIVITY_CONTRACT[activity.id]
		if not text_fields(activity, ["title", "prompt", "hint", "explanation"]) or not activity.get("transfer") is bool:
			return false
		if [activity.get("chapter"), activity.get("rule"), activity.get("view"), activity.transfer] != contract.slice(0, 4):
			return false
		if not same_ids(activity.get("choices"), contract[4]):
			return false
		for choice in activity.choices:
			if not text_fields(choice, ["text"]):
				return false
	for item in story.chapters:
		if not text_fields(item, ["title", "question", "intro", "npc", "reflection"]):
			return false
	for house in story.houses:
		if house.get("chapter") != CHAPTERS[HOUSE_IDS.find(house.id)] or not text_fields(house, ["title", "preview", "objective", "artifact"]):
			return false
	if not text_fields(story.get("optional_math"), ["title", "known", "formula", "combined", "limit"]):
		return false
	if not text_fields(story.get("comparison_artifact"), ["before", "count", "rate", "equal_count", "equal_rate", "unavailable"]):
		return false
	if not story.comparison_artifact.count.contains("{place}") or not story.comparison_artifact.rate.contains("{place}"):
		return false
	var workshop: Variant = story.get("poster_workshop")
	if not text_fields(workshop, ["title", "intro", "first_label", "second_label", "metric_label", "question_label", "count_label", "rate_label", "limit", "memory_note"]) or not same_ids(workshop.get("questions"), ["missing", "voices", "followup"]):
		return false
	for question in workshop.questions:
		if not text_fields(question, ["text"]): return false
	var fixtures: Variant = story.get("assessment_fixtures")
	if not fixtures is Dictionary or not fixture_counts(fixtures.get("printing")) or not fixtures.get("comparison") is Array or fixtures.comparison.size() != 2:
		return false
	for record in fixtures.comparison:
		if not fixture_counts(record):
			return false
	var definition: Variant = story.get("consultation")
	if not text_fields(definition, ["label"]) or not same_ids(definition.get("projects"), ["A", "B", "C"]):
		return false
	for project in definition.projects:
		if not text_fields(project, ["name", "benefit", "tradeoff"]):
			return false
	var roster: Variant = definition.get("roster")
	if not roster is Dictionary or not safe_count(roster.get("eligible_npcs")) or roster.eligible_npcs >= 9007199254740991 or roster.get("player_is_additional") != true:
		return false
	var preferences: Variant = roster.get("underlying_preferences")
	if not preferences is Array or preferences.size() != 3 or not preferences.all(safe_count):
		return false
	if int(preferences[0]) + int(preferences[1]) + int(preferences[2]) != int(roster.eligible_npcs):
		return false
	if not same_ids(definition.get("scenarios"), SCENARIO_IDS):
		return false
	for scenario in definition.scenarios:
		if not scenario.get("votes") is Array or scenario.votes.size() != 3:
			return false
		for i in 3:
			if not safe_count(scenario.votes[i]) or scenario.votes[i] > preferences[i]:
				return false
	return true

static func ordered_story(story: Dictionary) -> Dictionary:
	var result: Dictionary = story.duplicate(true)
	result.chapters.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return CHAPTERS.find(a.id) < CHAPTERS.find(b.id))
	result.houses.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return HOUSE_IDS.find(a.id) < HOUSE_IDS.find(b.id))
	return result

static func first_missing(completed: Array, chapter: int) -> int:
	for i in chapter:
		if CHAPTERS[i] not in completed:
			return i
	return -1

static func activity_answer(activity: Dictionary, data: Dictionary, story: Dictionary) -> String:
	var records: Dictionary = {}
	for record in data.records:
		records[record.id] = record
	match activity.rule:
		"national-participation":
			var national: Dictionary = records.national
			if int(national.sv) + int(national.nv) == 0:
				return "unavailable"
			return "equal" if national.sv == national.nv else ("sv" if national.sv > national.nv else "nv")
		"unknown": return "separate"
		"unknown-transfer": return "unknown"
		"count", "rate":
			return ["state_01", "state_02", "equal", "unavailable"][compare_records(records.state_01, records.state_02, activity.rule)]
		"comparison-transfer": return "no"
	return "unavailable"

static func rate(numerator: int, denominator: int) -> Variant:
	return 100.0 * numerator / denominator if denominator > 0 else null

static func comparison_caption(a: Dictionary, b: Dictionary, copy: Dictionary) -> String:
	var lines: Array[String] = []
	for metric in ["count", "rate"]:
		var result := compare_records(a, b, metric)
		if result == 3:
			lines.append(copy.unavailable)
		elif result == 2:
			lines.append(copy["equal_" + metric])
		else:
			lines.append(copy[metric].format({"place": [a, b][result].geography_name}))
	return "\n".join(lines)

static func combined_rate(a: Dictionary, b: Dictionary) -> Variant:
	return rate(int(a.sv) + int(b.sv), int(a.sv) + int(a.nv) + int(b.sv) + int(b.nv))

# 0/1: first/second record, 2: equal, 3: unavailable.
static func compare_records(a: Dictionary, b: Dictionary, metric: String) -> int:
	if metric == "count":
		return 2 if int(a.sv) == int(b.sv) else (0 if int(a.sv) > int(b.sv) else 1)
	var ad := int(a.sv) + int(a.nv)
	var bd := int(b.sv) + int(b.nv)
	if ad == 0 or bd == 0:
		return 3
	var comparison := compare_fractions(int(a.sv), ad, int(b.sv), bd)
	return 2 if comparison == 0 else (0 if comparison > 0 else 1)

# Continued fractions compare exact integers without cross-product overflow.
static func compare_fractions(an: int, ad: int, bn: int, bd: int) -> int:
	var reverse := false
	while true:
		var aq: int = an / ad
		var bq: int = bn / bd
		if aq != bq:
			var order := -1 if aq < bq else 1
			return -order if reverse else order
		var ar := an % ad
		var br := bn % bd
		if ar == 0 or br == 0:
			var order := 0 if ar == br else (-1 if ar == 0 else 1)
			return -order if reverse else order
		an = ad
		ad = ar
		bn = bd
		bd = br
		reverse = not reverse
	return 0

static func resolve_winners(votes: Array) -> Array:
	var winners: Array = []
	var maximum: int = votes.max()
	for i in votes.size():
		if votes[i] == maximum:
			winners.append(i)
	return winners

static func consultation(scenario: int, choice: String, definition: Dictionary) -> Dictionary:
	assert(scenario >= 0 and scenario < SCENARIO_IDS.size())
	assert(choice in ["A", "B", "C", "unmarked", "decline"])
	var selected: Dictionary = definition.scenarios.filter(func(item: Dictionary) -> bool: return item.id == SCENARIO_IDS[scenario])[0]
	var votes: Array = selected.votes.map(func(value: Variant) -> int: return int(value))
	var participants: int = votes[0] + votes[1] + votes[2]
	if choice in ["A", "B", "C"]:
		votes[["A", "B", "C"].find(choice)] += 1
	if choice != "decline":
		participants += 1
	return {"votes": votes, "participants": participants, "eligible": int(definition.roster.eligible_npcs) + 1,
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
	var volume: Variant = settings.get("music_volume", 0.2)
	if not (volume is float or volume is int) or not is_finite(float(volume)):
		volume = 0.2
	return {"schema_version": 2, "completed": completed, "hints": hints,
		"campaign_printed": raw.get("schema_version") == 2 and raw.get("campaign_printed") == true and first_missing(completed, 3) == -1,
		"settings": {"muted": settings.get("muted", false) == true,
		"music_volume": clampf(float(volume), 0.0, 1.0),
		"large_text": settings.get("large_text", false) == true,
		"reduced_motion": settings.get("reduced_motion", false) == true}}

static func validate_bundle(bundle: Dictionary) -> bool:
	if bundle.get("schema_version") != "1.0.0" or not bundle.get("records") is Array:
		return false
	if not bundle.get("source") is Dictionary or str(bundle.source.get("url", "")).is_empty():
		return false
	if not bundle.get("validation") is Dictionary:
		return false
	if not bundle.validation.get("limits") is Array or not bundle.validation.limits.all(func(value: Variant) -> bool: return value is String and not value.strip_edges().is_empty()):
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
		if not text_fields(record, ["id", "geography_name"]):
			return false
		if record.id in ids or record.year != 2024 or (record.id != "national" and not state_id(record.id)):
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
