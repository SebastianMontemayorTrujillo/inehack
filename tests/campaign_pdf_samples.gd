extends SceneTree
## Evidence-only runner; overrides are synthetic regression fixtures, never shipped.
const PDF = preload("res://scripts/campaign_pdf.gd")

func _initialize() -> void:
	var root := ProjectSettings.globalize_path("res://..")
	var original: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/ccpc.json"))
	var story: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/story.json"))
	var cases: Array = JSON.parse_string(FileAccess.get_file_as_string(root.path_join("tests/fixtures/campaign_pdf_cases.json")))
	DirAccess.make_dir_recursive_absolute(root.path_join("build/evidence"))
	for fixture in cases:
		var data: Dictionary = original.duplicate(true)
		for record in data.records:
			var overrides: Dictionary = fixture.get("overrides", {})
			if not overrides.has(record.id): continue
			record.merge(overrides[record.id], true)
			record.ln = record.sv + record.nv + record.ns
			record.participation_pct = 100.0 * record.sv / (record.sv + record.nv) if record.sv + record.nv else null
			record.unknown_pct = 100.0 * record.ns / record.ln if record.ln else null
		var bytes: PackedByteArray = PDF.create(data, story, fixture.selection)
		if bytes.is_empty() or bytes != PDF.create(data, story, fixture.selection):
			printerr("PDF failed or non-deterministic: ", fixture.name)
			quit(1)
			return
		var output := FileAccess.open(root.path_join("build/evidence/pink-poster-native-" + fixture.name + ".pdf"), FileAccess.WRITE)
		if output == null:
			quit(1)
			return
		output.store_buffer(bytes)
		output.close()
	print("PINK_POSTER_NATIVE_SAMPLES_OK ", cases.size())
	quit(0)
