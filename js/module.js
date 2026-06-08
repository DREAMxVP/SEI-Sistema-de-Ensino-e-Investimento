import { getModuleById } from "./learning-data.js";
import {
  getModuleProgress,
  getNextLessonForModule,
  isLessonCompleted,
  isLessonUnlocked,
  loadLearningState
} from "./learning-state.js";

function getModuleIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[1] || "iniciante";
}

function renderModule() {
  const moduleId = getModuleIdFromPath();
  const moduleData = getModuleById(moduleId) || getModuleById("iniciante");
  const state = loadLearningState();

  const title = document.getElementById("moduleTitle");
  const description = document.getElementById("moduleDescription");
  const lessons = document.getElementById("moduleLessons");
  const progress = document.getElementById("moduleProgress");
  const continueButton = document.getElementById("moduleContinueButton");

  if (title) {
    title.textContent = moduleData.titulo;
  }

  if (description) {
    description.textContent = moduleData.descricao;
  }

  if (lessons) {
    lessons.innerHTML = moduleData.lessons
      .map((lesson, index) => {
        const unlocked = isLessonUnlocked(lesson.id, state);
        const completed = isLessonCompleted(lesson.id, state);
        const status = completed ? "✅ Concluída" : unlocked ? "🔓 Disponível" : "🔒 Bloqueada";
        const action = unlocked
          ? `<a class="panel-link" href="/lesson/${lesson.id}">Abrir aula</a>`
          : `<span class="panel-link" aria-disabled="true">Complete a aula anterior</span>`;

        return `
          <article class="topic-card">
            <p class="eyebrow">Aula ${index + 1}</p>
            <h3>${lesson.titulo}</h3>
            <p>${lesson.resumo}</p>
            <p class="topic-example">${status}</p>
            ${action}
          </article>
        `;
      })
      .join("");
  }

  if (progress) {
    progress.textContent = `${getModuleProgress(moduleData.id, state)}%`;
  }

  if (continueButton) {
    const nextLesson = getNextLessonForModule(moduleData.id, state);
    continueButton.href = nextLesson ? `/lesson/${nextLesson.id}` : "/modules";
    continueButton.textContent = nextLesson ? "Continuar módulo" : "Voltar para módulos";
  }
}

renderModule();
