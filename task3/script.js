(function($) {
	
	function Player() {
		
		var _context, _source, _songs, _selectedSong, _visualizer;

		var _init, _fileSelect, _playSong, _stopSong, _getSelectedSong, _addToSongsList, _showLoader, _hideLoader;

		_init = function() {
			_context = new (AudioContext || webkitAudioContext)();

			_songs = [];

			var file = $('#file'),
				dropZone = $('#drop-zone'),
				playBtn = $('#play'),
				stopBtn = $('#stop'),
				songsList = $('#songs-list');

			_visualizer = new Visualizer(_context); /* запускаем модуль визуализации */

			var fileSelectListener,dragOverListener,dropZoneClickListener,addEvents;

			fileSelectListener = function(e) {
				player.fileSelect(e);
				player.showLoader();
			}

			dragOverListener = function(e) {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}

			dropZoneClickListener = function() {
				file.click();
			}

			playBtnClickListener = function () {
				if(_selectedSong)
					player.playSong(_selectedSong);
			}

			stopBtnClickListener = function () {
				if(_selectedSong)
					player.stopSong(_selectedSong);	
			}

			songItemClickListener = function() {
				var id = $(this).data('id');
				player.setSelectedSong(id);
			}

			addEvents = function() {
				
				file.on('change', fileSelectListener);
				
				dropZone.on('click', dropZoneClickListener);
				dropZone.on('dragover', dragOverListener);
				dropZone.on('drop', fileSelectListener);

				playBtn.on('click', playBtnClickListener);
				stopBtn.on('click', stopBtnClickListener);

				songsList.on('click',' > li', songItemClickListener);
			}

			addEvents();
		}

		_fileSelect = function(e) {
			e.stopPropagation();
			e.preventDefault();

			var readerCallback,decodeAudioDataCallback;

			var files = (e.target.files) ? e.target.files : e.dataTransfer.files;

			readerCallback = function(reader, file) {
				reader.onload = function(e) {
					_context.decodeAudioData(e.target.result, function(buffer) {
						decodeAudioDataCallback(file,buffer);		
					});
				};
			}

			decodeAudioDataCallback = function(file, buffer) {
				var rand_id = Math.floor(Math.random() * (9999 - 1) - 1),
					item = {
						id: rand_id,
						name: file.name,
						buffer: buffer
					};
				_songs.push(item);
				_addToSongsList(rand_id, item.name);
				_hideLoader();
			}

			for(var i = 0; i < files.length; i++) {
				var reader = new FileReader();
				readerCallback(reader,files[i]);
				reader.readAsArrayBuffer(files[i]);
			}
		}

		_playSong = function(song) {
			if(_source)
				_stopSong();
			_source = _context.createBufferSource();
			_source.buffer = song.buffer;
			_source.connect(_context.destination);
			_visualizer.init(_source);
			_source.start(0);
		}

		_stopSong = function() {
			if(_source) {
				_source.stop(0);
				_source = null;
			}
		}

		_setSelectedSong = function(id) {
			var song = _songs.filter(function(e) {
				return e.id === id;
			});
			_selectedSong = song[0];
			console.log(_selectedSong);
		}

		_addToSongsList = function(rand_id,name) {
			var songsList = $('#songs-list'),
				tmpl = '<li data-id="' + rand_id + '">' + name + '</li>';
			songsList.append(tmpl);
		}

		_showLoader = function() {
			var loader = $('#loader');
			loader.show();
		}

		_hideLoader = function() {
			var loader = $('#loader');
			loader.hide();
		}

		return {
			init: _init,
			fileSelect: _fileSelect,
			playSong: _playSong,
			stopSong: _stopSong,
			getSelectedSong: _getSelectedSong,
			showLoader: _showLoader,
			setSelectedSong: _setSelectedSong
		}
	}

	var player = new Player();
	player.init();

}(jQuery));