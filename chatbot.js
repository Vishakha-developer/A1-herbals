
/* =====================================
   A1 Herbals CHATBOT
===================================== */

// =====================================
// CHATBOT ELEMENTS
// =====================================

const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");

const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");
const chatbotBody = document.getElementById("chatbotBody");


// =====================================
// CHECK CHATBOT ELEMENTS
// =====================================

if (
    chatbotToggle &&
    chatbotWindow &&
    chatbotClose &&
    chatbotInput &&
    chatbotSend &&
    chatbotBody
) {

    // OPEN CHATBOT

    chatbotToggle.addEventListener("click", function () {
        chatbotWindow.classList.add("active");
        chatbotToggle.style.display = "none";
    });


    // CLOSE CHATBOT

    chatbotClose.addEventListener("click", function () {
        chatbotWindow.classList.remove("active");
        chatbotToggle.style.display = "block";
    });


    // =====================================
    // PRODUCT INFORMATION
    // =====================================

    const chatbotProducts = [

        {
            name: "Extra Strong",
            keywords: ["extra strong"],
            type: "Capsules",
            packs: "2, 6, 18 and 30 capsules",
            sku: "EXTSRNG2, EXTSRNG6"
        },

        {
            name: "Dragon",
            keywords: ["dragon"],
            type: "Capsules",
            packs: "6, 18 and 30 capsules",
            sku: "DGN"
        },

        {
            name: "Bull Blood 7500K",
            keywords: ["bull blood 7500k", "bull blood"],
            type: "Tablets",
            packs: "10 tablets",
            sku: "BLBLD"
        },

        {
            name: "Commander Tablets",
            keywords: ["commander tablets", "commander"],
            type: "Tablets",
            packs: "2 tablets",
            sku: "CMDT"
        },

        {
            name: "Blue Force",
            keywords: ["blue force"],
            type: "Tablets",
            packs: "10, 20 and 40 tablets",
            sku: "BLFRC"
        },

        {
            name: "The Player Choice",
            keywords: ["the player choice", "player choice"],
            type: "Tablets",
            packs: "10, 20 and 40 tablets",
            sku: "PLYFLM"
        },

        {
            name: "BluMax",
            keywords: ["blumax"],
            type: "Not confirmed",
            packs: null,
            sku: "BLUMAX"
        },

        {
            name: "Ignite",
            keywords: ["ignite"],
            type: "Not confirmed",
            packs: null,
            sku: "IGNITE"
        },

        {
            name: "Vigorax",
            keywords: ["vigorax"],
            type: "Not confirmed",
            packs: null,
            sku: null
        },

        {
            name: "Krazzy Bull",
            keywords: ["krazzy bull"],
            type: "Not confirmed",
            packs: null,
            sku: null
        },

        {
            name: "Lion King",
            keywords: ["lion king"],
            type: "Tablets",
            packs: "2, 5 and 10 tablets",
            sku: "LNKG"
        },

        {
            name: "Hulk",
            keywords: ["hulk"],
            type: "Tablets",
            packs: "2, 5 and 10 tablets",
            sku: "HLK"
        },

        {
            name: "Angry Bull 10000K",
            keywords: ["angry bull 10000k", "angry bull"],
            type: "Tablets",
            packs: "2, 5 and 10 tablets",
            sku: "AGRBL"
        },

        {
            name: "Premier Zen 50000K",
            keywords: ["premier zen 50000k", "premier zen"],
            type: "Tablets",
            packs: "2, 5 and 10 tablets",
            sku: "PMRZNPTNM"
        },

        {
            name: "Bonner Bears",
            keywords: ["bonner bears"],
            type: "Tablets",
            packs: "2 tablets",
            sku: "BNRBRS"
        },

        {
            name: "VIP Royal",
            keywords: ["vip royal"],
            type: "Capsules",
            packs: "1 unit",
            sku: "VIPRL"
        },

        {
            name: "Throb",
            keywords: ["throb"],
            type: "Tablets",
            packs: "1 unit",
            sku: "THB"
        },

        {
            name: "Mr. Bull Blue Tablets",
            keywords: ["mr. bull blue", "mr bull blue"],
            type: "Tablets",
            packs: "1 unit",
            sku: "MRBL"
        },

        {
            name: "Jack Rabbit",
            keywords: ["jack rabbit"],
            type: "Not confirmed",
            packs: "1 unit",
            sku: "JCKRB"
        },

        {
            name: "Lion Blood",
            keywords: ["lion blood"],
            type: "Not confirmed",
            packs: "1 unit",
            sku: "LNBLD"
        },

        {
            name: "Gold 100K",
            keywords: ["gold 100k"],
            type: "Not confirmed",
            packs: "1 unit",
            sku: "GLD100K"
        },

        {
            name: "Blue Bull",
            keywords: ["blue bull"],
            type: "Honey",
            packs: "15 units",
            sku: "BLBLE"
        }

    ];


    // =====================================
    // FIND PRODUCT
    // =====================================

    function findProduct(question) {

        return chatbotProducts.find(product =>
            Array.isArray(product.keywords) &&
            product.keywords.some(keyword =>
                question.includes(keyword.toLowerCase())
            )
        );

    }


    // =====================================
    // CHATBOT QUESTIONS & ANSWERS
    // =====================================

    function getBotResponse(message) {

        const question = message.toLowerCase().trim();


        // GREETINGS

        if (/^(hello|hi|hey|hello there)[!. ]*$/.test(question)) {
            return "Hello! 👋 Welcome to A1 Herbals. How may I assist you today?";
        }

        if (question.includes("good morning")) {
            return "Good morning! Welcome to A1 Herbals. How may I help you?";
        }

        if (question.includes("good afternoon")) {
            return "Good afternoon! How can I assist you today?";
        }

        if (question.includes("good evening")) {
            return "Good evening! Welcome to A1 Herbals.";
        }


        // BASIC CONVERSATION

        if (question.includes("how are you")) {
            return "I'm doing great, thank you! How can I help you with A1 Herbals today?";
        }

        if (
            question.includes("thank you") ||
            question === "thanks"
        ) {
            return "You're very welcome! Is there anything else I can help you with?";
        }

        if (
            question.includes("your name") ||
            question.includes("who are you")
        ) {
            return "I'm the A1 Herbals Assistant. I can help you with product details, pack sizes, SKUs and website information.";
        }

        if (
            question === "bye" ||
            question.includes("goodbye")
        ) {
            return "Thank you for visiting A1 Herbals! Have a wonderful day.";
        }


        // MEDICAL SAFETY

        if (
            question.includes("dosage") ||
            question.includes("side effect") ||
            question.includes("side effects") ||
            question.includes("what is it used for") ||
            question.includes("medicine for") ||
            question.includes("how to take") ||
            question.includes("can i take") ||
            question.includes("is it safe") ||
            question.includes("treatment")
        ) {
            return "For information about medical uses, dosage, safety or side effects, please consult a qualified healthcare professional. I can help with verified product and packaging information.";
        }


        // ALL PRODUCTS

        if (
            question.includes("what products") ||
            question.includes("products available") ||
            question.includes("show all products") ||
            question.includes("product list") ||
            question.includes("all products")
        ) {

            const productNames = chatbotProducts
                .map(product => product.name)
                .join(", ");

            return "Our listed product collection includes: " +
                productNames +
                ". Please visit our Products page to explore the collection.";
        }


        // PRODUCT CATEGORY

        if (
            question.includes("category") ||
            question.includes("categories")
        ) {
            return "Our listed product categories include Capsules, Tablets and Other Products. You can explore them on our Products page.";
        }


        // FIND PRODUCT

        const product = findProduct(question);


        // SKU QUESTIONS

        if (
            question.includes("sku") ||
            question.includes("product code") ||
            question.includes("code number")
        ) {

            if (!product) {
                return "Which product's SKU would you like to know? Please enter the product name.";
            }

            if (!product.sku) {
                return "The SKU for " + product.name + " has not been confirmed yet.";
            }

            return "The SKU for " + product.name + " is " + product.sku + ".";
        }


        // PACK SIZE QUESTIONS

        if (
            question.includes("pack size") ||
            question.includes("available size") ||
            question.includes("quantity") ||
            question.includes("how many") ||
            question.includes("pack options")
        ) {

            if (!product) {
                return "Please tell me the product name so I can check its available pack information.";
            }

            if (!product.packs) {
                return "The available pack-size information for " + product.name + " has not been confirmed yet.";
            }

            return product.name +
                " is available in the following listed pack options: " +
                product.packs + ".";
        }


        // PRICE QUESTIONS

        if (
            question.includes("price") ||
            question.includes("cost") ||
            question.includes("how much") ||
            question.includes("selling price")
        ) {
            return "Please select your country on our website to view the applicable currency and product prices. I don't want to provide an unconfirmed price.";
        }


        // COUNTRY QUESTIONS

        if (
            question.includes("country") ||
            question.includes("india") ||
            question.includes("usa") ||
            question.includes("united states") ||
            question.includes("available in")
        ) {
            return "Your selected country determines which products are displayed. You can use the country selector on our website to view the relevant collection.";
        }


        // CONTACT QUESTIONS

        if (
            question.includes("contact") ||
            question.includes("customer support") ||
            question.includes("customer care")
        ) {
            return "For further assistance, please visit the Contact Us page on our website.";
        }


        // PRODUCT INFORMATION

        if (product) {

            let response = product.name + " is ";

            if (product.type !== "Not confirmed") {
                response += "listed as a " +
                    product.type.toLowerCase() + " product. ";
            } else {
                response += "one of our listed products. ";
            }

            if (product.packs) {
                response += "Available listed quantity: " +
                    product.packs + ".";
            } else {
                response += "Further product and pack-size details are not confirmed yet.";
            }

            return response;
        }


        // WEBSITE HELP

        if (
            question.includes("website") ||
            question.includes("how to order") ||
            question.includes("shopping")
        ) {
            return "You can browse products, select your preferred items and explore the shopping options on our website.";
        }


        // DEFAULT RESPONSE

        return "I'm sorry, I couldn't find a verified answer to that question. Could you please rephrase it or mention a product name?";

    }


    // =====================================
    // SEND MESSAGE
    // =====================================

    function sendMessage() {

        const message = chatbotInput.value.trim();

        if (message === "") {
            return;
        }


        // USER MESSAGE

        const userMessage = document.createElement("div");

        userMessage.className = "user-message";
        userMessage.textContent = message;

        chatbotBody.appendChild(userMessage);


        // CLEAR INPUT

        chatbotInput.value = "";


        // BOT RESPONSE

        const botMessage = document.createElement("div");

        botMessage.className = "bot-message";
        botMessage.textContent = getBotResponse(message);

        chatbotBody.appendChild(botMessage);


        // SCROLL TO LATEST MESSAGE

        chatbotBody.scrollTop = chatbotBody.scrollHeight;

    }


    // SEND BUTTON

    chatbotSend.addEventListener("click", sendMessage);


    // ENTER KEY

    chatbotInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    });

} else {

    console.error("Chatbot HTML elements are missing. Please check the chatbot IDs.");

}
