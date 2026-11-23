
const API_URL = "http://127.0.0.1:5000/api/contact/admin";

const messagesTableBody = document.getElementById("messagesTableBody");
const messageSearch = document.getElementById("messageSearch");

const totalMessages = document.getElementById("totalMessages");
const newMessages = document.getElementById("newMessages");
const repliedMessages = document.getElementById("repliedMessages");

const messageDetailsModal = document.getElementById("messageDetailsModal");
const messageDetailsContent = document.getElementById("messageDetailsContent");
const closeMessageModal = document.getElementById("closeMessageModal");

let messages = [];

// Format Date
function formatMessageDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Escape HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}


// Update Statistics
function updateMessageStats() {
    totalMessages.textContent = messages.length;

    newMessages.textContent = messages.filter(
        message => message.status === "New"
    ).length;

    repliedMessages.textContent = messages.filter(
        message => message.status === "Replied"
    ).length;
}


// Display Messages
function displayMessages(data) {
    messagesTableBody.innerHTML = "";

    if (!data.length) {
        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No messages found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(message => {
        const row = document.createElement("tr");

        const values = [
            message.message_id,
            message.customer_name,
            message.email,
            message.subject,
            formatMessageDate(message.created_at),
            message.status
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            if (index === 5) {
                const status = document.createElement("span");
                status.textContent = value || "New";
                status.className = "message-status " +
                    String(value || "New").toLowerCase();
                cell.appendChild(status);
            } else {
                cell.textContent = value ?? "—";
            }

            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "View Details";
        viewButton.className = "view-customer-btn";
        viewButton.dataset.messageId = message.message_id;

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        messagesTableBody.appendChild(row);
    });
}


// Load Messages From API
async function loadMessages() {
    messagesTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                Loading messages...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_URL}/all`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load messages.");
        }

        messages = result.messages || [];

        updateMessageStats();
        displayMessages(messages);

    } catch (error) {
        console.error("Messages Loading Error:", error);

        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Unable to load messages. Please try again.
                </td>
            </tr>
        `;
    }
}


// Search Messages
messageSearch.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();

    const filteredMessages = messages.filter(message =>
        String(message.message_id).includes(searchValue) ||
        String(message.customer_name || "").toLowerCase().includes(searchValue) ||
        String(message.email || "").toLowerCase().includes(searchValue) ||
        String(message.subject || "").toLowerCase().includes(searchValue) ||
        String(message.message || "").toLowerCase().includes(searchValue) ||
        String(message.status || "").toLowerCase().includes(searchValue)
    );

    displayMessages(filteredMessages);
});


// View Message Details
async function viewMessageDetails(messageId) {
    const message = messages.find(
        item => String(item.message_id) === String(messageId)
    );

    if (!message) return;

    messageDetailsContent.innerHTML = `
        <div class="customer-profile-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${escapeHTML(message.customer_name)}</p>
            <p><strong>Email:</strong> ${escapeHTML(message.email)}</p>
            <p><strong>Phone:</strong> ${escapeHTML(message.phone || "Not provided")}</p>

            <h3>Message Information</h3>
            <p><strong>Subject:</strong> ${escapeHTML(message.subject)}</p>
            <p><strong>Date:</strong> ${formatMessageDate(message.created_at)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHTML(message.message)}</p>

            <h3>Update Message Status</h3>

            <select id="messageStatusSelect">
                <option value="New" ${message.status === "New" ? "selected" : ""}>New</option>
                <option value="Read" ${message.status === "Read" ? "selected" : ""}>Read</option>
                <option value="Replied" ${message.status === "Replied" ? "selected" : ""}>Replied</option>
            </select>

            <button type="button" id="updateMessageStatusBtn" class="view-customer-btn">
                Update Status
            </button>

            <p id="statusUpdateResult"></p>
        </div>
    `;

    messageDetailsModal.style.display = "flex";

    const statusSelect = document.getElementById("messageStatusSelect");
    const updateButton = document.getElementById("updateMessageStatusBtn");
    const statusResult = document.getElementById("statusUpdateResult");

    updateButton.addEventListener("click", async function () {
        const selectedStatus = statusSelect.value;

        updateButton.disabled = true;
        statusResult.textContent = "Updating...";

        try {
            const response = await fetch(
                `${API_URL}/update/${messageId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: selectedStatus
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Status update failed.");
            }

            message.status = selectedStatus;

            updateMessageStats();
            displayMessages(
                messages.filter(item =>
                    String(item.message_id).includes(messageSearch.value.trim()) ||
                    String(item.customer_name || "").toLowerCase().includes(messageSearch.value.toLowerCase()) ||
                    String(item.email || "").toLowerCase().includes(messageSearch.value.toLowerCase()) ||
                    String(item.subject || "").toLowerCase().includes(messageSearch.value.toLowerCase()) ||
                    String(item.message || "").toLowerCase().includes(messageSearch.value.toLowerCase()) ||
                    String(item.status || "").toLowerCase().includes(messageSearch.value.toLowerCase())
                )
            );

            statusResult.textContent = result.message;

        } catch (error) {
            console.error("Status Update Error:", error);
            statusResult.textContent = error.message;

        } finally {
            updateButton.disabled = false;
        }
    });
}


// Table Button Click
messagesTableBody.addEventListener("click", function (event) {
    const button = event.target.closest(".view-customer-btn");

    if (!button) return;

    viewMessageDetails(button.dataset.messageId);
});


// Close Modal
closeMessageModal.addEventListener("click", function () {
    messageDetailsModal.style.display = "none";
});

messageDetailsModal.addEventListener("click", function (event) {
    if (event.target === messageDetailsModal) {
        messageDetailsModal.style.display = "none";
    }
});


// Mobile Sidebar
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });
}


// Initial Load
loadMessages();
