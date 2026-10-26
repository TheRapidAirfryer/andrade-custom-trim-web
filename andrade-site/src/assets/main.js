// Andrade Custom Trim — small progressive enhancements. The site works without JS.
(function () {
  "use strict";

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Project filters (also honours ?cat=closets in the URL)
  var filters = document.querySelectorAll(".filter");
  var tiles = document.querySelectorAll(".tile");
  function applyFilter(cat) {
    filters.forEach(function (f) { f.setAttribute("aria-pressed", String(f.dataset.cat === cat)); });
    tiles.forEach(function (t) { t.hidden = cat !== "all" && t.dataset.cat !== cat; });
  }
  if (filters.length) {
    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        applyFilter(f.dataset.cat);
        var url = new URL(location.href);
        if (f.dataset.cat === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", f.dataset.cat);
        history.replaceState(null, "", url);
      });
    });
    var initial = new URLSearchParams(location.search).get("cat");
    if (initial && document.querySelector('.filter[data-cat="' + initial + '"]')) applyFilter(initial);
  }

  // Lightbox
  var box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    var boxImg = box.querySelector("img");
    var boxCap = box.querySelector("p");
    document.querySelectorAll(".tile button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        boxImg.src = btn.dataset.full;
        boxImg.alt = btn.dataset.alt;
        boxCap.textContent = btn.dataset.alt;
        box.showModal();
      });
    });
    box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }

  // Quote form
  var form = document.getElementById("quote-form");
  if (!form) return;
  var status = form.querySelector(".form-status");
  var F = form.elements;
  var msgs = JSON.parse(form.dataset.msgs);

  var preset = new URLSearchParams(location.search).get("service");
  if (preset && F.service.querySelector('option[value="' + preset + '"]')) F.service.value = preset;

  function setError(el, text) {
    var err = document.getElementById(el.id + "-error");
    el.setAttribute("aria-invalid", text ? "true" : "false");
    if (err) err.textContent = text || "";
  }

  function validate() {
    var first = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.willValidate || el.type === "submit") return;
      var text = "";
      if (el.validity.valueMissing) text = msgs.required;
      else if (el.validity.typeMismatch && el.type === "email") text = msgs.email;
      else if (el.type === "file" && el.files) {
        var total = 0;
        for (var i = 0; i < el.files.length; i++) total += el.files[i].size;
        if (el.files.length > 5 || total > 10 * 1024 * 1024) text = msgs.files;
      }
      setError(el, text);
      if (text && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true") setError(e.target, ""); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status";
    if (!validate()) return;
    if (F.website && F.website.value) return; // honeypot

    var endpoint = form.dataset.endpoint;
    var btn = form.querySelector('[type="submit"]');

    if (!endpoint) {
      // No form service configured yet: fall back to the visitor's email app.
      var body = [
        msgs.l_name + ": " + F.fullname.value,
        msgs.l_email + ": " + F.email.value,
        msgs.l_phone + ": " + (F.phone.value || "—"),
        msgs.l_city + ": " + F.city.value,
        msgs.l_type + ": " + F.service.options[F.service.selectedIndex].text,
        "",
        F.message.value
      ].join("\n");
      location.href = "mailto:" + form.dataset.mailto + "?subject=" + encodeURIComponent(msgs.subject + " — " + F.fullname.value) + "&body=" + encodeURIComponent(body);
      status.textContent = msgs.mailto;
      status.className = "form-status is-ok";
      return;
    }

    btn.disabled = true;
    btn.textContent = msgs.sending;
    fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        form.reset();
        status.textContent = msgs.ok;
        status.className = "form-status is-ok";
      })
      .catch(function () {
        status.textContent = msgs.err;
        status.className = "form-status is-err";
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = msgs.send;
        status.setAttribute("tabindex", "-1");
        status.focus();
      });
  });
})();
