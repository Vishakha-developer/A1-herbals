
// ==========================================
// A1 HERBALS - CUSTOMERS MANAGEMENT
// ==========================================


// MOBILE SIDEBAR TOGGLE

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

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
// CUSTOMER DATA FROM BACKEND API
// ==========================================

let customers = [];


// FORMAT REGISTRATION DATE

function formatCustomerDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// ==========================================
// UPDATE CUSTOMER COUNTS
// ==========================================

function updateCustomerCounts() {

    const totalCustomers =
        document.getElementById("totalCustomers");

    const activeCustomers =
        document.getElementById("activeCustomers");

    const newCustomers =
        document.getElementById("newCustomers");


    // Total Customers

    if (totalCustomers) {
        totalCustomers.textContent = customers.length;
    }


    // Active Customers
    // Database madhye status column nahi.

    if (activeCustomers) {
        activeCustomers.textContent = "—";
    }


    // New Customers - Last 30 Days

    const today = new Date();

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(today.getDate() - 30);

    const newCount = customers.filter(function (customer) {

        if (!customer.created_at) {
            return false;
        }

        const registrationDate = new Date(customer.created_at);

        return (
            !isNaN(registrationDate.getTime()) &&
            registrationDate >= thirtyDaysAgo &&
            registrationDate <= today
        );

    }).length;


    if (newCustomers) {
        newCustomers.textContent = newCount;
    }

}


// ==========================================
// DISPLAY CUSTOMERS
// ==========================================

function displayCustomers(customerList = customers) {

    const tableBody =
        document.getElementById("customersTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";


    if (customerList.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }


    customerList.forEach(function (customer) {

        const row = document.createElement("tr");

        const customerName = [
            customer.first_name,
            customer.last_name
        ].filter(Boolean).join(" ");


        // CUSTOMER INFORMATION

        const values = [
            customer.customer_id ?? "—",
            customerName || "—",
            customer.email ?? "—",
            customer.phone ?? "—",
            formatCustomerDate(customer.created_at),
            "—"
        ];


        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });


        // ACTION BUTTON

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");

        viewButton.textContent = "View Details";

        viewButton.className = "view-customer-btn";

        viewButton.dataset.customerId = customer.customer_id;

        actionCell.appendChild(viewButton);

        row.appendChild(actionCell);


        tableBody.appendChild(row);

    });

}


// ==========================================
// SEARCH CUSTOMERS
// ==========================================

const customerSearch =
    document.getElementById("customerSearch");

if (customerSearch) {

    customerSearch.addEventListener("input", function () {

        const searchValue =
            customerSearch.value.toLowerCase().trim();


        const filteredCustomers = customers.filter(
            function (customer) {

                const customerName = [
                    customer.first_name,
                    customer.last_name
                ].filter(Boolean).join(" ");


                return (

                    String(customer.customer_id ?? "")
                        .toLowerCase().includes(searchValue) ||

                    customerName.toLowerCase()
                        .includes(searchValue) ||

                    String(customer.email ?? "")
                        .toLowerCase().includes(searchValue) ||

                    String(customer.phone ?? "")
                        .toLowerCase().includes(searchValue)

                );

            }
        );


        displayCustomers(filteredCustomers);

    });

}


// ==========================================
// CUSTOMER DETAILS MODAL
// ==========================================

const customerDetailsModal =
    document.getElementById("customerDetailsModal");

const customerDetailsContent =
    document.getElementById("customerDetailsContent");

const closeCustomerModal =
    document.getElementById("closeCustomerModal");


// CLOSE MODAL

if (closeCustomerModal && customerDetailsModal) {

    closeCustomerModal.addEventListener("click", function () {

        customerDetailsModal.style.display = "none";

    });

}


// CLOSE MODAL OUTSIDE CLICK

if (customerDetailsModal) {

    customerDetailsModal.addEventListener("click", function (event) {

        if (event.target === customerDetailsModal) {

            customerDetailsModal.style.display = "none";

        }

    });

}


// ESCAPE HTML

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// FORMAT ORDER PRICE

function formatOrderPrice(amount, currency) {

    const symbol = currency === "USD" ? "$" : "₹";

    return symbol + Number(amount || 0).toFixed(2);

}


// ==========================================
// VIEW CUSTOMER DETAILS FROM MYSQL
// ==========================================

