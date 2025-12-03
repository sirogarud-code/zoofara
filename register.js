/* ======================================
   ZooFeed – register.js
   Логіка сторінки реєстрації (localStorage)
   ====================================== */

const LS_USER  = "zf_user";   // поточний користувач (так само, як в app.js)
const LS_USERS = "zf_users";  // список усіх користувачів

// простий генератор ID як в app.js
function generateUserId() {
  const part = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  return `ZOO-${part()}-${part()}`;
}

// робота зі списком користувачів
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

// "хешування" паролю (як у app.js — для демо)
function hashPassword(pwd) {
  return btoa(pwd || "");
}

document.addEventListener("DOMContentLoaded", () => {
  const form     = document.getElementById("registerForm");
  const nameInp  = document.getElementById("regName");
  const emailInp = document.getElementById("regEmail");
  const passInp  = document.getElementById("regPassword");
  const pass2Inp = document.getElementById("regPassword2");
  const phoneInp = document.getElementById("regPhone");
  const cityInp  = document.getElementById("regCity");
  const hintEl   = document.getElementById("regHint"); // тут показуємо помилки/успіх

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (hintEl) hintEl.textContent = "";

    const name  = (nameInp?.value || "").trim();
    const email = (emailInp?.value || "").trim().toLowerCase();
    const pass  = passInp?.value || "";
    const pass2 = pass2Inp?.value || "";
    const phone = (phoneInp?.value || "").trim();
    const city  = (cityInp?.value || "").trim();

    // --- базова валідація ---
    if (!name || !email || !pass || !pass2) {
      if (hintEl) hintEl.textContent = "Заповніть усі обов’язкові поля.";
      return;
    }

    if (!email.includes("@")) {
      if (hintEl) hintEl.textContent = "Вкажіть коректний e-mail.";
      return;
    }

    if (pass.length < 4) {
      if (hintEl) hintEl.textContent = "Пароль має містити щонайменше 4 символи.";
      return;
    }

    if (pass !== pass2) {
      if (hintEl) hintEl.textContent = "Паролі не співпадають.";
      return;
    }

    // --- перевірка, чи вже є такий e-mail ---
    const users = loadUsers();
    const existing = users.find(
      (u) => (u.email || "").toLowerCase() === email
    );
    if (existing) {
      if (hintEl) hintEl.textContent = "Користувач з таким e-mail вже існує. Спробуйте увійти.";
      return;
    }

    // --- створюємо нового користувача у тому ж форматі, що й app.js ---
    const user = {
      id: generateUserId(),
      email,
      name,
      passwordHash: hashPassword(pass), // те саме, що очікує логін
      phone: phone || null,
      city: city || null,
    };

    users.push(user);

    try {
      saveUsers(users);
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch (err) {
      console.error("Помилка збереження користувача:", err);
      if (hintEl) {
        hintEl.textContent =
          "Не вдалося зберегти акаунт (перевірте налаштування браузера / localStorage).";
      }
      return;
    }

    if (hintEl) {
      hintEl.textContent =
        "Акаунт створено! Зараз перенаправимо вас на головну (демо).";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 600);
  });

  // лінк «У мене вже є акаунт — Увійти»
  const loginLink = document.getElementById("regGoLogin");
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      // підказка для головної: одразу відкрити модалку входу (необов’язково)
      localStorage.setItem("zf_openAuthOnLoad", "1");
      window.location.href = "index.html";
    });
  }
});

/* 
  ВАЖЛИВО:
  Старий fetch("http://localhost:3000/api/register", ...) з кінця файла
  краще повністю видали або закоментуй, щоб не було помилки nameInput is not defined.
*/
