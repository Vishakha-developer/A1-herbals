
const API_URL = "http://127.0.0.1:5000/api";

let products = [];
let categories = [];

const productTableBody = document.getElementById("productTableBody");
const productForm = document.getElementById("productForm");
const productModal = document.getElementById("productModal");
const productSearch = document.getElementById("productSearch");

const addProductBtn = document.getElementById("addProductBtn");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");

const modalTitle = document.getElementById("modalTitle");
const editProductId = document.getElementById("editProductId");

const productName = document.getElementById("productName");
const productSKU = document.getElementById("productSKU");
const productStock = document.getElementById("productStock");
const productCategory = document.getElementById("productCategory");
const productImage = document.getElementById("productImage");
const priceINR = document.getElementById("priceINR");
const priceUSD = document.getElementById("priceUSD");
const availableIndia = document.getElementById("availableIndia");
const availableUSA = document.getElementById("availableUSA");
const productDescription = document.getElementById("productDescription");


// CHECK REQUIRED HTML ELEMENTS
const requiredElements = [
    productTableBody,
    productForm,
    productModal,
    productSearch,
    addProductBtn,
    closeModal,
    cancelModal,
    modalTitle,
    editProductId,
    productName,
    productSKU,
    productStock,
    productCategory,
    productImage,
    priceINR,
    priceUSD,
    availableIndia,
    availableUSA,
    productDescription
];

if (requiredElements.some(element => !element)) {
    console.error("Some product form HTML elements are missing. Check products.html.");
}


