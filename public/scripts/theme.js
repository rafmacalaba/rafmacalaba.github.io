(function () {
  "use strict";

  var ICONS = {
    system:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    light:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    dark:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  };

  var LABELS = {
    system: "System theme. Click for light.",
    light: "Light theme. Click for dark.",
    dark: "Dark theme. Click for system.",
  };

  var toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  function getStored() {
    try {
      var v = localStorage.getItem("theme");
      if (v === "light" || v === "dark" || v === "system") return v;
    } catch (e) {
      /* localStorage unavailable */
    }
    return "system";
  }

  function resolveEffective(stored) {
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia("(prefers-color-scheme:dark)").matches) return "dark";
    return "light";
  }

  function apply() {
    var stored = getStored();
    var effective = resolveEffective(stored);
    document.documentElement.setAttribute("data-theme", effective);
    document.documentElement.setAttribute("data-theme-pref", stored);
    var iconHolder = toggle.querySelector("[data-theme-icon]");
    if (iconHolder) iconHolder.innerHTML = ICONS[stored];
    toggle.setAttribute("aria-label", LABELS[stored]);
    toggle.setAttribute("title", LABELS[stored]);
  }

  function cycle() {
    var current = getStored();
    var next = current === "system" ? "light" : current === "light" ? "dark" : "system";
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* localStorage unavailable */
    }
    apply();
  }

  toggle.addEventListener("click", cycle);

  // React to OS theme changes when preference is "system"
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme:dark)");
    var listener = function () {
      if (getStored() === "system") apply();
    };
    if (mq.addEventListener) mq.addEventListener("change", listener);
    else if (mq.addListener) mq.addListener(listener);
  }

  apply();
})();
