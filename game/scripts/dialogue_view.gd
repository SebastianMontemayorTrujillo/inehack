extends RefCounted
## Character speech occupies the bottom of the world; evidence keeps its own panel.

static func show(app: Node, index: int, message: String, actions: Array = []) -> void:
	app._panel(app.story.chapters[index].npc + " · " + app.story.houses[index].title, false, true)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 24)
	app.body.add_child(row)
	var portrait := TextureRect.new()
	portrait.texture = app.catalog.texture(["character.luz", "character.mateo", "character.ines"][index])
	portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	portrait.custom_minimum_size = Vector2(76, 90)
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(portrait)
	var copy := VBoxContainer.new()
	copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(copy)
	app._text(message, copy)
	for action in actions:
		app._button(action.text, action.action, true)
	if actions.is_empty(): app._button(app.story.dialogue.close_label, app._close_panel)
