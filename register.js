
const registerForm = document.getElementById("registerForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const registerCountry = document.getElementById("registerCountry");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const API_URL = "http://127.0.0.1:5000/api/customers/register";
registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nameValue = fullName.value.trim();
    const emailValue = email.value.trim().toLowerCase();
    const mobileValue = mobile.value.trim();
    const countryCode = registerCountry.value;
    const passwordValue = password.value;

    if (nameValue.length < 3) {
        alert("Please enter a valid full name.");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobileValue)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    if (passwordValue.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    if (passwordValue !== confirmPassword.value) {
        alert("Passwords do not match!");
        return;
    }

    if (!countryCode) {
        alert("Please select your country.");
        return;
    }

    const nameParts = nameValue.split(/\s+/);

    const firstName = nameParts.shift();
    const lastName = nameParts.join(" ");

    const registerButton = registerForm.querySelector(
        'button[type="submit"]'
    );

    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                first_name: firstName,
                last_name: lastName,
                email: emailValue,
                phone: mobileValue,
                password: passwordValue

            })

        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Registration failed."
            );
        }

        localStorage.setItem("selectedCountry", countryCode);

        alert("Your account has been created successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error("Registration API Error:", error);

        alert(error.message || "Unable to create account. Please try again.");

    } finally {

        registerButton.disabled = false;
        registerButton.textContent = "Create Account";

    }

});
