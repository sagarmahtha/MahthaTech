// --------- Load Header & Footer ----------
async function loadPartial(id, url) {
  try {
    const r = await fetch(url);
    const t = await r.text();
    document.getElementById(id).innerHTML = t;
    attachHeaderHandlers(); // header events attach
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}

// --------- Header Handlers ----------
function attachHeaderHandlers() {
  const hamb = document.getElementById("hamburger");
  const nav = document.querySelector(".main-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // Hamburger
  if (hamb && nav) {
    hamb.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = hamb.getAttribute("aria-expanded") === "true";
      hamb.setAttribute("aria-expanded", String(!expanded));
    });
  }

  // Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });

    // Apply saved theme
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  // Search
  if (searchInput && searchResults) {
    searchInput.addEventListener("input", async (e) => {
      const q = e.target.value.toLowerCase();
      searchResults.innerHTML = "";
      if (!q) return;

      try {
        const r = await fetch("data/articles.json");
        const articles = await r.json();
        const matches = articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
        matches.slice(0, 5).forEach((a) => {
          const div = document.createElement("div");
          div.className = "search-result-item";
          div.innerHTML = `<strong>${a.title}</strong>`;
          div.addEventListener("click", () => openArticle(a.id));
          searchResults.appendChild(div);
        });
      } catch (err) {
        console.error("Search error:", err);
      }
    });
  }
}

// --------- Load Articles ----------
async function loadArticles() {
  try {
    const r = await fetch("data/articles.json");
    const articles = await r.json();
    const page = document.body.dataset.page;

    if (page === "home") {
      // Featured
      const featured = articles.find((a) => a.featured);
      if (featured) {
        document.getElementById("featured").innerHTML = articleCard(featured, true);
      }

      // Trending
      const trendingList = document.getElementById("trending-list");
      articles.filter((a) => a.trending).slice(0, 6).forEach((a) => {
        trendingList.innerHTML += articleCard(a);
      });

      // Category previews
      ["mobiles", "laptops", "gadgets"].forEach((cat) => {
        const list = document.getElementById(cat + "-list");
        if (list) {
          articles
            .filter((a) => a.category === cat)
            .slice(0, 6)
            .forEach((ar) => (list.innerHTML += articleCard(ar)));
        }
      });
    }

    if (page === "category") {
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      document.getElementById("category-title").textContent =
        cat.charAt(0).toUpperCase() + cat.slice(1);
      const list = document.getElementById("category-list");
      articles
        .filter((a) => a.category === cat)
        .forEach((ar) => (list.innerHTML += articleCard(ar)));
    }

    if (page === "article") {
      const id = new URLSearchParams(location.search).get("id");
      const art = articles.find((a) => a.id == id);
      if (art) {
        document.getElementById("article-content").innerHTML = `
          <h1>${art.title}</h1>
          <img src="${art.image}" alt="${art.title}" loading="lazy">
          <p>${art.content}</p>
        `;

        // Related
        const rel = document.getElementById("related-list");
        articles
          .filter((a) => a.category === art.category && a.id != art.id)
          .slice(0, 3)
          .forEach((ar) => (rel.innerHTML += articleCard(ar)));

        // Explore more
        const explore = document.getElementById("explore-list");
        articles
          .filter((a) => a.category !== art.category)
          .slice(0, 4)
          .forEach((ar) => (explore.innerHTML += articleCard(ar)));
      }
    }
  } catch (err) {
    console.error("Error loading articles:", err);
  }
}

// --------- Card Template ----------
function articleCard(a, isFeatured = false) {
  return `
    <div class="article-card ${isFeatured ? "featured-card" : ""}" onclick="openArticle(${a.id})">
      <img src="${a.image}" alt="${a.title}" loading="lazy">
      <div class="content">
        <h3>${a.title}</h3>
        <p>${a.description}</p>
      </div>
    </div>
  `;
}

// --------- Open Full Article ----------
function openArticle(id) {
  location.href = "article.html?id=" + id;
}

// --------- Init ----------
async function init() {
  await loadPartial("site-header", "partials/header.html");
  await loadPartial("site-footer", "partials/footer.html");
  await loadArticles();
}

init();
