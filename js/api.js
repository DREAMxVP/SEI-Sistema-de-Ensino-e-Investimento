const OPENAI_KEY = "";

function withTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export async function buscarSelic() {
  try {
    const res = await withTimeout("https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json");
    const dados = await res.json();
    return parseFloat(dados[dados.length - 1].valor);
  } catch {
    return 13.25; // valor padrão se API falhar
  }
}


export async function buscarCDI() {
  try {
    const res = await withTimeout("https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json");
    const dados = await res.json();
    return parseFloat(dados[dados.length - 1].valor);
  } catch {
    return 12.65;   
  }
}


export async function buscarIBOV() {
  try {
    const res = await withTimeout("https://brapi.dev/api/quote/%5EBVSP?range=3mo&interval=1d");
    const data = await res.json();

    const historico = data?.results?.[0]?.historicalDataPrice;
    if (!Array.isArray(historico) || !historico.length) {
      throw new Error("Histórico IBOV indisponível");
    }

    const valores = historico
      .slice(-12)
      .map((ponto) => Number(ponto.close))
      .filter((valor) => Number.isFinite(valor));

    if (!valores.length) {
      throw new Error("Valores IBOV inválidos");
    }

    return valores;
  } catch {
    return [120500, 121340, 122150, 123990, 124820, 125410, 126780, 127650, 128420, 127980, 128250, 128450];
  }
}



export async function gerarAnaliseIA(dadosTexto) {
  if (!OPENAI_KEY) {
    return "A análise de IA exige configuração de chave de API no backend/ambiente seguro.";
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um consultor financeiro especialista." },
        { role: "user", content: dadosTexto }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
