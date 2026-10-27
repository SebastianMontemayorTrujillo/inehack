extends RefCounted

const Rules = preload("res://scripts/civic_rules.gd")
const PDF = preload("res://scripts/campaign_pdf.gd")
# Compatibility with poster_view.gd's existing source-section rule.
const RED := Color("B41476")
static var design: Dictionary = {}

static func _layout() -> Dictionary:
	if design.is_empty():
		design = JSON.parse_string(FileAccess.get_file_as_string("res://content/campaign_layout.json"))
	return design

static func _color(key: String) -> Color:
	return Color(_layout().colors[key])

# Container minimum sizes keep long names and enlarged text readable. All text
# remains real Labels; the chart is an additional encoding, never the only one.
# https://docs.godotengine.org/en/stable/classes/class_panelcontainer.html
# https://docs.godotengine.org/en/stable/classes/class_control.html#class-control-property-size-flags-stretch-ratio
static func create(app: Node, result: Dictionary, compact: bool = false) -> PanelContainer:
	var copy: Dictionary = _layout().copy
	var card := PanelContainer.new()
	card.name = "PosterCard"
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var paper := StyleBoxFlat.new()
	paper.bg_color = _color("white")
	paper.border_color = _color("pink")
	paper.set_border_width_all(2)
	paper.set_content_margin_all(14 if compact else 20)
	card.add_theme_stylebox_override("panel", paper)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 8 if compact else 12)
	card.add_child(content)
	var masthead := PanelContainer.new()
	var invitation := StyleBoxFlat.new()
	invitation.bg_color = _color("pink")
	invitation.set_content_margin_all(12 if compact else 18)
	masthead.add_theme_stylebox_override("panel", invitation)
	content.add_child(masthead)
	var heading := VBoxContainer.new()
	heading.add_theme_constant_override("separation", 8)
	masthead.add_child(heading)
	var title := _label(app, heading, copy.headline.replace("\n", " ") if compact else copy.headline, 24 if compact else 36, true)
	title.name = "PosterInvitation"
	title.add_theme_color_override("font_color", _color("white"))
	_label(app, heading, copy.citizen, 16 if compact else 18).add_theme_color_override("font_color", _color("white"))
	var source := _label(app, content, "Datos reales · INE / CCPC · Elección federal %d" % int(result.records[0].year), 16 if compact else 18, true)
	source.name = "PosterSource"
	source.add_theme_color_override("font_color", _color("pink"))
	var finding := _label(app, content, result.finding, 24 if compact else 32, true)
	finding.name = "PosterFinding"
	var columns := HBoxContainer.new()
	columns.add_theme_constant_override("separation", 16 if compact else 24)
	content.add_child(columns)
	var chart := VBoxContainer.new()
	chart.name = "PosterComparison"
	chart.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chart.size_flags_stretch_ratio = 1.9
	chart.add_theme_constant_override("separation", 6 if compact else 10)
	columns.add_child(chart)
	var measure := _label(app, chart, "Registros con participación" if result.metric == "count" else "De cada 100 con información", 18 if compact else 20, true)
	measure.name = "PosterMeasure"
	var maximum: float = maxf(result.records[0].sv, result.records[1].sv) if result.metric == "count" else 100.0
	for record in result.records:
		_record(app, chart, record, result.metric, maximum, compact)
	var scale_text := "Misma escala: 0 a 100%."
	if result.metric == "count":
		scale_text = "Misma escala: 0 a %s registros." % app._number(maximum) if maximum > 0 else "Ambos lugares tienen 0 registros con participación."
	_label(app, chart, scale_text, 16 if compact else 18).name = "PosterScale"
	var discussion := PanelContainer.new()
	discussion.name = "PosterDiscussion"
	discussion.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var question_paper := StyleBoxFlat.new()
	question_paper.bg_color = _color("pale")
	question_paper.border_color = _color("pink")
	question_paper.border_width_left = 4
	question_paper.set_content_margin_all(12 if compact else 16)
	discussion.add_theme_stylebox_override("panel", question_paper)
	columns.add_child(discussion)
	var question_content := VBoxContainer.new()
	question_content.add_theme_constant_override("separation", 8 if compact else 12)
	discussion.add_child(question_content)
	_label(app, question_content, copy.discussion, 16 if compact else 18, true).add_theme_color_override("font_color", _color("pink"))
	_label(app, question_content, result.question, 20 if compact else 26, true).name = "PosterQuestionText"
	# Compact is a summary for FIN. Its caller supplies Enlarge; the default card
	# and PDF retain all evidence. No hidden controls, state or navigation here.
	if compact: return card
	_rule(content, _color("pink"), 1)
	var notes := VBoxContainer.new()
	notes.add_theme_constant_override("separation", 4)
	content.add_child(notes)
	_label(app, notes, copy.classification, 18).name = "PosterBase"
	if result.metric == "rate":
		_label(app, notes, "Porcentajes redondeados a 2 decimales. El titular usa los datos sin redondear.", 18).name = "PosterRounding"
	_label(app, notes, "Límite: " + app.story.poster_workshop.limit, 18).name = "PosterLimits"
	_label(app, notes, copy.source_label, 18, true)
	_label(app, notes, app.bundle.source.portal_url, 18).name = "PosterSourceURL"
	return card

static func _record(app: Node, parent: VBoxContainer, record: Dictionary, metric: String, maximum: float, compact: bool) -> void:
	var row := VBoxContainer.new()
	row.name = "PosterRecord_" + record.id
	row.add_theme_constant_override("separation", 4)
	parent.add_child(row)
	var heading := HBoxContainer.new()
	heading.add_theme_constant_override("separation", 12)
	row.add_child(heading)
	_label(app, heading, record.geography_name, 18 if compact else 20, true)
	var base: int = int(record.sv) + int(record.nv)
	var value: Variant = record.sv if metric == "count" else Rules.rate(record.sv, base)
	var display: String = PDF._integer(int(record.sv)) if metric == "count" else PDF._percentage(int(record.sv), base) if base else "Sin datos\nclasificables"
	var number := _label(app, heading, display, (22 if compact else 28) if value != null else 18, true)
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
		bar.custom_minimum_size.y = 10 if compact else 16
		var background := StyleBoxFlat.new()
		background.bg_color = _color("pale")
		var fill := StyleBoxFlat.new()
		fill.bg_color = _color("pink")
		bar.add_theme_stylebox_override("background", background)
		bar.add_theme_stylebox_override("fill", fill)
		row.add_child(bar)
	if not compact:
		var values := {"base": PDF._integer(base)}
		for key in ["sv", "nv", "ns", "ln"]: values[key] = PDF._integer(int(record[key]))
		_label(app, row, PDF._template(_layout().copy.preview_details, values), 18).name = "PosterBase_" + record.id

static func _label(app: Node, parent: Control, value: String, size: int, bold: bool = false) -> Label:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.add_theme_font_size_override("font_size", size + maxi(0, int(app.theme.default_font_size) - 20))
	label.add_theme_color_override("font_color", _color("ink"))
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
