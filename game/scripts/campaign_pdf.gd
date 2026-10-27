class_name CampaignPDF
extends RefCounted
## Offline, one-page Carta writer. No filesystem writes or session state.
## PDF 1.7: Type0 / Identity-H, CIDFontType2, embedded TTF and ToUnicode.
## Shared layout and generated font resources are also consumed by the HTML writer.

const Rules = preload("res://scripts/civic_rules.gd")
const Poster = preload("res://scripts/poster_workshop.gd")

var fonts: Array = []
var layout: Dictionary = {}
var failed := false

static func create(bundle: Dictionary, story: Dictionary, selection: Dictionary) -> PackedByteArray:
	if not Rules.validate_bundle(bundle) or not Rules.validate_story(story): return PackedByteArray()
	if bundle.get("dataset_id") != "ccpc-2024-v1": return PackedByteArray()
	var url: String = bundle.source.portal_url
	if not (url.begins_with("https://ine.mx/") or url.begins_with("https://www.ine.mx/")): return PackedByteArray()
	for character in url:
		if character.unicode_at(0) < 33 or character.unicode_at(0) > 126: return PackedByteArray()
	var poster: Dictionary = Poster.compose(bundle, story, selection)
	if poster.is_empty(): return PackedByteArray()
	var resources: Array = []
	for filename in ["campaign_font.json", "campaign_layout.json"]:
		var path: String = "res://content/" + filename
		if not FileAccess.file_exists(path): return PackedByteArray()
		var value: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
		if not value is Dictionary or value.get("schema_version") != 1: return PackedByteArray()
		resources.append(value)
	if not resources[0].get("fonts") is Array or resources[0].fonts.size() != 2: return PackedByteArray()
	var page: Variant = resources[1].get("page")
	if not page is Array or page.size() != 2 or page[0] != 612 or page[1] != 792 or not resources[1].get("blocks") is Array: return PackedByteArray()
	var writer = load("res://scripts/campaign_pdf.gd").new()
	writer.fonts = resources[0].fonts
	writer.layout = resources[1]
	return writer._document(writer._model(poster, bundle, story))

static func _integer(value: int) -> String:
	var digits := str(value)
	var groups: Array[String] = []
	while digits.length() > 3:
		groups.push_front(digits.right(3))
		digits = digits.left(digits.length() - 3)
	groups.push_front(digits)
	return ",".join(groups)

static func _percentage(numerator: int, denominator: int) -> String:
	# Long division avoids int64 overflow and float rounding of safe-integer data.
	var scaled: int = numerator / denominator
	var remainder: int = numerator % denominator
	for digit in 4:
		remainder *= 10
		scaled = scaled * 10 + remainder / denominator
		remainder %= denominator
	if remainder * 2 >= denominator: scaled += 1
	return "%d.%02d %%" % [scaled / 100, scaled % 100]

static func _template(value: String, model: Dictionary) -> String:
	for key in model:
		if model[key] is String: value = value.replace("{" + key + "}", model[key])
	return value

func _model(poster: Dictionary, bundle: Dictionary, story: Dictionary) -> Dictionary:
	var rates: bool = poster.metric == "rate"
	var maximum: int = maxi(int(poster.records[0].sv), int(poster.records[1].sv))
	var model: Dictionary = layout.copy.duplicate()
	model.merge({"finding": poster.finding, "question": poster.question, "limit": story.poster_workshop.limit,
		"source_url": bundle.source.portal_url, "year": str(int(poster.records[0].year)),
		"measure": story.poster_workshop.rate_label if rates else story.poster_workshop.count_label}, true)
	model.scale = layout.copy.rate_scale if rates else _template(layout.copy.count_scale, {"maximum": _integer(maximum)}) if maximum else layout.copy.zero_scale
	for index in 2:
		var record: Dictionary = poster.records[index]
		var prefix: String = "first_" if index == 0 else "second_"
		var base: int = int(record.sv) + int(record.nv)
		model[prefix + "name"] = record.geography_name
		model[prefix + "value"] = (_percentage(int(record.sv), base) if base else layout.copy.unavailable) if rates else _integer(int(record.sv))
		model[prefix + "ratio"] = (float(record.sv) / base if base else null) if rates else (float(record.sv) / maximum if maximum else 0.0)
		var values := {"base": _integer(base)}
		for key in ["sv", "nv", "ns", "ln"]: values[key] = _integer(int(record[key]))
		model[prefix + "details"] = _template(layout.copy.details, values)
	return model

static func _number(value: float) -> String:
	var scaled: int = int(floor(absf(value) * 10000.0 + 0.5))
	var digits: String = "%d.%04d" % [scaled / 10000, scaled % 10000]
	while digits.ends_with("0"): digits = digits.left(-1)
	return ("-" if value < 0 and scaled else "") + digits.trim_suffix(".")

func _color(key: String) -> String:
	var hex: String = layout.colors[key]
	var values: Array[String] = []
	for index in 3: values.append(_number(float(hex.substr(index * 2, 2).hex_to_int()) / 255.0))
	return " ".join(values) + " rg\n"

func _rectangle(block: Dictionary, width: float, color: String) -> String:
	return _color(color) + "%s %s %s %s re f\n" % [_number(block.x), _number(792 - block.y - block.h), _number(width), _number(block.h)]

func _width(value: String, font: Dictionary, size: float) -> float:
	var units := 0
	for character in value:
		if not font.characters.has(character):
			failed = true
			return 0
		units += int(font.characters[character][1])
	return float(units) * size / 1000.0

