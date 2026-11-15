/* Música original para el portafolio, generada en el navegador con Web Audio.
   Un loop lo-fi suave (82 BPM): acordes, bajo, arpegio y batería ligera.
   La cenefa del inicio se mueve con la música como un ecualizador. */
(function () {
  "use strict";

  var BPM = 82;
  var STEP = 60 / BPM / 2; // corcheas
  var STEPS = 32;          // 4 compases de 8 corcheas

  // Dm9, G13, Cmaj9, Am9 (voces cercanas para que suene suave)
  var CHORDS = [
    { root: 38, pad: [53, 57, 60, 64], arp: [62, 65, 69, 72, 76] },
    { root: 43, pad: [53, 59, 64, 67], arp: [62, 65, 67, 71, 74] },
    { root: 36, pad: [52, 55, 59, 62], arp: [60, 64, 67, 71, 74] },
    { root: 45, pad: [55, 60, 64, 67], arp: [64, 67, 69, 72, 76] }
  ];
  var ARP_STEPS = { 1: 0, 3: 2, 4: 1, 6: 3, 7: 4 };

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /** Crea el motor sobre un contexto (en vivo u offline). */
  function createEngine(ctx) {
    var out = ctx.createGain();
    out.gain.value = 0;

    var warm = ctx.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 7800;

    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;

    var analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;

    out.connect(warm);
    warm.connect(comp);
    comp.connect(analyser);
    analyser.connect(ctx.destination);

    var bus = ctx.createGain();
    bus.gain.value = 0.9;
    bus.connect(out);

    // Eco para el arpegio
    var delay = ctx.createDelay(2);
    delay.delayTime.value = STEP * 3;
    var feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    var wet = ctx.createGain();
    wet.gain.value = 0.28;
    var tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2600;
    delay.connect(tone);
    tone.connect(feedback);
    feedback.connect(delay);
    tone.connect(wet);
    wet.connect(bus);

    var padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 1100;
    padFilter.Q.value = 0.4;
    padFilter.connect(bus);

    // Ruido para la batería
    var noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) { nd[i] = Math.random() * 2 - 1; }

    function env(g, t, peak, attack, hold, release) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.setValueAtTime(peak, t + attack + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    }

    function pad(t, notes, dur) {
      for (var i = 0; i < notes.length; i++) {
        var f = mtof(notes[i]);
        var g = ctx.createGain();
        env(g, t, 0.045, 0.7, Math.max(0.1, dur - 1.4), 0.9);
        g.connect(padFilter);
        var types = ["triangle", "sine"];
        var det = [-5, 6];
        for (var k = 0; k < 2; k++) {
          var o = ctx.createOscillator();
          o.type = types[k];
          o.frequency.value = f;
          o.detune.value = det[k];
          o.connect(g);
          o.start(t);
          o.stop(t + dur + 1);
        }
      }
    }

    function bass(t, midi, dur) {
      var o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = mtof(midi);
      var g = ctx.createGain();
      env(g, t, 0.22, 0.012, dur * 0.6, dur * 0.5);
      var lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      o.connect(lp);
      lp.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + dur + 0.2);
    }

    function pluck(t, midi, vel) {
      var o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = mtof(midi);
      var g = ctx.createGain();
      env(g, t, 0.055 * vel, 0.006, 0.02, 0.45);
      o.connect(g);
      g.connect(bus);
      g.connect(delay);
      o.start(t);
      o.stop(t + 0.6);
    }

    function kick(t) {
      var o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(115, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
      var g = ctx.createGain();
      env(g, t, 0.42, 0.003, 0.02, 0.3);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + 0.4);
    }

    function noise(t, type, freq, q, peak, release) {
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      var f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      var g = ctx.createGain();
      env(g, t, peak, 0.002, 0.005, release);
      src.connect(f);
      f.connect(g);
      g.connect(bus);
      src.start(t, Math.random() * 0.3);
      src.stop(t + release + 0.05);
    }

    function schedule(step, t) {
      var bar = Math.floor(step / 8);
      var s = step % 8;
      var ch = CHORDS[bar];
      if (s % 2 === 1) { t += STEP * 0.14; } // swing

      if (s === 0) {
        pad(t, ch.pad, STEP * 8);
        bass(t, ch.root, STEP * 2.6);
      }
      if (s === 3) { bass(t, ch.root, STEP * 0.9); }
      if (s === 6) { bass(t, ch.root + 7, STEP * 1.6); }

      if (s === 0 || s === 4 || (s === 5 && bar % 2 === 1)) { kick(t); }
      if (s === 2 || s === 6) { noise(t, "bandpass", 1700, 0.7, 0.07, 0.17); }
      if (Math.random() > 0.08) { noise(t, "highpass", 7200, 0.5, s % 2 === 0 ? 0.03 : 0.016, 0.045); }

      if (ARP_STEPS[s] !== undefined && Math.random() < 0.82) {
        var idx = ARP_STEPS[s];
        if (Math.random() < 0.25) { idx = Math.floor(Math.random() * ch.arp.length); }
        pluck(t, ch.arp[idx], 0.75 + Math.random() * 0.35);
      }
    }

    return { out: out, analyser: analyser, schedule: schedule };
  }

  window.PortafolioMusica = { createEngine: createEngine, STEP: STEP, STEPS: STEPS };

  /* ---------- Reproductor en la página ---------- */
  var btn = document.getElementById("music-btn");
  if (!btn) { return; }
  var label = btn.querySelector(".music__label");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = null;
  var engine = null;
  var playing = false;
  var timer = null;
  var nextTime = 0;
  var step = 0;
  var raf = null;
  var stopTimeout = null;
  var freq = null;

  function tick() {
    while (nextTime < ctx.currentTime + 0.15) {
      engine.schedule(step, nextTime);
      nextTime += STEP;
      step = (step + 1) % STEPS;
    }
  }

  function bars() {
    return document.querySelectorAll("#cenefa i");
  }

  function drawBars() {
    raf = null;
    if (!playing) { return; }
    var list = bars();
    if (freq === null) { freq = new Uint8Array(engine.analyser.frequencyBinCount); }
    engine.analyser.getByteFrequencyData(freq);
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

  function setUi(on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    label.textContent = on ? "Pausar música" : "Poner música";
    btn.setAttribute("aria-label", on ? "Pausar música" : "Poner música");
    document.documentElement.classList.toggle("music-on", on);
  }

  function play() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { label.textContent = "Tu navegador no reproduce música"; return; }
    if (ctx === null) {
      ctx = new AC();
      engine = createEngine(ctx);
    }
    clearTimeout(stopTimeout);
    ctx.resume();
    playing = true;
    nextTime = ctx.currentTime + 0.08;
    var g = engine.out.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.85, ctx.currentTime + 1.8);
    tick();
    timer = setInterval(tick, 25);
    setUi(true);
    if (!reduceMotion && raf === null) { raf = requestAnimationFrame(drawBars); }
  }

  function pause() {
    if (!playing) { return; }
    playing = false;
    clearInterval(timer);
    var g = engine.out.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    stopTimeout = setTimeout(function () { if (!playing) { ctx.suspend(); } }, 800);
    setUi(false);
    resetBars();
  }

  btn.addEventListener("click", function () {
    if (playing) { pause(); } else { play(); }
  });
  document.addEventListener("portafolio:pausar-musica", pause);
  document.addEventListener("visibilitychange", function () {
    if (ctx === null) { return; }
    if (document.hidden) { ctx.suspend(); }
    else if (playing) { ctx.resume(); nextTime = Math.max(nextTime, ctx.currentTime + 0.05); }
  });
})();
