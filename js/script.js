const API_BASE_URL = "https://haditabatabaei.dev/api";

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

let currentUser;

function getCurrentUser() {
    const token = getToken();

    if (!token) {
        return;
    }

    fetch(`${API_BASE_URL}/auth/me` , {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then((response) => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
               document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
               window.location.href = "login.html"; 
               throw new Error('Unauthorized');
            }
            throw new Error('HTTP Error');
        }
        return response.json();
    })

    .then((data) => {
    
        currentUser = data.data.user;
      
        const stats = data.data.stats;
        

        

        const activeLoansElement = document.querySelector('#activeLoans');
        const availableBooksElement = document.querySelector("#availableBooks");
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
        if (studentName){
        studentName.innerText = currentUser.firstName + " " + currentUser.lastName;

        }
        const userAvatar = document.querySelector('#userAvatar');
        if (userAvatar) {
        userAvatar.innerText = currentUser.firstName.charAt(0);

        }

    })
    .catch((error) => {
        console.log(error);
    })
}

    const token = getToken();

    const booksContainer = document.querySelector('#booksContainer');

    function showBooks(books) {
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
        'status', book.available ? 'status-available' : 'status-unavailable');
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
        availableCopies.innerHTML = `<strong>Available Copies</strong>: ${book.availableCopies}`;
        bookCard.append(availableCopies);

       const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.gap = '8px';

        const borrowButton = document.createElement('button');
        borrowButton.classList.add('btn', 'btn-primary', 'btn-sm');

        if (book.available === true) {
        borrowButton.innerText ='Borrow Book';
         } else {
            borrowButton.innerText = "Not Available";
            borrowButton.disabled = true;
         }
         

         borrowButton.addEventListener('click', () => {
            
            const loanData = {
                bookId: book.id,
                userId: currentUser.id
            }
            

            fetch(`${API_BASE_URL}/loans`, {
                method: 'POST',  
                headers: {'Content-Type': "application/json",
                    "Authorization": `Bearer ${token}`},
                     body: JSON.stringify(loanData)
            })
            .then((response) => {
                if(!response.ok){
                    throw new Error('HTTP Error')
                }
                return response.json();
            })
            .then((data) => {
              console.log(data);
              console.log(data.loan.book);

              book.availableCopies = book.availableCopies - 1;
              book.available = book.availableCopies > 0;

              localStorage.setItem('books', JSON.stringify(books));
              localStorage.setItem('booksTimestamp', Date.now());
              availableCopies.innerText
               = `Available Copies: ${book.availableCopies}`;

   
             if (!book.available) {
              borrowButton.innerText = "Not Available";
              borrowButton.disabled = true;

              status.innerText = "Unavailable";
              status.classList.remove('status-available');
              status.classList.add('status-unavailable');
             }
              
})
            .catch((error)=> {
                console.log(error);
            })
        
         });

         const detailsButton= document.createElement('button');
         detailsButton.innerText = "View Details"
         detailsButton.classList.add('btn', 'btn-secondary', 'btn-sm');
         
         buttonContainer.append(borrowButton);
         buttonContainer.append(detailsButton);
         bookCard.append(buttonContainer);

         detailsButton.addEventListener('click', () => {
            detailsButton.disabled = true;
            const bookDescription = document.createElement('p');
            bookDescription.innerText = book.description;
            bookCard.append(bookDescription);

            const publicationYear = document.createElement('p');
            publicationYear.innerText = `Publication Year: ${book.publicationYear}`
            bookCard.append(publicationYear);

            const publisher = document.createElement('p');
            publisher.innerText = `Publisher: ${book.publisher}`;
            bookCard.append(publisher);


            console.log(book.description);
            console.log(book);
         })


          
        booksContainer.append(bookCard);

    }

    }
    
    if(booksContainer) {
            const cachedBooks = localStorage.getItem('books');
    const cachedTimestamp =  localStorage.getItem('booksTimestamp');

    const elapsedTime = Date.now() - cachedTimestamp;
    
    
    let books;
    if (cachedBooks && elapsedTime < 5 * 60 * 1000) {
         books = JSON.parse(cachedBooks);
         showBooks(books);

    } else {

        
    fetch(`${API_BASE_URL}/books`, {
    method: 'GET',
    headers: {
        "Authorization": `Bearer ${token}` }
})
.then((response) => {
    if (!response.ok) {
        throw new Error('HTTP Error');
    }
    return response.json();
})
.then((data) => {
    books = data.data;
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('booksTimestamp', Date.now());
   
    showBooks(books);
})
.catch((error)=> {
    console.log(error);
})


    }

    }

const loginForm = document.querySelector('#loginForm');
const logoutButton = document.querySelector('#logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', ()=> {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; 
    })
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector("#password");
    const email = emailInput.value;
    const password = passwordInput.value;

    const loginData = {
        email: email,
         password:password
    };

    fetch(`${API_BASE_URL}/auth/login`, {
        method:"POST", headers: {
            "Content-Type": "application/json"},
        body: JSON.stringify(loginData)
    })

    .then((response) => {
        if(!response.ok) {
            throw new Error('HTTP Error')
        }
        return response.json();
    })
    .then((data) => {
         
        document.cookie = `token=${data.token}; path=/`;

        

        if (data.token) {
            window.location = "dashboard.html";
        }
    })
    .catch((error)=> {
        console.log(error);
    })
    

});
}

const dashboardPage = document.querySelector('#dashboardPage');
const myLoansPage = document.querySelector('#myLoansPage');

if (dashboardPage || booksContainer || myLoansPage) {
protectPage();
}
if (dashboardPage || booksContainer) {
    getCurrentUser();
}



if (myLoansPage) {
    const loansContainer = document.querySelector('#loansContainer');

    fetch(`${API_BASE_URL}/loans/my-loans`, {
        method: "GET" , 
        headers: {'Authorization': `Bearer ${token}`
    }
    })
    .then((response) => {
        if(!response.ok) {
            throw new Error('HTTP Error')
        }
        return response.json();
    })
    
    .then ((data) => {
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
            if (loan.status === 'returned'){
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
                if(!response.ok) {
                    throw new Error('HTTP Error');
                }
                return response.json();

            })
            .then((data) => {
                console.log(data);
                console.log(data.data.book);
                if (data.success) {
                    loanRow.remove();

                    activeLoansCount--;
                    returnedLoansCount++;

                    activeLoansElement.innerText = activeLoansCount
                    returnedLoansElement.innerText = returnedLoansCount;

                    const cachedBooks = JSON.parse(localStorage.getItem('books'));

                    for (const book of cachedBooks) {
                       if (book.id === data.data.book.id) {
                        book.availableCopies++;
                        book.available = true;
                       }
                    }
                    localStorage.setItem('books', JSON.stringify(cachedBooks));
                    localStorage.setItem('booksTimestamp', Date.now());


                }
            })
            .catch((error)=> {
            console.log(error);
         });

         })
         

         }       
         loanRow.append(loanActionCell);
         loansContainer.append(loanRow);
         
        }
        
       
    })
    .catch((error)=> {
        console.log(error);
    })
}





