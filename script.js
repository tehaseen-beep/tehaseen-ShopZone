
// ==============================
// DOM ELEMENTS
// ==============================

const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const noProducts = document.getElementById("noProducts");
const checkoutButton = document.getElementById("checkoutButton");

// ==============================
// VARIABLES
// ==============================

let products = [];
let cart = [];

// Format prices in Indian Rupees
const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(price);
};

// ==============================
// FETCH PRODUCTS FROM JSON
// ==============================

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {
        productContainer.innerHTML = `
            <p class="loading-message">
                Failed to load products. Please run the
                website using a local server and try again.
            </p>
        `;

        console.error("Product loading error:", error);
    }
}

// ==============================
// DISPLAY PRODUCTS
// ==============================

function displayProducts(productList) {

    productContainer.innerHTML = "";

    noProducts.hidden = productList.length !== 0;

    productList.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.src = "https://placehold.co/400x300?text=Product";
        });

        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";
        imageContainer.appendChild(image);

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const rating = document.createElement("div");
        rating.className = "rating";

        const ratingValue = Math.max(
            0,
            Math.min(5, Number(product.rating) || 0)
        );

        const fullStars = Math.floor(ratingValue);
        const halfStar = ratingValue - fullStars >= 0.5;

        rating.innerHTML =
            '<i class="fas fa-star"></i>'.repeat(fullStars) +
            (halfStar ? '<i class="fas fa-star-half-alt"></i>' : "") +
            '<i class="far fa-star"></i>'.repeat(
                5 - fullStars - (halfStar ? 1 : 0)
            );

        const ratingText = document.createElement("span");
        ratingText.textContent = `${ratingValue.toFixed(1)} / 5`;
        rating.appendChild(ratingText);

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

        const addButton = document.createElement("button");
        addButton.className = "add-cart";
        addButton.innerHTML = '<i class="fas fa-cart-plus"></i> Add';

        addButton.addEventListener("click", () => {
            addToCart(product.id);
        });

        bottom.appendChild(price);
        bottom.appendChild(addButton);

        info.appendChild(category);
        info.appendChild(name);
        info.appendChild(rating);
        info.appendChild(bottom);

        card.appendChild(imageContainer);
        card.appendChild(info);

        productContainer.appendChild(card);

    });
}

// ==============================
// SEARCH PRODUCTS
// ==============================

function searchProducts() {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filteredProducts = products.filter(product => {

        return (
            product.name.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );

    });

    displayProducts(filteredProducts);
}

searchButton.addEventListener("click", searchProducts);

searchInput.addEventListener("input", searchProducts);

// ==============================
// ADD PRODUCT TO CART
// ==============================

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

}

// ==============================
// UPDATE CART
// ==============================

function updateCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

    }

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;

        image.addEventListener("error", () => {
            image.src = "https://placehold.co/100x100?text=Product";
        });

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const name = document.createElement("h4");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(item.price);

        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.textContent = "-";
        decreaseButton.setAttribute("aria-label", "Decrease quantity");

        decreaseButton.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", "Increase quantity");

        increaseButton.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        quantityControls.appendChild(decreaseButton);
        quantityControls.appendChild(quantity);
        quantityControls.appendChild(increaseButton);

        info.appendChild(name);
        info.appendChild(price);
        info.appendChild(quantityControls);

        const removeButton = document.createElement("button");
        removeButton.className = "remove-item";
        removeButton.innerHTML = '<i class="fas fa-trash"></i>';
        removeButton.setAttribute("aria-label", "Remove item");

        removeButton.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        cartItem.appendChild(image);
        cartItem.appendChild(info);
        cartItem.appendChild(removeButton);

        cartItems.appendChild(cartItem);

    });

    // Calculate total quantity
    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // Calculate total price
    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatPrice(totalPrice);

}

// ==============================
// CHANGE PRODUCT QUANTITY
// ==============================

function changeQuantity(productId, change) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        removeFromCart(productId);

    } else {

        updateCart();

    }

}

// ==============================
// REMOVE PRODUCT FROM CART
// ==============================

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCart();

}

// ==============================
// OPEN AND CLOSE CART
// ==============================

function openCart() {

    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");

}

function hideCart() {

    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");

}

cartButton.addEventListener("click", openCart);

closeCart.addEventListener("click", hideCart);

cartOverlay.addEventListener("click", hideCart);

// Close cart using Escape key
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        hideCart();
    }

});

// ==============================
// CHECKOUT BUTTON
// ==============================

checkoutButton.addEventListener("click", () => {

    if (cart.length === 0) {

        alert("Your shopping cart is empty!");

        return;

    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    alert(
        "Thank you for shopping with ShopZone!\n" +
        "Your order total is " + formatPrice(total) +
        "\n\nThis is a demo checkout. No payment has been processed."
    );

});

// ==============================
// INITIALIZE WEBSITE
// ==============================

loadProducts();

updateCart();
