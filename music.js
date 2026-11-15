/* Música del portafolio: una canción original que suena con el botón flotante.
   Mientras suena, la cenefa del inicio se mueve como un ecualizador. */
(function () {
  "use strict";

  var btn = document.getElementById("music-btn");
  if (!btn) { return; }
  var label = btn.querySelector(".music__label");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var audio = new Audio();
  audio.src = btn.getAttribute("data-src");
  audio.loop = true;
  audio.preload = "none";

  var ctx = null;
  var gain = null;
  var analyser = null;
  var freq = null;
  var playing = false;
  var raf = null;
  var stopTimer = null;
  var pausedByHide = false;

  function setup() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    ctx = new AC();
    var src = ctx.createMediaElementSource(audio);
    gain = ctx.createGain();
    gain.gain.value = 0;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    src.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
  }

  function fade(to, seconds) {
    if (ctx === null) {
      audio.volume = to;
      return;
    }
    var g = gain.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(to, ctx.currentTime + seconds);
  }

  function bars() {
    return document.querySelectorAll("#cenefa i");
  }

  function drawBars() {
    raf = null;
    if (!playing || analyser === null) { return; }
    analyser.getByteFrequencyData(freq);
    var list = bars();
    var n = list.length;
    for (var i = 0; i < n; i++) {
      var pos = n === 1 ? 0 : i / (n - 1);
      var bin = 1 + Math.floor(Math.pow(pos, 1.5) * 70);
      var v = (freq[bin] + freq[bin + 1]) / 510;
      var sc = 0.3 + v * 1.2 * (0.7 + 0.6 * pos);
      list[i].style.setProperty("--s", sc.toFixed(3));
    }
    raf = requestAnimationFrame(drawBars);
  }

  function resetBars() {
    var list = bars();
    for (var i = 0; i < list.length; i++) { list[i].style.setProperty("--s", "1"); }
  }

  function setUi(state) {
    var on = state === "on";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    if (state === "loading") { label.textContent = "Cargando…"; }
    else { label.textContent = on ? "Pausar música" : "Poner música"; }
    btn.setAttribute("aria-label", label.textContent);
    document.documentElement.classList.toggle("music-on", on);
  }

  function play() {
    if (ctx === null) { setup(); }
    if (ctx !== null) { ctx.resume(); }
    clearTimeout(stopTimer);
    setUi("loading");
    var started = audio.play();
    var ok = function () {
      playing = true;
      fade(1, 1.2);
      setUi("on");
      if (!reduceMotion && raf === null) { raf = requestAnimationFrame(drawBars); }
    };
    if (started && typeof started.then === "function") {
      started.then(ok, function () {
        setUi("off");
        label.textContent = "No se pudo reproducir";
      });
    } else {
      ok();
    }
  }

  function pause() {
    if (!playing) { return; }
    playing = false;
    fade(0, 0.5);
    stopTimer = setTimeout(function () { if (!playing) { audio.pause(); } }, 550);
    setUi("off");
    resetBars();
  }

  btn.addEventListener("click", function () {
    if (playing) { pause(); } else { play(); }
  });

  // Si alguien pone un reel, la música se pausa para que no suenen dos cosas.
  document.addEventListener("portafolio:pausar-musica", pause);

  // Al cambiar de pestaña se pausa y al volver sigue donde iba.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) {
      pausedByHide = true;
      audio.pause();
    } else if (!document.hidden && pausedByHide) {
      pausedByHide = false;
      if (playing) { audio.play(); }
    }
  });
})();
