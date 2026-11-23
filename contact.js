
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector(".send-message-btn");

    const contactData = {
        customer_name: document.getElementById("contactName").value.trim(),
        email: document.getElementById("contactEmail").value.trim(),
        subject: document.getElementById("contactSubject").value.trim(),
        message: document.getElementById("contactMessage").value.trim()
    };

    if (
        !contactData.customer_name ||
        !contactData.email ||
        !contactData.subject ||
        !contactData.message
    ) {
        alert("Please fill all required fields!");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/contact/submit",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contactData)
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Message submission failed.");
        }

        alert(result.message);
        contactForm.reset();

    } catch (error) {
        console.error("Contact Form Error:", error);
        alert(error.message || "Unable to submit your message. Please try again.");

    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
    }
});
