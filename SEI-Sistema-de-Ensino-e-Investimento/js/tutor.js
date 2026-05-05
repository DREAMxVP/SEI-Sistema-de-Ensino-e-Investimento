import { mountMarketAutoRefresh, formatRate, formatPoints } from "./market-data.js";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let latestSnapshot = null;

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

function buildTutorReply(question) {
  const lower = question.toLowerCase();

  const cdiText = latestSnapshot ? formatRate(latestSnapshot.cdi) : "--";
  const selicText = latestSnapshot ? formatRate(latestSnapshot.selic) : "--";
  const ipcaText = latestSnapshot ? formatRate(latestSnapshot.ipca) : "--";
  const ibovText = latestSnapshot ? formatPoints(latestSnapshot.ibov) : "--";

  if (lower.includes("cdi") || lower.includes("selic")) {
    return `Hoje o CDI está em ${cdiText} e a Selic em ${selicText}. Em geral, renda fixa pós-fixada tende a acompanhar esse nível de juros.`;
  }

  if (lower.includes("infla") || lower.includes("ipca")) {
    return `O IPCA atual está em ${ipcaText}. Para crescer patrimônio em termos reais, busque investimentos com retorno acima da inflação.`;
  }

  if (lower.includes("bolsa") || lower.includes("ibov") || lower.includes("ações")) {
    return `O Ibovespa está em ${ibovText}. Use esse índice como referência de mercado, mas foque em diversificação e horizonte de longo prazo.`;
  }

  if (lower.includes("reserva") || lower.includes("emergência")) {
    return "Comece pela reserva de emergência: de 6 a 12 meses de despesas em ativos de baixo risco e liquidez diária.";
  }

  return `Bom ponto. Cenário atual: CDI ${cdiText}, Selic ${selicText}, IPCA ${ipcaText} e Ibovespa ${ibovText}. Se quiser, te ajudo a montar um plano por perfil (conservador, moderado ou arrojado).`;
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) {
      return;
    }

    appendMessage(question, "user");
    const response = buildTutorReply(question);
    appendMessage(response, "bot");
    chatInput.value = "";
  });
}

appendMessage("Olá! Sou seu tutor financeiro. Pode perguntar sobre CDI, Selic, inflação, bolsa ou reserva de emergência.", "bot");

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#tutorTickerMeta",
  onData: (snapshot) => {
    latestSnapshot = snapshot;
  }
});
