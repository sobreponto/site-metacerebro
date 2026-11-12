/* MetaCérebro — interações do site */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Menu mobile ---------------- */
  var nav = document.getElementById("nav");
  var toggle = nav.querySelector(".nav__toggle");
  var toggleIcon = toggle.querySelector("use");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggleIcon.setAttribute("href", open ? "#i-x" : "#i-menu");
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------------- Link ativo (scrollspy) ---------------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll(".nav__link"));
  var map = {};
  links.forEach(function (a) {
    var h = a.getAttribute("href");
    var key = a.getAttribute("data-spy") || (h.charAt(0) === "#" ? h.slice(1) : null);
    if (key) map[key] = a;
  });
  var spyIds = ["inicio", "sobre", "programas", "resultados", "nr1", "contato"];
  var sections = spyIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function updateActive() {
    if (!sections.length) return; // página sem seções rastreadas (ex.: Sobre): mantém o link ativo do HTML
    var y = window.scrollY + (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 92) + 40;
    var current = "inicio";
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "contato";
    links.forEach(function (a) { a.classList.remove("is-active"); });
    if (map[current]) map[current].classList.add("is-active");
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateActive(); ticking = false; });
  }, { passive: true });
  updateActive();

  /* ---------------- Animação de entrada ---------------- */
  var fades = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Slider de programas (infinito) ---------------- */
  var track = document.getElementById("slider-track");
  if (track) {
    var viewport = track.parentElement;
    var real = Array.prototype.slice.call(track.children);
    var n = real.length;

    // clones nas pontas para o efeito infinito: [último*, 1, 2, 3, primeiro*]
    function clone(el) {
      var c = el.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.setAttribute("inert", "");
      c.querySelectorAll("a,button").forEach(function (x) { x.setAttribute("tabindex", "-1"); });
      return c;
    }
    track.insertBefore(clone(real[n - 1]), real[0]);
    track.appendChild(clone(real[0]));

    var slides = Array.prototype.slice.call(track.children);
    var pos = Math.min(2, n);     // começa com o card do meio ativo, como no design (posição 2 = "Desenvolvimento Corporativo")
    var busy = false;

    function setActive(p) {
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === p); });
    }
    function offsetFor(p) {
      var s = slides[p];
      return viewport.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
    }
    // mede a posição final com o estado de destino aplicado, sem animar
    function measure(p) {
      track.classList.add("no-anim");
      setActive(p);
      var x = offsetFor(p);
      return x;
    }
    function place(p) {
      track.classList.add("no-anim");
      setActive(p);
      track.style.transform = "translateX(" + offsetFor(p) + "px)";
      void track.offsetWidth;
      track.classList.remove("no-anim");
    }
    function goTo(target) {
      if (busy) return;
      busy = true;
      var from = pos;
      if (reduceMotion) { pos = target; place(pos); finish(); return; }
      var x = measure(target);           // estado final (sem transição)
      setActive(from);                   // volta ao estado atual…
      void track.offsetWidth;
      track.classList.remove("no-anim"); // …e anima até o estado final
      setActive(target);
      track.style.transform = "translateX(" + x + "px)";
      pos = target;
      var done = false;
      function end() { if (done) return; done = true; finish(); }
      track.addEventListener("transitionend", function h(e) {
        if (e.target !== track || e.propertyName !== "transform") return;
        track.removeEventListener("transitionend", h);
        end();
      });
      setTimeout(end, 900);
    }
    function finish() {
      // ao chegar em um clone, salta (sem animar) para o card real equivalente
      if (pos === 0) { pos = n; place(pos); }
      else if (pos === n + 1) { pos = 1; place(pos); }
      busy = false;
    }

    document.querySelector(".slider__arrow--next").addEventListener("click", function () { goTo(pos + 1); });
    document.querySelector(".slider__arrow--prev").addEventListener("click", function () { goTo(pos - 1); });

    // clique num card vizinho o traz para o centro
    track.addEventListener("click", function (e) {
      var s = e.target.closest(".slide");
      if (!s || s.classList.contains("is-active")) return;
      var i = slides.indexOf(s);
      if (i > -1) { e.preventDefault(); goTo(i); }
    });

    // teclado
    viewport.parentElement.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") goTo(pos + 1);
      if (e.key === "ArrowLeft") goTo(pos - 1);
    });

    // gesto de arrastar (touch)
    var startX = null;
    viewport.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) goTo(pos + (dx < 0 ? 1 : -1));
    }, { passive: true });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { place(pos); }, 120);
    });
    window.addEventListener("load", function () { place(pos); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(pos); });
    place(pos);
  }


  /* ---------------- Programa de interesse (vem do hash: contato.html#programa-mcdh) ---------------- */
  var INTERESSES = {
    "programa-mcdh": "Programa MCDH",
    "programa-essencial": "Programa Essencial de Desenvolvimento Humano",
    "palestras": "Palestras Inspiracionais",
    "palestra-cognitivo": "Palestra Desenvolvimento Humano Cognitivo",
    "palestra-socioemocional": "Palestra Desenvolvimento Humano Socioemocional",
    "palestra-integral": "Palestra Desenvolvimento Humano Integral"
  };
  function aplicarInteresse() {
    var nome = INTERESSES[(location.hash || "").replace("#", "")];
    var assunto = document.getElementById("f-assunto");
    var msg = document.getElementById("f-msg");
    if (!nome || !assunto || !msg) return;
    assunto.value = "Interesse: " + nome;
    if (!msg.value || msg.dataset.auto === "1") {
      msg.value = "Olá! Tenho interesse no(a) " + nome + " e gostaria de receber mais informações.";
      msg.dataset.auto = "1";
      msg.addEventListener("input", function () { msg.dataset.auto = "0"; }, { once: true });
    }
  }
  aplicarInteresse();
  window.addEventListener("hashchange", aplicarInteresse);

  /* ---------------- Formulário de contato ---------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form__status");
    var TO = "contato@metacerebro.com.br";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.classList.remove("is-error");
      if (!form.checkValidity()) {
        status.classList.add("is-error");
        status.textContent = "Preencha nome, e-mail e mensagem para continuar.";
        form.reportValidity();
        return;
      }
      var d = new FormData(form);
      var subject = d.get("assunto") || "Contato pelo site";
      var body = [
        "Nome: " + d.get("nome"),
        "E-mail: " + d.get("email"),
        "Empresa: " + (d.get("empresa") || "-"),
        "",
        d.get("mensagem")
      ].join("\n");
      // Sem back-end: abre o cliente de e-mail do visitante já preenchido.
      // Para enviar direto pelo site, troque por um fetch() para o seu endpoint/serviço de formulários.
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Abrindo seu aplicativo de e-mail para concluir o envio…";
    });
  }
})();
