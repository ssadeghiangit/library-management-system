import { API_BASE_URL } from "./api.js";
import { getToken, protectPage } from "./auth.js";

const myLoansPage = document.querySelector('#myLoansPage');

if (myLoansPage) {
    protectPage();
}
async function loadMyLoans() {
    const loansLoading = document.querySelector('#loansLoading');
    const loansContainer = document.querySelector('#loansContainer');
    const token = getToken();

    try {
        const response = await fetch(`${API_BASE_URL}/loans/my-loans`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('HTTP Error');
        }

        const data = await response.json();

        const loans = data.data;
        const totalLoans = loans.length;

        const totalLoansElement = document.querySelector("#totalLoans");
        totalLoansElement.innerText = `Total: ${totalLoans} loans`;

        let activeLoansCount = 0;
        let returnedLoansCount = 0;

        const activeLoansElement = document.querySelector('#activeLoansCount');
        const returnedLoansElement = document.querySelector('#returnedLoansCount');

        for (const loan of loans) {

            if (loan.status === "active") {
                activeLoansCount++;
            }

            if (loan.status === "returned") {
                returnedLoansCount++;
            }

            const loanRow = document.createElement('tr');

            const bookTitleCell = document.createElement('td');
            bookTitleCell.innerText = loan.book.title;
            loanRow.append(bookTitleCell);

            const bookAuthorCell = document.createElement('td');
            bookAuthorCell.innerText = loan.book.author;
            loanRow.append(bookAuthorCell);

            const loanDateCell = document.createElement('td');
            loanDateCell.innerText = loan.loanDate;
            loanRow.append(loanDateCell);

            const loanStatusCell = document.createElement('td');
            loanStatusCell.innerText = loan.status;
            loanRow.append(loanStatusCell);

            const loanActionCell = document.createElement("td");

            if (loan.status === "active") {
                const returnButton = document.createElement('button');
                returnButton.innerText = "Return";

                loanActionCell.append(returnButton);

                returnButton.addEventListener('click', () => {
                    fetch(`${API_BASE_URL}/loans/${loan.id}/return`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('HTTP Error');
                        }

                        return response.json();
                    })
                    .then((data) => {

                        if (data.success) {
                            loanRow.remove();

                            activeLoansCount--;
                            returnedLoansCount++;

                            activeLoansElement.innerText = activeLoansCount;
                            returnedLoansElement.innerText = returnedLoansCount;

                            const cachedBooks = JSON.parse(
                                localStorage.getItem('books') || '[]'
                            );

                            for (const book of cachedBooks) {
                                if (book.id === data.data.book.id) {
                                    book.availableCopies++;
                                    book.available = true;
                                }
                            }

                            localStorage.setItem(
                                'books',
                                JSON.stringify(cachedBooks)
                            );

                            localStorage.setItem(
                                'booksTimestamp',
                                Date.now()
                            );
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                });
            }

            loanRow.append(loanActionCell);
            loansContainer.append(loanRow);
        }

        activeLoansElement.innerText = activeLoansCount;
        returnedLoansElement.innerText = returnedLoansCount;

    } catch (error) {
        console.log(error);
    } finally {
        loansLoading.style.display = 'none';
    }
}

if (myLoansPage) {
    loadMyLoans();
}