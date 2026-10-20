import { protectPage, getCurrentUser } from "./auth.js";

const dashboardPage = document.querySelector('#dashboardPage');

if (dashboardPage) {
    protectPage();
    loadDashboard();
}

async function loadDashboard() {

    try {
    const data = await getCurrentUser();

    if (!data) {
        return;
    }

    const currentUser = data.user;
    const stats = data.stats;

    const activeLoansElement = document.querySelector('#activeLoans');
    const availableBooksElement = document.querySelector('#availableBooks');

    if (activeLoansElement) {
        activeLoansElement.innerText = stats.activeLoans;
    }

    if (availableBooksElement) {
        availableBooksElement.innerText = stats.availableBooks;
    }

    const userName = document.querySelector('#userName');
    const studentName = document.querySelector('#studentName');

    if (userName) {
        userName.innerText = currentUser.firstName + " " + currentUser.lastName;
    }

    if (studentName) {
        studentName.innerText = currentUser.firstName + " " + currentUser.lastName;
    }

    const userAvatar = document.querySelector('#userAvatar');

    if (userAvatar) {
        userAvatar.innerText = currentUser.firstName.charAt(0);
    }

}
catch (error) {
        console.error("Failed to load dashboard:", error);

        const errorMessage = document.querySelector('#dashboardError');

        if (errorMessage) {
            errorMessage.textContent =
                "Failed to load dashboard data. Please try again.";
            errorMessage.style.display = 'block';
        }
    }

}