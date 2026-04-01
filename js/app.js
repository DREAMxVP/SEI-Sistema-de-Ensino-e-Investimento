import { simularTodos, crescimentoMensal } from "./analysis.js";

const configuracaoApi = {
  brapiBaseUrl: "https://brapi.dev/api",
  brapiToken: "",
  intervaloAtualizacaoGeralMs: 30000,
  intervaloAtualizacaoWatchlistMs: 30000
};

const investimentos = {
  "Poupança": 6.17,
  "Tesouro Selic": 13.25,
  "CDB 100% CDI": 13.15,
  "CDB 110% CDI": 14.46,
  "LCI/LCA": 12.5,
  "Fundo DI": 12.8
};

const estadoIndicadores = {
  cdi: 13.25,
  selic: 13.25
};

const configuracaoTaxasInvestimentos = {
  "Poupança": { tipo: "fixo", valor: 6.17 },
  "Tesouro Selic": { tipo: "selic", ajuste: 0 },
  "CDB 100% CDI": { tipo: "cdiMultiplicador", multiplicador: 1 },
  "CDB 110% CDI": { tipo: "cdiMultiplicador", multiplicador: 1.1 },
  "LCI/LCA": { tipo: "cdiMultiplicador", multiplicador: 0.95 },
  "Fundo DI": { tipo: "cdiMultiplicador", multiplicador: 0.98 }
};

function atualizarTaxasInvestimentos(indicadores) {
  Object.entries(configuracaoTaxasInvestimentos).forEach(([nome, config]) => {
    if (config.tipo === "fixo") {
      investimentos[nome] = config.valor;
      return;
    }

    if (config.tipo === "selic") {
      investimentos[nome] = (indicadores.selic ?? estadoIndicadores.selic) + (config.ajuste ?? 0);
      return;
    }

    if (config.tipo === "cdiMultiplicador") {
      investimentos[nome] = (indicadores.cdi ?? estadoIndicadores.cdi) * (config.multiplicador ?? 1);
    }
  });
}

// Modify simularTodos to use the local investimentos
function simularTodosLocal(valor, meses) {
  const resultados = [];

  for (let nome in investimentos) {
    const taxa = investimentos[nome];
    const total = simularMensalLocal(valor, taxa, meses);

    resultados.push({
      nome,
      taxa,
      total,
      lucro: total - (valor * meses)
    });
  }

  return resultados.sort((a, b) => b.total - a.total);
}

function simularMensalLocal(valor, taxa, meses) {
  const taxaMensal = taxa / 100 / 12;
  let total = 0;

  for (let i = 0; i < meses; i++) {
    total = (total + valor) * (1 + taxaMensal);
  }

  return total;
}

function crescimentoMensalLocal(valor, taxa, meses) {
  const taxaMensal = taxa / 100 / 12;
  let total = 0;
  const historico = [];

  for (let i = 0; i < meses; i++) {
    total = (total + valor) * (1 + taxaMensal);
    historico.push(total);
  }

  return historico;
}
import {
  atualizarGraficoInvestimentos,
  atualizarGraficoMensal
} from "./charts.js";

const valorInput = document.getElementById("valorInvestimento");
const mesesInput = document.getElementById("mesesInvestimento");
const resultadoContainer = document.getElementById("resultadoInvestimentos");

// Atualiza automaticamente ao digitar
valorInput.addEventListener("input", atualizarAutomatico);
mesesInput.addEventListener("input", atualizarAutomatico);

// Atualização principal
function atualizarAutomatico() {

  const valor = unformatCurrency(valorInput.value);
  const meses = parseInt(mesesInput.value);

  if (!valor || valor <= 0 || !meses || meses <= 0) {
    resultadoContainer.innerHTML = "";
    return;
  }

  // 🔥 Simula todos investimentos
  const resultados = simularTodosLocal(valor, meses);

  // 🔥 Cria tabela ranking
  criarTabelaRanking(resultados);

  // 🔥 Atualiza gráfico lateral principal
  atualizarGraficoInvestimentos(resultados);

  // 🔥 Crescimento mês a mês do melhor investimento
  const melhor = resultados[0];
  const historico = crescimentoMensalLocal(valor, melhor.taxa, meses);

  atualizarGraficoMensal(historico);
}

