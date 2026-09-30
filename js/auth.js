import { API_BASE_URL } from "./api.js";
function getToken() {
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');

        if (name === 'token') {
            return value;
        }
    }

    return null;
}

function protectPage() {
    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
    }
}



async function getCurrentUser() {
    const token = getToken();

    if (!token) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                window.location.href = "login.html";
                throw new Error('Unauthorized');
            }

            throw new Error('HTTP Error');
        }

        const data = await response.json();

        return data.data;

    } catch (error) {
        console.log(error);
    }
}
const loginForm = document.querySelector('#loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const emailInput = document.querySelector('#email');
        const passwordInput = document.querySelector("#password");

        const loginData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error('HTTP Error');
            }

            const data = await response.json();

            document.cookie = `token=${data.token}; path=/`;

            if (data.token) {
                window.location = "dashboard.html";
            }

        } catch (error) {
            console.log(error);

            const alertContainer = document.querySelector('#alert-container');

            alertContainer.innerText =
                'Login failed. Please check your email and password.';
        }
    });
}

const logoutButton = document.querySelector('#logoutButton');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    });
}

export { getToken, protectPage, getCurrentUser };