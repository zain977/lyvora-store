/* ==========================================================================
   LYVORA — Rendering Helpers (product cards, grids, quick view)
   ========================================================================== */

function lyRoot(){ return window.LYVORA_ROOT || ''; }

function lyStars(rating){
  const full = Math.round(rating);
  return '\u2605'.repeat(full) + '\u2606'.repeat(5-full);
}

function lyProductCard(p, opts={}){
  const isFav = LyStore.isFavorite(p.id);
  const badge = p.badge ? `<span class="product-badge ${p.oldPrice ? 'badge-sale':''}">${p.badge}</span>` : (p.oldPrice ? `<span class="product-badge badge-sale">Sale</span>` : '');
  return `
  <div class="product-card${opts.reveal?' reveal':''}" data-id="${p.id}">
    <div class="product-media">
      ${badge}
      <button class="fav-btn${isFav?' active':''}" data-fav-id="${p.id}" aria-label="Toggle favorite" onclick="lyToggleFav(event,'${p.id}')">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10.1-9.3C.4 8.7 1.8 5 5.4 4.2 8 3.6 10.3 5 12 7.3 13.7 5 16 3.6 18.6 4.2 22.2 5 23.6 8.7 22.1 11.7 19.5 16.1 12 21 12 21Z"/></svg>
      </button>
      <a href="${lyRoot()}pages/product.html?id=${p.id}">
        <img src="${lyRoot()}assets/images/${p.img}" alt="${p.name}" loading="lazy">
      </a>
      <div class="product-quick-actions">
        <button class="qa-btn" onclick="lyAddToCartQuick(event,'${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 8H6"/></svg>
          <span>Add to Cart</span>
        </button>
        <button class="qa-btn qa-icon" aria-label="Quick view" onclick="lyOpenQuickView(event,'${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    <a href="${lyRoot()}pages/product.html?id=${p.id}" class="product-info" style="display:block">
      <div class="product-cat">${CATEGORY_META[p.category].label}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating"><span class="stars">${lyStars(p.rating)}</span><span>(${p.reviews})</span></div>
      <div class="product-price">
        ${p.oldPrice ? `<span class="price-old">${p.oldPrice} EGP</span>`:''}
        <span>${p.price} EGP</span>
      </div>
    </a>
  </div>`;
}

function lyRenderGrid(target, products, opts={}){
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if(!el) return;
  if(!products.length){
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <h3>No products found</h3><p>Try adjusting your filters or search.</p>
    </div>`;
    return;
  }
  el.innerHTML = products.map(p=>lyProductCard(p, opts)).join('');
  requestAnimationFrame(()=>{
    el.querySelectorAll('.product-card').forEach((c,i)=>{
      setTimeout(()=>c.classList.add('reveal'), i*45);
    });
  });
}

function lyToggleFav(e, id){
  e.preventDefault(); e.stopPropagation();
  const nowFav = LyStore.toggleFavorite(id);
  lyToast(nowFav ? 'Added to favorites' : 'Removed from favorites', nowFav ? 'success' : 'default');
  if(document.body.dataset.page === 'favorites') lyInitFavoritesPage();
}

function lyAddToCartQuick(e, id){
  e.preventDefault(); e.stopPropagation();
  LyStore.addToCart(id, 1);
  const p = lyProduct(id);
  lyToast(`${p.name} added to your bag`, 'success');
  LyStore.openDrawer();
}

/* ---------------- Quick View Modal ---------------- */
function lyOpenQuickView(e, id){
  e.preventDefault(); e.stopPropagation();
  const p = lyProduct(id);
  if(!p) return;
  let modal = document.getElementById('quick-view-overlay');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'quick-view-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
    modal.addEventListener('click', (ev)=>{ if(ev.target===modal) closeQuickView(); });
  }
  const isFav = LyStore.isFavorite(p.id);
  modal.innerHTML = `
    <div class="quick-view-modal">
      <button class="qv-close" onclick="closeQuickView()" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="qv-media"><img src="${lyRoot()}assets/images/${p.img}" alt="${p.name}"></div>
      <div class="qv-info">
        <div class="product-cat">${CATEGORY_META[p.category].label}</div>
        <h2 style="font-size:1.6rem;margin-bottom:.6rem;">${p.name}</h2>
        <div class="product-rating"><span class="stars">${lyStars(p.rating)}</span><span>(${p.reviews} reviews)</span></div>
        <div class="pd-price-row" style="font-size:1.3rem;margin:.9rem 0;">
          ${p.oldPrice?`<span class="price-old">${p.oldPrice} EGP</span>`:''}<span>${p.price} EGP</span>
        </div>
        <p class="pd-desc" style="font-size:.9rem;">${p.desc}</p>
        <div class="pd-actions">
          <button class="btn btn-primary" onclick="LyStore.addToCart('${p.id}',1); lyToast('${p.name.replace(/'/g,"")} added to your bag','success'); closeQuickView(); LyStore.openDrawer();">Add to Cart</button>
          <button class="fav-btn${isFav?' active':''}" data-fav-id="${p.id}" onclick="lyToggleFav(event,'${p.id}')" aria-label="Toggle favorite">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10.1-9.3C.4 8.7 1.8 5 5.4 4.2 8 3.6 10.3 5 12 7.3 13.7 5 16 3.6 18.6 4.2 22.2 5 23.6 8.7 22.1 11.7 19.5 16.1 12 21 12 21Z"/></svg>
          </button>
        </div>
        <a href="${lyRoot()}pages/product.html?id=${p.id}" style="display:inline-block;margin-top:1.2rem;font-size:.85rem;text-decoration:underline;color:var(--c-rose-gold);">View full details</a>
      </div>
    </div>`;
  requestAnimationFrame(()=> modal.classList.add('show'));
  document.body.style.overflow='hidden';
}
function closeQuickView(){
  const modal = document.getElementById('quick-view-overlay');
  if(!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow='';
}
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeQuickView(); });

/* ---------------- Favorites Page ---------------- */
function lyInitFavoritesPage(){
  const ids = LyStore.getFavorites();
  const products = ids.map(id=>lyProduct(id)).filter(Boolean);
  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('favorites-empty');
  if(!grid) return;
  if(!products.length){
    grid.style.display='none';
    if(empty) empty.style.display='block';
  } else {
    grid.style.display='grid';
    if(empty) empty.style.display='none';
    lyRenderGrid(grid, products);
  }
}
