/**
 * Learning Schedule Manager
 * 
 * Gerencia cronograma personalizado de aprendizado baseado no perfil do usuário
 * Calcula progresso e sugere próximos passos
 */

const STORAGE_KEY = 'sei-learning-schedule';
const STORAGE_USER_KEY = 'sei-active-user';

/**
 * Estrutura do cronograma por semana
 * Cada semana tem módulos, tópicos e atividades recomendadas
 */
const LEARNING_CURRICULUM = [
  {
    semana: 1,
    titulo: "Fundamentos Básicos",
    tema: "Começar do Zero",
    topicos: [
      "O que é investimento",
      "Por que investir",
      "Tipos básicos de investimento",
      "Seu perfil como investidor"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Introdução aos Investimentos", duracao: 30 },
      { tipo: "video", titulo: "Os 5 Maiores Mitos sobre Investimento", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Fundamentos Básicos", duracao: 10 }
    ],
    xpReward: 100
  },
  {
    semana: 2,
    titulo: "Entendendo o Risco",
    tema: "Risco e Retorno",
    topicos: [
      "O que é risco",
      "Relação risco-retorno",
      "Perfis de investidor",
      "Adequação do risco"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Risco e Retorno na Prática", duracao: 30 },
      { tipo: "simulador", titulo: "Simule seu Perfil de Risco", duracao: 20 },
      { tipo: "quiz", titulo: "Quiz: Gerenciamento de Risco", duracao: 10 }
    ],
    xpReward: 120
  },
  {
    semana: 3,
    titulo: "Instrumentos Financeiros",
    tema: "Produtos de Investimento",
    topicos: [
      "Renda Fixa (CDB, LCI, Tesouro)",
      "Fundos de Investimento",
      "Ações na Prática",
      "Índices de Referência (CDI, Selic, IPCA)"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Renda Fixa: Guia Completo", duracao: 40 },
      { tipo: "video", titulo: "O que são Ações e Como Comprar", duracao: 20 },
      { tipo: "calculadora", titulo: "Calcule Rendimento de CDB", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Instrumentos Financeiros", duracao: 10 }
    ],
    xpReward: 150
  },
  {
    semana: 4,
    titulo: "Reserva de Emergência",
    tema: "Segurança Financeira",
    topicos: [
      "Por que poupar para emergências",
      "Quanto poupar (6-12 meses)",
      "Onde guardar com segurança",
      "Liquidez e rentabilidade"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Reserva de Emergência: Guia Prático", duracao: 30 },
      { tipo: "calculadora", titulo: "Calcule sua Reserva Ideal", duracao: 15 },
      { tipo: "video", titulo: "Investimentos para Reserva de Emergência", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Planejamento de Emergência", duracao: 10 }
    ],
    xpReward: 130
  },
  {
    semana: 5,
    titulo: "Primeiros Investimentos",
    tema: "Começar a Investir",
    topicos: [
      "Abrir conta em corretora",
      "Seu primeiro aporte",
      "Escolher o primeiro ativo",
      "Acompanhamento inicial"
    ],
    atividades: [
      { tipo: "guia", titulo: "Guia: Abrir Conta em Corretora", duracao: 40 },
      { tipo: "video", titulo: "Seu Primeiro Investimento Passo a Passo", duracao: 20 },
      { tipo: "simulador", titulo: "Simule seu Primeiro Aporte", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Primeiros Passos", duracao: 10 }
    ],
    xpReward: 140
  },
  {
    semana: 6,
    titulo: "Construindo Diversificação",
    tema: "Carteira Equilibrada",
    topicos: [
      "O que é diversificação",
      "Alocação de ativos",
      "Perfil conservador, moderado, arrojado",
      "Rebalanceamento"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Diversificação: A Chave do Sucesso", duracao: 35 },
      { tipo: "calculadora", titulo: "Monte sua Carteira Diversificada", duracao: 20 },
      { tipo: "simulador", titulo: "Simule Carteira por Perfil", duracao: 20 },
      { tipo: "quiz", titulo: "Quiz: Diversificação", duracao: 10 }
    ],
    xpReward: 150
  },
  {
    semana: 7,
    titulo: "Análise Básica",
    tema: "Tomando Decisões Informadas",
    topicos: [
      "Leitura de indicadores (Selic, CDI, IPCA)",
      "Como ler gráficos básicos",
      "Notícias e seu impacto",
      "Ferramentas de análise"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Indicadores que Movem o Mercado", duracao: 40 },
      { tipo: "video", titulo: "Como Interpretar Gráficos Financeiros", duracao: 25 },
      { tipo: "tutorial", titulo: "Tutorial: Ferramentas de Análise", duracao: 30 },
      { tipo: "quiz", titulo: "Quiz: Análise de Mercado", duracao: 10 }
    ],
    xpReward: 160
  },
  {
    semana: 8,
    titulo: "Ações Avançado",
    tema: "Investindo em Empresas",
    topicos: [
      "Análise fundamentalista básica",
      "Leitura de demonstrações financeiras",
      "Dividendos e proventos",
      "Setores e tendências"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Análise Fundamentalista Simplificada", duracao: 45 },
      { tipo: "case_study", titulo: "Estudo de Caso: Análise de Empresa", duracao: 40 },
      { tipo: "simulador", titulo: "Simule Investimento em Ações", duracao: 20 },
      { tipo: "quiz", titulo: "Quiz: Análise de Ações", duracao: 10 }
    ],
    xpReward: 180
  },
  {
    semana: 9,
    titulo: "Fundos e ETFs",
    tema: "Investimento Simplificado",
    topicos: [
      "Tipos de fundos",
      "ETFs e suas vantagens",
      "Comparação de custos",
      "Tracker vs Gestão Ativa"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Fundos: Quando e Como Usar", duracao: 35 },
      { tipo: "video", titulo: "ETFs Explicados para Iniciantes", duracao: 20 },
      { tipo: "calculadora", titulo: "Compare Custos de Fundos", duracao: 20 },
      { tipo: "quiz", titulo: "Quiz: Fundos e ETFs", duracao: 10 }
    ],
    xpReward: 140
  },
  {
    semana: 10,
    titulo: "Renda Passiva",
    tema: "Ganhos Recorrentes",
    topicos: [
      "O que é renda passiva",
      "FIIs (Fundos Imobiliários)",
      "Dividendos e juros sobre juros",
      "Planejamento para renda passiva"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Renda Passiva: Realidade vs Mito", duracao: 40 },
      { tipo: "video", titulo: "FIIs: Investimento em Imóveis pela Bolsa", duracao: 20 },
      { tipo: "calculadora", titulo: "Calcule sua Meta de Renda Passiva", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Renda Passiva", duracao: 10 }
    ],
    xpReward: 150
  },
  {
    semana: 11,
    titulo: "Imposto e Tributação",
    tema: "Otimizando Retornos",
    topicos: [
      "Como funciona tributação de investimento",
      "Alíquotas por tipo de ativo",
      "Planejamento tributário simples",
      "Aproveitando deduções"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Tributação de Investimentos no Brasil", duracao: 40 },
      { tipo: "video", titulo: "Guia de IR para Investidores", duracao: 25 },
      { tipo: "calculadora", titulo: "Simule Impacto de Impostos", duracao: 15 },
      { tipo: "quiz", titulo: "Quiz: Tributação", duracao: 10 }
    ],
    xpReward: 140
  },
  {
    semana: 12,
    titulo: "Planejamento a Longo Prazo",
    tema: "Construindo Patrimônio",
    topicos: [
      "Meta do Primeiro Milhão",
      "Poder dos juros compostos",
      "Ciclos de investimento",
      "Revisão e ajuste de estratégia"
    ],
    atividades: [
      { tipo: "leitura", titulo: "Poder dos Juros Compostos", duracao: 35 },
      { tipo: "calculadora", titulo: "Quando atingir R$ 1.000.000", duracao: 20 },
      { tipo: "simulador", titulo: "Projete seu Patrimônio em 10 Anos", duracao: 25 },
      { tipo: "quiz", titulo: "Quiz: Planejamento a Longo Prazo", duracao: 10 },
      { tipo: "reflexao", titulo: "Reflexão: Seu Plano Financeiro Pessoal", duracao: 30 }
    ],
    xpReward: 200
  }
];

/**
 * Inicializa o cronograma para um usuário
 * @param {object} user - Objeto do usuário com id, name, investorProfile
 * @returns {object} - Cronograma inicializado
 */
function initializeSchedule(user) {
  const now = new Date();
  const schedule = {
    userId: user.id,
    userName: user.name,
    perfil: user.investorProfile || { tipo: 'moderado', risco: 'médio' },
    dataInicio: now.toISOString(),
    dataAtual: now.toISOString(),
    semanaAtual: 1,
    totalXP: 0,
    nivelUsuario: 'Iniciante',
    progressoGeral: 0,
    atividadesCompletas: [],
    ultimaAtualizacao: now.toISOString(),
    ativadoEm: now.toISOString()
  };

  saveSchedule(schedule);
  return schedule;
}

/**
 * Salva cronograma no localStorage
 * @param {object} schedule - Cronograma a ser salvo
 */
function saveSchedule(schedule) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error('Erro ao salvar cronograma:', error);
  }
}

/**
 * Carrega cronograma do localStorage
 * @returns {object|null} - Cronograma carregado ou null se não existir
 */
function loadSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Erro ao carregar cronograma:', error);
    return null;
  }
}

/**
 * Obtém cronograma do usuário (cria se não existir)
 * @returns {object} - Cronograma do usuário
 */
function getUserSchedule() {
  let schedule = loadSchedule();

  if (!schedule) {
    try {
      const userRaw = localStorage.getItem(STORAGE_USER_KEY);
      const user = userRaw ? JSON.parse(userRaw) : null;

      if (!user) {
        return null;
      }

      schedule = initializeSchedule(user);
    } catch (error) {
      console.error('Erro ao obter cronograma:', error);
      return null;
    }
  }

  return schedule;
}

/**
 * Marca uma atividade como completa
 * @param {number} semana - Número da semana (1-12)
 * @param {number} indiceAtividade - Índice da atividade na semana
 * @param {number} xpGanho - XP ganhado
 */
function completeActivity(semana, indiceAtividade, xpGanho) {
  const schedule = getUserSchedule();
  if (!schedule) return;

  const atividadeId = `semana${semana}_atividade${indiceAtividade}`;

  if (!schedule.atividadesCompletas.includes(atividadeId)) {
    schedule.atividadesCompletas.push(atividadeId);
    schedule.totalXP = (schedule.totalXP || 0) + (xpGanho || 50);
    schedule.dataAtual = new Date().toISOString();

    // Atualiza nível
    schedule.nivelUsuario = calculateLevel(schedule.totalXP);

    // Atualiza progresso
    schedule.progressoGeral = calculateProgress(schedule.semanaAtual);

    saveSchedule(schedule);
  }
}

/**
 * Calcula o nível do usuário baseado no XP
 * @param {number} totalXP - Total de XP
 * @returns {string} - Nível do usuário
 */
function calculateLevel(totalXP) {
  if (totalXP < 500) return 'Iniciante';
  if (totalXP < 1000) return 'Aprendiz';
  if (totalXP < 2000) return 'Intermediário';
  if (totalXP < 3500) return 'Avançado';
  return 'Expert';
}

/**
 * Calcula progresso percentual do cronograma
 * @param {number} semanaAtual - Semana atual
 * @returns {number} - Percentual de progresso (0-100)
 */
function calculateProgress(semanaAtual) {
  return Math.round((semanaAtual / 12) * 100);
}

/**
 * Obtém próxima semana recomendada
 * @returns {object} - Próxima semana do cronograma
 */
function getNextWeek() {
  const schedule = getUserSchedule();
  if (!schedule) return null;

  const proximaSemana = Math.min(schedule.semanaAtual + 1, 12);
  return LEARNING_CURRICULUM[proximaSemana - 1];
}

/**
 * Obtém semana atual
 * @returns {object} - Semana atual do cronograma
 */
function getCurrentWeek() {
  const schedule = getUserSchedule();
  if (!schedule) return null;

  return LEARNING_CURRICULUM[schedule.semanaAtual - 1];
}

/**
 * Avança para próxima semana
 */
function advanceToNextWeek() {
  const schedule = getUserSchedule();
  if (!schedule || schedule.semanaAtual >= 12) return;

  schedule.semanaAtual++;
  schedule.dataAtual = new Date().toISOString();
  schedule.progressoGeral = calculateProgress(schedule.semanaAtual);

  saveSchedule(schedule);
}

/**
 * Obtém resumo do cronograma para exibição
 * @returns {object} - Resumo do cronograma
 */
function getScheduleSummary() {
  const schedule = getUserSchedule();
  if (!schedule) return null;

  const semanaAtual = LEARNING_CURRICULUM[schedule.semanaAtual - 1];
  const proximaSemana = getNextWeek();

  return {
    usuario: schedule.userName,
    semanaAtual: schedule.semanaAtual,
    tituloSemana: semanaAtual?.titulo,
    temaSemana: semanaAtual?.tema,
    proximaSemana: proximaSemana?.titulo,
    totalXP: schedule.totalXP,
    nivelUsuario: schedule.nivelUsuario,
    progressoGeral: schedule.progressoGeral,
    perfil: schedule.perfil,
    atividadesConcluidas: schedule.atividadesCompletas.length,
    totalAtividades: getTotalActivities()
  };
}

/**
 * Obtém total de atividades do currículo
 * @returns {number} - Total de atividades
 */
function getTotalActivities() {
  return LEARNING_CURRICULUM.reduce((total, semana) => {
    return total + (semana.atividades ? semana.atividades.length : 0);
  }, 0);
}

/**
 * Obtém recomendação de próximas atividades
 * @param {number} limit - Número de atividades a retornar
 * @returns {array} - Array com atividades recomendadas
 */
function getRecommendedActivities(limit = 5) {
  const schedule = getUserSchedule();
  if (!schedule) return [];

  const semanaAtual = LEARNING_CURRICULUM[schedule.semanaAtual - 1];
  if (!semanaAtual || !semanaAtual.atividades) return [];

  const nãoConcluidas = semanaAtual.atividades.filter((ativ, idx) => {
    const atividadeId = `semana${schedule.semanaAtual}_atividade${idx}`;
    return !schedule.atividadesCompletas.includes(atividadeId);
  });

  return nãoConcluidas.slice(0, limit);
}

/**
 * Reseta o cronograma do usuário (apenas para testes)
 */
function resetSchedule() {
  localStorage.removeItem(STORAGE_KEY);
}

export {
  initializeSchedule,
  getUserSchedule,
  loadSchedule,
  saveSchedule,
  completeActivity,
  getNextWeek,
  getCurrentWeek,
  advanceToNextWeek,
  getScheduleSummary,
  getRecommendedActivities,
  getTotalActivities,
  calculateLevel,
  calculateProgress,
  resetSchedule,
  LEARNING_CURRICULUM
};