// Atualização automática a cada 30 segundos com valores padrão
setInterval(async () => {
  // Aguardar atualização das taxas
  await atualizarIndices();
  
  const valorPadrao = unformatCurrency(document.getElementById("valorInvestimento").value) || 500;
  const mesesPadrao = 12;

  const resultados = simularTodosLocal(valorPadrao, mesesPadrao);
  criarTabelaRanking(resultados);
  atualizarGraficoInvestimentos(resultados);

  const melhor = resultados[0];
  const historico = crescimentoMensalLocal(valorPadrao, melhor.taxa, mesesPadrao);
  atualizarGraficoMensal(historico);
}, configuracaoApi.intervaloAtualizacaoGeralMs);


// 🔥 TABELA PROFISSIONAL
function criarTabelaRanking(resultados) {
  let html = `<table><tr><th>#</th><th>Investimento</th><th>Taxa</th><th>Total Final</th><th>Lucro</th></tr>`;
  resultados.forEach((r, i) => {
    html += `<tr${i === 0 ? ' style="background:rgba(162,89,255,0.15);font-weight:bold"' : ''}>
      <td>${i === 0 ? '🏆' : i + 1}</td>
      <td>${r.nome}</td>
      <td>${r.taxa.toFixed(2).replace('.', ',')}%</td>
      <td>R$ ${r.total.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
      <td>R$ ${r.lucro.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
    </tr>`;
  });
  html += `</table>`;
  document.getElementById("resultadoInvestimentos").innerHTML = html;
}

const ativosFallback = [
  { nome: "PETR4", variacao: -2.55 },
  { nome: "ITSA4", variacao: -2.20 },
  { nome: "BBAS3", variacao: 4.50 },
  { nome: "MGLU3", variacao: -8.56 },
  { nome: "VALE3", variacao: -0.95 }
];

const configuracaoWatchlistApi = {
  simbolos: ["PETR4", "VALE3", "MGLU3", "ITUB4"]
};

function renderWatchlist(itens) {
  const lista = document.getElementById("listaAtivos");
  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  itens.forEach((ativo) => {
    const div = document.createElement("div");
    div.classList.add("watchItem");

    const variacao = Number(ativo.variacao ?? 0);
    const cor = variacao > 0 ? "#00ff9d" : "#ff4d6d";
    const variacaoTexto = `${variacao > 0 ? "+" : ""}${variacao.toFixed(2)}%`;
    const precoTexto = Number.isFinite(Number(ativo.preco))
      ? ` • ${formatarMoedaBRL(ativo.preco)}`
      : "";

    div.innerHTML = `
      <div>
        <strong>${ativo.nome}</strong>
      </div>
      <span style="color:${cor}">
        ${variacaoTexto}${precoTexto}
      </span>
    `;

    lista.appendChild(div);
  });
}

async function carregarWatchlistApi() {
  try {
    const simbolos = configuracaoWatchlistApi.simbolos.join(",");
    const data = await buscarJsonBrapi(`/quote/${simbolos}?range=1d&interval=1d`);

    const ativos = (data?.results || []).map((item) => ({
      nome: item.symbol,
      variacao: Number(item.regularMarketChangePercent ?? 0),
      preco: Number(item.regularMarketPrice)
    }));

    if (!ativos.length) {
      renderWatchlist(ativosFallback);
      return;
    }

    renderWatchlist(ativos);
  } catch {
    renderWatchlist(ativosFallback);
  }
}

function carregarWatchlist() {
  carregarWatchlistApi();
}

carregarWatchlist();

const API_KEY = "6FDZYJZTWIX0TJL6";

