
// ==========================================
// LOGIN CHECK
// ==========================================

const registeredUser = JSON.parse(
    localStorage.getItem("registeredUser") || "null"
);

const isUserLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" &&
    registeredUser !== null;

if (!isUserLoggedIn) {
    alert("Please login to access your cart.");
    window.location.href = "login.html";
}


// ==========================================
// CART FUNCTIONS
// ==========================================

function getCart() {

    try {
        const cart = JSON.parse(localStorage.getItem("shoppingCart"));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Unable to load cart:", error);
        return [];
    }

}


function saveCart(cart) {

    localStorage.setItem(
        "shoppingCart",
        JSON.stringify(cart)
    );

}


function getCurrency() {

    return localStorage.getItem("selectedCountry") || "IN";

}


function formatPrice(price) {

    return getCurrency() === "US"
        ? "$" + Number(price).toFixed(2)
        : "₹" + Number(price).toFixed(2);

}


// ==========================================
// DISPLAY CART PRODUCTS
// ==========================================

function displayCart() {

    if (!isUserLoggedIn) return;

    const cartContent = document.getElementById("cartContent");

    if (!cartContent) return;

    const cart = getCart();

    if (cart.length === 0) {

        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <h2>Your Cart is Empty</h2>
                <p>You haven't added any products yet.</p>
                <a href="products.html">Continue Shopping</a>
            </div>
        `;

        return;

    }

    let subtotal = 0;
    let itemsHTML = "";

    cart.forEach(function (item, index) {

        const country = getCurrency();

        const price = Number(
            country === "US" ? item.priceUS : item.priceIN
        );

        const quantity = Number(item.quantity);

        const itemTotal = price * quantity;

        subtotal += itemTotal;

        itemsHTML += `
            <div class="cart-item">

                <img src="${item.image}" alt="${item.name}">

                <div class="cart-item-info">

                    <h3>${item.name}</h3>

                    <p>${item.category}</p>

                    <p class="cart-item-price">
                        ${formatPrice(price)}
                    </p>

                    <div class="quantity-controls">

                        <button type="button"
                            data-action="decrease"
                            data-index="${index}">−</button>

                        <span>${quantity}</span>

                        <button type="button"
                            data-action="increase"
                            data-index="${index}">+</button>

                    </div>

                </div>

                <div>
                    <strong>${formatPrice(itemTotal)}</strong>
                </div>

                <button type="button"
                    class="remove-item"
                    data-action="remove"
                    data-index="${index}"
                    title="Remove Product">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>
        `;

    });


    cartContent.innerHTML = `
        <div class="cart-container">

            <div class="cart-items">
                ${itemsHTML}
            </div>

            <div class="cart-summary">

                <h2>Order Summary</h2>

                <div class="summary-row">
                    <span>Subtotal</span>
                    <strong>${formatPrice(subtotal)}</strong>
                </div>

                <div class="summary-row">
                    <span>Shipping</span>
                    <strong>Calculated at checkout</strong>
                </div>

                <div class="detail-divider"></div>

                <div class="summary-row">
                    <strong>Total</strong>
                    <strong>${formatPrice(subtotal)}</strong>
                </div>

                <button class="checkout-btn"
                    type="button"
                    id="proceedCheckoutBtn">

                    Proceed to Checkout

                </button>

            </div>

        </div>
    `;


    // CHECKOUT BUTTON

    const checkoutButton = document.getElementById("proceedCheckoutBtn");

    checkoutButton.addEventListener("click", function () {

        const currentCart = getCart();

        if (currentCart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        window.location.href = "checkout.html";

    });

}


// ==========================================
// CART BUTTON ACTIONS
// ==========================================

document.addEventListener("click", function (event) {

    if (!isUserLoggedIn) return;

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const index = Number(button.dataset.index);

    const cart = getCart();

    if (!Number.isInteger(index) || !cart[index]) return;

    if (action === "increase") {

        cart[index].quantity++;

    }

    else if (action === "decrease") {

        cart[index].quantity--;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

    }

    else if (action === "remove") {

        cart.splice(index, 1);

    }

    saveCart(cart);
    displayCart();

});


// ==========================================
// INITIAL DISPLAY
// ==========================================

displayCart();
