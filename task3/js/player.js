(function($) {
	
	function Player() {
		
		var _context, _source, _songs, _selectedSong, _playbackTime, _startTimeStamp, _isPlaying, _visualizer, _equalizer;

		var _init, _fileSelect, _playSong, _stopSong, _endOfPlayback, _getSelectedSong, _addToSongsList, _showLoader, _hideLoader, _showSongName;

		_init = function() {
			_context = new (AudioContext || webkitAudioContext)();

			_playbackTime = 0;
			_startTimeStamp = 0;
			_isPlaying = false;

			_songs = [];

			var file = $('#file'),
				dropZone = document.getElementById('drop-zone'),
				playBtn = $('#play'),
				pauseBtn = $('#pause'),
				stopBtn = $('#stop'),
				songsList = $('#songs-list'),
				equalizeBtn = $('input[name="equalizeBtn"]');

			_visualizer = new Visualizer(_context); /* инициализируем модуль визуализации */
			_equalizer = new Equalizer(_context); /* инициализируем эквалайзер */

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
				if(_selectedSong) {
					player.playSong(_selectedSong);
					playBtn.hide();
					pauseBtn.show();
				} else {
					alert('Загрузите и выберите файл для прослушивания.');
				}
			}

			pauseBtnClickListener = function() {
				if(_isPlaying)
					player.stopSong(true);
			}

			stopBtnClickListener = function () {
				if(_isPlaying)
					player.stopSong();	
			}

			songItemClickListener = function() {
				
				if(_isPlaying)
					player.stopSong();	

				var $this = $(this);
				
				$this.siblings('li').removeClass('active');
				$this.addClass('active');
				
				var id = $this.data('id');
				player.setSelectedSong(id);
			}

			equalizeBtnClickListener = function() {
				var value = $(this).val();
				_equalizer.changeEqualizerType(value);
			}

			addEvents = function() {
				
				file.on('change', fileSelectListener);
				
				dropZone.addEventListener('click', dropZoneClickListener,false);
				dropZone.addEventListener('dragover', dragOverListener,false);
				dropZone.addEventListener('drop', fileSelectListener,false);

				playBtn.on('click', playBtnClickListener);
				stopBtn.on('click', stopBtnClickListener);
				pauseBtn.on('click', pauseBtnClickListener);

				songsList.on('click',' > li', songItemClickListener);
				equalizeBtn.on('click',equalizeBtnClickListener);
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
					id3(file, function(err, tags) {
						id3Callback(e,file,tags);
				    });
				};
			}

			id3Callback = function(readerEvent, file, tags) {
				_context.decodeAudioData(readerEvent.target.result, function(buffer) {
					decodeAudioDataCallback(file,buffer,tags);		
				});
			}

			decodeAudioDataCallback = function(file, buffer, tags) {
				var rand_id = Math.floor(Math.random() * (9999 - 1) - 1),
					item = {
						id: rand_id,
						name: file.name,
						buffer: buffer,
						tags: tags
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

			var endOfPlayback = _endOfPlayback.bind(this);
      		_source.onended = endOfPlayback;

      		_equalizer.init(_source);
			_visualizer.init(_source);
			
			_source.start(0,_playbackTime);
			_startTimestamp = Date.now();
      		_isPlaying = true;
      		_showSongName(song.tags);
		}

		_stopSong = function(pause) {
			if(!_isPlaying) return;
			if(_source) {
				_isPlaying = false;
				_source.stop(0);
				_source = null;
				_playbackTime = pause ? (Date.now() - _startTimestamp) / 1000 + _playbackTime : 0;
			}
		}

		_endOfPlayback = function(e) {
			console.log("end of playback");

			_visualizer.clear();

	      	// If playback stopped because end of buffer was reached
	      	if (_isPlaying) _playbackTime = 0;
	      	_isPlaying = false;
	      	var pauseBtn = $('#pause'), playBtn = $('#play');
	      	pauseBtn.hide();
	      	playBtn.show();
		}

		_setSelectedSong = function(id) {
			var song = _songs.filter(function(e) {
				return e.id === id;
			});
			_selectedSong = song[0];
			_playbackTime = 0;
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

		_showSongName = function(tags) {
			var songInfo = $('.song-info'),
				text = '';
			if(tags.artist && tags.title) {
				text += tags.artist + ' - ' + tags.title;
				songInfo.text(text);
			}
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