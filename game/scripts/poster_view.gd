extends RefCounted

const Poster = preload("res://scripts/poster_workshop.gd")
const Rules = preload("res://scripts/civic_rules.gd")

static func chooser(app: Node, label: String, choices: Array, selected: String, node_name: String) -> OptionButton:
	app._text(label)
	var control := OptionButton.new()
	control.name = node_name
	control.accessibility_name = label
	control.fit_to_longest_item = false
	control.custom_minimum_size.y = 48
	control.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	# Official Linux release templates hit godotengine/godot#89657 in embedded
	# popup focus bookkeeping. Native popups avoid that path; web stays embedded.
	if OS.has_feature("linux") and not OS.has_feature("web"):
		control.get_popup().force_native = true
	for item in choices:
		control.add_item(item.text)
		control.set_item_metadata(control.item_count - 1, item.id)
		if item.id == selected: control.select(control.item_count - 1)
	app.body.add_child(control)
	return control

static func editor(app: Node) -> void:
	app._panel(app.story.poster_workshop.title)
	var content: Dictionary = app.story.poster_workshop
	app._text(content.intro)
	app._text(content.memory_note)
	var feedback: Label = app._text("")
	var places: Array = Poster.states(app.bundle).map(func(record: Dictionary): return {"id": record.id, "text": record.geography_name})
	var first := chooser(app, content.first_label, places, app.poster_selection.first, "PosterFirst")
	var second := chooser(app, content.second_label, places, app.poster_selection.second, "PosterSecond")
	var metric := chooser(app, content.metric_label, [{"id": "count", "text": content.count_label}, {"id": "rate", "text": content.rate_label}], app.poster_selection.metric, "PosterMetric")
	var question := chooser(app, content.question_label, content.questions, app.poster_selection.question, "PosterQuestion")
	app._button("Ver mi cartel", func():
		var selection := {"first": first.get_selected_metadata(), "second": second.get_selected_metadata(), "metric": metric.get_selected_metadata(), "question": question.get_selected_metadata()}
		if Poster.compose(app.bundle, app.story, selection).is_empty():
			feedback.text = "Elige dos estados distintos para comparar."
			app._focus_if_available(weakref(first), weakref(feedback))
			return
		app.poster_selection = selection
		app._poster_preview())
	app._button("Volver sin publicar" if app.meeting_poster.is_empty() else "Cancelar y conservar mi publicación", app._close_panel)

static func evidence(app: Node, selection: Dictionary) -> void:
	var result := Poster.compose(app.bundle, app.story, selection)
	if result.is_empty(): return
	var a: Dictionary = result.records[0]
	var b: Dictionary = result.records[1]
	app._text("INE · CCPC · Elección federal 2024\n" + a.geography_name + " y " + b.geography_name)
	app._text(result.finding)
	var maximum: float = maxf(a.sv, b.sv) if result.metric == "count" else 100.0
	for record in result.records:
		var base: int = int(record.sv) + int(record.nv)
		var value: Variant = record.sv if result.metric == "count" else Rules.rate(record.sv, base)
		var display: String = app._number(record.sv) + " registros con participación" if result.metric == "count" else app._percentage(value) + " entre registros con información conocida"
		app._bar(record.geography_name + ": " + display, 0.0 if value == null else 100.0 * value / maxf(1, maximum))
		app._text("Exactos: %s con participación de %s con información conocida. Por separado, %s sin información de %s en toda la lista." % [app._number(record.sv), app._number(base), app._number(record.ns), app._number(record.ln)])
	if result.metric == "rate":
		app._text("Base: SV + NV. La comparación usa conteos exactos aunque los porcentajes redondeados se parezcan.")
	app._text(app.story.poster_workshop.limit)
	app._text("Para conversar: " + result.question)

static func acknowledge(app: Node) -> void:
	if app.meeting_poster.is_empty(): return
	var result := Poster.compose(app.bundle, app.story, app.meeting_poster)
	if result.is_empty(): return
	app._text("Inés: «Trajiste un cartel sobre %s y %s: %s»" % [result.records[0].geography_name, result.records[1].geography_name, result.finding])
	app._text("Tu pregunta abre la conversación: " + result.question)
	app._text(app.story.poster_workshop.limit)
	app._button("Abrir mi cartel y su fuente", app._published_poster)

static func preview(app: Node, published: bool = false) -> void:
	var selection: Dictionary = app.meeting_poster if published else app.poster_selection
	app._panel("Mi cartel publicado" if published else "Tu cartel para la reunión")
	evidence(app, selection)
	app._text(app.story.poster_workshop.memory_note)
	app._button("Cambiar mi cartel", func():
		app.poster_selection = selection.duplicate()
		app._poster_workshop())
	if not published:
		app._button("Llevar a la reunión", func():
			app.meeting_poster = selection.duplicate()
			app._enter_house(2)
			app._start_chapter(2))
	app._button("Datos exactos y fuente del cartel", func():
		app._panel("Datos y fuente de mi cartel")
		for record in Poster.compose(app.bundle, app.story, selection).get("records", []): app._data_card(record)
		app._text("Fuente: " + app.bundle.source.url + "\nSHA-256: " + app.bundle.source.sha256)
		app._button("Abrir portal oficial CCPC", func(): OS.shell_open(app.bundle.source.portal_url))
		app._button("Volver a mi cartel", func(): preview(app, published)))
