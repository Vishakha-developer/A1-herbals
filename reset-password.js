
const API_URL = "http://127.0.0.1:5000/api/password/reset-password";

const resetForm = document.getElementById("resetPasswordForm");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const resetMessage = document.getElementById("resetMessage");
const resetButton = document.getElementById("resetPasswordBtn");


// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get("token");


resetForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    resetMessage.textContent = "";

    // Check reset token
    if (!resetToken) {
        resetMessage.textContent =
            "Invalid reset link. Please request a new password reset link.";

        resetMessage.style.color = "red";
        return;
    }

    const password = newPassword.value;
    const confirm = confirmPassword.value;

    // Check password match
    if (password !== confirm) {

        resetMessage.textContent = "Passwords do not match.";
        resetMessage.style.color = "red";

        return;
    }

    // Check password length
    if (password.length < 8) {

        resetMessage.textContent =
            "Password must contain at least 8 characters.";

        resetMessage.style.color = "red";
        return;
    }

    try {

        resetButton.disabled = true;
        resetButton.innerHTML = "Resetting...";

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                token: resetToken,
                new_password: password

            })

        });

        const data = await response.json();

        resetMessage.textContent = data.message;

        resetMessage.style.color = response.ok ? "green" : "red";

        if (response.ok) {

            resetForm.reset();

            resetButton.disabled = true;

            setTimeout(function() {
                window.location.href = "login.html";
            }, 2000);

        }

    } catch (error) {

        console.error("Reset Password Error:", error);

        resetMessage.textContent =
            "Unable to connect to server. Please try again.";

        resetMessage.style.color = "red";

    } finally {

        if (!resetMessage.textContent.includes("successfully")) {

            resetButton.disabled = false;

            resetButton.innerHTML =
                'Reset Password <i class="fa-solid fa-arrow-right"></i>';

        }

    }

});