// LOAD CATEGORIES
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories/`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load categories");
        }

        categories = data.categories || [];

        productCategory.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Category";

        productCategory.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.category_id;
            option.textContent = category.category_name;

            productCategory.appendChild(option);
        });

        document.getElementById("totalCategories").textContent =
            categories.length;

    } catch (error) {
        console.error("Category Error:", error);
        alert("Unable to load categories. Please check backend.");
    }
}


// LOAD PRODUCTS
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load products");
        }

        products = data.products || [];

        updateSummary();
        displayProducts(products);

    } catch (error) {
        console.error("Product Error:", error);

        products = [];
        updateSummary();

        productTableBody.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Unable to load products. Please check backend.";

        row.appendChild(cell);
        productTableBody.appendChild(row);
    }
}


// UPDATE SUMMARY
function updateSummary() {
    document.getElementById("totalProducts").textContent = products.length;

    const availableProducts = products.filter(
        product => product.status === "active"
    ).length;

    document.getElementById("availableProducts").textContent =
        availableProducts;
}


// GET CATEGORY NAME
function getCategoryName(categoryId) {
    const category = categories.find(
        item => Number(item.category_id) === Number(categoryId)
    );

    return category ? category.category_name : "—";
}


// CHECK AVAILABILITY VALUE
function isAvailable(value) {
    return value === 1 || value === "1" || value === true;
}


// DISPLAY PRODUCTS
function displayProducts(list) {
    productTableBody.innerHTML = "";

    if (list.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No products available.";

        row.appendChild(cell);
        productTableBody.appendChild(row);

        return;
    }

    list.forEach(product => {

        const row = document.createElement("tr");

        // PRODUCT NAME AND SKU
        const productCell = document.createElement("td");
        productCell.className = "product-cell";

        if (product.product_image) {
            const image = document.createElement("img");

            image.src = product.product_image;
            image.alt = product.product_name || "Product";

            image.onerror = function () {
                this.style.display = "none";
            };

            productCell.appendChild(image);
        }

        const productDetails = document.createElement("div");

        const name = document.createElement("span");
        name.textContent = product.product_name || "—";

        const sku = document.createElement("small");
        sku.textContent = product.sku
            ? `SKU: ${product.sku}`
            : "SKU: —";

        sku.style.display = "block";
        sku.style.color = "#89948c";
        sku.style.marginTop = "4px";
        sku.style.fontSize = "10px";

        productDetails.append(name, sku);
        productCell.appendChild(productDetails);


        // STOCK
        const stockCell = document.createElement("td");
        stockCell.textContent = product.stock_quantity ?? 0;


        // CATEGORY
        const categoryCell = document.createElement("td");

        const categoryLabel = document.createElement("span");
        categoryLabel.className = "category-label";
        categoryLabel.textContent = product.category_name ||
            getCategoryName(product.category_id);

        categoryCell.appendChild(categoryLabel);


        // INDIA AND USA PRICES
        const priceCell = document.createElement("td");

        const indiaPrice = document.createElement("div");
        indiaPrice.textContent =
            `₹${Number(product.price_in || 0).toFixed(2)}`;

        const usaPrice = document.createElement("div");
        usaPrice.textContent =
            `$${Number(product.price_us || 0).toFixed(2)}`;

        usaPrice.style.marginTop = "5px";
        usaPrice.style.color = "#68746c";

        priceCell.append(indiaPrice, usaPrice);


        // STATUS AND COUNTRY AVAILABILITY
        const statusCell = document.createElement("td");

        const status = document.createElement("div");
        status.textContent = product.status || "—";
        status.style.fontWeight = "600";

        const countryStatus = document.createElement("small");

        const countries = [];

        if (isAvailable(product.available_in)) {
            countries.push("India");
        }

        if (isAvailable(product.available_us)) {
            countries.push("USA");
        }

        countryStatus.textContent = countries.length
            ? countries.join(" / ")
            : "Not available";

        countryStatus.style.display = "block";
        countryStatus.style.marginTop = "5px";
        countryStatus.style.color = "#89948c";
        countryStatus.style.fontSize = "10px";

        statusCell.append(status, countryStatus);


        // ACTIONS
        const actionCell = document.createElement("td");
        actionCell.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = "Edit Product";

        editButton.addEventListener("click", () => {
            editProduct(product.product_id);
        });


        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = "Delete Product";

        deleteButton.addEventListener("click", () => {
            deleteProduct(product.product_id);
        });

        actionCell.append(editButton, deleteButton);


        row.append(
            productCell,
            stockCell,
            categoryCell,
            priceCell,
            statusCell,
            actionCell
        );

        productTableBody.appendChild(row);
    });
}


// OPEN MODAL
function openProductModal() {
    productForm.reset();

    editProductId.value = "";
    modalTitle.textContent = "Add Product";

    productModal.classList.add("active");
}


// CLOSE MODAL
function hideProductModal() {
    productModal.classList.remove("active");

    productForm.reset();
    editProductId.value = "";
}


// EDIT PRODUCT
function editProduct(id) {
    const product = products.find(
        item => Number(item.product_id) === Number(id)
    );

    if (!product) return;

    openProductModal();

    modalTitle.textContent = "Edit Product";

    editProductId.value = product.product_id;

    productName.value = product.product_name || "";
    productSKU.value = product.sku || "";
    productStock.value = product.stock_quantity ?? 0;
    productCategory.value = product.category_id ?? "";
    productImage.value = product.product_image || "";

    priceINR.value = product.price_in ?? product.price ?? "";
    priceUSD.value = product.price_us ?? "";

    availableIndia.checked = isAvailable(product.available_in);
    availableUSA.checked = isAvailable(product.available_us);

    productDescription.value = product.description || "";
}


// ADD / UPDATE PRODUCT
productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const categoryId = productCategory.value;

    if (!categoryId) {
        alert("Please select a category.");
        return;
    }

    const productData = {
        product_name: productName.value.trim(),
        sku: productSKU.value.trim(),
        category_id: Number(categoryId),
        description: productDescription.value.trim(),

        price: Number(priceINR.value),
        price_in: Number(priceINR.value),
        price_us: Number(priceUSD.value),

        available_in: availableIndia.checked ? 1 : 0,
        available_us: availableUSA.checked ? 1 : 0,

        stock_quantity: Number(productStock.value),
        product_image: productImage.value.trim(),
        status: "active"
    };


    // VALIDATION
    if (
        !productData.product_name ||
        !productData.description ||
        !productData.product_image ||
        priceINR.value.trim() === "" ||
        priceUSD.value.trim() === "" ||
        productStock.value.trim() === "" ||
        !Number.isFinite(productData.price_in) ||
        !Number.isFinite(productData.price_us) ||
        !Number.isFinite(productData.stock_quantity) ||
        productData.price_in < 0 ||
        productData.price_us < 0 ||
        productData.stock_quantity < 0
    ) {
        alert("Please enter valid product details.");
        return;
    }

    if (!productData.available_in && !productData.available_us) {
        alert("Please select at least one country for product availability.");
        return;
    }


    const id = editProductId.value;
    const isEditing = Boolean(id);

    const url = isEditing
        ? `${API_URL}/products/${id}`
        : `${API_URL}/products/`;

    const method = isEditing ? "PUT" : "POST";


    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Product save failed");
        }

        alert(
            isEditing
                ? "Product updated successfully!"
                : "Product added successfully!"
        );

        hideProductModal();

        await loadProducts();

    } catch (error) {
        console.error("Save Error:", error);
        alert(error.message);
    }
});


// DELETE PRODUCT
async function deleteProduct(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Product delete failed");
        }

        alert("Product deleted successfully!");

        await loadProducts();

    } catch (error) {
        console.error("Delete Error:", error);
        alert(error.message);
    }
}


// SEARCH PRODUCTS
productSearch.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {

        const categoryName = getCategoryName(product.category_id);

        return (
            (product.product_name || "").toLowerCase().includes(searchValue) ||
            (product.sku || "").toLowerCase().includes(searchValue) ||
            (product.description || "").toLowerCase().includes(searchValue) ||
            categoryName.toLowerCase().includes(searchValue)
        );
    });

    displayProducts(filteredProducts);
});


// MODAL EVENTS
addProductBtn.addEventListener("click", openProductModal);
closeModal.addEventListener("click", hideProductModal);
cancelModal.addEventListener("click", hideProductModal);


// CLOSE MODAL ON BACKGROUND CLICK
productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
        hideProductModal();
    }
});


// SIDEBAR TOGGLE
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });
}


// INITIAL LOAD
async function initializeProductsPage() {
    await loadCategories();
    await loadProducts();
}

initializeProductsPage();
