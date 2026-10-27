class_name CivicAssetCatalog
extends RefCounted

var assets: Dictionary = {}
var cache: Dictionary = {}

func _init() -> void:
	var path := "res://assets/active_catalog.json"
	if not FileAccess.file_exists(path):
		path = "res://assets/catalogs/original.json"
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	if parsed is Dictionary:
		assets = parsed.get("assets", {})

func texture(role: String) -> Texture2D:
	if cache.has(role):
		return cache[role]
	if not assets.has(role):
		return null
	var entry: Dictionary = assets[role]
	var loaded := load(str(entry.path)) as Texture2D
	if loaded == null:
		return null
	if entry.has("region"):
		var rect: Array = entry.region
		var atlas := AtlasTexture.new()
		atlas.atlas = loaded
		atlas.region = Rect2(rect[0], rect[1], rect[2], rect[3])
		loaded = atlas
	cache[role] = loaded
	return loaded

func sound(role: String) -> AudioStream:
	if not assets.has(role):
		return null
	var stream := load(str(assets[role].path)) as AudioStream
	if stream is AudioStreamOggVorbis:
		stream.loop = bool(assets[role].get("loop", false))
	return stream

func character_frame(role: String, direction: String, frame: int) -> Texture2D:
	if not assets.has(role) or not assets[role].get("animations") is Dictionary:
		return texture(role)
	var entry: Dictionary = assets[role]
	var frames: Array = entry.animations.get(direction, entry.animations.get("down", []))
	if frames.is_empty():
		return texture(role)
	var key := "%s:%s:%d" % [role, direction, frame]
	if not cache.has(key):
		var region: Array = frames[clampi(frame, 0, frames.size() - 1)]
		var atlas := AtlasTexture.new()
		atlas.atlas = load(str(entry.path)) as Texture2D
		atlas.region = Rect2(region[0], region[1], region[2], region[3])
		cache[key] = atlas
	return cache[key]

func font(role: String) -> Font:
	return load(str(assets[role].path)) as Font if assets.has(role) and ResourceLoader.exists(str(assets[role].path)) else null
