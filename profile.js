
/* ==============================
   LOAD USER PROFILE
================================ */

// Check login status
const isLoggedIn = localStorage.getItem("isLoggedIn");

const registeredUser = JSON.parse(
    localStorage.getItem("registeredUser") || "null"
);

// Redirect if user is not logged in
if (isLoggedIn !== "true" || !registeredUser) {

    alert("Please login to access your profile.");

    window.location.href = "login.html";

} else {

    // Display user name
    document.getElementById("profileName").textContent =
        registeredUser.name;

    document.getElementById("detailName").textContent =
        registeredUser.name;

    // Display email
    document.getElementById("detailEmail").textContent =
        registeredUser.email;

    // Display mobile number
    document.getElementById("detailMobile").textContent =
        registeredUser.mobile;

    // Display country
    const countryNames = {
        IN: "India 🇮🇳",
        US: "USA 🇺🇸"
    };

    document.getElementById("detailCountry").textContent =
        countryNames[registeredUser.country] || "Not selected";

}



/* ==============================
   EDIT PROFILE
================================ */

const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileForm = document.getElementById("editProfileForm");

const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editMobile = document.getElementById("editMobile");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");


/* Open Edit Form */

editProfileBtn.addEventListener("click", function () {

    editName.value = registeredUser.name;
    editEmail.value = registeredUser.email;
    editMobile.value = registeredUser.mobile;

    editProfileForm.style.display = "block";

    editProfileForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


/* Save Updated Details */

saveProfileBtn.addEventListener("click", function () {

    const updatedName = editName.value.trim();
    const updatedEmail = editEmail.value.trim();
    const updatedMobile = editMobile.value.trim();

    if (!updatedName || !updatedEmail || !updatedMobile) {

        alert("Please fill in all fields.");
        return;

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedEmail)) {

        alert("Please enter a valid email address.");
        return;

    }

    // Update user details
    registeredUser.name = updatedName;
    registeredUser.email = updatedEmail;
    registeredUser.mobile = updatedMobile;

    // Save updated information
    localStorage.setItem(
        "registeredUser",
        JSON.stringify(registeredUser)
    );

    // Update profile display
    document.getElementById("profileName").textContent = updatedName;
    document.getElementById("detailName").textContent = updatedName;
    document.getElementById("detailEmail").textContent = updatedEmail;
    document.getElementById("detailMobile").textContent = updatedMobile;

    // Hide form
    editProfileForm.style.display = "none";

    alert("Profile updated successfully!");

});


/* Cancel Editing */

cancelEditBtn.addEventListener("click", function () {

    editProfileForm.style.display = "none";

});


/* ==============================
   LOGOUT
================================ */

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (confirmLogout) {

        localStorage.removeItem("isLoggedIn");

        alert("You have been logged out successfully!");

        window.location.href = "../index.html";

    }

});


/* ==============================
   CHANGE PASSWORD FORM
================================ */

const changePasswordBtn = document.getElementById("changePasswordBtn");

const changePasswordForm = document.getElementById("changePasswordForm");

const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");


/* Open Change Password Form */

changePasswordBtn.addEventListener("click", function () {

    changePasswordForm.style.display = "block";

    changePasswordForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


/* Close Change Password Form */

cancelPasswordBtn.addEventListener("click", function () {

    changePasswordForm.style.display = "none";

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";

});
