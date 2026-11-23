
const NEWSLETTER_API = "http://127.0.0.1:5000/api/newsletter";

const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");

if (newsletterForm && newsletterEmail) {

    newsletterForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = newsletterEmail.value.trim();

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        const submitButton = newsletterForm.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.textContent = "Subscribing...";

        try {

            const response = await fetch(`${NEWSLETTER_API}/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email })
            });

            const result = await response.json();

            if (response.ok && result.success) {

                alert(result.message);
                newsletterForm.reset();

            } else {

                alert(result.message || "Subscription failed. Please try again.");

            }

        } catch (error) {

            console.error("Newsletter Error:", error);
            alert("Unable to connect to the server. Please try again later.");

        } finally {

            submitButton.disabled = false;
            submitButton.innerHTML = `Subscribe <i class="fa-solid fa-arrow-right"></i>`;

        }

    });

}
