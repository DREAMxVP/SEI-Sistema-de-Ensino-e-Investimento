import {
  LEARNING_MODULES,
  getLessonById,
  getQuizById,
  getTotalLessonsCount
} from "./learning-data.js";

const SESSION_KEY = "sei-active-user";
const STATE_KEY_PREFIX = "sei-learning-state-v1";

// Cada usuário logado possui um estado de progresso independente no localStorage.
function getStateStorageKey() {
  const user = getActiveUser();
  const userId = user?.id || "guest";
  return `${STATE_KEY_PREFIX}:${userId}`;
}

export function getActiveUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDefaultUnlockedLessons() {
  return LEARNING_MODULES.reduce((acc, module) => {
    const firstLesson = module.lessons[0];
    if (firstLesson) {
      acc[firstLesson.id] = true;
    }
    return acc;
  }, {});
}

function getDefaultState() {
  return {
    xp: 0,
    completedLessons: {},
    unlockedLessons: getDefaultUnlockedLessons(),
    quizResults: {},
    updatedAt: new Date().toISOString()
  };
}

function normalizeState(state) {
  const base = getDefaultState();
  const merged = {
    ...base,
    ...(state || {}),
    completedLessons: {
      ...base.completedLessons,
      ...(state?.completedLessons || {})
    },
    unlockedLessons: {
      ...base.unlockedLessons,
      ...(state?.unlockedLessons || {})
    },
    quizResults: {
      ...base.quizResults,
      ...(state?.quizResults || {})
    }
  };

  return merged;
}

export function loadLearningState() {
  try {
    const raw = localStorage.getItem(getStateStorageKey());
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeState(null);
  }
}

export function saveLearningState(state) {
  const normalized = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  localStorage.setItem(getStateStorageKey(), JSON.stringify(normalized));
  return normalized;
}

export function getLevelFromXp(xp) {
  if (xp >= 900) {
    return "Especialista";
  }
  if (xp >= 550) {
    return "Avançado";
  }
  if (xp >= 250) {
    return "Intermediário";
  }
  return "Iniciante";
}

export function getModuleProgress(moduleId, state = loadLearningState()) {
  const module = LEARNING_MODULES.find((item) => item.id === moduleId);
  if (!module || !module.lessons.length) {
    return 0;
  }

  const completedCount = module.lessons.filter((lesson) => Boolean(state.completedLessons[lesson.id])).length;
  return Math.round((completedCount / module.lessons.length) * 100);
}

export function getOverallProgress(state = loadLearningState()) {
  const total = getTotalLessonsCount();
  if (!total) {
    return 0;
  }
  const completed = Object.values(state.completedLessons).filter(Boolean).length;
  return Math.round((completed / total) * 100);
}

export function isLessonUnlocked(lessonId, state = loadLearningState()) {
  return Boolean(state.unlockedLessons[lessonId]);
}

export function isLessonCompleted(lessonId, state = loadLearningState()) {
  return Boolean(state.completedLessons[lessonId]);
}

export function getNextLessonForModule(moduleId, state = loadLearningState()) {
  const module = LEARNING_MODULES.find((item) => item.id === moduleId);
  if (!module) {
    return null;
  }

  return (
    module.lessons.find((lesson) => isLessonUnlocked(lesson.id, state) && !isLessonCompleted(lesson.id, state)) ||
    module.lessons[module.lessons.length - 1] ||
    null
  );
}

