/* ==========================================================================
   LYVORA — Cart & Favorites Store (LocalStorage backed)
   ========================================================================== */

const LyStore = (function(){
  'use strict';
  const CART_KEY = 'lyvora_cart';
  const FAV_KEY = 'lyvora_favorites';

  function read(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
  function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function getCart(){ return read(CART_KEY); }
  function getFavorites(){ return read(FAV_KEY); }

  function addToCart(id, qty=1){
    const cart = getCart();
    const line = cart.find(i=>i.id===id);
    if(line) line.qty += qty; else cart.push({id, qty});
    write(CART_KEY, cart);
    renderBadges();
    return cart;
  }
  function setQty(id, qty){
    let cart = getCart();
    if(qty<=0){ cart = cart.filter(i=>i.id!==id); }
    else { const line = cart.find(i=>i.id===id); if(line) line.qty = qty; }
    write(CART_KEY, cart);
    renderBadges();
    renderDrawer();
  }
  function removeFromCart(id){
    write(CART_KEY, getCart().filter(i=>i.id!==id));
    renderBadges();
    renderDrawer();
  }
  function clearCart(){ write(CART_KEY, []); renderBadges(); }

  function toggleFavorite(id){
    let favs = getFavorites();
    const has = favs.includes(id);
    favs = has ? favs.filter(f=>f!==id) : [...favs, id];
    write(FAV_KEY, favs);
    renderBadges();
    document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn=> btn.classList.toggle('active', !has));
    return !has;
  }
  function isFavorite(id){ return getFavorites().includes(id); }

  function cartTotal(){
    return getCart().reduce((sum,line)=>{
      const p = typeof lyProduct==='function' ? lyProduct(line.id) : null;
      return sum + (p ? p.price*line.qty : 0);
    },0);
  }
  function cartCount(){ return getCart().reduce((n,l)=>n+l.qty,0); }

  function renderBadges(){
    document.querySelectorAll('.cart-badge').forEach(b=> b.textContent = cartCount());
    document.querySelectorAll('.fav-badge').forEach(b=> b.textContent = getFavorites().length);
  }

  /* ---------------- Cart Drawer ---------------- */
  function renderDrawer(){
    const body = document.getElementById('drawer-body');
    const foot = document.getElementById('drawer-foot');
    if(!body) return;
    const cart = getCart();
    if(!cart.length){
      body.innerHTML = `<div class="drawer-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
        <p>Your bag is empty.</p>
        <a href="${rootPath()}pages/makeup.html" class="btn btn-outline">Start Shopping</a>
      </div>`;
      if(foot) foot.style.display='none';
      return;
    }
    if(foot) foot.style.display='block';
    body.innerHTML = cart.map(line=>{
      const p = lyProduct(line.id);
      if(!p) return '';
      return `
      <div class="cart-item">
        <img src="${rootPath()}assets/images/${p.img}" alt="${p.name}">
        <div class="cart-item-info">
          <div>
            <h5>${p.name}</h5>
            <div class="ci-cat">${CATEGORY_META[p.category].label}</div>
          </div>
          <div class="qty-control">
            <button aria-label="Decrease" onclick="LyStore.setQty('${p.id}', ${line.qty-1})">&minus;</button>
            <span>${line.qty}</span>
            <button aria-label="Increase" onclick="LyStore.setQty('${p.id}', ${line.qty+1})">+</button>
          </div>
          <div class="ci-row">
            <span class="ci-price">${p.price*line.qty} EGP</span>
            <button class="ci-remove" onclick="LyStore.removeFromCart('${p.id}')">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const subtotal = document.getElementById('drawer-subtotal');
    if(subtotal) subtotal.textContent = cartTotal() + ' EGP';
  }

  function rootPath(){ return window.LYVORA_ROOT || ''; }

  function openDrawer(){
    renderDrawer();
    document.getElementById('cart-drawer')?.classList.add('show');
    document.getElementById('drawer-overlay')?.classList.add('show');
    document.body.style.overflow='hidden';
  }
  function closeDrawer(){
    document.getElementById('cart-drawer')?.classList.remove('show');
    document.getElementById('drawer-overlay')?.classList.remove('show');
    document.body.style.overflow='';
  }

  function initDrawerControls(){
    document.querySelectorAll('[data-open-cart]').forEach(b=> b.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); }));
    document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderBadges();
    initDrawerControls();
  });

  return { getCart, getFavorites, addToCart, setQty, removeFromCart, clearCart,
           toggleFavorite, isFavorite, cartTotal, cartCount, renderBadges,
           renderDrawer, openDrawer, closeDrawer };
})();
