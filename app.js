(function () {
  "use strict";

  var D = window.PORTAFOLIO;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var COLORS = {
    iei:   { bg: "var(--azul)",     ink: "var(--blanco)" },
    ibq:   { bg: "var(--morado)",   ink: "var(--blanco)" },
    bio:   { bg: "var(--verde)",    ink: "var(--negro)" },
    powex: { bg: "var(--amarillo)", ink: "var(--negro)" }
  };
  var ORDER = ["iei", "ibq", "bio", "powex"];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "style") { n.style.cssText = attrs[k]; }
        else { n.setAttribute(k, attrs[k]); }
      }
    }
    if (html !== undefined) { n.innerHTML = html; }
    return n;
  }
  function accVars(acc) {
    return "--acc:" + COLORS[acc].bg + ";--acc-ink:" + COLORS[acc].ink + ";";
  }
  function plural(n, uno, varios) { return n + " " + (n === 1 ? uno : varios); }

  /* ---------- Cenefa: barras que engrosan de forma progresiva ---------- */
  function buildBars(container, count, minW, maxW, reverse) {
    container.innerHTML = "";
    var bars = [];
    for (var i = 0; i < count; i++) {
      var t = count === 1 ? 1 : i / (count - 1);
      if (reverse) { t = 1 - t; }
      var w = minW + (maxW - minW) * t;
      var b = el("i", { style: "width:" + w.toFixed(1) + "px" });
      container.appendChild(b);
      bars.push(b);
    }
    return bars;
  }

  var heroBars = [];
  var heroBound = false;
  function heroCenefa() {
    var c = $("#cenefa");
    if (!c) { return; }
    var count = window.innerWidth < 600 ? 18 : (window.innerWidth < 1000 ? 28 : 38);
    var maxW = window.innerWidth < 600 ? 10 : 16;
    var bars = buildBars(c, count, 3, maxW, false);
    heroBars = bars;

    if (reduceMotion) { return; }

    // Un solo momento orquestado: la cenefa se construye al cargar.
    c.classList.add("is-building");
    bars.forEach(function (b, i) { b.style.setProperty("--d", (i * 0.028) + "s"); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        c.classList.add("is-built");
        c.classList.remove("is-building");
        setTimeout(function () { c.classList.remove("is-built"); c.classList.add("is-live"); }, 700 + count * 28);
      });
    });

    if (heroBound) { return; }
    heroBound = true;

    // Responde al puntero como un ecualizador.
    var hero = $(".hero");
    var raf = null;
    var px = null;
    function paint() {
      raf = null;
      if (document.documentElement.classList.contains("music-on")) { return; }
      var bars = heroBars;
      var rects = bars.map(function (b) { var r = b.getBoundingClientRect(); return r.left + r.width / 2; });
      for (var i = 0; i < bars.length; i++) {
        var s = 1;
        if (px !== null) {
          var d = Math.abs(rects[i] - px);
          var k = Math.max(0, 1 - d / 220);
          s = 1 + k * k * 0.9;
        }
        bars[i].style.setProperty("--s", s.toFixed(3));
      }
    }
    hero.addEventListener("pointermove", function (e) {
      if (!$("#cenefa").classList.contains("is-live")) { return; }
      px = e.clientX;
      if (!raf) { raf = requestAnimationFrame(paint); }
    });
    hero.addEventListener("pointerleave", function () {
      px = null;
      if (!raf) { raf = requestAnimationFrame(paint); }
    });
  }

  function footCenefa() {
    var c = $("#cenefa-foot");
    if (!c) { return; }
    var count = window.innerWidth < 600 ? 16 : 32;
    var r1 = el("div", { "class": "cenefa__row" });
    var r2 = el("div", { "class": "cenefa__row" });
    c.innerHTML = "";
    c.appendChild(r1);
    c.appendChild(r2);
    buildBars(r1, count, 3, 14, false);
    buildBars(r2, count, 3, 14, true);
  }

  function stepCenefa() {
    var c = $("#steps-full");
    if (c) { buildBars(c, 14, 4, 10, false); }
  }

  /* ---------- Cuentas ---------- */
  function renderAccounts() {
    var list = $("#accounts");
    ORDER.forEach(function (acc) {
      var a = D.cuentas[acc];
      var nP = D.piezas.filter(function (p) { return p.cuenta === acc; }).length;
      var nR = D.reels.filter(function (r) { return r.cuenta === acc; }).length;
      var since = acc === "powex" ? "Cofundadora, 2026" : "Desde " + a.desde;
      var li = el("li", { "class": "account account--" + acc });
      var btn = el("button", { "class": "account__btn", type: "button", "data-filter": acc, "aria-label": "Ver las piezas de " + a.nombre },
        '<span class="account__short">' + a.corto + "</span>" +
        '<span class="account__name">' + a.nombre + "</span>" +
        '<span class="account__since">' + since + "</span>" +
        '<span class="account__count">' + plural(nP, "pieza", "piezas") + " y " + plural(nR, "reel", "reels") + "</span>");
      li.appendChild(btn);
      if (a.url) {
        li.appendChild(el("p", { "class": "account__cta" }, '<a href="' + a.url + '" target="_blank" rel="noopener">' + a.handle + "</a>"));
      }
      list.appendChild(li);
      btn.addEventListener("click", function () {
        setFilter(acc);
        $("#piezas").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Galería y filtros ---------- */
  var current = "todas";
  var visible = D.piezas.slice();

  function renderFilters() {
    var box = $("#filters");
    var opts = [{ id: "todas", label: "Todas" }].concat(ORDER.map(function (acc) {
      return { id: acc, label: acc === "bio" ? "Biología" : D.cuentas[acc].corto };
    }));
    opts.forEach(function (o) {
      var b = el("button", { "class": "chip", type: "button", "data-acc": o.id, "aria-pressed": o.id === current ? "true" : "false" }, o.label);
      b.addEventListener("click", function () { setFilter(o.id); });
      box.appendChild(b);
    });
  }

  function renderGallery() {
    var ul = $("#gallery");
    D.piezas.forEach(function (p) {
      var a = D.cuentas[p.cuenta];
      var li = el("li", { "class": "gallery__item", "data-acc": p.cuenta, style: accVars(p.cuenta) + "view-transition-name:pz" + p.id });
      var btn = el("button", { "class": "piece", type: "button", "data-open": p.id },
        '<div class="piece__img"><img src="img/' + p.id + '.webp" alt="Pieza para ' + a.nombre + ": " + p.titulo + '" width="1080" height="' + p.h + '" loading="lazy" decoding="async"></div>' +
        '<div class="piece__cap"><span class="piece__acc">' + a.corto + '</span><span class="piece__title">' + p.titulo + '<span class="piece__type">' + p.tipo + "</span></span></div>");
      li.appendChild(btn);
      ul.appendChild(li);
    });
    updateCount();
  }

  function updateCount() {
    var txt;
    if (current === "todas") {
      txt = "Mostrando las " + D.piezas.length + " piezas.";
    } else {
      txt = "Mostrando " + plural(visible.length, "pieza", "piezas") + " de " + D.cuentas[current].nombre + ".";
    }
    $("#gallery-count").textContent = txt;
  }

  function applyFilter() {
    visible = D.piezas.filter(function (p) { return current === "todas" || p.cuenta === current; });
    var items = document.querySelectorAll(".gallery__item");
    for (var i = 0; i < items.length; i++) {
      var show = current === "todas" || items[i].getAttribute("data-acc") === current;
      items[i].hidden = !show;
    }
    var chips = document.querySelectorAll(".chip");
    for (var j = 0; j < chips.length; j++) {
      chips[j].setAttribute("aria-pressed", chips[j].getAttribute("data-acc") === current ? "true" : "false");
    }
    updateCount();
  }

  function setFilter(id) {
    if (id === current) { return; }
    current = id;
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(applyFilter);
    } else {
      applyFilter();
    }
  }

  /* ---------- Reels ---------- */
  function renderReels() {
    var box = $("#reels");
    var perAcc = {};
    D.reels.forEach(function (r) {
      perAcc[r.cuenta] = (perAcc[r.cuenta] || 0) + 1;
      var n = perAcc[r.cuenta];
      var total = D.reels.filter(function (x) { return x.cuenta === r.cuenta; }).length;
      var a = D.cuentas[r.cuenta];
      var url = "https://www.instagram.com/reel/" + r.id + "/";
      var label = "Reel " + (total > 1 ? n + " de " : "de ") + a.corto;

      var fig = el("figure", { "class": "reel", style: accVars(r.cuenta) + "margin:0" });
      var frame = el("div", { "class": "reel__frame" });
      var cover = el("button", { "class": "reel__cover", type: "button", "aria-label": "Reproducir " + label },
        '<span class="tag tag--black">' + a.nombre + "</span>" +
        '<span class="reel__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></span>' +
        '<span><span class="reel__title">' + label + '</span><span class="reel__hint">Toca para reproducir</span></span>' +
        '<span class="reel__bars" aria-hidden="true"></span>');
      buildBars(cover.querySelector(".reel__bars"), 14, 2, 8, false);
      frame.appendChild(cover);
      fig.appendChild(frame);
      fig.appendChild(el("a", { "class": "reel__link", href: url, target: "_blank", rel: "noopener" }, "Abrir en Instagram"));
      box.appendChild(fig);

      cover.addEventListener("click", function () {
        document.dispatchEvent(new CustomEvent("portafolio:pausar-musica"));
        var ifr = el("iframe", {
          src: "https://www.instagram.com/reel/" + r.id + "/embed/",
          title: label + " en Instagram",
          allow: "autoplay; encrypted-media; picture-in-picture",
          allowfullscreen: "",
          scrolling: "no",
          loading: "lazy"
        });
        frame.innerHTML = "";
        frame.appendChild(ifr);
        ifr.focus();
      });
    });
  }

  /* ---------- App: Amigo Secreto ---------- */
  var appGroup = "participante";
  var appIndex = 0;

  function showAppScreen(i) {
    var list = D.app[appGroup];
    appIndex = i;
    var sc = list[i];
    var img = $("#app-img");
    img.src = "img/app/" + sc.id + ".webp";
    img.height = sc.h;
    img.alt = "Pantalla de Amigo Secreto (" + appGroup + "): " + sc.titulo;
    $("#app-screen").scrollTop = 0;
    $("#app-cap-title").textContent = sc.titulo;
    $("#app-cap-text").textContent = sc.texto;
    var btns = document.querySelectorAll(".screen-btn");
    for (var k = 0; k < btns.length; k++) {
      btns[k].setAttribute("aria-pressed", k === i ? "true" : "false");
    }
  }

  function renderAppScreens() {
    var ul = $("#app-screens");
    ul.innerHTML = "";
    D.app[appGroup].forEach(function (sc, i) {
      var li = el("li");
      var b = el("button", { "class": "screen-btn", type: "button", "aria-pressed": "false" },
        '<span class="screen-btn__n">' + (i + 1) + "</span><span>" + sc.titulo + "</span>");
      b.addEventListener("click", function () { showAppScreen(i); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    showAppScreen(0);
  }

  function setAppGroup(group) {
    appGroup = group;
    var tabs = document.querySelectorAll(".seg__btn");
    for (var k = 0; k < tabs.length; k++) {
      var on = tabs[k].getAttribute("data-group") === group;
      tabs[k].setAttribute("aria-selected", on ? "true" : "false");
      tabs[k].setAttribute("tabindex", on ? "0" : "-1");
      if (on) { $("#app-panel").setAttribute("aria-labelledby", tabs[k].id); }
    }
    renderAppScreens();
  }

  function bindApp() {
    if (!D.app || !$("#app-panel")) { return; }
    var tabs = document.querySelectorAll(".seg__btn");
    for (var k = 0; k < tabs.length; k++) {
      tabs[k].addEventListener("click", function (e) { setAppGroup(e.currentTarget.getAttribute("data-group")); });
      tabs[k].addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          var next = appGroup === "participante" ? "administradora" : "participante";
          setAppGroup(next);
          $("#tab-" + next).focus();
        }
      });
    }
    renderAppScreens();
  }

  /* ---------- Paleta ---------- */
  var PALETTE = [
    { grupo: "Paleta principal" },
    { n: "Azul Icesi", hex: "#5454E9", main: true },
    { n: "Blanco", hex: "#FFFFFF", main: true },
    { grupo: "Paleta complementaria" },
    { n: "Amarillo Icesi", hex: "#E4EB60" },
    { n: "Naranja Icesi", hex: "#E9683B" },
    { n: "Morado Icesi", hex: "#865CF0" },
    { n: "Verde Icesi", hex: "#4CB979" },
    { n: "Negro", hex: "#000000" },
    { n: "Gris 1", hex: "#88898C" },
    { n: "Gris 2", hex: "#CECFD4" }
  ];

  function renderSwatches() {
    var box = $("#swatches");
    PALETTE.forEach(function (s) {
      if (s.grupo) { box.appendChild(el("p", { "class": "swatch__group" }, s.grupo)); return; }
      var b = el("button", { "class": "swatch" + (s.main ? " swatch--main" : ""), type: "button", style: "--c:" + s.hex, "aria-label": "Copiar " + s.n + ", " + s.hex },
        '<span class="swatch__chip"></span><span class="swatch__name">' + s.n + '</span><span class="swatch__hex">' + s.hex + "</span>");
      b.addEventListener("click", function () { copy(s.hex, s.n); });
      box.appendChild(b);
    });
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 1800);
  }
  function copy(hex, name) {
    function ok() { toast(name + " copiado: " + hex); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(ok, function () { toast(name + ": " + hex); });
    } else {
      toast(name + ": " + hex);
    }
  }

  /* ---------- Visor ---------- */
  var viewer = $("#viewer");
  var vIndex = 0;
  var lastFocus = null;

  function viewerList() {
    return visible.length ? visible : D.piezas;
  }

  function showPiece(i) {
    var list = viewerList();
    vIndex = (i + list.length) % list.length;
    var p = list[vIndex];
    var a = D.cuentas[p.cuenta];
    var img = $("#viewer-img");
    img.src = "img/" + p.id + ".webp";
    img.alt = "Pieza para " + a.nombre + ": " + p.titulo;
    img.width = 1080;
    img.height = p.h;
    var tag = $("#viewer-account");
    tag.textContent = a.nombre;
    viewer.style.cssText = accVars(p.cuenta);
    $("#viewer-title").textContent = p.titulo;
    $("#viewer-meta").textContent = p.tipo + (a.handle ? " publicado en " + a.handle : "");
    $("#viewer-link").href = p.url;
    $("#viewer-pos").textContent = (vIndex + 1) + " de " + list.length;
  }

  function openViewer(id) {
    var list = viewerList();
    var idx = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { idx = i; } }
    if (idx === -1) {
      // La pieza del hero puede no estar en el filtro actual: se abre con todas.
      current = "todas";
      applyFilter();
      list = viewerList();
      for (var j = 0; j < list.length; j++) { if (list[j].id === id) { idx = j; } }
    }
    lastFocus = document.activeElement;
    showPiece(idx);
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    $(".viewer__close").focus();
  }

  function closeViewer() {
    viewer.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) { lastFocus.focus(); }
  }

  function bindViewer() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (opener) { openViewer(opener.getAttribute("data-open")); return; }
      if (e.target.closest("[data-close]")) { closeViewer(); }
    });
    $("#viewer-prev").addEventListener("click", function () { showPiece(vIndex - 1); });
    $("#viewer-next").addEventListener("click", function () { showPiece(vIndex + 1); });
    document.addEventListener("keydown", function (e) {
      if (viewer.hidden) { return; }
      if (e.key === "Escape") { closeViewer(); }
      else if (e.key === "ArrowRight") { showPiece(vIndex + 1); }
      else if (e.key === "ArrowLeft") { showPiece(vIndex - 1); }
      else if (e.key === "Tab") {
        var f = viewer.querySelectorAll("a, button");
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null;
    var fig = $(".viewer__figure");
    fig.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    fig.addEventListener("touchend", function (e) {
      if (sx === null) { return; }
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) { showPiece(vIndex + (dx < 0 ? 1 : -1)); }
      sx = null;
    });
  }

  /* ---------- Barra superior ---------- */
  function bindTopbar() {
    var bar = $(".topbar");
    var hero = $(".hero");
    if (!("IntersectionObserver" in window)) { bar.classList.add("is-solid"); return; }
    var io = new IntersectionObserver(function (entries) {
      bar.classList.toggle("is-solid", !entries[0].isIntersecting);
    }, { rootMargin: "-64px 0px 0px 0px", threshold: 0 });
    io.observe(hero);
  }

  /* ---------- Inicio ---------- */
  renderAccounts();
  renderFilters();
  renderGallery();
  renderReels();
  bindApp();
  renderSwatches();
  heroCenefa();
  footCenefa();
  stepCenefa();
  bindViewer();
  bindTopbar();

  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 80) { return; }
    lastW = window.innerWidth;
    var c = $("#cenefa");
    c.className = "cenefa";
    heroCenefa();
    footCenefa();
  });
})();
