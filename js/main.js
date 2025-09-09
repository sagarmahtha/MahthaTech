// Load header and footer components
function loadComponent(url, containerId) {
  fetch(url)
    .then(res => res.text())
    .then(html => document.getElementById(containerId).innerHTML = html)
    .catch(err => console.error('Component load error:', err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent('components/header.html', 'header-container');
  loadComponent('components/footer.html', 'footer-container');

  fetch('article.json')
    .then(res => res.json())
    .then(articles => {
      const path = window.location.pathname;
      const page = path.substring(path.lastIndexOf('/') + 1);

      if (page === 'index.html' || page === '') {
        renderHomepage(articles);
      } else if (page === 'category.html') {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('cat');
        if (category) {
          renderCategoryPage(articles, category);
        }
      } else if (page === 'article.html') {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
          renderArticlePage(articles, id);
        }
      }
    })
    .catch(e => console.error('Error loading articles:', e));
});

function renderHomepage(articles) {
  renderArticles(filterByKey(articles, 'featured', true, 6), '#featured-section .articles-container');
  renderArticles(filterByKey(articles, 'trending', true, 6), '#trending-section .articles-container');
  renderArticles(filterByKey(articles, 'category', 'mobiles', 6), '#mobiles-section .articles-container');
  renderArticles(filterByKey(articles, 'category', 'laptops', 6), '#laptops-section .articles-container');
  renderArticles(filterByKey(articles, 'category', 'gadgets', 6), '#gadgets-section .articles-container');
  renderArticles(filterByKey(articles, 'category', 'technews', 6), '#technews-section .articles-container');
}

function renderCategoryPage(articles, category) {
  document.getElementById('category-title').textContent = category.charAt(0).toUpperCase() + category.slice(1);
  renderArticles(filterByKey(articles, 'category', category, 6), '#category-articles .articles-container');
}

function renderArticlePage(articles, id) {
  const article = articles.find(a => a.id === id);
  if (!article) {
    document.body.innerHTML = '<h2>Article not found</h2>';
    return;
  }
  document.getElementById('article-title').textContent = article.title;
  const img = document.getElementById('article-image');
  img.src = article.image;
  img.alt = article.title;
  document.getElementById('article-content').innerHTML = article.content;

  const related = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
  renderMiniCards(related, '#related-articles .mini-cards-container');

  const otherCats = [...new Set(articles.map(a => a.category))].filter(c => c !== article.category);
  let exploreMore = [];
  otherCats.forEach(cat => {
    exploreMore = exploreMore.concat(articles.filter(a => a.category === cat).slice(0, 2));
  });
  renderMiniCards(exploreMore, '#explore-more .mini-cards-container');

  document.getElementById('share-button').onclick = () => {
    const shareData = {
      title: article.title,
      text: article.summary,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => alert("Sharing failed"));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("URL copied to clipboard"));
    }
  };
}

function renderArticles(articles, containerSelector) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';
  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}" />
      <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
      <p>${article.summary}</p>
    `;
    container.appendChild(card);
  });
}

function renderMiniCards(articles, containerSelector) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';
  articles.forEach(article => {
    const miniCard = document.createElement('div');
    miniCard.className = 'mini-article-card';
    miniCard.innerHTML = `<a href="article.html?id=${article.id}">${article.title}</a>`;
    container.appendChild(miniCard);
  });
}

function filterByKey(articles, key, value, limit) {
  return articles
    .filter(article => article[key] === value)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
