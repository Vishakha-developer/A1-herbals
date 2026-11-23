
const API_URL = "http://127.0.0.1:5000/api/password/forgot-password";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotEmail = document.getElementById("forgotEmail");
const forgotMessage = document.getElementById("forgotMessage");
const sendResetBtn = document.getElementById("sendResetBtn");


forgotPasswordForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = forgotEmail.value.trim();

    if (!email) {
        forgotMessage.textContent = "Please enter your email address.";
        forgotMessage.style.color = "red";
        return;
    }

    try {

        sendResetBtn.disabled = true;
        sendResetBtn.innerHTML = "Sending...";

        forgotMessage.textContent = "";

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email
            })

        });

        const data = await response.json();

        forgotMessage.textContent = data.message;

        forgotMessage.style.color = response.ok ? "green" : "red";

        if (response.ok) {
            forgotPasswordForm.reset();
        }

    } catch (error) {

        console.error("Forgot Password Error:", error);

        forgotMessage.textContent =
            "Unable to connect to server. Please try again.";

        forgotMessage.style.color = "red";

    } finally {

        sendResetBtn.disabled = false;

        sendResetBtn.innerHTML =
            'Send Reset Link <i class="fa-solid fa-paper-plane"></i>';

    }

});
