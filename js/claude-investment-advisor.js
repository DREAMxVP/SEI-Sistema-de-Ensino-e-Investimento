/**
 * Claude Investment Advisor Module
 * 
 * Integração com Claude API para tutor especializado em investimento
 * Usa filter para permitir APENAS perguntas sobre investimento
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'; // Modelo mais recente

/**
 * Verifica se a pergunta é sobre investimento
 * @param {string} question - Pergunta do usuário
 * @returns {boolean} - True se é sobre investimento
 */
function isInvestmentQuestion(question) {
  const investmentKeywords = [
    'investimento', 'investir', 'aplicação', 'aplicar',
    'bolsa', 'ações', 'ação', 'stock', 'fundo', 'fii',
    'cdb', 'lci', 'lca', 'tesouro', 'renda fixa', 'renda variável',
    'criptomoeda', 'cripto', 'bitcoin', 'ethereum',
    'dividendo', 'renda passiva', 'renda',
    'carteira', 'portfólio', 'portfolio',
    'selic', 'cdi', 'ipca', 'ibov', 'taxa',
    'juros', 'compostos', 'simulação', 'simulador',
    'perfil', 'risco', 'rentabilidade', 'retorno',
    'diversificação', 'rebalanceamento', 'alocação',
    'estratégia financeira', 'planejamento financeiro',
    'primeira compra', 'primeira ação', 'iniciante',
    'fiis', 'etfs', 'fundos imobiliários', 'fundos',
    'b3', 'bolsa de valores', 'mercado',
    'análise técnica', 'análise fundamentalista',
    'valor presente', 'valor futuro', 'fluxo de caixa',
    'inflação', 'poder de compra',
    'reserva de emergência', 'fundo de emergência',
    'cálculo de investimento', 'quanto investir',
    'imposto de renda', 'ir', 'tributação'
  ];

  const questionLower = question.toLowerCase();
  return investmentKeywords.some(keyword => questionLower.includes(keyword));
}

/**
 * Formata pergunta com contexto dos indicadores
 * @param {string} question - Pergunta do usuário
 * @param {object} marketSnapshot - Snapshot com dados de mercado
 * @returns {string} - Pergunta formatada
 */
function formatQuestionWithContext(question, marketSnapshot = {}) {
  const { cdi, selic, ipca, ibov, ifix } = marketSnapshot;
  
  let contextString = '';
  if (cdi) contextString += `CDI atual: ${cdi}%. `;
  if (selic) contextString += `SELIC atual: ${selic}%. `;
  if (ipca) contextString += `IPCA atual: ${ipca}%. `;
  if (ibov) contextString += `IBOV atual: ${ibov} pontos. `;
  if (ifix) contextString += `IFIX atual: ${ifix} pontos. `;

  return `Contexto do mercado agora: ${contextString}\n\nPergunta: ${question}`;
}

/**
 * Chama Claude API com prompt do tutor de investimento
 * @param {string} question - Pergunta do usuário
 * @param {string} apiKey - Chave da API Claude (process.env.CLAUDE_API_KEY)
 * @param {object} marketSnapshot - Dados de mercado para contexto
 * @returns {Promise<string>} - Resposta do Claude
 */
async function askClaudeInvestmentAdvisor(question, apiKey, marketSnapshot = {}) {
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY não configurada. Adicione em .env');
  }

  // Validação: apenas perguntas sobre investimento
  if (!isInvestmentQuestion(question)) {
    return `❌ Desculpe, sou especializado apenas em investimento. 
    
Sua pergunta não parece ser sobre esse tema. 

Por favor, faça perguntas sobre:
- Estratégias de investimento
- Instrumentos financeiros (ações, fundos, CDB, etc)
- Análise de risco e retorno
- Planejamento financeiro
- Indicadores de mercado

Estou aqui para ajudar com suas dúvidas sobre investimento! 💰📈`;
  }

  const formattedQuestion = formatQuestionWithContext(question, marketSnapshot);

  const systemPrompt = `Você é um especialista em investimento e educação financeira brasileira. 
Seu nome é "Tutor SEI" e você trabalha no Sistema de Ensino e Investimento.

Diretrizes:
1. RESPONDA APENAS sobre investimento, mercado financeiro e planejamento financeiro
2. Se a pergunta NÃO for sobre esses temas, recuse educadamente
3. Use dados de mercado brasileiros quando relevante (B3, Tesouro Direto, CVM)
4. Seja prático e didático - explique para iniciantes e avançados
5. Cite sempre o horizonte de tempo (curto/médio/longo prazo)
6. Mencione sempre diversificação e gerenciamento de risco
7. Respostas em português brasileiro, claro e objetivo
8. Use exemplos numéricos quando apropriado
9. Considere o contexto de taxas e indicadores atuais
10. Nunca recomende ativos específicos (pode sugerir categorias)
11. Sempre avise: "Esta não é recomendação profissional, consulte um especialista"`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: formattedQuestion
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API Error:', error);
      throw new Error(`Claude API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const answer = data.content[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

    // Adiciona aviso legal no final
    return answer + '\n\n⚖️ *Aviso Legal: Esta não é recomendação profissional. Consulte um consultor de investimentos.*';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * Constrói fallback para quando Claude não está disponível
 * @param {string} question - Pergunta do usuário
 * @param {object} marketSnapshot - Dados de mercado
 * @returns {string} - Resposta fallback
 */
function buildFallbackResponse(question, marketSnapshot = {}) {
  const lower = question.toLowerCase();
  
  if (lower.includes('cdi') || lower.includes('selic')) {
    const cdi = marketSnapshot.cdi || '13.25';
    const selic = marketSnapshot.selic || '13.25';
    return `CDI está em ${cdi}% e Selic em ${selic}%. Renda fixa pós-fixada tende a acompanhar esse nível. Que outra dúvida você tem?`;
  }

  if (lower.includes('iniciante') || lower.includes('começar')) {
    return `Para iniciantes, recomendo:\n1. Entender seu perfil de risco\n2. Construir reserva de emergência (6-12 meses)\n3. Começar com renda fixa (Tesouro, CDB)\n4. Depois adicionar diversificação\n\nQual é o seu objetivo principal?`;
  }

  if (lower.includes('risco') || lower.includes('seguro')) {
    return `Renda fixa é mais segura (CDB, Tesouro), renda variável tem mais risco/retorno. Depende do seu horizonte: curto prazo = menos risco, longo prazo = pode aceitar mais volatilidade. Qual é seu prazo?`;
  }

  return `Ótima pergunta sobre investimento! Infelizmente, não consigo processar essa resposta no momento. Tente reformular ou pergunte sobre SELIC, CDI, renda fixa, ações, diversificação ou planejamento.`;
}

module.exports = {
  askClaudeInvestmentAdvisor,
  isInvestmentQuestion,
  formatQuestionWithContext,
  buildFallbackResponse,
  CLAUDE_API_URL,
  CLAUDE_MODEL
};
