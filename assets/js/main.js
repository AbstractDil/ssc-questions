/* ── main.js ── */

// ── Card data ──────────────────────────────────────────────
const cardContent = [

    {
    icon: "📊",
    title: "Live Mock",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "LiveMock/index.html",
  },
    
  {
    icon: "📖",
    title: "English",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "Eng/index.html",
  },
  {
    icon: "🧠",
    title: "Reasoning",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "Reasoning/index.html",
  },
  {
    icon: "📐",
    title: "Mathematics",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "Math/index.html",
  },
  {
    icon: "🌍",
    title: "General Knowledge",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "GS/index.html",
  },
  {
    icon: "💻",
    title: "Computer",
    subTitle: "Mock Test Analysis",
    link: "Go →",
    url: "Computer/index.html",
  },
];

// ── Render cards ───────────────────────────────────────────
const mainContent = document.getElementById("mainContent");

cardContent.forEach((item) => {
  const card = document.createElement("a");
  card.setAttribute("class", "card");
  card.setAttribute("href", item.url);

  card.innerHTML = `
    <div class="card-icon">${item.icon}</div>
    <div>
      <div class="card-title">${item.title}</div>
      <div class="card-sub">${item.subTitle}</div>
    </div>
    <div class="card-cta">${item.link.replace("→", '')} <span class="arrow">→</span></div>
  `;

  mainContent.appendChild(card);
});

// ── Theme toggle ───────────────────────────────────────────
const html      = document.documentElement;
const themeBtn  = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

// Load saved preference or default to dark
const savedTheme = localStorage.getItem("ssc-theme") || "dark";
applyTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("ssc-theme", theme);

  if (theme === "dark") {
    themeIcon.textContent  = "🌙";
    themeLabel.textContent = "Dark";
  } else {
    themeIcon.textContent  = "☀️";
    themeLabel.textContent = "Light";
  }
}