async function viewCustomerDetails(customerId) {

    const customer = customers.find(function (item) {

        return String(item.customer_id) === String(customerId);

    });


    if (!customer || !customerDetailsModal || !customerDetailsContent) {
        return;
    }


    customerDetailsModal.style.display = "flex";

    customerDetailsContent.innerHTML =
        "Loading customer details...";


    try {

        // FETCH CUSTOMER ORDERS FROM BACKEND

        const response = await fetch(
            "http://127.0.0.1:5000/api/orders/customer/" + encodeURIComponent(customerId)
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load customer details."
            );

        }


        const orders = data.orders || [];

        let ordersHTML = "";


        // NO ORDERS

        if (orders.length === 0) {

            ordersHTML = `
                <p class="no-customer-orders">
                    No orders placed yet.
                </p>
            `;

        } else {


            // DISPLAY CUSTOMER ORDERS

            ordersHTML = orders.map(function (order) {

                const itemsHTML = (order.items || []).map(function (item) {

                    return `
                        <div class="customer-detail-item">

                            <span>
                                ${escapeHTML(item.product_name)}
                            </span>

                            <span>
                                Quantity: ${escapeHTML(item.quantity)}
                            </span>

                            <strong>
                                ${formatOrderPrice(item.subtotal, order.currency)}
                            </strong>

                        </div>
                    `;

                }).join("");


                return `

                    <div class="customer-order-card">

                        <h4>
                            Order #${escapeHTML(order.order_id)}
                        </h4>

                        <p>
                            <strong>Order Date:</strong>
                            ${escapeHTML(formatCustomerDate(order.order_date))}
                        </p>

                        <p>
                            <strong>Order Status:</strong>
                            ${escapeHTML(order.order_status)}
                        </p>

                        <p>
                            <strong>Payment Method:</strong>
                            ${escapeHTML(order.payment_method)}
                        </p>

                        <p>
                            <strong>Payment Status:</strong>
                            ${escapeHTML(order.payment_status)}
                        </p>

                        <p>
                            <strong>Total Amount:</strong>
                            ${formatOrderPrice(order.total_amount, order.currency)}
                        </p>

                        <h4>Ordered Products</h4>

                        ${itemsHTML}


                        <h4>Delivery Address</h4>

                        <p>
                            ${escapeHTML(order.full_name)}<br>
                            ${escapeHTML(order.phone)}<br>
                            ${escapeHTML(order.address_line1)}<br>
                            ${escapeHTML(order.city)},
                            ${escapeHTML(order.state)}
                            - ${escapeHTML(order.pincode)}<br>
                            ${escapeHTML(order.country)}
                        </p>

                    </div>

                `;

            }).join("");

        }


        // CUSTOMER INFORMATION + ORDER HISTORY

        customerDetailsContent.innerHTML = `

            <div class="customer-profile-details">

                <h3>Customer Information</h3>

                <p>
                    <strong>Customer ID:</strong>
                    ${escapeHTML(customer.customer_id)}
                </p>

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(customer.first_name)}
                    ${escapeHTML(customer.last_name)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(customer.email)}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(customer.phone)}
                </p>

                <p>
                    <strong>Registration Date:</strong>
                    ${escapeHTML(formatCustomerDate(customer.created_at))}
                </p>


                <h3>Order History (${orders.length})</h3>

                ${ordersHTML}

            </div>

        `;


    } catch (error) {

        console.error("Customer Details Error:", error);

        customerDetailsContent.textContent =
            "Unable to load customer details. Please try again.";

    }

}


// ==========================================
// VIEW DETAILS BUTTON CLICK
// ==========================================

const customersTableBody =
    document.getElementById("customersTableBody");

if (customersTableBody) {

    customersTableBody.addEventListener("click", function (event) {

        const button = event.target.closest(".view-customer-btn");

        if (!button) return;

        viewCustomerDetails(button.dataset.customerId);

    });

}


// ==========================================
// LOAD CUSTOMERS FROM BACKEND
// ==========================================

async function loadCustomers() {

    const tableBody =
        document.getElementById("customersTableBody");

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/admin/customers/"
        );

        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load customers."
            );

        }


        customers = data.customers || [];

        updateCustomerCounts();

        displayCustomers();


    } catch (error) {

        console.error("Customers API Error:", error);

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        Unable to load customers. Please try again.
                    </td>
                </tr>
            `;

        }

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadCustomers();
