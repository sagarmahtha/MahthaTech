// --------- Load Partial (header/footer) ----------
async function loadPartial(id, url) {
  try {
    const r = await fetch(url);
    const t = await r.text();
    document.getElementById(id).innerHTML = t;
    if (id === "site-header") {
      attachHeaderHandlers(); // header events bind on dynamic load
    }
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}

// --------- Menu Overlay for mobile nav ---------
function enableMenuOverlay() {
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
  }
  overlay.onclick = () => {
    document.querySelector('.main-nav').classList.remove('open');
    overlay.classList.remove('active');
    const hamb = document.getElementById('hamburger');
    if (hamb) hamb.setAttribute('aria-expanded', 'false');
    if (hamb) hamb.classList.remove('active');
  };
}

// --------- Header Handlers (single, merged version) ----------
function attachHeaderHandlers() {
  // Overlay setup for menu (close when tap outside)
  enableMenuOverlay();
  const overlay = document.querySelector('.menu-overlay');
  const hamb = document.getElementById("hamburger");
  const nav = document.querySelector(".main-nav");

  if (hamb && nav) {
    hamb.onclick = function () {
      nav.classList.toggle("open");
      hamb.classList.toggle("active");
      const expanded = nav.classList.contains("open");
      hamb.setAttribute("aria-expanded", String(expanded));
      if (overlay) overlay.classList.toggle('active', expanded);
    };
  }

  // Theme toggle button (default: light mode)
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.onclick = function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    };
    // Apply saved theme preference
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  // Instant search integration
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  if (searchInput && searchResults) {
    let debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      const q = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = "";
      if (!q) return;
      debounceTimer = setTimeout(async () => {
        try {
          const r = await fetch("data/articles.json");
          const articles = await r.json();
          const matches = articles.filter(
            a =>
              a.title.toLowerCase().includes(q) ||
              (a.description && a.description.toLowerCase().includes(q)) ||
              (a.tags && a.tags.join(" ").toLowerCase().includes(q))
          );
          if (matches.length) {
            matches.slice(0, 5).forEach(a => {
              const div = document.createElement("div");
              div.className = "search-result-item";
              div.innerHTML = `<a href="article.html?id=${a.id}">${a.title}</a>`;
              searchResults.appendChild(div);
            });
          } else {
            searchResults.innerHTML = "<div class='search-result-item'>No matches found.</div>";
          }
        } catch (e) {
          searchResults.innerHTML = "<div class='search-result-item'>Search error.</div>";
        }
      }, 200);
    });
    // Clear search results when input loses focus after a short delay
    searchInput.addEventListener("blur", () => setTimeout(() => (searchResults.innerHTML = ""), 350));
  }
}

// --------- Load Articles / Render Cards ----------
async function loadArticles() {
  try {
    const r = await fetch("data/articles.json");
    const articles = await r.json();
    const page = document.body.dataset.page;

    if (page === "home") {
      // Featured
      const featured = articles.find(a => a.featured) || articles[0];
      if (featured) {
        document.getElementById("featured").innerHTML = articleCard(featured, true);
      }
      // Trending
      const trendingList = document.getElementById("trending-list");
      if (trendingList) {
        articles
          .filter(a => a.trending)
          .slice(0, 6)
          .forEach(a => (trendingList.innerHTML += articleCard(a)));
      }
      // Category Previews
      ["mobiles", "laptops", "gadgets"].forEach(cat => {
        const list = document.getElementById(`${cat}-list`);
        if (list) {
          articles
            .filter(a => a.category === cat)
            .slice(0, 6)
            .forEach(a => (list.innerHTML += articleCard(a)));
        }
      });
    }

    if (page === "category") {
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      if (cat) {
        document.getElementById("category-title").textContent =
          cat.charAt(0).toUpperCase() + cat.slice(1);
        const list = document.getElementById("category-list");
        if (list) {
          articles
            .filter(a => a.category === cat)
            .forEach(a => (list.innerHTML += articleCard(a)));
        }
      }
    }

    if (page === "article") {
      const id = new URLSearchParams(location.search).get("id");
      const art = articles.find(a => String(a.id) === id);
      if (art) {
        const c = document.getElementById("article-content");
        if (c) {
          c.innerHTML = `
            <h1>${art.title}</h1>
            <img src="${art.image}" alt="${art.title}" loading="lazy">
            <p>${art.content}</p>
          `;
        }
        // Related
        const rel = document.getElementById("related-list");
        if (rel) {
          rel.innerHTML = "";
          articles
            .filter(a => a.category === art.category && String(a.id) !== String(art.id))
            .slice(0, 3)
            .forEach(a => (rel.innerHTML += articleCard(a)));
        }
        // Explore More
        const explore = document.getElementById("explore-list");
        if (explore) {
          explore.innerHTML = "";
          articles
            .filter(a => a.category !== art.category)
            .slice(0, 4)
            .forEach(a => (explore.innerHTML += articleCard(a)));
        }
      } else {
        const c = document.getElementById("article-content");
        if (c) c.innerHTML = "<p>Article not found.</p>";
      }
    }
  } catch (err) {
    console.error("Error loading articles:", err);
  }
}

// --------- Card Template ----------
function articleCard(a, isFeatured = false) {
  return `
    <div class="article-card${isFeatured ? " featured-card" : ""}">
      <a href="article.html?id=${a.id}">
        <img src="${a.image}" alt="${a.title}" loading="lazy">
        <div class="content">
          <h3>${a.title}</h3>
          <p>${a.description}</p>
        </div>
      </a>
    </div>
  `;
}

// --------- Init (Run on all pages) ----------
async function init() {
  await loadPartial("site-header", "partials/header.html");
  await loadPartial("site-footer", "partials/footer.html");
  await loadArticles();
}

init();