async function atualizarIndice(simbolo, elementoId) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${simbolo}&apikey=${API_KEY}`
    );

    const data = await response.json();
    const quote = data["Global Quote"];

    if (!quote) return;

    const variacao = parseFloat(quote["10. change percent"].replace("%", ""));
    const preco = parseFloat(quote["05. price"]);

    const elemento = document.getElementById(elementoId);

    elemento.innerHTML = `
      <strong>${simbolo}</strong>
      <span style="color:${variacao > 0 ? "#00ff9d" : "#ff4d6d"}">
        ${variacao > 0 ? "+" : ""}${variacao.toFixed(2)}%
      </span>
    `;

  } catch (erro) {
    console.log("Erro ao atualizar índice:", erro);
  }
}

setInterval(() => {
  carregarWatchlistApi();
}, configuracaoApi.intervaloAtualizacaoWatchlistMs);

function formatarMoedaBRL(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function buscarJsonBrapi(caminho) {
  const headers = {};

  if (configuracaoApi.brapiToken) {
    headers.Authorization = `Bearer ${configuracaoApi.brapiToken}`;
  }

  const resposta = await fetch(`${configuracaoApi.brapiBaseUrl}${caminho}`, { headers });
  return resposta.json();
}

async function buscarQuoteBrapi(simbolo) {
  const dados = await buscarJsonBrapi(`/quote/${encodeURIComponent(simbolo)}?range=1d&interval=1d`);
  return dados?.results?.[0] || null;
}

async function buscarIbovComFallback() {
  try {
    const simbolosBrapi = ["^BVSP", "IBOV"];

    for (const simbolo of simbolosBrapi) {
      const quote = await buscarQuoteBrapi(simbolo);
      const valor = Number(quote?.regularMarketPrice);
      const variacao = Number(quote?.regularMarketChangePercent);

      if (Number.isFinite(valor)) {
        return { valor, variacao: Number.isFinite(variacao) ? variacao : undefined };
      }
    }
  } catch {
  }

  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^BVSP&apikey=${API_KEY}`);
    const data = await response.json();
    const quote = data["Global Quote"];

    if (!quote) {
      return null;
    }

    const valor = parseFloat(quote["05. price"]);
    const variacao = parseFloat((quote["10. change percent"] || "").replace("%", ""));

    if (!Number.isFinite(valor)) {
      return null;
    }

    return {
      valor,
      variacao: Number.isFinite(variacao) ? variacao : undefined
    };
  } catch {
    return null;
  }
}

async function atualizarDolar() {
  const response = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
  const data = await response.json();

  const valor = parseFloat(data.USDBRL.bid);
  const variacao = parseFloat(data.USDBRL.pctChange);

  document.getElementById("dolar").innerHTML = `
    <a href="https://analitica.auvp.com.br/indices" target="_blank" rel="noopener noreferrer">
      💵 Dólar: ${formatarMoedaBRL(valor)}
      <span style="color:${variacao > 0 ? "#00ff9d" : "#ff4d6d"}">
        ${variacao > 0 ? "+" : ""}${variacao.toFixed(2)}%
      </span>
    </a>
  `;
  aplicarFadeEmElemento("dolar");
}

async function atualizarEuro() {
  const response = await fetch("https://economia.awesomeapi.com.br/json/last/EUR-BRL");
  const data = await response.json();

  const valor = parseFloat(data.EURBRL.bid);
  const variacao = parseFloat(data.EURBRL.pctChange);

  document.getElementById("euro").innerHTML = `
    <a href="https://analitica.auvp.com.br/indices" target="_blank" rel="noopener noreferrer">
      💶 Euro: ${formatarMoedaBRL(valor)}
      <span style="color:${variacao > 0 ? "#00ff9d" : "#ff4d6d"}">
        ${variacao > 0 ? "+" : ""}${variacao.toFixed(2)}%
      </span>
    </a>
  `;
  aplicarFadeEmElemento("euro");
}

async function atualizarBitcoin() {
  const response = await fetch("https://economia.awesomeapi.com.br/json/last/BTC-BRL");
  const data = await response.json();

  const valor = parseFloat(data.BTCBRL.bid);
  const variacao = parseFloat(data.BTCBRL.pctChange);

  document.getElementById("bitcoin").innerHTML = `
    <a href="https://analitica.auvp.com.br/indices" target="_blank" rel="noopener noreferrer">
      ₿ Bitcoin: ${formatarMoedaBRL(valor)}
      <span style="color:${variacao > 0 ? "#00ff9d" : "#ff4d6d"}">
        ${variacao > 0 ? "+" : ""}${variacao.toFixed(2)}%
      </span>
    </a>
  `;
  aplicarFadeEmElemento("bitcoin");
}

async function atualizarIBOV() {
  try {
    const ibov = await buscarIbovComFallback();

    if (!ibov) {
      return;
    }

    const variacaoTexto = typeof ibov.variacao === "number"
      ? `<span style="color:${ibov.variacao > 0 ? "#00ff9d" : "#ff4d6d"}">
          ${ibov.variacao > 0 ? "+" : ""}${ibov.variacao.toFixed(2)}%
        </span>`
      : "";

    document.getElementById("ibov").innerHTML = `
      📈 IBOV: ${formatarMoedaBRL(ibov.valor)}
      ${variacaoTexto}
    `;
  } catch (error) {
    console.log("Erro ao atualizar IBOV:", error);
  }
}

