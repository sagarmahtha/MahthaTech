async function loadPartial(id,url){
  const r=await fetch(url);const t=await r.text();document.getElementById(id).innerHTML=t;attachHeaderHandlers();
}
function attachHeaderHandlers(){
  const hamb=document.getElementById('hamburger');
  const nav=document.querySelector('.main-nav');
  if(hamb&&nav){
    hamb.addEventListener('click',()=>{
      nav.classList.toggle('open');
      const expanded=hamb.getAttribute('aria-expanded')==='true';
      hamb.setAttribute('aria-expanded',String(!expanded));
    });
  }
}
async function loadArticles(){
  const r=await fetch('data/articles.json');const articles=await r.json();
  const page=document.body.dataset.page;
  if(page==='home'){
    const featured=articles.find(a=>a.featured);
    if(featured){
      document.getElementById('featured').innerHTML=`<div class="article-card" onclick="openArticle(${featured.id})">
      <img src="${featured.image}"><div class="content"><h3>${featured.title}</h3><p>${featured.description}</p></div></div>`;
    }
    const trendingList=document.getElementById('trending-list');
    articles.filter(a=>a.trending).slice(0,6).forEach(a=>{
      trendingList.innerHTML+=articleCard(a);
    });
    ['mobiles','laptops','gadgets'].forEach(cat=>{
      const list=document.getElementById(cat+'-list');
      if(list){
        articles.filter(a=>a.category===cat).slice(0,6).forEach(ar=>list.innerHTML+=articleCard(ar));
      }
    });
  }
  if(page==='category'){
    const params=new URLSearchParams(location.search);const cat=params.get('cat');
    document.getElementById('category-title').textContent=cat.charAt(0).toUpperCase()+cat.slice(1);
    const list=document.getElementById('category-list');
    articles.filter(a=>a.category===cat).forEach(ar=>list.innerHTML+=articleCard(ar));
  }
  if(page==='article'){
    const id=new URLSearchParams(location.search).get('id');
    const art=articles.find(a=>a.id==id);
    if(art){
      document.getElementById('article-content').innerHTML=`<h1>${art.title}</h1><img src="${art.image}"><p>${art.content}</p>`;
      const rel=document.getElementById('related-list');
      articles.filter(a=>a.category===art.category&&a.id!=art.id).slice(0,3).forEach(ar=>rel.innerHTML+=articleCard(ar));
      const explore=document.getElementById('explore-list');
      articles.filter(a=>a.category!==art.category).slice(0,4).forEach(ar=>explore.innerHTML+=articleCard(ar));
    }
  }
}
function articleCard(a){return `<div class="article-card" onclick="openArticle(${a.id})"><img src="${a.image}"><div class="content"><h3>${a.title}</h3><p>${a.description}</p></div></div>`;}
function openArticle(id){location.href='article.html?id='+id;}
async function init(){await loadPartial('site-header','partials/header.html');await loadPartial('site-footer','partials/footer.html');await loadArticles();}
init();