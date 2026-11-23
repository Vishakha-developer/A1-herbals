
const API_URL = "http://127.0.0.1:5000/api/orders/customer/";

const registeredUser = JSON.parse(
    localStorage.getItem("registeredUser") || "null"
);

const ordersLoading = document.getElementById("ordersLoading");
const ordersList = document.getElementById("ordersList");
const noOrders = document.getElementById("noOrders");

const country = localStorage.getItem("selectedCountry") || "IN";

function formatPrice(amount, currency) {
    const symbol = currency === "USD" ? "$" : "₹";

    return symbol + Number(amount).toFixed(2);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function displayOrders(orders) {

    ordersList.innerHTML = "";

    if (!orders || orders.length === 0) {
        noOrders.style.display = "block";
        return;
    }

    noOrders.style.display = "none";

    orders.forEach(order => {

        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        const itemsHTML = order.items.map(item => `
            <div class="order-item">
                <div>
                    <strong>${item.product_name}</strong>
                    <p>Quantity: ${item.quantity}</p>
                </div>

                <strong>
                    ${formatPrice(item.subtotal, order.currency)}
                </strong>
            </div>
        `).join("");

        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Order #${order.order_id}</h3>
                    <p>Placed on ${formatDate(order.order_date)}</p>
                </div>

                <span class="order-status">
                    ${order.order_status}
                </span>
            </div>

            <div class="order-info">
                <div>
                    <p>Total Amount</p>
                    <strong>
                        ${formatPrice(order.total_amount, order.currency)}
                    </strong>
                </div>

                <div>
                    <p>Payment Method</p>
                    <strong>${order.payment_method}</strong>
                </div>

                <div>
                    <p>Payment Status</p>
                    <strong>${order.payment_status}</strong>
                </div>
            </div>

            <div class="order-items">
                <h3>Ordered Products</h3>
                ${itemsHTML}
            </div>

            <div class="order-address">
                <h3>Delivery Address</h3>
                <p>
                    ${order.full_name || ""}
                    <br>
                    ${order.phone || ""}
                    <br>
                    ${order.address_line1 || ""}
                    <br>
                    ${order.city || ""}, ${order.state || ""}
                    - ${order.pincode || ""}
                    <br>
                    ${order.country || ""}
                </p>
            </div>
        `;

        ordersList.appendChild(orderCard);

    });
}

async function loadCustomerOrders() {

    if (!registeredUser || !registeredUser.customer_id) {
        alert("Please login to view your orders.");
        window.location.href = "login.html?redirect=my-orders.html";
        return;
    }

    try {

        const response = await fetch(
            API_URL + registeredUser.customer_id
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load orders.");
        }

        displayOrders(data.orders);

    } catch (error) {

        console.error("Orders API Error:", error);

        ordersList.innerHTML = `
            <p>Unable to load your orders. Please try again.</p>
        `;

    } finally {

        ordersLoading.style.display = "none";

    }
}

loadCustomerOrders();
