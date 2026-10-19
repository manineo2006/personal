(function () {
  var theme = null;
  try {
    theme = localStorage.getItem("theme");
  } catch (e) {}

  if (theme !== "dark2" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
