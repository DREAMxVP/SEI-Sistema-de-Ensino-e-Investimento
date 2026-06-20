import { getActiveUser } from "./learning-state.js";

const UNPROTECTED_PATHS = [
  "/",
  "/index.html",
  "/login.html",
  "/register.html",
  "/pages/login.html",
  "/pages/register.html"
];

function normalizePath(path) {
  if (!path) return "/";

  path = path.toLowerCase();

  if (path !== "/") {
    path = path.replace(/\/+$/, "");
  }

  return path;
}

function isProtectedPath() {
  const current = normalizePath(window.location.pathname);

  return !UNPROTECTED_PATHS.some(
    path => normalizePath(path) === current
  );
}

function getRegisterTarget() {
  const current = normalizePath(window.location.pathname);

  return current.startsWith("/pages/")
    ? "register.html"
    : "pages/register.html";
}

function createAuthOverlay() {
  if (document.querySelector(".auth-overlay")) {
    return;
  }

  const overlay = document.createElement("div");

  overlay.className = "auth-overlay";

  overlay.innerHTML = `
    <div class="auth-overlay-card">
      <span class="auth-overlay-badge">
        Acesso exclusivo
      </span>

      <h2>
        Crie sua conta para aproveitar nossas ferramentas
      </h2>

      <p>
        Você precisa criar uma conta para abrir módulos,
        usar simuladores avançados e desbloquear conteúdo.
      </p>

      <div class="auth-overlay-actions">
        <button
          type="button"
          class="auth-overlay-button"
          id="authOverlayRegister"
        >
          Criar conta
        </button>
      </div>
    </div>
  `;

  document.body.classList.add("auth-blocked");
  document.body.appendChild(overlay);

  const button = document.getElementById(
    "authOverlayRegister"
  );

  button?.addEventListener("click", () => {
    window.location.assign(getRegisterTarget());
  });
}

function ensureAuthenticated() {
  if (!isProtectedPath()) {
    return;
  }

  const activeUser = getActiveUser();

  console.log("Verificando login:", {
    path: window.location.pathname,
    user: activeUser
  });

  if (!activeUser?.id) {
    createAuthOverlay();
  }
}

function initAuthProtection() {
  ensureAuthenticated();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initAuthProtection
  );
} else {
  initAuthProtection();
}