async function atualizarCDI() {
  const cdiRate = await buscarTaxaBCB(12, 13.25);
  estadoIndicadores.cdi = cdiRate;

  document.getElementById("cdi").innerHTML = `
    💰 CDI (último valor): ${cdiRate.toFixed(2)}%
  `;
  atualizarTaxasInvestimentos(estadoIndicadores);
}

async function buscarTaxaBCB(codigoSerie, fallback) {
  try {
    const resposta = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSerie}/dados?formato=json`);
    const dados = await resposta.json();
    const ultimo = dados[dados.length - 1];
    return parseFloat(ultimo.valor);
  } catch {
    return fallback;
  }
}

function renderIndicadorApi(id, titulo, valor, variacao, link) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    return;
  }

  const variacaoTexto = typeof variacao === "number"
    ? `<span style="color:${variacao >= 0 ? "#00ff9d" : "#ff4d6d"}"> ${variacao >= 0 ? "+" : ""}${variacao.toFixed(2)}%</span>`
    : "";

  elemento.innerHTML = `
    <a href="${link}" target="_blank" rel="noopener noreferrer">
      ${titulo}: ${valor}${variacaoTexto}
    </a>
  `;
  aplicarFadeEmElemento(id);
}

async function atualizarIndicadoresApi() {
  const [cdi, selic] = await Promise.all([
    buscarTaxaBCB(12, 13.25),
    buscarTaxaBCB(11, 13.25)
  ]);

  estadoIndicadores.cdi = cdi;
  estadoIndicadores.selic = selic;
  atualizarTaxasInvestimentos(estadoIndicadores);

  renderIndicadorApi("cdiTicker", "CDI", `${cdi.toFixed(2)}%`, undefined, "https://analitica.auvp.com.br/indices/cdi");
  renderIndicadorApi("selicTicker", "SELIC", `${selic.toFixed(2)}%`, undefined, "https://analitica.auvp.com.br/renda-fixa");

  try {
    const ibov = await buscarIbovComFallback();

    if (ibov) {
      renderIndicadorApi("ibovTicker", "IBOV", formatarMoedaBRL(ibov.valor), ibov.variacao, "https://analitica.auvp.com.br/indices/IBOV");
    } else {
      renderIndicadorApi("ibovTicker", "IBOV", "R$ --", undefined, "https://analitica.auvp.com.br/indices/IBOV");
    }
  } catch {
    renderIndicadorApi("ibovTicker", "IBOV", "R$ --", undefined, "https://analitica.auvp.com.br/indices/IBOV");
  }

  try {
    const ifix = await buscarQuoteBrapi("IFIX");

    if (ifix) {
      renderIndicadorApi(
        "ifixTicker",
        "IFIX",
        formatarMoedaBRL(Number(ifix.regularMarketPrice || 0)),
        Number(ifix.regularMarketChangePercent),
        "https://analitica.auvp.com.br/indices/ifix"
      );
    } else {
      renderIndicadorApi("ifixTicker", "IFIX", "R$ --", undefined, "https://analitica.auvp.com.br/indices/ifix");
    }
  } catch {
    renderIndicadorApi("ifixTicker", "IFIX", "R$ --", undefined, "https://analitica.auvp.com.br/indices/ifix");
  }
}

let tickerMoedasController = null;

async function atualizarIndices() {
  await atualizarDolar();
  await atualizarIBOV();
  await atualizarCDI();
  await atualizarEuro();
  await atualizarBitcoin();
  await atualizarIndicadoresApi();
}

function aplicarFadeEmElemento(elementoId) {
  const elemento = document.getElementById(elementoId);
  if (!elemento) return;
  
  elemento.style.animation = 'none';
  setTimeout(() => {
    elemento.style.animation = 'fadeUpdate 0.4s ease-in-out';
  }, 10);
}

