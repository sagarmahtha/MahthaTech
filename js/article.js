async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const res = await fetch("data/articles.json");
  const articles = await res.json();
  const article = articles.find(a => a.slug === slug);

  if (article) {
    document.getElementById("article-content").innerHTML = `
      <h1>${article.title}</h1>
      <img src="${article.image}" alt="${article.title}">
      <p>${article.full}</p>
    `;
  } else {
    document.getElementById("article-content").innerHTML = "<p>Article not found.</p>";
  }
}
loadArticle();