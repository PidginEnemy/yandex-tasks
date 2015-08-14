(function() {

	function Equalizer(context) {

		var _createFilter, _createFilters, _changeEqualizerType;

		var _frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
    			_filters;

    	var _gains  = [
    		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],		/* normal */
    		[ -1.5, -1, 0, 1, 2, 2, 1, 0, -1, -1 ],		/* pop */
    		[ 4, 3, 2, 1, -1, -1, 0, 1, 2, 3 ],		/* rock */
    		[ 3, 2, 1, 1.8, -1.5, -1.5, 0, 1, 2, 2.5 ],		/* jazz */
    		[ 5, 4.5, 4, 4, -2, -2, 0, 1, 2, 2.2 ]		/* classic */
    	];


		_createFilter = function(frequency) {
			var filter = context.createBiquadFilter();

			filter.type = 'peaking'; 
			filter.frequency.value = frequency; 
			filter.Q.value = 1;
			filter.gain.value = 0;

			return filter;
		}

		_createFilters = function() {
			
    		_filters = _frequencies.map(_createFilter);
      
			_filters.reduce(function (prev, curr) {
			    prev.connect(curr);
			    return curr;
			});

			return _filters;
		}

		_changeEqualizerType = function(type) {
			var index = type - 1;
			for(var i = 0; i < _filters.length; i++) {
				_filters[i].gain.value = _gains[index][i];
			}
			console.log(_filters);
		}

		_init = function(source) {
			var _filters = _createFilters();

			source.connect(_filters[0]);
			_filters[_filters.length - 1].connect(context.destination);
		}

		return {
			init: _init,
			changeEqualizerType: _changeEqualizerType
		}

	}

	window.Equalizer = Equalizer;
	
}());