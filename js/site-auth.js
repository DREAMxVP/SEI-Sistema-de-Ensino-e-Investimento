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
    messageNode.setAttribute("aria-live", isError ? "assertive" : "polite");
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

  function markInvalid(input) {
    if (!input) {
      return;
    }

    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", "authMessage");
  }

  function clearInvalid(inputs) {
    (inputs || []).forEach(function (input) {
      if (!input) {
        return;
      }

      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    });
  }

  function handleRegister(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameInput = document.getElementById("registerName");
      var emailInput = document.getElementById("registerEmail");
      var passwordInput = document.getElementById("registerPassword");
      var name = nameInput.value.trim();
      var email = normalizeEmail(emailInput.value);
      var password = passwordInput.value;

      clearInvalid([nameInput, emailInput, passwordInput]);

      if (!name || !email || !password) {
        if (!name) {
          markInvalid(nameInput);
        }
        if (!email) {
          markInvalid(emailInput);
        }
        if (!password) {
          markInvalid(passwordInput);
        }
        showMessage("Erro: preencha todos os campos.", true);
        return;
      }

      if (password.length < 4) {
        markInvalid(passwordInput);
        showMessage("Erro: a senha deve ter no mínimo 4 caracteres.", true);
        return;
      }

      var users = getUsers();
      var exists = users.some(function (user) {
        return user.email === email;
      });

      if (exists) {
        markInvalid(emailInput);
        showMessage("Erro: esse e-mail já está cadastrado.", true);
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

      var emailInput = document.getElementById("loginEmail");
      var passwordInput = document.getElementById("loginPassword");
      var email = normalizeEmail(emailInput.value);
      var password = passwordInput.value;

      clearInvalid([emailInput, passwordInput]);

      if (!email || !password) {
        if (!email) {
          markInvalid(emailInput);
        }
        if (!password) {
          markInvalid(passwordInput);
        }
        showMessage("Erro: informe e-mail e senha.", true);
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
        markInvalid(emailInput);
        markInvalid(passwordInput);
        showMessage("Erro: usuário ou senha incorretos.", true);
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
