extends RefCounted

const Poster = preload("res://scripts/poster_workshop.gd")
const Card = preload("res://scripts/poster_card.gd")

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
	app.body.add_child(Card.create(app, result))

static func acknowledge(app: Node) -> void:
	if app.meeting_poster.is_empty(): return
	var result := Poster.compose(app.bundle, app.story, app.meeting_poster)
	if result.is_empty(): return
	app._text("Cartel publicado sobre %s y %s: %s" % [result.records[0].geography_name, result.records[1].geography_name, result.finding])
	app._text("Tu pregunta abre la conversación: " + result.question)
	app._text(app.story.poster_workshop.limit)
	app._button("Abrir mi cartel y su fuente", app._published_poster)

static func preview(app: Node, published: bool = false) -> void:
	var selection: Dictionary = app.meeting_poster if published else app.poster_selection
	app._panel("Mi cartel publicado" if published else "Tu cartel para la reunión", true)
	var actions := HBoxContainer.new()
	actions.name = "PosterActions"
	actions.add_theme_constant_override("separation", 12)
	app.body.add_child(actions)
	_action(app, actions, "Cambiar mi cartel", "PosterEdit", func():
		app.poster_selection = selection.duplicate()
		app._poster_workshop())
	if not published:
		var publish := _action(app, actions, "Guardar mi cartel", "PosterPublish", func(): app._publish_poster(selection))
		_primary(app, publish)
	var source := _action(app, actions, "Datos exactos y fuente del cartel", "PosterSourceButton", func(): _source(app, selection, published))
	source.size_flags_stretch_ratio = 1.6
	evidence(app, selection)
	app._text(app.story.poster_workshop.memory_note)

static func _source(app: Node, selection: Dictionary, published: bool) -> void:
	app._panel("Datos y fuente de mi cartel")
	for record in Poster.compose(app.bundle, app.story, selection).get("records", []): app._data_card(record)
	app._text("Fuente: " + app.bundle.source.url + "\nSHA-256: " + app.bundle.source.sha256)
	app._button("Abrir portal oficial CCPC", func(): OS.shell_open(app.bundle.source.portal_url))
	app._button("Volver a mi cartel", func(): preview(app, published))

static func _action(app: Node, parent: HBoxContainer, title: String, node_name: String, action: Callable) -> Button:
	var button: Button = app._button(title, action)
	button.name = node_name
	button.alignment = HORIZONTAL_ALIGNMENT_CENTER
	button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	button.custom_minimum_size.y = 48
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	app.body.remove_child(button)
	parent.add_child(button)
	return button

static func _primary(app: Node, button: Button) -> void:
	for state in ["normal", "hover", "pressed"]:
		var box := StyleBoxFlat.new()
		box.bg_color = app.INK if state == "normal" else Color("28564d")
		box.set_corner_radius_all(6)
		box.set_content_margin_all(12)
		button.add_theme_stylebox_override(state, box)
	for state in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
		button.add_theme_color_override(state, app.CREAM)
	var focus := StyleBoxFlat.new()
	focus.draw_center = false
	focus.border_color = Card.RED
	focus.set_border_width_all(3)
	focus.set_corner_radius_all(6)
	focus.set_expand_margin_all(3)
	button.add_theme_stylebox_override("focus", focus)
