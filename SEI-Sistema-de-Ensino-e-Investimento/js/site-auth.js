(function () {
  var storageKey = "sei-users";
  var sessionKey = "sei-active-user";

  function getUsers() {
    try {
      var raw = localStorage.getItem(storageKey);
      var users = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(users)) {
        return [];
      }
      return users;
    } catch (error) {
      return [];
    }
  }

  function setUsers(users) {
    localStorage.setItem(storageKey, JSON.stringify(users));
  }

  function showMessage(message, isError) {
    var messageNode = document.getElementById("authMessage");
    if (!messageNode) {
      return;
    }

    messageNode.textContent = message || "";
    if (isError) {
      messageNode.classList.add("error");
      return;
    }

    messageNode.classList.remove("error");
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function redirectToDashboard() {
    window.location.href = "./dashboard.html";
  }

  function handleRegister(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("registerName").value.trim();
      var email = normalizeEmail(document.getElementById("registerEmail").value);
      var password = document.getElementById("registerPassword").value;

      if (!name || !email || !password) {
        showMessage("Preencha todos os campos.", true);
        return;
      }

      if (password.length < 4) {
        showMessage("A senha deve ter no mínimo 4 caracteres.", true);
        return;
      }

      var users = getUsers();
      var exists = users.some(function (user) {
        return user.email === email;
      });

      if (exists) {
        showMessage("Esse e-mail já está cadastrado.", true);
        return;
      }

      users.push({
        name: name,
        email: email,
        password: password
      });

      setUsers(users);
      localStorage.setItem(sessionKey, JSON.stringify({ name: name, email: email }));
      showMessage("Conta criada com sucesso! Redirecionando...");

      setTimeout(redirectToDashboard, 700);
    });
  }

  function handleLogin(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = normalizeEmail(document.getElementById("loginEmail").value);
      var password = document.getElementById("loginPassword").value;

      if (!email || !password) {
        showMessage("Informe e-mail e senha.", true);
        return;
      }

      if (email === "admin" && password === "1234") {
        localStorage.setItem(sessionKey, JSON.stringify({ name: "Administrador", email: "admin" }));
        redirectToDashboard();
        return;
      }

      var users = getUsers();
      var user = users.find(function (item) {
        return item.email === email && item.password === password;
      });

      if (!user) {
        showMessage("Usuário ou senha incorretos.", true);
        return;
      }

      localStorage.setItem(sessionKey, JSON.stringify({ name: user.name, email: user.email }));
      showMessage("Login realizado. Redirecionando...");
      setTimeout(redirectToDashboard, 500);
    });
  }

  var registerForm = document.getElementById("registerForm");
  var loginForm = document.getElementById("loginForm");

  if (registerForm) {
    handleRegister(registerForm);
  }

  if (loginForm) {
    handleLogin(loginForm);
  }
})();
