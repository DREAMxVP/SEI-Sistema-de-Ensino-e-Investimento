import { getActiveUser } from "./learning-state.js";

const UNPROTECTED_PATHS = ["/login.html", "/register.html", "/index.html", "/", "/pages/login.html", "/pages/register.html"];

function normalizePath(path) {
  return path.replace(/\/+$|\\/g, "/").toLowerCase();
}

function isProtectedPath() {
  const current = normalizePath(window.location.pathname);
  return !UNPROTECTED_PATHS.includes(current);
}

function getRegisterTarget() {
  return window.location.pathname.includes("/pages/") ? "register.html" : "pages/register.html";
}

function createAuthOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "auth-overlay";
  overlay.innerHTML = `
    <div class="auth-overlay-card">
      <span class="auth-overlay-badge">Acesso exclusivo</span>
      <h2>Crie sua conta para aproveitar nossas ferramentas</h2>
      <p>Você precisa de um acesso rápido para abrir módulos, usar simuladores avançados e desbloquear conteúdo de aprendizado.</p>
      <div class="auth-overlay-actions">
        <button type="button" class="auth-overlay-button" id="authOverlayRegister">Criar conta</button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      event.stopPropagation();
    }
  });

  document.body.classList.add("auth-blocked");
  document.body.appendChild(overlay);

  const button = document.getElementById("authOverlayRegister");
  if (button) {
    button.addEventListener("click", function () {
      window.location.href = getRegisterTarget();
    });
  }
}

function ensureAuthenticated() {
  if (!isProtectedPath()) {
    return;
  }

  const activeUser = getActiveUser();
  if (!activeUser || !activeUser.id) {
    createAuthOverlay();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureAuthenticated);
} else {
  ensureAuthenticated();
}
