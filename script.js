
/* ==============================
   HERO SLIDER
================================ */

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");

let currentSlide = 0;
let sliderInterval;

function showSlide(index) {

    if (!slides.length || !dots.length) return;

    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function startSlider() {

    clearInterval(sliderInterval);

    if (slides.length > 1) {
        sliderInterval = setInterval(nextSlide, 4000);
    }
}

if (slides.length && dots.length) {

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            prevSlide();
            startSlider();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            nextSlide();
            startSlider();
        });
    }

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {
            showSlide(index);
            startSlider();
        });

    });

    startSlider();
}


/* ==============================
   COUNTRY & CURRENCY SELECTION
================================ */

const countryBtn = document.getElementById("countryBtn");
const countryDropdown = document.getElementById("countryDropdown");

const countryFlag = document.getElementById("countryFlag");
const countryName = document.getElementById("countryName");
const countryCurrency = document.getElementById("countryCurrency");

const countryOptions = document.querySelectorAll(".country-option");

const countries = {

    IN: {
        name: "India",
        flag: "🇮🇳",
        currency: "₹"
    },

    US: {
        name: "USA",
        flag: "🇺🇸",
        currency: "$"
    }

};


/* ==============================
   COUNTRY BASED PRODUCT FILTER
================================ */

function filterProductsByCountry(countryCode) {

    const productCards = document.querySelectorAll(
        ".product-card[data-country]"
    );

    productCards.forEach(card => {

        const availability = card.dataset.country;

        if (
            !countryCode ||
            availability === "BOTH" ||
            availability === countryCode
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


/* ==============================
   UPDATE COUNTRY
================================ */

function updateCountry(countryCode) {

    const country = countries[countryCode];

    if (!country) return;

    if (countryFlag) {
        countryFlag.textContent = country.flag;
    }

    if (countryName) {
        countryName.textContent = country.name;
    }

    if (countryCurrency) {
        countryCurrency.textContent = country.currency;
    }

    // Save selected country
    localStorage.setItem("selectedCountry", countryCode);

    window.selectedCountry = countryCode;
    window.selectedCurrency = country.currency;

    // Apply country-based product filter
    filterProductsByCountry(countryCode);

}


/* ==============================
   COUNTRY DROPDOWN
================================ */

if (countryBtn && countryDropdown) {

    countryBtn.addEventListener("click", () => {

        countryDropdown.classList.toggle("show");

    });


    /* Manual country selection */

    countryOptions.forEach(option => {

        option.addEventListener("click", () => {

            const selectedCode = option.dataset.country;

            updateCountry(selectedCode);

            countryDropdown.classList.remove("show");

        });

    });


    /* Close dropdown when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            !countryBtn.contains(event.target) &&
            !countryDropdown.contains(event.target)
        ) {

            countryDropdown.classList.remove("show");

        }

    });

}


/* ==============================
   RESTORE SAVED COUNTRY
================================ */

// Get country saved during registration
const savedCountry = localStorage.getItem("selectedCountry");

if (savedCountry && countries[savedCountry]) {

    // Automatically apply saved country
    updateCountry(savedCountry);

} else {

    // No country selected
    if (countryFlag) {
        countryFlag.textContent = "🌍";
    }

    if (countryName) {
        countryName.textContent = "Select Country";
    }

    if (countryCurrency) {
        countryCurrency.textContent = "";
    }

    window.selectedCountry = "";
    window.selectedCurrency = "";

    filterProductsByCountry("");

}


/* ==============================
   SAMPLE PRODUCT DATA
================================ */

const products = [

    {
        name: "Extra Strong",
        availableIn: ["IN"]
    },

    {
        name: "Dragon",
        availableIn: ["IN"]
    },

    {
        name: "Lion King",
        availableIn: ["US"]
    }

];


function filterProducts(countryCode) {

    if (!countryCode) {
        return products;
    }

    return products.filter(product =>
        product.availableIn.includes(countryCode)
    );

}


/* ==============================
   DISPLAY LOGGED-IN USER NAME
================================ */

const accountLink = document.getElementById("accountLink");
const accountText = document.getElementById("accountText");

const registeredUser = JSON.parse(
    localStorage.getItem("registeredUser") || "null"
);

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (accountLink && accountText) {

    if (isLoggedIn === "true" && registeredUser) {

        accountText.textContent = registeredUser.name;

        accountLink.href = "pages/profile.html";

    } else {

        accountText.textContent = "Account";

        accountLink.href = "pages/login.html";

    }

}
