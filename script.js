
const PRICES = {
  "30ml": 55,
  "60ml": 75,
  "100ml": 120
};

const state = {
  filter: "all",
  search: "",
  cart: JSON.parse(localStorage.getItem("charm_cart") || "[]")
};

const productsGrid = document.getElementById("productsGrid");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");
const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const sendOrder = document.getElementById("sendOrder");
const clearCart = document.getElementById("clearCart");

function money(value){
  return `${value} DH`;
}

function slugify(text){
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

function filteredProducts(){
  return products.filter((product) => {
    const matchesFilter = state.filter === "all" || product.category === state.filter;
    const matchesSearch = product.name.toLowerCase().includes(state.search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function renderProducts(){
  const list = filteredProducts();
  resultsCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`;
  productsGrid.innerHTML = list.map((product, index) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-body">
        <span class="category-pill">${product.category}</span>
        <h4 class="product-title">${product.name}</h4>
        <div class="price-row">
          <span class="price-tag">30ml · 55 DH</span>
          <span class="price-tag">60ml · 75 DH</span>
          <span class="price-tag">100ml · 120 DH</span>
        </div>
        <div class="product-actions">
          <select class="size-select" id="size-${index}">
            <option value="30ml">30ml - 55 DH</option>
            <option value="60ml">60ml - 75 DH</option>
            <option value="100ml">100ml - 120 DH</option>
          </select>
          <button class="add-btn" data-index="${index}">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const product = list[Number(button.dataset.index)];
      const size = document.getElementById(`size-${button.dataset.index}`).value;
      addToCart(product, size);
    });
  });
}

function saveCart(){
  localStorage.setItem("charm_cart", JSON.stringify(state.cart));
}

function addToCart(product, size){
  const existing = state.cart.find((item) => item.name === product.name && item.size === size);
  if(existing){
    existing.qty += 1;
  } else {
    state.cart.push({
      name: product.name,
      category: product.category,
      size,
      price: PRICES[size],
      qty: 1,
      image: product.image
    });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(index){
  state.cart.splice(index, 1);
  saveCart();
  renderCart();
}

function renderCart(){
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  cartCount.textContent = totalItems;
  cartTotal.textContent = money(totalPrice);

  if(state.cart.length === 0){
    cartItems.innerHTML = `<div class="empty-cart">Votre panier est vide.</div>`;
    return;
  }

  cartItems.innerHTML = state.cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h6>${item.name}</h6>
        <p>${item.category} · ${item.size} · ${money(item.price)} × ${item.qty}</p>
      </div>
      <button class="remove-item" data-remove="${index}">Supprimer</button>
    </div>
  `).join("");

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(Number(button.dataset.remove)));
  });
}

function openCart(){
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
}

function closeCartDrawer(){
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
}

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderProducts();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderProducts();
  });
});

clearCart.addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
});

sendOrder.addEventListener("click", () => {
  if(state.cart.length === 0){
    alert("Votre panier est vide.");
    return;
  }

  const lines = [
    "Bonjour CHARM PERFUME, je veux commander :",
    ""
  ];

  state.cart.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} - ${item.size} - ${item.qty} x ${item.price} DH`);
  });

  const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  lines.push("");
  lines.push(`Total : ${total} DH`);

  const url = `https://wa.me/212649657517?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank");
});

renderProducts();
renderCart();
