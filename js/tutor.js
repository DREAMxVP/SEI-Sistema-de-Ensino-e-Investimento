import { mountMarketAutoRefresh, formatRate, formatPoints } from "./market-data.js";
import { getDashboardSnapshot, getRecommendations } from "./learning-state.js";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let latestSnapshot = null;
let isLoading = false;

function appendMessage(text, role) {
  if (!chatMessages) {
    return;
  }

  const node = document.createElement("div");
  node.className = `chat-bubble ${role}`;
  node.textContent = text;
  chatMessages.appendChild(node);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setLoadingState(loading) {
  isLoading = loading;
  if (chatForm && chatInput) {
    chatInput.disabled = loading;
    chatForm.querySelector('button[type="submit"]').disabled = loading;
    if (loading) {
      chatForm.querySelector('button[type="submit"]').textContent = 'Aguarde...';
    } else {
      chatForm.querySelector('button[type="submit"]').textContent = 'Perguntar';
    }
  }
}

/**
 * Chama o endpoint /api/ask-tutor com a pergunta do usuário
 * @param {string} question - Pergunta do usuário
 * @returns {Promise<string>} - Resposta do tutor IA
 */
async function askTutorAI(question) {
  try {
    const payload = {
      question: question,
      marketSnapshot: latestSnapshot ? {
        cdi: latestSnapshot.cdi,
        selic: latestSnapshot.selic,
        ipca: latestSnapshot.ipca,
        ibov: latestSnapshot.ibov,
        ifix: latestSnapshot.ifix
      } : {}
    };

    const response = await fetch('/api/ask-tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return error.response || 'Erro ao processar sua pergunta. Tente novamente.';
    }

    const data = await response.json();
    console.log('Tutor Response:', data);
    
    return data.response || 'Desculpe, não consegui gerar uma resposta.';
  } catch (error) {
    console.error('Error calling tutor API:', error);
    return `Desculpe, ocorreu um erro ao processar sua pergunta: ${error.message}. Tente novamente.`;
  }
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question || isLoading) {
      return;
    }

    appendMessage(question, "user");
    chatInput.value = "";
    
    setLoadingState(true);
    const response = await askTutorAI(question);
    setLoadingState(false);
    
    appendMessage(response, "bot");
  });
}

appendMessage("Olá! Sou seu tutor de investimento especializado. Posso responder dúvidas sobre estratégias, instrumentos financeiros, análise de mercado e planejamento. O que deseja saber? 💰📈", "bot");

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#tutorTickerMeta",
  onData: (snapshot) => {
    latestSnapshot = snapshot;
  }
});
