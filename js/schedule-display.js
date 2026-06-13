/**
 * Schedule Display Component
 * 
 * Exibe cronograma personalizado do usuário em qualquer página
 * Inicializa cronograma se usuário autenticado
 */

import { 
  getUserSchedule, 
  getScheduleSummary, 
  getRecommendedActivities,
  initializeSchedule,
  LEARNING_CURRICULUM
} from './learning-schedule.js';

const STORAGE_USER_KEY = 'sei-active-user';

/**
 * Inicializa e exibe cronograma
 */
function initializeAndDisplaySchedule() {
  try {
    // Carrega usuário ativo
    const userRaw = localStorage.getItem(STORAGE_USER_KEY);
    if (!userRaw) {
      console.log('[Schedule] Nenhum usuário autenticado');
      return;
    }

    const user = JSON.parse(userRaw);
    
    // Obtém ou cria cronograma
    let schedule = getUserSchedule();
    if (!schedule) {
      console.log('[Schedule] Criando novo cronograma para', user.name);
      schedule = initializeSchedule(user);
    }

    // Exibe sumário
    const summary = getScheduleSummary();
    displayScheduleSummary(summary);

    // Exibe atividades recomendadas
    const recommended = getRecommendedActivities(3);
    displayRecommendedActivities(recommended, summary);

  } catch (error) {
    console.error('[Schedule] Erro ao inicializar:', error);
  }
}

/**
 * Exibe sumário do cronograma
 * @param {object} summary - Sumário do cronograma
 */
function displayScheduleSummary(summary) {
  if (!summary) return;

  const container = document.getElementById('cronogramaDisplay') || 
                   document.getElementById('scheduleContainer') ||
                   createScheduleContainer();

  const progressPercent = summary.progressoGeral;
  const cor = progressPercent < 33 ? '#ff6f00' : progressPercent < 66 ? '#1976d2' : '#388e3c';

  container.innerHTML = `
    <div style="padding: 15px; border-radius: 8px; background: #f5f5f5;">
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">
          📅 Semana ${summary.semanaAtual}/12: ${summary.tituloSemana}
        </h3>
        <p style="margin: 5px 0; color: #666; font-size: 0.95em;">
          <strong>Tema:</strong> ${summary.temaSemana}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 0.95em;">
          <strong>Perfil:</strong> ${summary.perfil.tipo} (${summary.perfil.risco})
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 0.9em; color: #666;">Progresso Geral</span>
          <span style="font-size: 0.9em; font-weight: bold; color: ${cor};">${progressPercent}%</span>
        </div>
        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: ${cor}; height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #9c27b0;">
          <p style="margin: 0; font-size: 0.85em; color: #666;">XP Total</p>
          <p style="margin: 5px 0 0 0; font-size: 1.3em; font-weight: bold; color: #9c27b0;">
            ${summary.totalXP}
          </p>
        </div>
        <div style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #2196f3;">
          <p style="margin: 0; font-size: 0.85em; color: #666;">Nível</p>
          <p style="margin: 5px 0 0 0; font-size: 1.3em; font-weight: bold; color: #2196f3;">
            ${summary.nivelUsuario}
          </p>
        </div>
      </div>

      <div style="padding: 12px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3;">
        <p style="margin: 0; font-size: 0.9em;">
          <strong>📊 Próxima Semana:</strong> ${summary.proximaSemana || 'Parabéns! Cronograma completo!'}
        </p>
      </div>
    </div>
  `;
}

/**
 * Exibe atividades recomendadas
 * @param {array} activities - Lista de atividades
 * @param {object} summary - Sumário do cronograma
 */
function displayRecommendedActivities(activities, summary) {
  const container = document.getElementById('recommendedActivities') || 
                   document.getElementById('activitiesContainer') ||
                   createActivitiesContainer();

  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div style="padding: 15px; background: #c8e6c9; border-radius: 6px; text-align: center;">
        <p style="margin: 0; color: #2e7d32;">✅ Parabéns! Você completou todos os conteúdos desta semana!</p>
      </div>
    `;
    return;
  }

  let html = `
    <div style="padding: 15px;">
      <h4 style="margin: 0 0 15px 0; color: #333;">🎯 Próximos Passos (${activities.length} atividades)</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
  `;

  const icones = {
    leitura: '📖',
    video: '🎥',
    quiz: '❓',
    calculadora: '🧮',
    simulador: '📊',
    guia: '📚',
    tutorial: '🎓',
    case_study: '📑',
    reflexao: '💭'
  };

  activities.forEach((activity, idx) => {
    const icone = icones[activity.tipo] || '📝';
    html += `
      <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; border-left: 4px solid #2196f3;">
        <p style="margin: 0 0 5px 0; font-size: 0.9em; color: #2196f3; font-weight: bold;">
          ${icone} ${activity.tipo.toUpperCase()}
        </p>
        <p style="margin: 0 0 5px 0; font-size: 0.95em; color: #333;">
          <strong>${activity.titulo}</strong>
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #999;">
          ⏱️ ${activity.duracao} min
        </p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Cria container para cronograma se não existir
 * @returns {element} - Elemento criado
 */
function createScheduleContainer() {
  const container = document.createElement('div');
  container.id = 'cronogramaDisplay';
  container.style.marginBottom = '20px';
  
  const mainContent = document.querySelector('main') || document.body;
  mainContent.insertBefore(container, mainContent.firstChild);
  
  return container;
}

/**
 * Cria container para atividades se não existir
 * @returns {element} - Elemento criado
 */
function createActivitiesContainer() {
  const container = document.createElement('div');
  container.id = 'recommendedActivities';
  container.style.marginTop = '20px';
  container.style.marginBottom = '20px';
  
  const mainContent = document.querySelector('main') || document.body;
  mainContent.appendChild(container);
  
  return container;
}

/**
 * Exibe informações gerais do cronograma
 */
function displayScheduleInfo() {
  const container = document.getElementById('scheduleInfo');
  if (!container) return;

  const html = `
    <div style="padding: 15px; background: #f5f5f5; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">📚 Seu Caminho de Aprendizado</h3>
      <p style="margin: 5px 0; color: #666; font-size: 0.95em;">
        Este cronograma foi especialmente desenvolvido para levar você do zero ao domínio em investimento financeiro.
      </p>
      <p style="margin: 5px 0; color: #666; font-size: 0.95em;">
        <strong>Total:</strong> 12 semanas | <strong>Atividades:</strong> ${getTotalActivitiesCount()} | <strong>Estimado:</strong> 50-60 horas
      </p>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Conta total de atividades no currículo
 * @returns {number} - Total de atividades
 */
function getTotalActivitiesCount() {
  return LEARNING_CURRICULUM.reduce((total, semana) => {
    return total + (semana.atividades ? semana.atividades.length : 0);
  }, 0);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Schedule] Inicializando display de cronograma...');
  initializeAndDisplaySchedule();
  displayScheduleInfo();
});

// Exportar para uso em outros arquivos
export {
  initializeAndDisplaySchedule,
  displayScheduleSummary,
  displayRecommendedActivities,
  displayScheduleInfo
};