func _lines(value: String, font: Dictionary, size: float, width: float) -> Array[String]:
	var result: Array[String] = []
	for paragraph in value.split("\n"):
		var line := ""
		for word in paragraph.split(" ", false):
			var candidate: String = word if line.is_empty() else line + " " + word
			if _width(candidate, font, size) <= width:
				line = candidate
				continue
			if not line.is_empty(): result.append(line)
			line = ""
			for character in word:
				if _width(line + character, font, size) > width:
					if line.is_empty(): failed = true
					result.append(line)
					line = ""
				line += character
		result.append(line)
	return result

func _text(block: Dictionary, model: Dictionary) -> String:
	var font_index: int = int(block.get("font", 0))
	var font: Dictionary = fonts[font_index]
	var size: float = block.size
	var leading: float = block.get("leading", size * 1.25)
	var lines := _lines(_template(block.text, model), font, size, block.w)
	if size + (lines.size() - 1) * leading > block.h: failed = true
	if failed: return ""
	var output := _color(block.get("color", "ink"))
	for index in lines.size():
		var line: String = lines[index]
		var x: float = block.x
		if block.get("align") == "right": x += block.w - _width(line, font, size)
		var encoded := ""
		for character in line: encoded += "%04x" % int(font.characters[character][0])
		output += "BT /F%d %s Tf 1 0 0 1 %s %s Tm <%s> Tj ET\n" % [font_index, _number(size), _number(x), _number(792 - block.y - size - index * leading), encoded]
	return output

static func _stream(bytes: PackedByteArray, extra: String = "") -> PackedByteArray:
	var result: PackedByteArray = ("<< /Length %d%s >>\nstream\n" % [bytes.size(), extra]).to_ascii_buffer()
	result.append_array(bytes)
	result.append_array("\nendstream".to_ascii_buffer())
	return result

func _font_objects(font: Dictionary, start: int) -> Array[PackedByteArray]:
	var bytes := Marshalls.base64_to_raw(font.ttf_base64)
	var cid_map := Marshalls.base64_to_raw(font.cid_map_base64)
	if bytes.size() < 4 or bytes.slice(0, 4) != PackedByteArray([0, 1, 0, 0]) or cid_map.is_empty(): failed = true
	var widths: Array[String] = []
	for width in font.widths: widths.append(str(int(width)))
	var bbox: Array[String] = []
	for coordinate in font.bbox: bbox.append(str(int(coordinate)))
	return [
		("<< /Type /Font /Subtype /Type0 /BaseFont /%s /Encoding /Identity-H /DescendantFonts [%d 0 R] /ToUnicode %d 0 R >>" % [font.name, start + 1, start + 4]).to_ascii_buffer(),
		("<< /Type /Font /Subtype /CIDFontType2 /BaseFont /%s /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor %d 0 R /CIDToGIDMap %d 0 R /DW 0 /W [0 [%s]] >>" % [font.name, start + 2, start + 5, " ".join(widths)]).to_ascii_buffer(),
		("<< /Type /FontDescriptor /FontName /%s /Flags 32 /FontBBox [%s] /ItalicAngle 0 /Ascent %d /Descent %d /CapHeight %d /StemV 80 /FontFile2 %d 0 R >>" % [font.name, " ".join(bbox), int(font.ascent), int(font.descent), int(font.cap_height), start + 3]).to_ascii_buffer(),
		_stream(bytes, " /Length1 %d" % bytes.size()), _stream(font.to_unicode.to_ascii_buffer()), _stream(cid_map)]

func _document(model: Dictionary) -> PackedByteArray:
	var commands := ""
	var annotation := ""
	for block in layout.blocks:
		match block.type:
			"text": commands += _text(block, model)
			"rect": commands += _rectangle(block, block.w, block.color)
			"bar":
				var ratio: Variant = model[block.value]
				if ratio != null:
					commands += _rectangle(block, block.w, "pale")
					if ratio > 0: commands += _rectangle(block, block.w * ratio, "pink")
			"link": annotation = "<< /Type /Annot /Subtype /Link /Rect [%s %s %s %s] /Border [0 0 0] /A << /S /URI /URI <%s> >> >>" % [_number(block.x), _number(792 - block.y - block.h), _number(block.x + block.w), _number(792 - block.y), str(model[block.value]).to_utf8_buffer().hex_encode()]
			_: failed = true
	if failed or annotation.is_empty(): return PackedByteArray()
	var objects: Array[PackedByteArray] = [
		"<< /Type /Catalog /Pages 2 0 R /Lang (es-MX) >>".to_ascii_buffer(),
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>".to_ascii_buffer(),
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F0 6 0 R /F1 12 0 R >> >> /Contents 4 0 R /Annots [5 0 R] >>".to_ascii_buffer(),
		_stream(commands.to_ascii_buffer()), annotation.to_ascii_buffer()]
	for font in fonts: objects.append_array(_font_objects(font, objects.size() + 1))
	if failed: return PackedByteArray()
	var output := "%PDF-1.7\n".to_ascii_buffer()
	output.append_array(PackedByteArray([37, 226, 227, 207, 211, 10]))
	var offsets: Array[int] = [0]
	for index in objects.size():
		offsets.append(output.size())
		output.append_array(("%d 0 obj\n" % (index + 1)).to_ascii_buffer())
		output.append_array(objects[index])
		output.append_array("\nendobj\n".to_ascii_buffer())
	var xref: int = output.size()
	output.append_array(("xref\n0 %d\n0000000000 65535 f \n" % offsets.size()).to_ascii_buffer())
	for offset in offsets.slice(1): output.append_array(("%010d 00000 n \n" % offset).to_ascii_buffer())
	output.append_array(("trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % [offsets.size(), xref]).to_ascii_buffer())
	return output
