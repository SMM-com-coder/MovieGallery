// common.js - общие функции для всех страниц

// Фейковая база данных пользователей 
let usersDatabase = JSON.parse(localStorage.getItem('movieGalleryUsers')) || [
    { username: "TestUser", email: "test@example.com", password: "123456" },
    { username: "DemoUser", email: "user@example.com", password: "password" },
    { username: "AdminUser", email: "admin@example.com", password: "adminpass", role: "moderator" }
];

// Функция для проверки авторизации
function checkAuth() {
    const userData = JSON.parse(localStorage.getItem("movieGalleryUser")) || 
                    JSON.parse(sessionStorage.getItem("movieGalleryUser"));
    return userData || null;
}

// Функция для проверки роли пользователя
function checkUserRole() {
    const userData = checkAuth();
    if (!userData) return null;
    
    const currentUsers = JSON.parse(localStorage.getItem('movieGalleryUsers')) || usersDatabase;
    const user = currentUsers.find(u => u.email === userData.email);
    return user?.role || 'user';
}

// Функция для обновления блока аккаунта
function updateAccountStatus() {
    const accountStatus = document.getElementById("account-status");
    if (!accountStatus) return;
    
    const userData = checkAuth();
    accountStatus.innerHTML = "";

    if (userData) {
        const firstLetter = userData.username?.charAt(0).toUpperCase() || 
                          userData.email?.charAt(0).toUpperCase();
        const userRole = checkUserRole();

        accountStatus.innerHTML = `
            <div class="account-details">
                <div class="account-avatar">${firstLetter}</div>
                <div>
                    <div class="auth-info">Вы вошли как:</div>
                    <strong>${userData.username || userData.email}</strong>
                    ${userRole === 'moderator' ? '<div class="role-badge">Модератор</div>' : ''}
                </div>
            </div>
            <button class="button" id="logout-button">Выйти</button>
        `;

        document.getElementById("logout-button").addEventListener("click", logout);
    } else {
        accountStatus.innerHTML = `
            <div class="auth-info">Гость</div>
            <button class="button" id="login-button">Войти / Регистрация</button>
        `;

        document.getElementById("login-button").addEventListener("click", () => {
            const authModal = document.getElementById("auth-modal");
            if (authModal) {
                authModal.style.display = "flex";
                document.body.style.overflow = "hidden";
            }
        });
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem("movieGalleryUser");
    sessionStorage.removeItem("movieGalleryUser");
    updateAccountStatus();
    
    // Получаем все кнопки удаления и скрываем их
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.remove();
    });
    
    window.location.reload(); // Полная перезагрузка страницы
}

// Функция для инициализации модального окна авторизации
function initAuthModal() {
    const authModal = document.getElementById("auth-modal");
    if (!authModal) return;
    
    const closeModal = document.getElementById("close-modal");
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Открытие модального окна
    document.getElementById("auth-button")?.addEventListener('click', () => {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Закрытие при клике вне модального окна
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Переключение между вкладками
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Переключение видимости пароля
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'Скрыть';
            } else {
                input.type = 'password';
                this.textContent = 'Показать';
            }
        });
    });

    // Обработка формы входа
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const remember = document.getElementById("remember").checked;

        const user = usersDatabase.find(u => u.email === email && u.password === password);
        
        if (user) {
            const userData = { 
                username: user.username,
                email: user.email 
            };

            if (remember) {
                localStorage.setItem("movieGalleryUser", JSON.stringify(userData));
            } else {
                sessionStorage.setItem("movieGalleryUser", JSON.stringify(userData));
            }

            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            updateAccountStatus();
            window.location.reload();
        } else {
            alert('Неверный e-mail или пароль!');
        }
    });

    // Обработка формы регистрации
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById("reg-username").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
    
        // Загружаем актуальные данные
        const currentUsers = JSON.parse(localStorage.getItem('movieGalleryUsers')) || usersDatabase;
    
        if (currentUsers.some(u => u.email === email)) {
            alert("Аккаунт с таким e-mail уже существует!");
            return;
        }
    
        if (currentUsers.some(u => u.username === username)) {
            alert("Этот никнейм уже занят!");
            return;
        }
    
        if (username && email && password && password === confirmPassword) {
            const newUser = { username, email, password };
            
            // Добавляем в массив и сохраняем
            currentUsers.push(newUser);
            localStorage.setItem('movieGalleryUsers', JSON.stringify(currentUsers));
            usersDatabase = currentUsers; // Обновляем локальную переменную
    
            alert('Регистрация успешна! Теперь вы можете войти.');
            loginTab.click();
            registerForm.reset();
        } else {
            alert("Пожалуйста, заполните все поля и убедитесь, что пароли совпадают!");
        }
    });
}

