extends Node2D
## One active spatial location. Session/progress and player belong to Main.
const Rules = preload("res://scripts/civic_rules.gd")

var catalog: RefCounted
var house_index := -1
var story: Dictionary
var bounds := Rect2(8, 12, 464, 186)
var interactions: Array[Dictionary] = []
var artifact_label: Label
var exhibit_labels: Array[Label] = []

func _ready() -> void:
	if house_index < 0:
		_plaza()
	else:
		_interior()

func sprite(role: String, point: Vector2) -> void:
	var art := Sprite2D.new()
	art.texture = catalog.texture(role)
	art.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	art.position = point
	add_child(art)

func label(text: String, point: Vector2, size: int = 8) -> Label:
	var node := Label.new()
	node.text = text
	node.position = point
	node.add_theme_font_override("font", catalog.font("font.bold"))
	node.add_theme_font_size_override("font_size", size)
	node.add_theme_color_override("font_color", Color("173b39"))
	add_child(node)
	return node

func solid(point: Vector2, size: Vector2) -> void:
	var obstacle := StaticBody2D.new()
	var collider := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = size
	collider.shape = shape
	obstacle.position = point
	obstacle.add_child(collider)
	add_child(obstacle)

func target(kind: String, index: int, point: Vector2, size: Vector2) -> void:
	var area := Area2D.new()
	area.position = point
	area.collision_layer = 0
	area.collision_mask = 1
	var collision := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = size
	collision.shape = shape
	area.add_child(collision)
	add_child(area)
	interactions.append({"kind": kind, "index": index, "point": point, "area": area})

func nearest_target(player: CharacterBody2D) -> Dictionary:
	var selected: Dictionary = {}
	var distance := INF
	for item in interactions:
		if item.area.overlaps_body(player):
			var candidate: float = player.position.distance_to(item.point)
			if candidate < distance:
				selected = item
				distance = candidate
	return selected

func ground(roles: Array[String], inside: bool) -> void:
	var tiles := TileSet.new()
	tiles.tile_size = Vector2i(16, 16)
	for i in roles.size():
		var source := TileSetAtlasSource.new()
		source.texture = catalog.texture(roles[i])
		source.texture_region_size = Vector2i(16, 16)
		source.create_tile(Vector2i.ZERO)
		tiles.add_source(source, i)
	var layer := TileMapLayer.new()
	layer.tile_set = tiles
	layer.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	add_child(layer)
	for x in 30:
		for y in 13:
			var tile := 0
			if inside:
				tile = 1 if x == 0 or x == 29 or y < 2 or y == 12 else 0
			else:
				tile = 2 if y >= 7 and y <= 10 else 0
				if x in range(13, 17) or y == 11:
					tile = 1
				if x >= 26 and y < 5:
					tile = 3
			layer.set_cell(Vector2i(x, y), tile, Vector2i.ZERO)

func _plaza() -> void:
	ground(["terrain.grass", "terrain.path", "terrain.paving", "terrain.water"], false)
	var buildings := ["building.printshop", "building.archive", "building.hall"]
	for i in 3:
		var x: float = 80 + i * 160
		sprite(buildings[i], Vector2(x, 62))
		solid(Vector2(x, 64), Vector2(52, 34))
		target("door", i, Vector2(x, 96), Vector2(40, 30))
		label(["1 · IMPRENTA", "2 · ARCHIVO", "3 · REUNIÓN"][i], Vector2(x - 38, 109))
		exhibit_labels.append(label("", Vector2(x - 53, 154)))
	for point in [Vector2(20, 35), Vector2(145, 46), Vector2(316, 42), Vector2(470, 180)]:
		sprite("prop.tree", point)
	sprite("prop.bench", Vector2(170, 181))
	sprite("prop.bench", Vector2(330, 181))
	label("Camina con WASD · Cruza una puerta para entrar", Vector2(92, 192), 7)

