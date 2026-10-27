extends RefCounted

const Rules = preload("res://scripts/civic_rules.gd")
const PAPER := Color("fff8e7")
const OCHRE_PAPER := Color("efe2b6")
const RED := Color("9b4d2d")
const TRACK := Color("dfd9c7")

# Container minimum sizes keep long names and enlarged text readable. All text
# remains real Labels; the chart is an additional encoding, never the only one.
# https://docs.godotengine.org/en/stable/classes/class_panelcontainer.html
# https://docs.godotengine.org/en/stable/classes/class_control.html#class-control-property-size-flags-stretch-ratio
static func create(app: Node, result: Dictionary) -> PanelContainer:
	var card := PanelContainer.new()
	card.name = "PosterCard"
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var paper := StyleBoxFlat.new()
	paper.bg_color = PAPER
	paper.border_color = app.INK
	paper.set_border_width_all(2)
	paper.set_content_margin_all(20)
	card.add_theme_stylebox_override("panel", paper)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 12)
	card.add_child(content)
	var masthead := HBoxContainer.new()
	masthead.add_theme_constant_override("separation", 16)
	content.add_child(masthead)
	var signature := _label(app, masthead, "VOCES DE LA PLAZA", 18, true)
	signature.add_theme_color_override("font_color", RED)
	var source := _label(app, masthead, "INE · CCPC · ELECCIÓN FEDERAL %d" % int(result.records[0].year), 18)
	source.name = "PosterSource"
	source.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_rule(content, app.INK, 2)
	var finding := _label(app, content, result.finding, 34, true)
	finding.name = "PosterFinding"
	var columns := HBoxContainer.new()
	columns.add_theme_constant_override("separation", 24)
	content.add_child(columns)
	var chart := VBoxContainer.new()
	chart.name = "PosterComparison"
	chart.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chart.size_flags_stretch_ratio = 1.9
	chart.add_theme_constant_override("separation", 10)
	columns.add_child(chart)
	var measure := _label(app, chart, "Registros con participación" if result.metric == "count" else "De cada 100 con información", 20, true)
	measure.name = "PosterMeasure"
	var maximum: float = maxf(result.records[0].sv, result.records[1].sv) if result.metric == "count" else 100.0
	for record in result.records:
		_record(app, chart, record, result.metric, maximum)
	var scale_text := "Misma escala: 0 a 100%."
	if result.metric == "count":
		scale_text = "Misma escala: 0 a %s registros." % app._number(maximum) if maximum > 0 else "Ambos lugares tienen 0 registros con participación."
	_label(app, chart, scale_text, 18).name = "PosterScale"
	var discussion := PanelContainer.new()
	discussion.name = "PosterDiscussion"
	discussion.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var question_paper := StyleBoxFlat.new()
	question_paper.bg_color = OCHRE_PAPER
	question_paper.border_color = RED
	question_paper.border_width_left = 4
	question_paper.set_content_margin_all(16)
	discussion.add_theme_stylebox_override("panel", question_paper)
	columns.add_child(discussion)
	var question_content := VBoxContainer.new()
	question_content.add_theme_constant_override("separation", 12)
	discussion.add_child(question_content)
	_label(app, question_content, "PARA CONVERSAR", 18, true).add_theme_color_override("font_color", RED)
	_label(app, question_content, result.question, 26, true).name = "PosterQuestionText"
	_rule(content, RED, 1)
	var notes := VBoxContainer.new()
	notes.add_theme_constant_override("separation", 4)
	content.add_child(notes)
	_label(app, notes, "Base: registros con información (SV + NV). NS: sin información; se muestra aparte.", 18).name = "PosterBase"
	if result.metric == "rate":
		_label(app, notes, "Porcentajes redondeados a 2 decimales. El titular usa los datos sin redondear.", 18).name = "PosterRounding"
	_label(app, notes, "Límite: " + app.story.poster_workshop.limit, 18).name = "PosterLimits"
	return card

static func _record(app: Node, parent: VBoxContainer, record: Dictionary, metric: String, maximum: float) -> void:
	var row := VBoxContainer.new()
	row.name = "PosterRecord_" + record.id
	row.add_theme_constant_override("separation", 4)
	parent.add_child(row)
	var heading := HBoxContainer.new()
	heading.add_theme_constant_override("separation", 12)
	row.add_child(heading)
	_label(app, heading, record.geography_name, 20, true)
	var base: int = int(record.sv) + int(record.nv)
	var value: Variant = record.sv if metric == "count" else Rules.rate(record.sv, base)
	var display: String = app._number(record.sv) if metric == "count" else app._percentage(value)
	var number := _label(app, heading, display if value != null else "Sin datos\nclasificables", 28 if value != null else 20, true)
	number.name = "PosterValue_" + record.id
	number.autowrap_mode = TextServer.AUTOWRAP_OFF
	number.size_flags_horizontal = Control.SIZE_SHRINK_END
	number.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	# A missing denominator is not a zero-length bar. Preserve the canonical
	# finding and show the missing-data label, without inventing a proportion.
	if value != null:
		var bar := ProgressBar.new()
		bar.name = "PosterBar_" + record.id
		bar.accessibility_name = record.geography_name + ": " + display + (" registros con participación" if metric == "count" else " entre registros con información")
		bar.min_value = 0
		bar.max_value = maxf(1.0, maximum)
		# Range.step=0 prevents display quantization; it never determines which
		# record wins. Poster.compose already supplies the exact-data finding.
		# https://docs.godotengine.org/en/stable/classes/class_range.html#class-range-property-step
		bar.step = 0.0
		bar.value = float(value)
		bar.show_percentage = false
		bar.custom_minimum_size.y = 16
		var background := StyleBoxFlat.new()
		background.bg_color = TRACK
		var fill := StyleBoxFlat.new()
		fill.bg_color = app.TEAL
		bar.add_theme_stylebox_override("background", background)
		bar.add_theme_stylebox_override("fill", fill)
		row.add_child(bar)
	_label(app, row, "Base: %s · NS: %s" % [app._number(base), app._number(record.ns)], 18).name = "PosterBase_" + record.id

static func _label(app: Node, parent: Control, value: String, size: int, bold: bool = false) -> Label:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.add_theme_font_size_override("font_size", size + maxi(0, int(app.theme.default_font_size) - 20))
	label.add_theme_color_override("font_color", app.INK)
	if bold:
		var font: Font = app.catalog.font("font.bold")
		if font != null: label.add_theme_font_override("font", font)
	parent.add_child(label)
	return label

static func _rule(parent: VBoxContainer, color: Color, height: int) -> void:
	var rule := ColorRect.new()
	rule.color = color
	rule.custom_minimum_size.y = height
	rule.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(rule)