// Функция для инициализации системы отзывов с возможностью модерации
function initReviewsSystem(movieKey) {
    const reviewForm = document.getElementById('review-form');
    const reviewsContainer = document.getElementById('reviews-container');
    
    if (!reviewForm || !reviewsContainer) return;

    // Обработка отправки отзыва
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('review-text').value;
        const userData = checkAuth();
        
        if (text) {
            const username = userData?.username || "Гость"; // Используем "Гость" если пользователь не авторизован
            const reviewId = Date.now().toString();
            const newReview = createReviewElement(
                username, 
                text, 
                reviewId,
                userData?.email || null // email будет null для гостей
            );
            
            reviewsContainer.insertBefore(newReview, reviewsContainer.firstChild);
            reviewForm.reset();
            newReview.scrollIntoView({ behavior: 'smooth' });
            
            saveReviewToLocalStorage(movieKey, username, text, reviewId, userData?.email);
            
            // Добавляем кнопку удаления только для авторизованных пользователей
            if (userData) {
                addDeleteButtonToReview(newReview, movieKey);
            }
        }
    });

    // Загрузка отзывов
    loadReviewsFromLocalStorage(movieKey);
}

function createReviewElement(username, text, reviewId, userEmail) {
    const review = document.createElement('div');
    review.className = 'review';
    review.dataset.id = reviewId || Date.now().toString();
    review.dataset.userEmail = userEmail || ''; // Добавляем email пользователя
    review.innerHTML = `
        <p><strong>${username}:</strong> ${text}</p>
        <div class="review-actions"></div>
    `;
    return review;
}

function saveReviewToLocalStorage(movieKey, username, text, reviewId, userEmail = null) {
    let reviews = JSON.parse(localStorage.getItem(`${movieKey}-reviews`)) || [];
    reviews.unshift({ 
        username, 
        text, 
        id: reviewId,
        userEmail, // Может быть null для гостей
        timestamp: new Date().toISOString() 
    });
    localStorage.setItem(`${movieKey}-reviews`, JSON.stringify(reviews));
}

function loadReviewsFromLocalStorage(movieKey) {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviews = JSON.parse(localStorage.getItem(`${movieKey}-reviews`)) || [];
    
    reviewsContainer.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(
            review.username, 
            review.text, 
            review.id,
            review.userEmail
        );
        reviewsContainer.appendChild(reviewElement);
        
        // Добавляем кнопку удаления только если пользователь авторизован и это его комментарий
        const userData = checkAuth();
        if (userData && userData.email === review.userEmail) {
            addDeleteButtonToReview(reviewElement, movieKey);
        }
    });
}

function addDeleteButtonToReview(reviewElement, movieKey) {
    const actionsDiv = reviewElement.querySelector('.review-actions');
    if (!actionsDiv) return;
    
    actionsDiv.innerHTML = '';
    
    const userData = checkAuth();
    const isModerator = checkUserRole() === 'moderator';
    const isOwner = userData && userData.email === reviewElement.dataset.userEmail;
    
    // Показываем кнопку только модераторам или владельцам комментария
    if (isModerator || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-review-btn';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
                reviewElement.style.opacity = '0';
                reviewElement.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    deleteReviewFromStorage(reviewElement.dataset.id, movieKey);
                    reviewElement.remove();
                }, 300);
            }
        });
        actionsDiv.appendChild(deleteBtn);
    }
}

function deleteReviewFromStorage(reviewId, movieKey) {
    let reviews = JSON.parse(localStorage.getItem(`${movieKey}-reviews`)) || [];
    reviews = reviews.filter(review => review.id !== reviewId);
    localStorage.setItem(`${movieKey}-reviews`, JSON.stringify(reviews));
}

function updateReviewDeleteButtons(movieKey) {
    const reviews = document.querySelectorAll('.review');
    reviews.forEach(review => {
        addDeleteButtonToReview(review, movieKey);
    });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    updateAccountStatus();
    initAuthModal();
    
    // Обновляем кнопки удаления при загрузке страницы
    const movieKey = window.location.pathname.split('/').pop().replace('.html', '');
    if (movieKey) {
        const userData = checkAuth();
        if (userData) {
            updateReviewDeleteButtons(movieKey);
        }
    }
});
