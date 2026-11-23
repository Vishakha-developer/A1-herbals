
const API_URL = "http://127.0.0.1:5000/api/newsletter/admin/all";

const subscribersTableBody = document.getElementById("subscribersTableBody");
const totalSubscribers = document.getElementById("totalSubscribers");
const activeSubscribers = document.getElementById("activeSubscribers");
const unsubscribedSubscribers = document.getElementById("unsubscribedSubscribers");
const subscriberSearch = document.getElementById("subscriberSearch");
const noSubscribers = document.getElementById("noSubscribers");

let subscribers = [];

// Escape HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

// Format Date
function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Load Subscribers
async function loadSubscribers() {

    try {

        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Unable to load subscribers.");
        }

        subscribers = result.subscribers || [];

        updateStatistics();
        displaySubscribers(subscribers);

    } catch (error) {

        console.error("Newsletter Subscribers Error:", error);

        subscribersTableBody.innerHTML = `
            <tr>
                <td colspan="4">Unable to load subscribers. Please try again.</td>
            </tr>
        `;

    }
}

// Update Statistics
function updateStatistics() {

    const total = subscribers.length;

    const active = subscribers.filter(
        subscriber => subscriber.status === "Subscribed"
    ).length;

    const unsubscribed = subscribers.filter(
        subscriber => subscriber.status === "Unsubscribed"
    ).length;

    totalSubscribers.textContent = total;
    activeSubscribers.textContent = active;
    unsubscribedSubscribers.textContent = unsubscribed;
}

// Display Subscribers
function displaySubscribers(data) {

    subscribersTableBody.innerHTML = "";

    if (data.length === 0) {

        noSubscribers.style.display = "block";
        return;

    }

    noSubscribers.style.display = "none";

    data.forEach((subscriber, index) => {

        const status = subscriber.status || "Unknown";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>${escapeHTML(subscriber.email)}</td>

            <td>${formatDate(subscriber.subscribed_at)}</td>

            <td>
                <span class="message-status ${status === "Subscribed" ? "status-replied" : "status-new"}">
                    ${escapeHTML(status)}
                </span>
            </td>
        `;

        subscribersTableBody.appendChild(row);

    });

}

// Search Subscribers
subscriberSearch.addEventListener("input", function () {

    const searchValue = this.value.toLowerCase().trim();

    const filteredSubscribers = subscribers.filter(subscriber =>
        String(subscriber.email || "").toLowerCase().includes(searchValue)
    );

    displaySubscribers(filteredSubscribers);

});

// Sidebar Toggle
const sidebarToggle = document.getElementById("sidebarToggle");
const adminSidebar = document.getElementById("adminSidebar");

if (sidebarToggle && adminSidebar) {

    sidebarToggle.addEventListener("click", function () {
        adminSidebar.classList.toggle("active");
    });

}

// Initialize
loadSubscribers();