export function completeLesson(lessonId) {
  const lessonInfo = getLessonById(lessonId);
  if (!lessonInfo) {
    return { ok: false, message: "Aula não encontrada." };
  }

  const state = loadLearningState();
  if (!isLessonUnlocked(lessonId, state)) {
    return { ok: false, message: "Esta aula ainda está bloqueada." };
  }

  const { module, lesson } = lessonInfo;
  const alreadyCompleted = Boolean(state.completedLessons[lessonId]);
  let xpGained = 0;

  state.completedLessons[lessonId] = new Date().toISOString();

  if (!alreadyCompleted) {
    xpGained = Number(lesson.xp || 0);
    state.xp += xpGained;
  }

  // Ao concluir uma aula, a próxima da mesma trilha é desbloqueada automaticamente.
  const currentIndex = module.lessons.findIndex((item) => item.id === lessonId);
  const nextLesson = module.lessons[currentIndex + 1];
  if (nextLesson) {
    state.unlockedLessons[nextLesson.id] = true;
  }

  saveLearningState(state);
  return {
    ok: true,
    xpGained,
    alreadyCompleted,
    message: alreadyCompleted
      ? "Aula já concluída anteriormente."
      : `Aula concluída! +${xpGained} XP.`
  };
}

export function submitQuiz(quizId, answers = {}) {
  const quizInfo = getQuizById(quizId);
  if (!quizInfo) {
    return { ok: false, message: "Quiz não encontrado." };
  }

  const { quiz } = quizInfo;
  const total = quiz.perguntas.length;
  let correctCount = 0;

  quiz.perguntas.forEach((question) => {
    const selected = Number(answers[question.id]);
    if (selected === question.correta) {
      correctCount += 1;
    }
  });

  const score = Math.round((correctCount / total) * 100);
  const state = loadLearningState();

  // XP do quiz é progressivo: melhora de nota gera apenas diferença de XP, evitando farm infinito.
  const currentTargetXp = score >= 80 ? 45 : score >= 50 ? 25 : 10;
  const previousXp = Number(state.quizResults[quizId]?.xpAwarded || 0);
  const xpGained = Math.max(0, currentTargetXp - previousXp);

  state.quizResults[quizId] = {
    score,
    correctCount,
    total,
    xpAwarded: Math.max(previousXp, currentTargetXp),
    answeredAt: new Date().toISOString()
  };

  state.xp += xpGained;
  saveLearningState(state);

  return {
    ok: true,
    score,
    correctCount,
    total,
    xpGained,
    approved: score >= 70
  };
}

export function getProfileSummary() {
  const user = getActiveUser();
  const state = loadLearningState();

  const overallProgress = getOverallProgress(state);
  const level = getLevelFromXp(state.xp);
  const investorProfile = user?.investorProfile?.tipo || "moderado";

  return {
    userName: user?.name || "Visitante",
    email: user?.email || "",
    investorProfile,
    xp: state.xp,
    level,
    overallProgress
  };
}

export function getRecommendations(maxItems = 3) {
  const state = loadLearningState();
  const recommendations = [];

  const firstPending = LEARNING_MODULES
    .flatMap((module) => module.lessons)
    .find((lesson) => isLessonUnlocked(lesson.id, state) && !isLessonCompleted(lesson.id, state));

  if (firstPending) {
    recommendations.push(`Continue na aula "${firstPending.titulo}" para manter ritmo de estudos.`);
  }

  if (state.xp < 250) {
    recommendations.push("Priorize os módulos iniciais para consolidar base e ganhar XP rapidamente.");
  }

  const overall = getOverallProgress(state);
  if (overall >= 50) {
    recommendations.push("Você já passou da metade da trilha: avance para simulador e rebalanceamento no painel.");
  } else {
    recommendations.push("Após cada aula, faça o quiz para acelerar progressão e reforçar aprendizado.");
  }

  return recommendations.slice(0, maxItems);
}

export function getDashboardSnapshot() {
  const state = loadLearningState();

  const modules = LEARNING_MODULES.map((module) => ({
    id: module.id,
    nivel: module.nivel,
    titulo: module.titulo,
    descricao: module.descricao,
    progress: getModuleProgress(module.id, state),
    nextLesson: getNextLessonForModule(module.id, state)
  }));

  return {
    xp: state.xp,
    level: getLevelFromXp(state.xp),
    overallProgress: getOverallProgress(state),
    modules,
    recommendations: getRecommendations(4)
  };
}
