
const loginForm = document.getElementById("adminLoginForm");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");

const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");


// Show / Hide Password
togglePassword.addEventListener("click", function () {

    if (adminPassword.type === "password") {
        adminPassword.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    } else {
        adminPassword.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
    }

});


// Actual Admin Login API
loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = adminEmail.value.trim();
    const password = adminPassword.value;

    loginMessage.textContent = "Please wait...";
    loginMessage.style.color = "#555";

    try {

        const response = await fetch("http://127.0.0.1:5000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {

            loginMessage.textContent = "Login successful! Redirecting...";
            loginMessage.style.color = "#16834a";

            sessionStorage.setItem("adminLoggedIn", "true");
            sessionStorage.setItem("adminId", data.admin.admin_id);
            sessionStorage.setItem("adminName", data.admin.name);
            sessionStorage.setItem("adminEmail", data.admin.email);

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } else {

            loginMessage.textContent = data.message || "Invalid email or password.";
            loginMessage.style.color = "red";

        }

    } catch (error) {

        loginMessage.textContent = "Unable to connect to server. Please try again.";
        loginMessage.style.color = "red";

        console.error("Admin Login Error:", error);

    }

});
