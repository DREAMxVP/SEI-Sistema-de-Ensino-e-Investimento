export const LEARNING_MODULES = [
  {
    id: "iniciante",
    nivel: "Iniciante",
    titulo: "Fundamentos de investimento",
    descricao: "Construa base sólida com organização financeira, objetivos e primeiros passos.",
    lessons: [
      {
        id: "fundamentos-1",
        titulo: "Reserva de emergência",
        resumo: "O primeiro passo para investir com segurança.",
        conteudo: "Monte uma reserva entre 6 e 12 meses de despesas em ativos de liquidez diária e baixo risco.",
        exemplo: "Se seu custo mensal é R$ 2.500, a meta inicial da reserva fica entre R$ 15.000 e R$ 30.000.",
        xp: 40,
        quiz: {
          id: "fundamentos-1",
          perguntas: [
            {
              id: "q1",
              enunciado: "Qual faixa é recomendada para reserva de emergência?",
              opcoes: ["1 a 2 meses", "6 a 12 meses", "24 meses fixos"],
              correta: 1,
              explicacao: "A faixa de 6 a 12 meses protege imprevistos sem depender de crédito caro."
            },
            {
              id: "q2",
              enunciado: "Qual característica é essencial na reserva?",
              opcoes: ["Alta volatilidade", "Liquidez diária", "Prazo de carência longo"],
              correta: 1,
              explicacao: "Reserva é para emergência, então precisa de acesso rápido ao dinheiro."
            }
          ]
        }
      },
      {
        id: "fundamentos-2",
        titulo: "Objetivos financeiros",
        resumo: "Defina metas para escolher melhor seus investimentos.",
        conteudo: "Separar metas por prazo (curto, médio e longo) ajuda a montar carteiras adequadas para cada objetivo.",
        exemplo: "Curto: reserva; médio: viagem; longo: aposentadoria e independência financeira.",
        xp: 40,
        quiz: {
          id: "fundamentos-2",
          perguntas: [
            {
              id: "q1",
              enunciado: "Qual prática melhora decisões de investimento?",
              opcoes: ["Investir sem metas", "Separar metas por prazo", "Usar apenas um ativo para tudo"],
              correta: 1,
              explicacao: "Metas por prazo conectam risco e liquidez ao objetivo correto."
            },
            {
              id: "q2",
              enunciado: "Uma meta de curto prazo deve priorizar:",
              opcoes: ["Liquidez e segurança", "Risco alto", "Alavancagem"],
              correta: 0,
              explicacao: "No curto prazo, oscilações podem atrapalhar, então liquidez e proteção são prioridade."
            }
          ]
        }
      },
      {
        id: "fundamentos-3",
        titulo: "Primeiros aportes com consistência",
        resumo: "Disciplina supera timing de mercado no começo.",
        conteudo: "Automatize aportes mensais e acompanhe evolução com foco em constância e custo baixo.",
        exemplo: "Aportar R$ 300 todo mês por 24 meses cria hábito e acelera patrimônio no longo prazo.",
        xp: 45,
        quiz: {
          id: "fundamentos-3",
          perguntas: [
            {
              id: "q1",
              enunciado: "Qual atitude fortalece o início da jornada?",
              opcoes: ["Aportes esporádicos", "Aportes automáticos", "Esperar o momento perfeito"],
              correta: 1,
              explicacao: "Automação reduz fricção e mantém consistência."
            },
            {
              id: "q2",
              enunciado: "No início, o foco principal deve ser:",
              opcoes: ["Disciplina", "Operações complexas", "Alta alavancagem"],
              correta: 0,
              explicacao: "A base de longo prazo nasce da disciplina de aporte e estudo."
            }
          ]
        }
      }
    ]
  },
  {
    id: "intermediario",
    nivel: "Intermediário",
    titulo: "Renda fixa e inflação",
    descricao: "Compare produtos pós-fixados e entenda retorno real acima da inflação.",
    lessons: [
      {
        id: "fixa-1",
        titulo: "CDI, SELIC e Tesouro Selic",
        resumo: "Entenda o trio base da renda fixa no Brasil.",
        conteudo: "SELIC é taxa básica da economia; CDI referencia produtos bancários; Tesouro Selic acompanha a taxa com risco soberano.",
        exemplo: "Em cenário de SELIC alta, pós-fixados tendem a pagar melhor no curto e médio prazo.",
        xp: 50,
        quiz: {
          id: "fixa-1",
          perguntas: [
            {
              id: "q1",
              enunciado: "Qual taxa é definida pelo Banco Central?",
              opcoes: ["IPCA", "SELIC", "IFIX"],
              correta: 1,
              explicacao: "SELIC é definida pelo Copom do Banco Central."
            },
            {
              id: "q2",
              enunciado: "Produto mais associado à taxa SELIC:",
              opcoes: ["Tesouro Selic", "Ações", "Fundos cambiais"],
              correta: 0,
              explicacao: "Tesouro Selic é título público pós-fixado ligado à SELIC."
            }
          ]
        }
      },
      {
        id: "fixa-2",
        titulo: "CDB, LCI e LCA na prática",
        resumo: "Como comparar rentabilidade líquida e prazo.",
        conteudo: "Avalie percentual do CDI, prazo, liquidez e tributação para escolher entre CDB, LCI e LCA.",
        exemplo: "Um CDB 110% CDI pode superar uma LCI menor, mesmo sem isenção, dependendo do prazo.",
        xp: 50,
        quiz: {
          id: "fixa-2",
          perguntas: [
            {
              id: "q1",
              enunciado: "LCI e LCA são isentas de IR para pessoa física?",
              opcoes: ["Sim", "Não", "Depende da corretora"],
              correta: 0,
              explicacao: "LCI e LCA têm isenção de IR para pessoa física no Brasil."
            },
            {
              id: "q2",
              enunciado: "Além da taxa, você deve comparar:",
              opcoes: ["Liquidez e prazo", "Cor do app", "Nome do gerente"],
              correta: 0,
              explicacao: "Liquidez e vencimento impactam o resultado e a estratégia."
            }
          ]
        }
      },
      {
        id: "fixa-3",
        titulo: "Retorno real e proteção com IPCA",
        resumo: "Ganhar de verdade é vencer a inflação.",
        conteudo: "Retorno real é o ganho acima do IPCA. Títulos indexados ao IPCA ajudam na proteção do poder de compra.",
        exemplo: "Se sua carteira rende 10% e IPCA é 6%, o ganho real aproximado fica próximo de 3,8%.",
        xp: 55,
        quiz: {
          id: "fixa-3",
          perguntas: [
            {
              id: "q1",
              enunciado: "Retorno real significa:",
              opcoes: ["Retorno nominal", "Retorno acima da inflação", "Retorno sem risco"],
              correta: 1,
              explicacao: "Retorno real considera o desconto da inflação no período."
            },
            {
              id: "q2",
              enunciado: "Produto tipicamente usado para proteção inflacionária:",
              opcoes: ["Título IPCA+", "Poupança tradicional", "Day trade"],
              correta: 0,
              explicacao: "Títulos IPCA+ são estruturados para proteger o poder de compra no longo prazo."
            }
          ]
        }
      }
    ]
  },
  {
    id: "avancado",
    nivel: "Avançado",
    titulo: "Renda variável e diversificação",
    descricao: "Aprofunde alocação estratégica, risco e carteira de longo prazo.",
    lessons: [
      {
        id: "rv-1",
        titulo: "Ações e FIIs com visão de longo prazo",
        resumo: "Entenda papel de ações e renda imobiliária na carteira.",
        conteudo: "Ações trazem potencial de crescimento; FIIs podem contribuir com renda periódica e diversificação setorial.",
        exemplo: "Combinar ações de setores distintos e FIIs de segmentos variados reduz concentração.",
        xp: 60,
        quiz: {
          id: "rv-1",
          perguntas: [
            {
              id: "q1",
              enunciado: "Objetivo comum de FIIs em carteira:",
              opcoes: ["Renda periódica", "Alavancagem máxima", "Proteção cambial direta"],
              correta: 0,
              explicacao: "FIIs costumam ser usados para complementar renda e diversificar."
            },
            {
              id: "q2",
              enunciado: "Estratégia saudável para ações:",
              opcoes: ["Concentrar tudo em 1 ativo", "Diversificar por setores", "Ignorar fundamentos"],
              correta: 1,
              explicacao: "Diversificação setorial reduz risco específico de empresa/segmento."
            }
          ]
        }
      },
      {
        id: "rv-2",
        titulo: "Gestão de risco e volatilidade",
        resumo: "Como sobreviver aos ciclos do mercado.",
        conteudo: "Defina limite de exposição, horizonte e regra de aportes para manter a estratégia em momentos de estresse.",
        exemplo: "Uma carteira com percentual definido por classe evita decisões impulsivas em quedas bruscas.",
        xp: 60,
        quiz: {
          id: "rv-2",
          perguntas: [
            {
              id: "q1",
              enunciado: "Em queda de mercado, o ideal é:",
              opcoes: ["Seguir o plano de risco", "Tomar decisões por emoção", "Abandonar a estratégia"],
              correta: 0,
              explicacao: "Processo e disciplina reduzem erros emocionais."
            },
            {
              id: "q2",
              enunciado: "Volatilidade representa:",
              opcoes: ["Oscilação de preços", "Garantia de lucro", "Ausência de risco"],
              correta: 0,
              explicacao: "Volatilidade é variação de preço, não sinônimo de perda permanente."
            }
          ]
        }
      },
      {
        id: "rv-3",
        titulo: "Rebalanceamento e evolução da carteira",
        resumo: "Ajuste pesos para manter risco sob controle.",
        conteudo: "Rebalancear é vender parte do que subiu demais e reforçar o que ficou abaixo da alocação alvo.",
        exemplo: "Revisar a carteira semestralmente ajuda a manter coerência com perfil e metas.",
        xp: 70,
        quiz: {
          id: "rv-3",
          perguntas: [
            {
              id: "q1",
              enunciado: "Rebalanceamento serve para:",
              opcoes: ["Ajustar risco ao plano", "Aumentar giro sem critério", "Ignorar metas"],
              correta: 0,
              explicacao: "Rebalancear mantém a carteira alinhada ao perfil e objetivo."
            },
            {
              id: "q2",
              enunciado: "Frequência comum de revisão:",
              opcoes: ["Diária", "Semestral ou por desvio de alocação", "A cada 10 anos"],
              correta: 1,
              explicacao: "Semestral ou por banda de desvio é prática comum e eficiente."
            }
          ]
        }
      }
    ]
  }
];

export function getModuleById(moduleId) {
  return LEARNING_MODULES.find((module) => module.id === moduleId) || null;
}

export function getLessonById(lessonId) {
  for (const module of LEARNING_MODULES) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { module, lesson };
    }
  }
  return null;
}

export function getQuizById(quizId) {
  for (const module of LEARNING_MODULES) {
    for (const lesson of module.lessons) {
      if (lesson.quiz?.id === quizId) {
        return { module, lesson, quiz: lesson.quiz };
      }
    }
  }
  return null;
}

export function getAllLessons() {
  return LEARNING_MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({ moduleId: module.id, moduleTitle: module.titulo, ...lesson }))
  );
}

export function getTotalLessonsCount() {
  return LEARNING_MODULES.reduce((acc, module) => acc + module.lessons.length, 0);
}
