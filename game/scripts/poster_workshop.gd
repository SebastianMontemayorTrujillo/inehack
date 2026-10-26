extends RefCounted

const Rules = preload("res://scripts/civic_rules.gd")

static func states(data: Dictionary) -> Array:
	return data.get("records", []).filter(func(record: Dictionary): return Rules.state_id(record.id))

static func compose(data: Dictionary, story: Dictionary, selection: Dictionary) -> Dictionary:
	var records: Array = []
	for id in [selection.get("first"), selection.get("second")]:
		var found: Array = states(data).filter(func(record: Dictionary): return record.id == id)
		if found.is_empty(): return {}
		records.append(found[0])
	if records[0].id == records[1].id or selection.get("metric") not in ["count", "rate"]:
		return {}
	var questions: Array = story.poster_workshop.questions.filter(func(item: Dictionary): return item.id == selection.get("question"))
	if questions.is_empty(): return {}
	var metric: String = selection.metric
	var comparison: int = Rules.compare_records(records[0], records[1], metric)
	var templates: Dictionary = story.comparison_artifact
	var finding: String = templates.unavailable if comparison == 3 else templates["equal_" + metric] if comparison == 2 else templates[metric].replace("{place}", records[comparison].geography_name)
	return {"records": records, "metric": metric, "finding": finding, "question": questions[0].text}
