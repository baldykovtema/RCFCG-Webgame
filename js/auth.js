const authScreen = document.getElementById("authScreen");
const game = document.getElementById("game");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const backToLogin = document.getElementById("backToLogin");
const registerText = document.getElementById("registerText");
const authMessage = document.getElementById("authMessage");
const logoutButton = document.getElementById("logoutButton");

function showAuthMessage(message) {
    authMessage.textContent = message;
}

function showGame() {
    authScreen.style.display = "none";
    game.style.display = "block";
    adminPanel.style.display = isAdmin() ? "block" : "none";
    if (isAdmin()) {
        adminCubeInput.value = stats.cubesCompleted;
        adminMessage.textContent = "";
    }
    updateStatsUI();
    startPlayTimer();
    requestAnimationFrame(updateLayout);
}

function showAuth() {
    game.style.display = "none";
    authScreen.style.display = "flex";
    adminPanel.style.display = "none";
}

function enterRegistrationMode() {
    registrationMode = true;
    document.getElementById("authTitle").textContent = "Регистрация";
    loginButton.style.display = "none";
    registerText.style.display = "none";
    registerButton.textContent = "Создать аккаунт";
    backToLogin.style.display = "block";
    passwordInput.value = "";
    showAuthMessage("");
}

function exitRegistrationMode() {
    registrationMode = false;
    document.getElementById("authTitle").textContent = "RCFCG";
    loginButton.style.display = "block";
    registerText.style.display = "block";
    registerButton.textContent = "Зарегистрироваться";
    backToLogin.style.display = "none";
    showAuthMessage("");
}

backToLogin.addEventListener("click", exitRegistrationMode);

registerButton.addEventListener("click", async () => {
    if (!registrationMode) {
        enterRegistrationMode();
        return;
    }
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    if (!isValidUsername(username)) {
        showAuthMessage("Логин: 3–30 символов. Используй только латинские буквы, цифры и _.");
        return;
    }
    if (password.length < 6) {
        showAuthMessage("Пароль должен содержать минимум 6 символов.");
        return;
    }
    registerButton.disabled = true;
    showAuthMessage("Создание аккаунта...");
    const { data, error } = await supabaseClient.auth.signUp({
        email: usernameToEmail(username),
        password: password,
        options: { data: { username: username } }
    });
    registerButton.disabled = false;
    if (error) {
        showAuthMessage(error.message.toLowerCase().includes("already registered") ? "Такой логин уже занят." : "Ошибка: " + error.message);
        return;
    }
    if (data.session) {
        currentUser = data.user;
        stats = { bestPercentage: 0, dominantColor: "white", totalPlaySeconds: 0, cubesCompleted: 0, bestColors: [] };
        await savePlayerStats();
        showAuthMessage("");
        showGame();
        return;
    }
    showAuthMessage("Аккаунт создан. Проверь настройки Confirm email в Supabase.");
    exitRegistrationMode();
});

loginButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    if (!username) {
        showAuthMessage("Введите логин.");
        return;
    }
    if (!password) {
        showAuthMessage("Введите пароль.");
        return;
    }
    if (!isValidUsername(username)) {
        showAuthMessage("Неверный логин.");
        return;
    }
    loginButton.disabled = true;
    showAuthMessage("Выполняется вход...");
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: usernameToEmail(username),
        password: password
    });
    loginButton.disabled = false;
    if (error) {
        showAuthMessage("Неверный логин или пароль.");
        return;
    }
    currentUser = data.user;
    await loadPlayerStats(currentUser);
    showAuthMessage("");
    showGame();
});

usernameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") passwordInput.focus();
});

passwordInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        registrationMode ? registerButton.click() : loginButton.click();
    }
});

logoutButton.addEventListener("click", async () => {
    await stopPlayTimer();
    await supabaseClient.auth.signOut();
    currentUser = null;
    showAuth();
    usernameInput.value = "";
    passwordInput.value = "";
    exitRegistrationMode();
});

async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
        currentUser = data.session.user;
        await loadPlayerStats(currentUser);
        showGame();
    } else {
        showAuth();
    }
}