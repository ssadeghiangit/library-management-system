# پروژه نهایی جاوااسکریپت - کاریار

## Library Management System

این پروژه به عنوان پروژه نهایی دوره جاوااسکریپت کاریار پیاده‌سازی شده است.

در این پروژه یک سیستم مدیریت کتابخانه در سمت Frontend طراحی و پیاده‌سازی شده که با استفاده از API آماده Backend با سرور ارتباط برقرار می‌کند.

کاربر پس از ورود می‌تواند اطلاعات حساب خود را مشاهده کند، کتاب‌ها را بررسی کند، کتاب‌های موجود را Borrow کند، وضعیت Loanهای خود را مشاهده کند و کتاب‌های Borrow شده را Return کند.

---

## امکانات پروژه

### Authentication

- ورود کاربر با Email و Password
- استفاده از JWT برای Authentication
- ذخیره Token در Cookie
- ارسال Token در Header درخواست‌های محافظت‌شده
- محافظت از صفحات نیازمند ورود
- بررسی اعتبار Token
- Logout
- نمایش پیام خطا در صورت ورود ناموفق
- هدایت کاربر به Login در صورت نامعتبر بودن Token

### Dashboard

در صفحه Dashboard اطلاعات زیر نمایش داده می‌شود:

- نام و نام خانوادگی کاربر
- Avatar کاربر
- Active Loans
- Available Books
- Quick Actions

اطلاعات کاربر و آمار از طریق API دریافت می‌شوند.

### Books

در صفحه Books امکانات زیر پیاده‌سازی شده است:

- نمایش Title
- نمایش Author
- نمایش ISBN
- نمایش Category
- نمایش Available Copies
- نمایش وضعیت Available / Unavailable
- Borrow Book
- View Details
- غیرفعال شدن Borrow برای کتاب‌های ناموجود

### View Details

با انتخاب View Details اطلاعات بیشتری از کتاب نمایش داده می‌شود:

- Description
- Publication Year
- Publisher

### Borrow Book

در هنگام Borrow کردن یک کتاب:

- درخواست POST به API ارسال می‌شود.
- Available Copies کاهش پیدا می‌کند.
- وضعیت Available / Unavailable به‌روزرسانی می‌شود.
- اطلاعات کتاب در LocalStorage به‌روزرسانی می‌شود.
- یک Loan جدید ایجاد می‌شود.
- Loan جدید در صفحه My Loans قابل مشاهده است.

### My Loans

در صفحه My Loans اطلاعات Loanهای کاربر نمایش داده می‌شود:

- Book Title
- Author
- Loan Date
- Loan Status
- Total Loans
- Active Loans
- Returned Loans

برای Loanهای فعال امکان Return کردن کتاب وجود دارد.

### Return

با Return کردن یک کتاب:

- Loan از حالت Active خارج می‌شود.
- Active Loans کاهش پیدا می‌کند.
- Returned Loans افزایش پیدا می‌کند.
- Available Copies کتاب افزایش پیدا می‌کند.
- اطلاعات کتاب در LocalStorage به‌روزرسانی می‌شود.
- وضعیت Available / Unavailable به‌روزرسانی می‌شود.

---

## LocalStorage Cache

برای دریافت لیست کتاب‌ها از LocalStorage به عنوان Cache استفاده شده است.

- اطلاعات Books برای 5 دقیقه در LocalStorage نگهداری می‌شوند.
- زمان ذخیره شدن اطلاعات نیز در LocalStorage ثبت می‌شود.
- در صورت معتبر بودن Cache، اطلاعات از LocalStorage خوانده می‌شوند.
- پس از پایان 5 دقیقه، اطلاعات جدید از API دریافت می‌شوند.
- بعد از Borrow و Return نیز اطلاعات Cache به‌روزرسانی می‌شوند.

کلیدهای مورد استفاده:

```text
books
booksTimestamp
```

---

## Loading States

برای بخش‌های مختلف پروژه Loading State مستقل در نظر گرفته شده است.

- Books Loading
- My Loans Loading

Loading هر بخش به صورت مستقل مدیریت می‌شود و پس از دریافت اطلاعات یا وقوع خطا مخفی می‌شود.

---

## Error Handling

برای مدیریت خطاهای API از بررسی `response.ok` استفاده شده است.

موارد زیر مدیریت می‌شوند:

- خطاهای HTTP
- خطاهای Login
- خطاهای API
- Token نامعتبر یا غیرمجاز
- خطا در دریافت Books
- خطا در دریافت My Loans
- خطا در Borrow
- خطا در Return

در صورت دریافت وضعیت `401` یا `403`، Token حذف شده و کاربر به صفحه Login هدایت می‌شود.

---

## API

### Base URL

```text
https://haditabatabaei.dev/api
```

### API Documentation

```text
https://haditabatabaei.dev/api/docs
```

### Authentication

```text
POST /auth/login
GET /auth/me
```

### Books

```text
GET /books
GET /books/:id
```

### Loans

```text
GET /loans/my-loans
POST /loans
POST /loans/:id/return
```

برای درخواست‌های محافظت‌شده Token به صورت زیر در Header ارسال می‌شود:

```text
Authorization: Bearer <token>
```

---

## Authentication Flow

روند Authentication در پروژه به این صورت است:

1. کاربر Email و Password خود را وارد می‌کند.
2. اطلاعات با `POST /auth/login` به API ارسال می‌شود.
3. در صورت موفقیت، JWT از پاسخ API دریافت می‌شود.
4. Token در Cookie ذخیره می‌شود.
5. کاربر به Dashboard هدایت می‌شود.
6. در درخواست‌های محافظت‌شده Token از Cookie خوانده می‌شود.
7. Token در Header با فرمت `Bearer Token` ارسال می‌شود.
8. در صورت دریافت `401` یا `403`، Token حذف شده و کاربر به Login بازگردانده می‌شود.

---

## Project Structure

```text
library-management-system/
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── index.html
├── login.html
├── dashboard.html
├── books.html
├── my-loans.html
└── README.md
```

---

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- REST API
- JWT Authentication
- Cookies
- LocalStorage
- Git
- GitHub

---

## How to Run

این پروژه یک Frontend مستقل است و نیازی به نصب Backend یا اجرای Build Process ندارد.

برای اجرای پروژه می‌توان از یک Local Development Server مانند Live Server در VS Code استفاده کرد.

پس از اجرای پروژه، صفحه `index.html` را باز کنید.

---

## Testing

بخش‌های مختلف پروژه به صورت دستی تست شده‌اند، از جمله:

- Login موفق
- Login با اطلاعات اشتباه
- Dashboard
- نمایش اطلاعات کاربر
- نمایش Statistics
- نمایش Books
- Available / Unavailable
- Books Cache
- Borrow Book
- View Details
- My Loans
- Return Book
- به‌روزرسانی تعداد Loans
- به‌روزرسانی Available Copies
- Logout
- Protected Pages
- Token نامعتبر
- خطاهای API و HTTP
- Loading States

---

## Project Status

قابلیت‌های اصلی پروژه پیاده‌سازی و تست شده‌اند:

- Authentication
- Dashboard
- Books
- View Details
- Borrow Book
- My Loans
- Return
- LocalStorage Cache
- Protected Pages
- Logout
- Error Handling
- HTTP Response Handling
- Loading States

---

## GitHub Repository

https://github.com/ssadeghiangit/library-management-system

---

## Author

**Saeed Sadeghian**