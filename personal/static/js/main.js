(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  if (!button) return;

  function isDark() {
    return root.getAttribute("data-theme") === "dark";
  }

  function syncButton() {
    button.setAttribute("aria-pressed", String(isDark()));
  }

  button.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    syncButton();
  });

  syncButton();
})();
