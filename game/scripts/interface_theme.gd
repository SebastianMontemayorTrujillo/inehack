extends RefCounted

const INK := Color("173b39")
const CREAM := Color("f6f0da")
const PAPER := Color("fff8e7")
const GOLD := Color("e4ba5c")
const FOCUS := Color("9b4d2d")

# One shared Theme keeps every answer and consultation choice equally styled.
# https://docs.godotengine.org/en/stable/classes/class_theme.html
static func apply(theme: Theme, catalog: RefCounted, large: bool) -> void:
	theme.default_font_size = 26 if large else 20
	var font: Font = catalog.font("font.regular")
	if font != null: theme.default_font = font
	theme.set_color("font_color", "Label", INK)
	for type in ["Button", "PrimaryButton", "QuietButton"]:
		if type != "Button": theme.set_type_variation(type, "Button")
		for state in ["normal", "hover", "pressed", "disabled"]:
			var fill := PAPER if state == "normal" else Color("eddfba")
			if type == "PrimaryButton": fill = INK if state == "normal" else Color("28564d")
			if type == "QuietButton" and state == "normal": fill = CREAM
			if state == "disabled": fill = Color("d0cbbb")
			var box := panel(fill, Color("708477"), 1, 6)
			box.content_margin_left = 16
			box.content_margin_right = 16
			box.content_margin_top = 9
			box.content_margin_bottom = 9
			theme.set_stylebox(state, type, box)
			var color := CREAM if type == "PrimaryButton" and state != "disabled" else INK
			theme.set_color("font_color" if state == "normal" else "font_" + state + "_color", type, color)
		var focus := panel(Color.TRANSPARENT, GOLD if type == "PrimaryButton" else FOCUS, 3, 6)
		focus.draw_center = false
		theme.set_stylebox("focus", type, focus)
		theme.set_color("font_focus_color", type, CREAM if type == "PrimaryButton" else INK)
	var popup := panel(CREAM, INK, 2, 6)
	popup.set_content_margin_all(8)
	theme.set_stylebox("panel", "PopupMenu", popup)
	theme.set_stylebox("hover", "PopupMenu", panel(Color("eddfba"), Color.TRANSPARENT, 0, 3))
	theme.set_color("font_color", "PopupMenu", INK)
	theme.set_color("font_hover_color", "PopupMenu", INK)
	theme.set_constant("v_separation", "PopupMenu", 10)

static func panel(fill: Color, border: Color, width: int, radius: int) -> StyleBoxFlat:
	var box := StyleBoxFlat.new()
	box.bg_color = fill
	box.border_color = border
	box.set_border_width_all(width)
	box.set_corner_radius_all(radius)
	return box