function configurarTickerMoedasIndividual() {
  const container = document.querySelector(".indicesMoedas");
  const faixaMoedas = document.querySelector(".moedas");

  if (!container || !faixaMoedas) {
    return;
  }

  const itens = Array.from(faixaMoedas.children);

  if (!itens.length) {
    return;
  }

  const espacamento = 48;
  const velocidadePixelsPorSegundo = 45;
  const estado = itens.map((item) => ({ item, x: 0, largura: 0 }));
  let ultimoFrame = null;

  const medirItens = () => {
    estado.forEach((entrada) => {
      entrada.largura = Math.max(entrada.item.offsetWidth, 140);
    });
  };

  const posicionarInicio = () => {
    const larguraContainer = container.clientWidth;
    let acumulado = larguraContainer;

    estado.forEach((entrada) => {
      entrada.x = acumulado;
      acumulado += entrada.largura + espacamento;
      entrada.item.style.transform = `translate3d(${entrada.x}px, -50%, 0)`;
    });
  };

  const animar = (tempoAtual) => {
    if (ultimoFrame === null) {
      ultimoFrame = tempoAtual;
      requestAnimationFrame(animar);
      return;
    }

    const deltaSegundos = (tempoAtual - ultimoFrame) / 1000;
    ultimoFrame = tempoAtual;
    const deslocamento = velocidadePixelsPorSegundo * deltaSegundos;

    let maiorDireita = -Infinity;

    estado.forEach((entrada) => {
      entrada.x -= deslocamento;
      const direitaAtual = entrada.x + entrada.largura;

      if (direitaAtual > maiorDireita) {
        maiorDireita = direitaAtual;
      }
    });

    estado.forEach((entrada) => {
      const saiuDaTela = entrada.x + entrada.largura < 0;

      if (saiuDaTela) {
        entrada.x = maiorDireita + espacamento;
        maiorDireita = entrada.x + entrada.largura;
      }

      entrada.item.style.transform = `translate3d(${entrada.x}px, -50%, 0)`;
    });

    requestAnimationFrame(animar);
  };

  const reiniciarTicker = () => {
    medirItens();
    posicionarInicio();
    ultimoFrame = null;
  };

  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      reiniciarTicker();
    }, 300);
  };

  reiniciarTicker();
  window.addEventListener("resize", handleResize);
  requestAnimationFrame(animar);

  return {
    recalcularLayout: reiniciarTicker
  };
}

tickerMoedasController = configurarTickerMoedasIndividual();

// Atualiza ao carregar
atualizarIndices();

