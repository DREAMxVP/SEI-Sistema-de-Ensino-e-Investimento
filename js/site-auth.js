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
    window.location.href = "/dashboard";
  }

  function getActiveSession() {
    try {
      var raw = localStorage.getItem(sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveActiveSession(user) {
    localStorage.setItem(
      sessionKey,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        investorProfile: user.investorProfile || { tipo: "iniciante", risco: "moderado", objetivo: "longo prazo" }
      })
    );
  }

  function makeInvestorProfile(name) {
    var letters = String(name || "").replace(/\s+/g, "").length;
    if (letters <= 5) {
      return { tipo: "conservador", risco: "baixo", objetivo: "reserva de emergência" };
    }
    if (letters <= 10) {
      return { tipo: "moderado", risco: "médio", objetivo: "crescimento consistente" };
    }
    return { tipo: "arrojado", risco: "alto", objetivo: "acúmulo de patrimônio" };
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

  function ensureRedirectIfSessionExists() {
    var current = window.location.pathname.toLowerCase();
    var isAuthPage = current.endsWith("/login.html") || current.endsWith("/register.html");
    if (!isAuthPage) {
      return;
    }

    if (getActiveSession()) {
      redirectToDashboard();
    }
  }

  function setupPasswordToggles() {
    var passwordInputs = document.querySelectorAll(".auth-form input[type='password']");

    passwordInputs.forEach(function (input) {
      if (input.dataset.toggleReady === "true") {
        return;
      }

      var wrapper = document.createElement("div");
      wrapper.className = "password-field";

      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      var toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "password-toggle";
      toggleButton.setAttribute("aria-label", "Mostrar senha");
      toggleButton.setAttribute("aria-pressed", "false");
      toggleButton.textContent = "Mostrar";

      toggleButton.addEventListener("click", function () {
        var shouldReveal = input.type === "password";
        input.type = shouldReveal ? "text" : "password";
        toggleButton.textContent = shouldReveal ? "Ocultar" : "Mostrar";
        toggleButton.setAttribute("aria-label", shouldReveal ? "Ocultar senha" : "Mostrar senha");
        toggleButton.setAttribute("aria-pressed", shouldReveal ? "true" : "false");
      });

      wrapper.appendChild(toggleButton);
      input.dataset.toggleReady = "true";
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

      if (password.length < 4 || !/^[A-Za-z0-9]{4,}$/.test(password)) {
        markInvalid(passwordInput);
        showMessage("Erro: a senha deve ter no mínimo 4 caracteres e conter apenas letras e números.", true);
        return;
      }

      var users = getUsers();
      var exists = users.some(function (item) {
        return item.email === email;
      });

      if (exists) {
        markInvalid(emailInput);
        showMessage("Erro: já existe uma conta com este e-mail.", true);
        return;
      }

      var newUser = {
        id: "u_" + Date.now(),
        name: name,
        email: email,
        password: password,
        investorProfile: makeInvestorProfile(name),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setUsers(users);
      saveActiveSession(newUser);

      showMessage("Conta criada e login ativo no navegador. Redirecionando...");
      setTimeout(redirectToDashboard, 600);
    });
  }

  function handleLogin(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var emailInput = document.getElementById("loginEmail") || document.getElementById("username");
      var passwordInput = document.getElementById("loginPassword") || document.getElementById("password");
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

      saveActiveSession(user);
      showMessage("Login realizado. Redirecionando...");
      setTimeout(redirectToDashboard, 500);
    });
  }

  var registerForm = document.getElementById("registerForm");
  var loginForm = document.getElementById("loginForm");

  ensureRedirectIfSessionExists();
  setupPasswordToggles();

  if (registerForm) {
    handleRegister(registerForm);
  }

  if (loginForm) {
    handleLogin(loginForm);
  }
})();
