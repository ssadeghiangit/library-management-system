import { API_BASE_URL } from "./api.js";
import { getToken, getCurrentUser, protectPage } from "./auth.js";

const booksContainer = document.querySelector('#booksContainer');

if (booksContainer) {
    protectPage();
}

async function loadBooks() {
    const booksLoading = document.querySelector('#booksLoading');
    const token = getToken();

    try {
        const cachedBooks = localStorage.getItem('books');
        const cachedTimestamp = localStorage.getItem('booksTimestamp');

        let books;

        if (
            cachedBooks &&
            cachedTimestamp &&
            Date.now() - Number(cachedTimestamp) < 5 * 60 * 1000
        ) {
            books = JSON.parse(cachedBooks);
        } else {
            const response = await fetch(`${API_BASE_URL}/books`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('HTTP Error');
            }

            const data = await response.json();

            books = data.data;

            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('booksTimestamp', Date.now());
        }

        await showBooks(books);

    } catch (error) {
        console.log(error);
    } finally {
        booksLoading.style.display = 'none';
    }
}

async function showBooks(books) {
    const userData = await getCurrentUser();

    if (!userData) {
        return;
    }

    const currentUser = userData.user;
    const token = getToken();

    for (const book of books) {

        const bookCard = document.createElement('div');
        bookCard.classList.add('card');

        const titleRow = document.createElement('div');
        titleRow.style.display = 'flex';
        titleRow.style.justifyContent = 'space-between';
        titleRow.style.alignItems = 'flex-start';
        titleRow.style.width = '100%';

        const bookTitle = document.createElement('h3');
        bookTitle.innerText = book.title;

        const status = document.createElement('span');
        status.classList.add(
            'status',
            book.available ? 'status-available' : 'status-unavailable'
        );
        status.innerText = book.available ? 'Available' : 'Unavailable';

        titleRow.append(bookTitle);
        titleRow.append(status);
        bookCard.append(titleRow);

        const bookAuthor = document.createElement('p');
        bookAuthor.innerHTML = `<strong>Author:</strong> ${book.author}`;
        bookCard.append(bookAuthor);

        const bookIsbn = document.createElement('p');
        bookIsbn.innerHTML = `<strong>ISBN</strong>: ${book.isbn}`;
        bookCard.append(bookIsbn);

        const bookCategory = document.createElement('p');
        bookCategory.innerHTML = `<strong>Category</strong>: ${book.category.name}`;
        bookCard.append(bookCategory);

        const availableCopies = document.createElement('p');
        availableCopies.innerHTML =
            `<strong>Available Copies</strong>: ${book.availableCopies}`;
        bookCard.append(availableCopies);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '8px';

        const borrowButton = document.createElement('button');
        borrowButton.classList.add('btn', 'btn-primary', 'btn-sm');

        if (book.available === true) {
            borrowButton.innerText = 'Borrow Book';
        } else {
            borrowButton.innerText = 'Not Available';
            borrowButton.disabled = true;
        }

        borrowButton.addEventListener('click', () => {

            const loanData = {
                bookId: book.id,
                userId: currentUser.id
            };

            fetch(`${API_BASE_URL}/loans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(loanData)
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('HTTP Error');
                }

                return response.json();
            })
            .then((data) => {

                book.availableCopies = book.availableCopies - 1;
                book.available = book.availableCopies > 0;

                localStorage.setItem('books', JSON.stringify(books));
                localStorage.setItem('booksTimestamp', Date.now());

                availableCopies.innerText =
                    `Available Copies: ${book.availableCopies}`;

                if (!book.available) {
                    borrowButton.innerText = 'Not Available';
                    borrowButton.disabled = true;

                    status.innerText = 'Unavailable';
                    status.classList.remove('status-available');
                    status.classList.add('status-unavailable');
                }
            })
            .catch((error) => {
                console.log(error);
            });
        });

        const detailsButton = document.createElement('button');
        detailsButton.innerText = 'View Details';
        detailsButton.classList.add('btn', 'btn-secondary', 'btn-sm');

        buttonContainer.append(borrowButton);
        buttonContainer.append(detailsButton);
        bookCard.append(buttonContainer);

    detailsButton.addEventListener('click', () => {
    const modal = document.querySelector('#bookDetailsModal');

    document.querySelector('#modalBookTitle').textContent =
        book.title;

    document.querySelector('#modalBookAuthor').textContent =
        `Author: ${book.author}`;

    document.querySelector('#modalBookIsbn').textContent =
        `ISBN: ${book.isbn}`;

    document.querySelector('#modalBookCategory').textContent =
        `Category: ${book.category.name}`;

    document.querySelector('#modalBookCopies').textContent =
        `Available Copies: ${book.availableCopies}`;

    document.querySelector('#modalBookYear').textContent =
        `Publication Year: ${book.publicationYear}`;

    document.querySelector('#modalBookPublisher').textContent =
        `Publisher: ${book.publisher}`;

    document.querySelector('#modalBookDescription').textContent =
        book.description || 'No description available.';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
});

        booksContainer.append(bookCard);
    }
}
if (booksContainer) {
    loadBooks();
}
const bookDetailsModal = document.querySelector('#bookDetailsModal');

if (bookDetailsModal) {
    bookDetailsModal.addEventListener('click', (event) => {
        if (event.target.closest('[data-close-modal]')) {
            closeBookDetailsModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeBookDetailsModal();
        }
    });
}

function closeBookDetailsModal() {
    const modal = document.querySelector('#bookDetailsModal');

    if (!modal) {
        return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}