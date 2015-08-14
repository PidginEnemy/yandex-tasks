(function() {

  function Visualizer(context) {

    var analyser = context.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    var canvas = document.querySelector('.visualizer');
    var canvasCtx = canvas.getContext("2d");

    var intendedWidth = document.querySelector('.container').clientWidth;

    canvas.setAttribute('width',intendedWidth);

    var drawVisual;

    /* visualize frequencybars */
    function visualize() {
      WIDTH = canvas.width;
      HEIGHT = canvas.height;

      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

          x += barWidth + 1;
        }
      }

      draw();
    }

    this.init = function(source) {
      source.connect(analyser);
      visualize();
    }
  }

  window.Visualizer = Visualizer;

}());