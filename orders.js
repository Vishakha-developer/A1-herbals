
// ==========================================
// A1 HERBALS - ORDERS MANAGEMENT
// ==========================================

const API_URL = "http://127.0.0.1:5000/api/orders";

let orders = [];


// ==========================================
// ELEMENTS
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");

const ordersTableBody = document.getElementById("ordersTableBody");
const orderSearch = document.getElementById("orderSearch");

const viewOrderModal = document.getElementById("viewOrderModal");
const closeViewOrderModal = document.getElementById("closeViewOrderModal");
const closeViewOrderBtn = document.getElementById("closeViewOrderBtn");


// ==========================================
// MOBILE SIDEBAR TOGGLE
// ==========================================

if (menuToggle && sidebar) {

    menuToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        sidebar.classList.toggle("open");
    });

    document.addEventListener("click", function (event) {

        if (
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }

    });

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN");

}


// ==========================================
// FORMAT AMOUNT
// ==========================================

function formatAmount(amount) {

    return "₹" + Number(amount || 0).toFixed(2);

}


// ==========================================
// LOAD ORDERS FROM DATABASE
// ==========================================

async function loadOrders() {

    try {

        const response = await fetch(`${API_URL}/admin/all`);

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load orders.");
        }

        orders = Array.isArray(data.orders) ? data.orders : [];

        updateOrderCounts();

        searchOrders();

    }

    catch (error) {

        console.error("Orders Loading Error:", error);

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Unable to load orders. Please check backend.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// UPDATE ORDER COUNTS
// ==========================================

function updateOrderCounts() {

    totalOrders.textContent = orders.length;

    pendingOrders.textContent = orders.filter(order =>
        ["Placed", "Processing"].includes(order.order_status)
    ).length;

    completedOrders.textContent = orders.filter(
        order => order.order_status === "Delivered"
    ).length;

}


// ==========================================
// GET PRODUCT NAMES
// ==========================================

function getProductNames(order) {

    if (!Array.isArray(order.items) || order.items.length === 0) {
        return "—";
    }

    return order.items.map(item => {

        return `${item.product_name} (x${item.quantity})`;

    }).join(", ");

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orderList = orders) {

    ordersTableBody.innerHTML = "";

    if (orderList.length === 0) {

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No orders found.
                </td>
            </tr>
        `;

        return;

    }


    orderList.forEach(function (order) {

        const row = document.createElement("tr");


        // ORDER ID

        const idCell = document.createElement("td");

        idCell.textContent = order.order_id;


        // CUSTOMER

        const customerCell = document.createElement("td");

        customerCell.textContent =
            `${order.first_name || ""} ${order.last_name || ""}`.trim() || "—";


        // PRODUCT

        const productCell = document.createElement("td");

        productCell.textContent = getProductNames(order);


        // DATE

        const dateCell = document.createElement("td");

        dateCell.textContent = formatDate(order.order_date);


        // AMOUNT

        const amountCell = document.createElement("td");

        amountCell.textContent = formatAmount(order.total_amount);


        // STATUS DROPDOWN

        const statusCell = document.createElement("td");

        const statusSelect = document.createElement("select");

        statusSelect.className = "order-status-select";

        statusSelect.dataset.id = order.order_id;

        const statuses = [
            "Placed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        statuses.forEach(function (status) {

            const option = document.createElement("option");

            option.value = status;

            option.textContent = status;

            option.selected = order.order_status === status;

            statusSelect.appendChild(option);

        });

        statusCell.appendChild(statusSelect);


        // ACTION BUTTON

        const actionsCell = document.createElement("td");

        actionsCell.className = "order-actions";

        const viewButton = document.createElement("button");

        viewButton.type = "button";

        viewButton.className = "action-btn view-btn";

        viewButton.dataset.id = order.order_id;

        viewButton.title = "View Order";

        viewButton.innerHTML = '<i class="fa-solid fa-eye"></i>';

        actionsCell.appendChild(viewButton);


        // ADD CELLS

        row.append(
            idCell,
            customerCell,
            productCell,
            dateCell,
            amountCell,
            statusCell,
            actionsCell
        );

        ordersTableBody.appendChild(row);

    });

}


// ==========================================
// SEARCH ORDERS
// ==========================================

function searchOrders() {

    const searchValue = orderSearch.value.toLowerCase().trim();

    const filteredOrders = orders.filter(function (order) {

        const customer =
            `${order.first_name || ""} ${order.last_name || ""}`;

        const products = getProductNames(order);

        return (

            String(order.order_id).toLowerCase().includes(searchValue) ||

            customer.toLowerCase().includes(searchValue) ||

            products.toLowerCase().includes(searchValue) ||

            String(order.order_status || "").toLowerCase().includes(searchValue)

        );

    });

    displayOrders(filteredOrders);

}

orderSearch.addEventListener("input", searchOrders);


// ==========================================
// VIEW ORDER DETAILS
// ==========================================

function viewOrder(orderId) {

    const order = orders.find(
        item => Number(item.order_id) === Number(orderId)
    );

    if (!order) {
        return;
    }


    // ORDER ID

    document.getElementById("viewOrderId").textContent =
        order.order_id;


    // CUSTOMER

    document.getElementById("viewOrderCustomer").textContent =
        `${order.first_name || ""} ${order.last_name || ""}`.trim() || "—";


    // PRODUCTS

    document.getElementById("viewOrderProduct").textContent =
        getProductNames(order);


    // DATE

    document.getElementById("viewOrderDate").textContent =
        order.order_date
            ? new Date(order.order_date).toLocaleString("en-IN")
            : "—";


    // AMOUNT

    document.getElementById("viewOrderAmount").textContent =
        formatAmount(order.total_amount);


    // STATUS

    document.getElementById("viewOrderStatus").textContent =
        order.order_status || "—";


    viewOrderModal.classList.add("active");

}


// ==========================================
// VIEW BUTTON CLICK
// ==========================================

ordersTableBody.addEventListener("click", function (event) {

    const button = event.target.closest(".view-btn");

    if (!button) {
        return;
    }

    viewOrder(button.dataset.id);

});


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

ordersTableBody.addEventListener("change", async function (event) {

    const select = event.target.closest(".order-status-select");

    if (!select) {
        return;
    }

    const orderId = select.dataset.id;

    const newStatus = select.value;

    const order = orders.find(
        item => Number(item.order_id) === Number(orderId)
    );

    if (!order) {
        return;
    }

    const previousStatus = order.order_status;

    if (newStatus === previousStatus) {
        return;
    }

    select.disabled = true;

    try {

        const response = await fetch(
            `${API_URL}/admin/update/${orderId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    order_status: newStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Status update failed.");
        }

        alert("Order status updated successfully!");

        await loadOrders();

    }

    catch (error) {

        console.error("Status Update Error:", error);

        alert(error.message);

        await loadOrders();

    }

    finally {

        select.disabled = false;

    }

});


// ==========================================
// CLOSE VIEW MODAL
// ==========================================

function closeViewModal() {

    viewOrderModal.classList.remove("active");

}

closeViewOrderModal.addEventListener("click", closeViewModal);

closeViewOrderBtn.addEventListener("click", closeViewModal);


viewOrderModal.addEventListener("click", function (event) {

    if (event.target === viewOrderModal) {
        closeViewModal();
    }

});


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeViewModal();
    }

});


// ==========================================
// INITIAL LOAD
// ==========================================

loadOrders();
