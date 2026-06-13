import { getLessonById } from "./learning-data.js";
import {
  completeLesson,
  isLessonCompleted,
  isLessonUnlocked,
  loadLearningState
} from "./learning-state.js";

function getLessonIdFromPath() {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get("id");
  if (queryId) {
    return queryId;
  }

  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  return last && !last.endsWith(".html") ? last : "fundamentos-1";
}

function renderLesson() {
  const lessonId = getLessonIdFromPath();
  const lessonInfo = getLessonById(lessonId) || getLessonById("fundamentos-1");
  const state = loadLearningState();

  if (!lessonInfo) {
    window.location.href = "modules.html";
    return;
  }

  const { module, lesson } = lessonInfo;

  const title = document.getElementById("lessonTitle");
  const summary = document.getElementById("lessonSummary");
  const content = document.getElementById("lessonContent");
  const example = document.getElementById("lessonExample");
  const quizButton = document.getElementById("lessonQuizButton");
  const completeButton = document.getElementById("completeLessonButton");
  const feedback = document.getElementById("lessonFeedback");

  if (!isLessonUnlocked(lesson.id, state)) {
    window.location.href = `module.html?id=${module.id}`;
    return;
  }

  if (title) title.textContent = lesson.titulo;
  if (summary) summary.textContent = `${lesson.resumo} • Módulo: ${module.titulo}`;
  if (content) content.textContent = lesson.conteudo;
  if (example) example.textContent = lesson.exemplo;
  if (quizButton) quizButton.href = `quiz.html?id=${lesson.quiz.id}`;

  if (feedback && isLessonCompleted(lesson.id, state)) {
    feedback.textContent = "Aula já concluída anteriormente. Você pode revisar o conteúdo e refazer o quiz.";
  }

  if (completeButton) {
    completeButton.addEventListener("click", () => {
      const completion = completeLesson(lesson.id);
      if (feedback) {
        feedback.textContent = completion.ok
          ? `${completion.message} Próximo passo: responder o quiz da aula.`
          : completion.message;
      }
    });
  }
}

renderLesson();
