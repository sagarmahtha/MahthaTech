// ✅ Load Partials (Header + Footer)
async function loadPartial(id, url) {
  const r = await fetch(url);
  const t = await r.text();
  document.getElementById(id).innerHTML = t;
  attachHeaderHandlers();
}

// ✅ Handle header toggle (hamburger menu)
function attachHeaderHandlers() {
  const hamb = document.getElementById("hamburger");
  const nav = document.querySelector(".main-nav");
  if (hamb && nav) {
    hamb.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = hamb.getAttribute("aria-expanded") === "true";
      hamb.setAttribute("aria-expanded", String(!expanded));
    });
  }
}

// ✅ Load Articles JSON
let allArticles = [];
async function loadArticles() {
  try {
    const res = await fetch("data/articles.json");
    allArticles = await res.json();
    renderPage();
  } catch (err) {
    console.error("Error loading articles.json", err);
  }
}

// ✅ Render based on page type
function renderPage() {
  const page = document.body.dataset.page;

  if (page === "home") renderHome();
  if (page === "category") renderCategory();
  if (page === "article") renderArticle();
}

// ✅ Homepage → Featured + Trending
function renderHome() {
  const featured = document.getElementById("featured");
  const trending = document.getElementById("trending-list");

  if (featured) {
    const f = allArticles.find(a => a.featured === true);
    if (f) {
      featured.innerHTML = `
        <article class="featured-card">
          <img src="${f.image}" alt="${f.title}">
          <h2><a href="article.html?id=${f.id}">${f.title}</a></h2>
          <p>${f.description}</p>
        </article>
      `;
    }
  }

  if (trending) {
    const trend = allArticles.filter(a => a.trending === true).slice(0, 6);
    trending.innerHTML = trend.map(a => `
      <article class="card">
        <img src="${a.image}" alt="${a.title}">
        <h3><a href="article.html?id=${a.id}">${a.title}</a></h3>
      </article>
    `).join("");
  }
}

// ✅ Category Page
function renderCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get("cat");

  const container = document.getElementById("category-list");
  if (!container) return;

  const filtered = allArticles.filter(a => a.category === cat);
  container.innerHTML = filtered.map(a => `
    <article class="card">
      <img src="${a.image}" alt="${a.title}">
      <h3><a href="article.html?id=${a.id}">${a.title}</a></h3>
      <p>${a.description}</p>
    </article>
  `).join("");
}

// ✅ Article Page
function renderArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"));
  const article = allArticles.find(a => a.id === id);

  if (!article) return;

  const container = document.getElementById("article-container");
  if (container) {
    container.innerHTML = `
      <article class="full-article">
        <h1>${article.title}</h1>
        <img src="${article.image}" alt="${article.title}">
        <p>${article.content}</p>

        <!-- Share button -->
        <button id="shareBtn">Share this article</button>

        <!-- Comment box -->
        <div class="comments">
          <h3>Leave a Comment</h3>
          <textarea id="commentInput" placeholder="Write a comment..."></textarea>
          <button id="submitComment">Post</button>
          <div id="commentList"></div>
        </div>
      </article>
    `;
    initComments();
    initShare(article);
  }

  // Related Articles
  const related = allArticles.filter(a => a.category === article.category && a.id !== id).slice(0, 3);
  const relatedBox = document.getElementById("related-articles");
  if (relatedBox) {
    relatedBox.innerHTML = related.map(a => `
      <article class="mini-card">
        <img src="${a.image}" alt="${a.title}">
        <h4><a href="article.html?id=${a.id}">${a.title}</a></h4>
      </article>
    `).join("");
  }

  // Explore More → 2 per category
  const exploreBox = document.getElementById("explore-more");
  if (exploreBox) {
    const grouped = {};
    allArticles.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = [];
      if (grouped[a.category].length < 2 && a.id !== id) {
        grouped[a.category].push(a);
      }
    });

    exploreBox.innerHTML = Object.keys(grouped).map(cat => `
      <h3>${cat}</h3>
      <div class="mini-grid">
        ${grouped[cat].map(a => `
          <article class="mini-card">
            <img src="${a.image}" alt="${a.title}">
            <h4><a href="article.html?id=${a.id}">${a.title}</a></h4>
          </article>
        `).join("")}
      </div>
    `).join("");
  }
}

// ✅ Comments
function initComments() {
  const input = document.getElementById("commentInput");
  const btn = document.getElementById("submitComment");
  const list = document.getElementById("commentList");

  if (btn) {
    btn.addEventListener("click", () => {
      if (input.value.trim()) {
        const comment = document.createElement("p");
        comment.textContent = input.value;
        list.appendChild(comment);
        input.value = "";
      }
    });
  }
}

// ✅ Share API
function initShare(article) {
  const btn = document.getElementById("shareBtn");
  if (btn && navigator.share) {
    btn.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    });
  }
}

// ✅ Init
async function init() {
  await loadPartial("site-header", "partials/header.html");
  await loadPartial("site-footer", "partials/footer.html");
  await loadArticles();
}
init();