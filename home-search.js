const homeSearchInput = document.getElementById("homeProductSearch");
const homeSearchButton = document.getElementById("homeSearchBtn");

function searchHomeProducts() {

    const searchValue = homeSearchInput.value.trim();

    if (searchValue === "") {
        homeSearchInput.focus();
        return;
    }

    window.location.href =
        "pages/products.html?search=" + encodeURIComponent(searchValue);
}


// Search button click
if (homeSearchButton) {
    homeSearchButton.addEventListener("click", searchHomeProducts);
}


// Enter key search
if (homeSearchInput) {
    homeSearchInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            searchHomeProducts();
        }

    });
}