func _interior() -> void:
	bounds = Rect2(24, 40, 432, 148)
	ground(["terrain.floor", "terrain.wall"], true)
	solid(Vector2(8, 104), Vector2(16, 208))
	solid(Vector2(472, 104), Vector2(16, 208))
	solid(Vector2(240, 24), Vector2(480, 16))
	solid(Vector2(105, 200), Vector2(210, 16))
	solid(Vector2(375, 200), Vector2(210, 16))
	label(story.houses[house_index].title.to_upper(), Vector2(32, 38), 11)
	label(["INFORMARNOS", "COMPARAR CON JUSTICIA", "ESCUCHAR Y DAR SEGUIMIENTO"][house_index], Vector2(32, 56))
	var people := ["character.luz", "character.mateo", "character.ines"]
	var props := ["prop.printer", "prop.noticeboard", "prop.ballotbox"]
	sprite(people[house_index], Vector2(175, 100))
	sprite(props[house_index], Vector2(283, 92))
	target("host", house_index, Vector2(175, 113), Vector2(55, 45))
	target("artifact", house_index, Vector2(283, 110), Vector2(55, 45))
	label(story.chapters[house_index].npc + " · E para conversar", Vector2(127, 128), 7)
	label(["Imprimir boletín", "Revisar cartel", "Conocer propuestas"][house_index], Vector2(247, 125), 7)
	solid(Vector2(283, 91), Vector2(25, 18))
	if house_index == 0:
		sprite("prop.desk", Vector2(74, 97))
		solid(Vector2(74, 100), Vector2(30, 18))
		sprite("prop.bookshelf", Vector2(405, 80))
	elif house_index == 1:
		for x in [65, 105, 405]:
			sprite("prop.bookshelf", Vector2(x, 85))
			solid(Vector2(x, 85), Vector2(26, 26))
	else:
		for x in [64, 102, 380, 420]:
			sprite("prop.chair", Vector2(x, 115))
			solid(Vector2(x, 115), Vector2(16, 14))
		sprite("icon.shade", Vector2(65, 76))
		sprite("icon.reading", Vector2(386, 76))
		sprite("icon.garden", Vector2(420, 76))
	artifact_label = label("", Vector2(38, 151), 8)
	sprite("prop.exit", Vector2(240, 192))
	target("exit", house_index, Vector2(240, 186), Vector2(44, 18))
	label("SALIR · CAMINA HACIA ABAJO", Vector2(263, 178), 7)

func update_artifacts(completed: Array, data: Dictionary, selection: Dictionary = {}) -> void:
	var unfinished := ["BOLETÍN POR PUBLICAR", "CARTEL POR REVISAR", "REUNIÓN POR PREPARAR"]
	var finished := ["BOLETÍN PUBLICADO · CON FUENTE", "CARTEL CORREGIDO · CON FUENTE", "ACUERDOS PARA DAR SEGUIMIENTO"]
	var records: Dictionary = {}
	for record in data.get("records", []):
		records[record.id] = record
	var national: Variant = records.get("national", {}).get("participation_pct")
	var short_finding := "Sin información suficiente" if national == null else "Cerca de %d de cada 100\ncon información · INE / CCPC 2024" % roundi(national)
	var comparison := "Cantidad y porcentaje son distintos.\nINE / CCPC 2024 · Revisa el diario."
	if records.has("state_01") and records.has("state_02"):
		comparison = Rules.comparison_caption(records.state_01, records.state_02, story.comparison_artifact)
	var authored: Dictionary = {}
	if not selection.is_empty():
		authored = preload("res://scripts/poster_workshop.gd").compose(data, story, selection)
		if not authored.is_empty(): comparison = authored.finding
	if house_index >= 0:
		artifact_label.text = finished[house_index] if story.chapters[house_index].id in completed else unfinished[house_index]
		if house_index == 1:
			artifact_label.text = "CARTEL CORREGIDO · INE / CCPC 2024" if "comparison" in completed else "TITULAR POR REVISAR\n«" + story.comparison_artifact.before + "»"
			if not authored.is_empty(): artifact_label.text = "MI CARTEL PUBLICADO · INE / CCPC 2024"
		if story.chapters[house_index].id in completed:
			artifact_label.text += "\n" + [short_finding, comparison.trim_suffix("\n"), "Escuchar necesidades y revisar avances."][house_index]
	else:
		for i in exhibit_labels.size():
			exhibit_labels[i].text = (["Boletín con fuente", "Cartel con fuente", "Seguimiento listo"][i] if story.chapters[i].id in completed else ["Informarnos", "Comparar con justicia", "Escuchar y decidir"][i])
			if i == 0 and "printing" in completed:
				exhibit_labels[i].text = short_finding
			if i == 1 and "comparison" in completed:
				exhibit_labels[i].text = "Cantidad y proporción:\nCartel corregido · CCPC 2024"
				if not authored.is_empty(): exhibit_labels[i].text = "Mi cartel publicado\nINE / CCPC 2024"
