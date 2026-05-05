const CACHE_KEY = "sei-market-cache";
const AUVP_BASE_URL = "https://analitica.auvp.com.br";
const FALLBACK = {
  cdi: 11.65,
  selic: 11.75,
  ipca: 4.52,
  ibov: 128450
};

function parseNumber(value) {
  const num = Number(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function parseNumeroTexto(value) {
  const text = String(value || "").trim();
  if (!text) {
    return NaN;
  }

  const clean = text.replace(/[^\d,.-]/g, "");
  if (clean.includes(",") && clean.includes(".")) {
    return Number.parseFloat(clean.replace(/\./g, "").replace(",", "."));
  }

  if (clean.includes(",")) {
    return Number.parseFloat(clean.replace(",", "."));
  }

  return Number.parseFloat(clean);
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractValueFromText(text, label) {
  if (!text || !label) {
    return null;
  }

  const regex = new RegExp(`${escapeRegExp(label)}\\s+([\\d.,]+)\\s*(%|pontos)?`, "i");
  const match = text.match(regex);
  if (!match?.[1]) {
    return null;
  }

  const value = parseNumeroTexto(match[1]);
  return Number.isFinite(value) ? value : null;
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatBcbDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function normalizeCdiAnnual(cdiValue) {
  const number = Number(cdiValue);
  if (!Number.isFinite(number)) {
    return cdiValue;
  }

  if (number > 0 && number < 1) {
    return (Math.pow(1 + (number / 100), 252) - 1) * 100;
  }

  return number;
}

function withTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
}

async function fetchBcbSerie(code, daysWindow = 90) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysWindow);

  const response = await withTimeout(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${formatBcbDate(startDate)}&dataFinal=${formatBcbDate(endDate)}`
  );

  if (!response.ok) {
    throw new Error(`Falha BCB série ${code}`);
  }

  const list = await response.json();
  return Array.isArray(list) ? list : [];
}

async function fetchTaxaBCB(code, fallback, daysWindow = 90) {
  try {
    const list = await fetchBcbSerie(code, daysWindow);
    if (!list.length) {
      return fallback;
    }

    const last = list[list.length - 1];
    const parsed = parseNumber(last.valor);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function fetchIpcaAccumulated12m(fallback = FALLBACK.ipca) {
  try {
    const list = await fetchBcbSerie(433, 420);
    const last12 = list
      .slice(-12)
      .map((item) => Number.parseFloat(item.valor))
      .filter(Number.isFinite);

    if (last12.length < 10) {
      return fallback;
    }

    const accumulated = last12.reduce((acc, monthValue) => acc * (1 + monthValue / 100), 1);
    return (accumulated - 1) * 100;
  } catch {
    return fallback;
  }
}

async function fetchTextFromAuvp(path) {
  const response = await withTimeout(`${AUVP_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error("Falha AUVP");
  }

  const html = await response.text();
  return htmlToText(html);
}

async function fetchAuvpIndicators() {
  const result = {};

  try {
    const text = await fetchTextFromAuvp("/indices");
    result.cdi = extractValueFromText(text, "CDI");
    result.selic = extractValueFromText(text, "SELIC");
    result.ibov = extractValueFromText(text, "IBOV") ?? extractValueFromText(text, "Ibovespa");
    result.ipca = extractValueFromText(text, "IPCA");
  } catch {
  }

  if (!Number.isFinite(result.cdi)) {
    try {
      const cdiText = await fetchTextFromAuvp("/indices/cdi");
      const match = cdiText.match(/taxa\s+CDI\s+est[aá]\s+atualmente\s+em\s+([\d.,]+)/i);
      if (match?.[1]) {
        result.cdi = parseNumeroTexto(match[1]);
      }
    } catch {
    }
  }

  if (!Number.isFinite(result.ibov)) {
    try {
      const ibovText = await fetchTextFromAuvp("/indices/IBOV");
      const match = ibovText.match(/Ibovespa\s+est[aá]\s+cotado\s+em\s+([\d.,]+)\s+pontos/i);
      if (match?.[1]) {
        result.ibov = parseNumeroTexto(match[1]);
      }
    } catch {
    }
  }

  return result;
}

async function fetchIbovBrapi() {
  const symbols = ["^BVSP", "IBOV"];

  for (const symbol of symbols) {
    try {
      const response = await withTimeout(`https://brapi.dev/api/quote/${encodeURIComponent(symbol)}?range=1d&interval=1d`);
      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const value = Number(payload?.results?.[0]?.regularMarketPrice);
      if (Number.isFinite(value)) {
        return value;
      }
    } catch {
    }
  }

  throw new Error("IBOV indisponível no brapi");
}

function readCachedValues() {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) {
      return null;
    }

    const parsed = JSON.parse(cache);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

function saveCache(snapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    return;
  }
}

export async function getMarketSnapshot() {
  const cache = readCachedValues();

  const auvpIndicators = await fetchAuvpIndicators().catch(() => ({}));

  const [cdiResult, selicResult, ipcaResult, ibovResult] = await Promise.allSettled([
    fetchTaxaBCB(12, Number.isFinite(auvpIndicators.cdi) ? auvpIndicators.cdi : cache?.cdi ?? FALLBACK.cdi),
    fetchTaxaBCB(432, Number.isFinite(auvpIndicators.selic) ? auvpIndicators.selic : cache?.selic ?? FALLBACK.selic),
    fetchIpcaAccumulated12m(Number.isFinite(auvpIndicators.ipca) ? auvpIndicators.ipca : cache?.ipca ?? FALLBACK.ipca),
    fetchIbovBrapi()
  ]);

  const cdiValue = cdiResult.status === "fulfilled"
    ? normalizeCdiAnnual(cdiResult.value)
    : normalizeCdiAnnual(Number.isFinite(auvpIndicators.cdi) ? auvpIndicators.cdi : cache?.cdi ?? FALLBACK.cdi);

  const selicValue = selicResult.status === "fulfilled"
    ? selicResult.value
    : Number.isFinite(auvpIndicators.selic) ? auvpIndicators.selic : cache?.selic ?? FALLBACK.selic;

  const ipcaValue = ipcaResult.status === "fulfilled"
    ? ipcaResult.value
    : Number.isFinite(auvpIndicators.ipca) ? auvpIndicators.ipca : cache?.ipca ?? FALLBACK.ipca;

  const ibovValue = ibovResult.status === "fulfilled"
    ? ibovResult.value
    : Number.isFinite(auvpIndicators.ibov) ? auvpIndicators.ibov : cache?.ibov ?? FALLBACK.ibov;

  const snapshot = {
    cdi: cdiValue,
    selic: selicValue,
    ipca: ipcaValue,
    ibov: ibovValue,
    updatedAt: new Date().toISOString(),
    fromFallback: [cdiResult, selicResult, ipcaResult, ibovResult].some((result) => result.status === "rejected")
      || !Number.isFinite(auvpIndicators.cdi)
  };

  saveCache(snapshot);
  return snapshot;
}

export function formatRate(value) {
  return `${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a.`;
}

export function formatPoints(value) {
  return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} pts`;
}

export function renderIndicators(snapshot, scope = document) {
  const map = {
    cdi: formatRate(snapshot.cdi),
    selic: formatRate(snapshot.selic),
    ipca: formatRate(snapshot.ipca),
    ibov: formatPoints(snapshot.ibov)
  };

  Object.entries(map).forEach(([key, value]) => {
    const target = scope.querySelector(`[data-indicator-value="${key}"]`);
    if (target) {
      target.textContent = value;
    }
  });
}

export async function mountMarketAutoRefresh(options = {}) {
  const {
    scope = document,
    intervalMs = 30000,
    metaSelector,
    onData
  } = options;

  async function update() {
    const snapshot = await getMarketSnapshot();
    renderIndicators(snapshot, scope);

    if (metaSelector) {
      const metaNode = scope.querySelector(metaSelector);
      if (metaNode) {
        const timestamp = new Date(snapshot.updatedAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });
        metaNode.textContent = snapshot.fromFallback
          ? `Atualizado às ${timestamp} (modo contingência de API).`
          : `Atualizado às ${timestamp} com dados automáticos do mercado.`;
      }
    }

    if (typeof onData === "function") {
      onData(snapshot);
    }
  }

  await update();
  const timerId = setInterval(update, intervalMs);
  return () => clearInterval(timerId);
}
