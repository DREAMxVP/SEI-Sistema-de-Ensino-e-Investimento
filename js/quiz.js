import { getQuizById } from "./learning-data.js";
import { submitQuiz } from "./learning-state.js";

function getQuizIdFromPath() {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get("id");
  if (queryId) {
    return queryId;
  }

  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  return last && !last.endsWith(".html") ? last : "fundamentos-1";
}

function renderQuiz() {
  const quizId = getQuizIdFromPath();
  const quizInfo = getQuizById(quizId) || getQuizById("fundamentos-1");
  if (!quizInfo) {
    window.location.href = "modules.html";
    return;
  }

  const { lesson, quiz } = quizInfo;

  const title = document.getElementById("quizTitle");
  const question = document.getElementById("quizQuestion");
  const form = document.getElementById("quizForm");
  const result = document.getElementById("quizResult");

  if (title) title.textContent = `Quiz • ${lesson.titulo}`;
  if (question) question.textContent = "Responda as perguntas abaixo:";

  if (!form) {
    return;
  }

  form.innerHTML = `
    ${quiz.perguntas
      .map(
        (pergunta, questionIndex) => `
      <fieldset class="topic-card">
        <legend><strong>${questionIndex + 1}. ${pergunta.enunciado}</strong></legend>
        ${pergunta.opcoes
          .map(
            (opcao, optionIndex) => `
          <label>
            <input type="radio" name="${pergunta.id}" value="${optionIndex}" required>
            ${opcao}
          </label>
        `
          )
          .join("")}
      </fieldset>
    `
      )
      .join("")}
    <button type="submit" class="btn-primary">Responder</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const answers = {};
    quiz.perguntas.forEach((pergunta) => {
      answers[pergunta.id] = Number(formData.get(pergunta.id));
    });

    const submission = submitQuiz(quiz.id, answers);
    if (!submission.ok) {
      if (result) {
        result.textContent = submission.message;
      }
      return;
    }

    if (result) {
      const status = submission.approved ? "✅ Aprovado" : "⚠️ Continue praticando";
      result.innerHTML = `${status} • Pontuação: <strong>${submission.score}%</strong> (${submission.correctCount}/${submission.total}) • XP ganho: <strong>+${submission.xpGained}</strong>. <a class="panel-link" href="lesson.html?id=${lesson.id}">Revisar aula</a>`;
    }
  });
}

renderQuiz();
