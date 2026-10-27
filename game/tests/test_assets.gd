extends GutTest

const Catalog = preload("res://scripts/asset_catalog.gd")

func test_music_and_sound_effects_load_through_generic_audio_stream() -> void:
	var catalog = Catalog.new()
	for asset_set in ["original", "development"]:
		var parsed: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/catalogs/%s.json" % asset_set))
		catalog.assets = parsed.assets
		for role in ["sound.focus", "sound.select", "sound.journal", "sound.corrective", "sound.chapter", "music.plaza"]:
			var stream: AudioStream = catalog.sound(role)
			assert_not_null(stream, asset_set + ": " + role)
			if stream != null:
				assert_gt(stream.get_length(), 0.0, role)
		var music: AudioStream = catalog.sound("music.plaza")
		assert_true(music is AudioStreamOggVorbis)
		if music is AudioStreamOggVorbis:
			assert_true(music.loop, "Catalog music repeats without changing OGG bytes")
			assert_almost_eq(music.get_length(), 76.8, 0.01)
		assert_null(catalog.sound("music.missing"))

func test_plaza_music_wraps_and_keeps_playing() -> void:
	var catalog = Catalog.new()
	var music: AudioStream = catalog.sound("music.plaza")
	assert_not_null(music)
	if music == null:
		return
	var player := AudioStreamPlayer.new()
	add_child_autofree(player)
	player.stream = music
	player.play(music.get_length() - 0.15)
	await wait_seconds(0.4)
	assert_true(player.playing, "Playback continues after reaching the loop boundary")
	assert_between(player.get_playback_position(), 0.0, 1.0)
	player.stop()
