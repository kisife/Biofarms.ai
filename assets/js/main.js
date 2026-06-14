/* =====================================================================
   Biofarms.ai — shared site behaviour
   Mobile nav · insights carousel · FAQ accordion · form validation
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Insights carousel arrows ---------- */
  var track = document.querySelector(".carousel__track");
  if (track) {
    var prev = document.querySelector('.carousel__btn[data-dir="prev"]');
    var next = document.querySelector('.carousel__btn[data-dir="next"]');
    var step = function () {
      var card = track.querySelector(".post-card");
      return card ? card.getBoundingClientRect().width + 22 : 360;
    };
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.style.maxHeight = expanded ? null : panel.scrollHeight + "px";
    });
  });

  /* ---------- Contact form: validation + mailto fallback ---------- */
  var form = document.querySelector("#enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var subject = "Project enquiry — " + (data.get("service") || "General");
      var body =
        "Name: " + (data.get("name") || "") + "\n" +
        "Organisation: " + (data.get("org") || "") + "\n" +
        "Email: " + (data.get("email") || "") + "\n" +
        "Service area: " + (data.get("service") || "") + "\n\n" +
        (data.get("message") || "");
      window.location.href =
        "mailto:info@biofarms.ai?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();