// Função para formatar moeda brasileira
function formatCurrency(value) {
  // Remove tudo que não é dígito
  let num = value.replace(/\D/g, '');
  // Adiciona zeros à esquerda se necessário
  num = num.padStart(3, '0');
  // Divide por 100 para ter centavos
  let floatNum = parseFloat(num) / 100;
  // Formata com separadores brasileiros e R$
  return 'R$ ' + floatNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para desformatar moeda brasileira
function unformatCurrency(value) {
  return parseFloat(value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
}

// Aplica formatação aos inputs de moeda
function applyCurrencyMask(inputId) {
  const input = document.getElementById(inputId);
  input.addEventListener('input', function() {
    let value = this.value;
    this.value = formatCurrency(value);
  });
  input.addEventListener('focus', function() {
    if (this.value === 'R$ 0,00') this.value = '';
  });
  input.addEventListener('blur', function() {
    if (this.value === '') this.value = 'R$ 0,00';
  });
}

// Aplica máscara aos inputs relevantes
applyCurrencyMask('rendaMensal');
applyCurrencyMask('gastosFixos');
applyCurrencyMask('alimentacao');
applyCurrencyMask('transporte');
applyCurrencyMask('lazer');
applyCurrencyMask('valorInvestimento');
applyCurrencyMask('valorInicial');
applyCurrencyMask('valorMensal');

function mostrarAlerta(mensagem) {
  const alertaExistente = document.querySelector('.alertaFlutuante');
  if (alertaExistente) {
    alertaExistente.classList.add('saindo');
    setTimeout(() => {
      if (document.body.contains(alertaExistente)) {
        document.body.removeChild(alertaExistente);
      }
      criarNovoAlerta(mensagem);
    }, 500);
  } else {
    criarNovoAlerta(mensagem);
  }
}

function criarNovoAlerta(mensagem) {
  const alerta = document.createElement('div');
  alerta.className = 'alertaFlutuante';
  alerta.textContent = mensagem;
  document.body.appendChild(alerta);
  setTimeout(() => {
    if (document.body.contains(alerta)) {
      alerta.classList.add('saindo');
      setTimeout(() => document.body.removeChild(alerta), 500);
    }
  }, 3000);
}

let graficoMilhao;
let investorListenerAdded = false; // control for Saiba Investir delegation

document.getElementById("calcularOrcamento").addEventListener("click", () => {
  const renda = unformatCurrency(document.getElementById("rendaMensal").value);
  const fixos = unformatCurrency(document.getElementById("gastosFixos").value);
  const ali = unformatCurrency(document.getElementById("alimentacao").value);
  const trans = unformatCurrency(document.getElementById("transporte").value);
  const laz = unformatCurrency(document.getElementById("lazer").value);

  // Validação: obrigar renda a ser informada e positiva
  if (isNaN(renda) || renda <= 0) {
    mostrarAlerta('Por favor, insira uma renda mensal válida e positiva.');
    return;
  }

  const totalGastos = fixos + ali + trans + laz;
  const sobras = renda - totalGastos;

  document.getElementById("resultadoOrcamento").innerHTML = `
    <h3>📊 Resultado do Orçamento</h3>
    <p>Renda: R$ ${renda.toFixed(2)}</p>
    <p>Total de Gastos: R$ ${totalGastos.toFixed(2)}</p>
    <p><strong>Sobras para Investir: R$ ${sobras.toFixed(2)}</strong></p>
    ${sobras > 0 ? `<p>💡 Com R$ ${sobras.toFixed(2)} por mês, você pode investir e alcançar seus objetivos!</p><button class="btnSaibaInvestir">💼 Saiba Investir!</button>` : `<p>⚠️ Seus gastos estão acima da renda. Considere reduzir despesas.</p>`}
  `;

  // Adiciona evento ao botão "Saiba Investir!" (delegação para evitar múltiplos handlers)
  if (!investorListenerAdded) {
    const container = document.getElementById("resultadoOrcamento");
    if (container) {
      container.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("btnSaibaInvestir")) {
          abrirModalInvestimento();
        }
      });
      investorListenerAdded = true;
    }
  }


  // Auto-preencher o valor de investimento com as sobras
  if (sobras > 0) {
    document.getElementById("valorInvestimento").value = sobras;
    // Trigger the update
    atualizarAutomatico();
    // Also set in million calculator
    document.getElementById("valorMensal").value = sobras;
  }
});

document.getElementById("calcularMilhao").addEventListener("click", () => {

  const valorInicial = unformatCurrency(document.getElementById("valorInicial").value);
  const valorMensal = unformatCurrency(document.getElementById("valorMensal").value);
  const taxaAnual = parseFloat(document.getElementById("taxaJuros").value) / 100;

  // Validação: obrigar valor mensal a ser informado e positivo
  if (isNaN(valorMensal) || valorMensal <= 0) {
    mostrarAlerta('Por favor, insira um valor mensal válido e positivo.');
    return;
  }

  const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1;

  let total = valorInicial;
  let meses = 0;

  let dados = [];
  let labels = [];

  while (total < 1000000) {
    total = total * (1 + taxaMensal) + valorMensal;
    meses++;

    dados.push(total);
    labels.push(`Mês ${meses}`);

    if (meses > 1000) break;
  }

  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  document.getElementById("resultadoMilhao").innerHTML = `
    <h3>📊 Resultado</h3>
    <p>Você atingirá R$ 1.000.000 em:</p>
    <strong>${anos} anos e ${mesesRestantes} meses</strong>
  `;

  criarGraficoMilhao(labels, dados);
});


function criarGraficoMilhao(labels, dados) {

  const ctx = document.getElementById("graficoMilhao").getContext("2d");

  if (graficoMilhao) {
    graficoMilhao.destroy();
  }

  graficoMilhao = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Crescimento do Investimento",
          data: dados,
          borderColor: "#a259ff",
          backgroundColor: "rgba(162,89,255,0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 0
        },
        {
          label: "Meta 1 Milhão",
          data: Array(labels.length).fill(1000000),
          borderColor: "#00ff9d",
          borderDash: [5,5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 2000
      },
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#aaa" }
        },
        y: {
          ticks: {
            color: "#aaa",
            callback: function(value) {
              return "R$ " + value.toLocaleString("pt-BR");
            }
          }
        }
      }
    }
  });
}
// ===== FUNÇÕES DO MODAL DE INVESTIMENTOS =====

