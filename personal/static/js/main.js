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

  var form = document.getElementById("contact-form");
  if (!form) return;

  var MESSAGES = {
    name: "لطفاً نام خود را وارد کنید.",
    email: "لطفاً یک ایمیل معتبر وارد کنید.",
    subject: "لطفاً موضوع پیام را وارد کنید.",
    message: "پیام باید حداقل ۱۰ کاراکتر باشد."
  };

  function fieldOf(input) {
    return input.closest(".field");
  }

  function clearError(input) {
    var field = fieldOf(input);
    if (!field) return;
    field.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    var old = field.querySelector(".field-error");
    if (old) old.remove();
  }

  function showError(input, text) {
    clearError(input);
    var field = fieldOf(input);
    if (!field) return;
    var err = document.createElement("p");
    err.className = "field-error";
    err.id = input.id + "-error";
    err.textContent = text;
    field.appendChild(err);
    field.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", err.id);
  }

  function validate(input) {
    var value = input.value.trim();
    if (!value || (input.minLength > 0 && value.length < input.minLength)) {
      showError(input, MESSAGES[input.name] || "این فیلد را درست پر کنید.");
      return false;
    }
    if (input.type === "email" && !input.checkValidity()) {
      showError(input, MESSAGES.email);
      return false;
    }
    clearError(input);
    return true;
  }

  var inputs = Array.prototype.slice.call(
    form.querySelectorAll("input[required], textarea[required]")
  );

  inputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value !== "") validate(input);
    });
    input.addEventListener("input", function () {
      if (fieldOf(input).classList.contains("has-error")) validate(input);
    });
  });

  form.addEventListener("submit", function (event) {
    var firstInvalid = null;
    inputs.forEach(function (input) {
      if (!validate(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
      return;
    }

    // جلوگیری از ارسال دوباره با کلیک‌های پشت‌سرهم
    var submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;
  });
})();







/* ---------- پنجره‌ی کد صفحه‌ی اصلی ---------- */
(function () {
  var box = document.getElementById("code-demo");
  if (!box) return;

  var codeEl = box.querySelector(".code-body");
  var cmdBox = box.querySelector(".code-cmd");
  var cmdEl = box.querySelector(".code-cmd-text");
  var tabs = Array.prototype.slice.call(box.querySelectorAll(".code-tab"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SNIPPETS = [
    {
      code: [
        "from django.shortcuts import render",
        "",
        "def index(request):",
        "    # render the home page",
        '    return render(request, "personal/index.html")'
      ].join("\n"),
      cmd: "python manage.py runserver"
    },
    {
      code: [
        "class Contacts(models.Model):",
        "    id = models.UUIDField(primary_key=True)",
        "    name = models.CharField(max_length=100)",
        "    sent_at = models.DateTimeField(auto_now_add=True)"
      ].join("\n"),
      cmd: "python manage.py migrate"
    },
    {
      code: [
        "FROM python:3.12-slim",
        "WORKDIR /app",
        "COPY requirements.txt .",
        "RUN pip install -r requirements.txt",
        'CMD ["python", "manage.py", "runserver"]'
      ].join("\n"),
      cmd: "docker compose up -d"
    },
    {
      code: [
        "services:",
        "  web:",
        "    build: .",
        "    ports:",
        '      - "8000:8000"',
        "  main_db:",
        "    image: postgres:16"
      ].join("\n"),
      cmd: "docker compose ps"
    }
  ];

  var TOKEN = /(#.*)|("[^"\n]*"?|'[^'\n]*'?)|\b(from|import|def|class|return|async|await|FROM|RUN|COPY|CMD|WORKDIR|True|False|None)\b/g;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

function highlight(line) {
    return esc(line).replace(TOKEN, function (m, c, s, k) {
      if (c) return '<span class="tok-c">' + c + "</span>";
      if (s) return '<span class="tok-s">' + s + "</span>";
      return '<span class="tok-k">' + k + "</span>";
    });
  }

  function render(text) {
    codeEl.innerHTML = text.split("\n").map(function (l) {
      return '<span class="line">' + highlight(l) + "</span>";
    }).join("");
  }

  function select(i) {
    tabs.forEach(function (t, n) {
      t.setAttribute("aria-selected", String(n === i));
    });
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function show(i) {
    select(i);
    render(SNIPPETS[i].code);
    cmdEl.textContent = SNIPPETS[i].cmd;
  }

  var runId = 0;

  async function play(i) {
    var my = ++runId;
    var s = SNIPPETS[i];
    var n;

    select(i);
    cmdEl.textContent = "";
    cmdBox.classList.remove("is-typing");
    codeEl.classList.add("is-typing");

    for (n = 1; n <= s.code.length; n++) {
      render(s.code.slice(0, n));
      await sleep(s.code.charAt(n - 1) === "\n" ? 260 : 32);
      if (my !== runId) return;
    }

    codeEl.classList.remove("is-typing");
    cmdBox.classList.add("is-typing");
    for (n = 1; n <= s.cmd.length; n++) {
      cmdEl.textContent = s.cmd.slice(0, n);
      await sleep(45);
      if (my !== runId) return;
    }

    await sleep(3200);
    if (my !== runId) return;

    // پاک کردن
    cmdBox.classList.remove("is-typing");
    codeEl.classList.add("is-typing");
    cmdEl.textContent = "";
    for (n = s.code.length; n > 0; n -= 3) {
      render(s.code.slice(0, n));
      await sleep(14);
      if (my !== runId) return;
    }
    render("");
    await sleep(300);
    if (my !== runId) return;

    play((i + 1) % SNIPPETS.length);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      if (reduce) {
        runId++;
        show(i);
      } else {
        play(i);
      }
    });
  });

  if (reduce) show(0);
  else play(0);
})();



/* ---------- روشن شدن دکمه‌ی منو با اسکرول ---------- */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".navbar a[data-section]")
  );
  if (!links.length || !("IntersectionObserver" in window)) return;

  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute("data-section")); })
    .filter(Boolean);
  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (a) {
      if (a.getAttribute("data-section") === id) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setActive(e.target.id);
    });
  }, { rootMargin: "-35% 0px -64% 0px" });

  sections.forEach(function (s) { observer.observe(s); });
})();