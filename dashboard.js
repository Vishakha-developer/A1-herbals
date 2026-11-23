
// ==========================================
// A1 Herbals - DASHBOARD
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
// LOAD DASHBOARD DATA FROM BACKEND API
// ==========================================

async function loadDashboardData() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/admin/dashboard"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load dashboard data");
        }

        const dashboard = data.dashboard;


        // TOTAL PRODUCTS
        document.getElementById("dashboardTotalProducts").textContent =
            dashboard.total_products;


        // TOTAL CATEGORIES
        document.getElementById("dashboardTotalCategories").textContent =
            dashboard.total_categories;


        // TOTAL ORDERS
        document.getElementById("dashboardTotalOrders").textContent =
            dashboard.total_orders;


        // TOTAL CUSTOMERS
        document.getElementById("dashboardTotalCustomers").textContent =
            dashboard.total_customers;


        // TOTAL REVENUE
        document.getElementById("dashboardTotalRevenue").textContent =
            "₹" + Number(dashboard.total_revenue).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });


        // RECENT ORDERS
        const recentOrders =
            document.getElementById("dashboardRecentOrders");

        recentOrders.innerHTML = "";

        if (dashboard.recent_orders.length === 0) {

            recentOrders.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-data">
                        <i class="fa-solid fa-inbox"></i>
                        <p>No orders available yet</p>
                    </td>
                </tr>
            `;

        } else {

            dashboard.recent_orders.forEach(function (order) {

                const row = document.createElement("tr");

                const values = [
                    order.order_id,
                    order.customer_name,
                    order.order_date,
                    "₹" + Number(order.total_amount).toFixed(2),
                    order.order_status
                ];

                values.forEach(function (value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);

                });

                recentOrders.appendChild(row);

            });

        }

    } catch (error) {

        console.error("Dashboard API Error:", error);

    }

}


// ==========================================
// INITIAL DASHBOARD LOAD
// ==========================================

loadDashboardData();