function abrirModalInvestimento() {
  const modal = document.getElementById("modalInvestimento");
  const overlay = document.getElementById("overlayModal");
  
  modal.classList.add("ativo");
  overlay.classList.add("ativo");
  
  // Impede scroll do body quando modal está aberto
  document.body.style.overflow = "hidden";
}

function fecharModalInvestimento() {
  const modal = document.getElementById("modalInvestimento");
  const overlay = document.getElementById("overlayModal");
  
  modal.classList.remove("ativo");
  overlay.classList.remove("ativo");
  
  // Restaura scroll do body
  document.body.style.overflow = "auto";
}

function irParaSecaoInvestimentos() {
  fecharModalInvestimento();
  
  // Faz scroll suave para a seção de investimentos
  const secaoInvestimentos = document.querySelector(".dashboard");
  if (secaoInvestimentos) {
    setTimeout(() => {
      secaoInvestimentos.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }
}

// ===== TOUR DE ORIENTAÇÃO =====

let tourSteps = [];
let tourCurrent = 0;
let tourCallback = null;

function startTour(steps, callback) {
  tourSteps = steps;
  tourCurrent = 0;
  tourCallback = callback;

  // remove any existing cancel button to start clean
  const oldCancel = document.getElementById("tourCancel");
  if (oldCancel) {
    oldCancel.remove();
  }

  const overlay = document.getElementById("overlayTour");
  const message = document.getElementById("tourMessage");
  const text = document.getElementById("tourText");
  const btnNext = document.getElementById("tourNext");
  const btnPrev = document.getElementById("tourPrev");
  const btnEnd = document.getElementById("tourEnd");

  overlay.classList.add("ativo");
  message.style.display = "block";

  function showStep() {
    const step = tourSteps[tourCurrent];
    text.textContent = step.text;

    // highlight element
    tourSteps.forEach(s => {
      const el = document.querySelector(s.selector);
      if (el) el.classList.remove("tourHighlight");
    });
    const el = document.querySelector(step.selector);
    if (el) {
      el.classList.add("tourHighlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    btnPrev.style.display = tourCurrent > 0 ? "inline-block" : "none";
    if (tourCurrent === tourSteps.length - 1) {
      btnNext.style.display = "none";
      btnEnd.style.display = "inline-block";
    } else {
      btnNext.style.display = "inline-block";
      btnEnd.style.display = "none";
    }
  }

  btnNext.onclick = () => {
    tourCurrent++;
    showStep();
  };

  btnPrev.onclick = () => {
    tourCurrent--;
    showStep();
  };

  btnEnd.onclick = () => {
    const el = document.querySelector(tourSteps[tourCurrent].selector);
    if (el) el.classList.remove("tourHighlight");
    overlay.classList.remove("ativo");
    message.style.display = "none";
    if (tourCallback) tourCallback();
  };

  showStep();
}

function perguntaMilhao() {
  const overlay = document.getElementById("overlayTour");
  const message = document.getElementById("tourMessage");
  const text = document.getElementById("tourText");
  const btnNext = document.getElementById("tourNext");
  const btnPrev = document.getElementById("tourPrev");
  const btnEnd = document.getElementById("tourEnd");

  text.innerHTML = "<strong>Deseja seguir para a Calculadora do Primeiro Milhão?</strong>";
  btnPrev.style.display = "none";
  btnNext.style.display = "none";
  btnEnd.textContent = "Sim, vamos!";

  // add cancel button if not already
  let cancel = document.getElementById("tourCancel");
  if (!cancel) {
    cancel = document.createElement("button");
    cancel.id = "tourCancel";
    cancel.textContent = "Ainda não";
    cancel.style.margin = "0 5px";
    cancel.style.padding = "10px 15px";
    cancel.style.background = "#ff4d6d";
    cancel.style.border = "none";
    cancel.style.color = "white";
    cancel.style.borderRadius = "8px";
    cancel.style.cursor = "pointer";
    cancel.addEventListener("click", () => {
      overlay.classList.remove("ativo");
      message.style.display = "none";
    });
    message.querySelector(".tourButtons").appendChild(cancel);
  }

  btnEnd.onclick = () => {
    overlay.classList.remove("ativo");
    message.style.display = "none";
    // iniciar tour do milhão
    const stepsMilhao = [
      {selector: "#valorInicial", text: "Comece informando o valor inicial que você já possui."},
      {selector: "#valorMensal", text: "Aqui coloque o quanto irá investir todo mês (geralmente suas sobras)."},
      {selector: "#taxaJuros", text: "Informe a taxa de juros anual estimada (p.ex. 8%)."},
      {selector: "#resultadoMilhao", text: "O resultado aparecerá aqui com tempo para atingir 1 milhão."}
    ];
    startTour(stepsMilhao);
  };
}

// Event listeners do modal
document.addEventListener("DOMContentLoaded", () => {
  const btnFechar = document.querySelector(".btnFecharModal");
  const btnComecar = document.getElementById("btnComecar");
  const overlay = document.getElementById("overlayModal");
  const topoFixo = document.querySelector(".topo");
  const OFFSET_MINIMO_TOPO = 160;

  const atualizarOffsetTopo = () => {
    if (!topoFixo) return;
    const alturaTopo = Math.ceil(topoFixo.offsetHeight || topoFixo.getBoundingClientRect().height || 0);
    const offsetFinal = Math.max(alturaTopo + 10, OFFSET_MINIMO_TOPO);
    document.documentElement.style.setProperty("--topo-offset", `${offsetFinal}px`);
  };

  let resizeTimeout;
  const atualizarOffsetTopoDebounced = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(atualizarOffsetTopo, 120);
  };

  atualizarOffsetTopo();
  window.addEventListener("resize", atualizarOffsetTopoDebounced);
  window.addEventListener("load", atualizarOffsetTopo);
  setTimeout(atualizarOffsetTopo, 250);

  if (topoFixo && "ResizeObserver" in window) {
    const observadorTopo = new ResizeObserver(() => {
      atualizarOffsetTopoDebounced();
    });
    observadorTopo.observe(topoFixo);
  }
  
  if (btnFechar) {
    btnFechar.addEventListener("click", fecharModalInvestimento);
  }
  
  if (btnComecar) {
    btnComecar.addEventListener("click", () => {
      // scroll to investments section then launch tour
      irParaSecaoInvestimentos();
      const stepsComparacao = [
        {selector: "#valorInvestimento", text: "Digite ou verifique o valor mensal disponível para investir."},
        {selector: "#mesesInvestimento", text: "Selecione por quantos meses você planeja investir."},
        {selector: "#resultadoInvestimentos", text: "Veja aqui o ranking dos investimentos e o lucro estimado."},
        {selector: ".ladoGrafico", text: "O gráfico mostra o crescimento mês a mês do melhor investimento."}
      ];
      startTour(stepsComparacao, perguntaMilhao);
    });
  }

  // Fechar modal ao clicar no overlay
  if (overlay) {
    overlay.addEventListener("click", fecharModalInvestimento);
  }
  
  // Fechar modal ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fecharModalInvestimento();
    }
  });
  
  // Sistema de scroll para ocultar/mostrar header
  let ultimoScrollY = 0;
  const LIMIAR_ESCONDER = 90;
  const LIMIAR_MOSTRAR = 10;
  
  window.addEventListener("scroll", () => {
    const topo = document.querySelector(".topo");
    if (!topo) return;

    const scrollAtual = Math.max(window.scrollY, 0);
    const delta = scrollAtual - ultimoScrollY;
    
    if (scrollAtual <= 50) {
      topo.classList.remove("hidden");
      ultimoScrollY = scrollAtual;
      return;
    }

    if (delta > LIMIAR_MOSTRAR && scrollAtual > LIMIAR_ESCONDER) {
      topo.classList.add("hidden");
    } else if (delta < -LIMIAR_MOSTRAR) {
      topo.classList.remove("hidden");
    }

    ultimoScrollY = scrollAtual;
  }, { passive: true });
});


import { neonCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js'

neonCursor({
  el: document.getElementById('app'),
  shaderPoints: 16,
  curvePoints: 80,
  curveLerp: 0.5,
  radius1: 5,
  radius2: 30,
  velocityTreshold: 10,
  sleepRadiusX: 100,
  sleepRadiusY: 100,
  sleepTimeCoefX: 0.0025,
  sleepTimeCoefY: 0.0025
})