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
        return response.json();
    })
    .then((data) => {
    
        currentUser = data.data.user;
      
        const stats = data.data.stats;
        

        

        const activeLoansElement = document.querySelector('#activeLoans');
        const availableBooksElement = document.querySelector("#availableBooks");

        activeLoansElement.innerText = stats.activeLoans;
        availableBooksElement.innerText = stats.availableBooks;

        const userName = document.querySelector('#userName');
        const studentName = document.querySelector('#studentName');

        userName.innerText = currentUser.firstName + " " + currentUser.lastName;
        studentName.innerText = currentUser.firstName + " " + currentUser.lastName;
        const userAvatar = document.querySelector('#userAvatar');
        userAvatar.innerText = currentUser.firstName.charAt(0);

    })
}

    const token = getToken();

    const booksContainer = document.querySelector('#booksContainer');

    function showBooks(books) {
          for (const book of books) {
        
        const bookCard = document.createElement('div');

        bookCard.classList.add('card');
        //last two line needs rewiew

        const bookTitle = document.createElement('h3');
        bookTitle.innerText = book.title;
        bookCard.append(bookTitle);

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText= book.author;
        bookCard.append(bookAuthor);
        
        const bookIsbn = document.createElement('p');
        bookIsbn.innerText = book.isbn;
        bookCard.append(bookIsbn);

        const bookCategory = document.createElement('p');
        bookCategory.innerText = `Category: ${book.category.name}`;
        bookCard.append(bookCategory);

        const availableCopies = document.createElement('p');
        availableCopies.innerText = `Available Copies: ${book.availableCopies}`;
        bookCard.append(availableCopies);

       
        const borrowButton = document.createElement('button');

        if (book.available === true) {
        borrowButton.innerText ='Borrow Book';
         } else {
            borrowButton.innerText = "Not Available";
            borrowButton.disabled = true;
         }
         bookCard.append(borrowButton);

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
                return response.json();
            })
            .then((data) => {
                console.log(data);
                
            })
        
         });

         const detailsButton= document.createElement('button');
         detailsButton.innerText = "View Details"
         bookCard.append(detailsButton);

         detailsButton.addEventListener('click', () => {
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
    return response.json();
})
.then((data) => {
    books = data.data;
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('booksTimestamp', Date.now());
   
    showBooks(books);
})


    }

    }

const loginForm = document.querySelector('#loginForm');

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
        return response.json()
    })
    .then((data) => {
         
        document.cookie = `token=${data.token}; path=/`;

        

        if (data.token) {
            window.location = "dashboard.html";
        }
    });
    

});
}

const dashboardPage = document.querySelector('#dashboardPage');

if (dashboardPage || booksContainer) {
    getCurrentUser();
}



