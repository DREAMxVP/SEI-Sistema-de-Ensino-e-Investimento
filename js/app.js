import { simularTodos, crescimentoMensal } from "./analysis.js";

const configuracaoApi = {
  brapiBaseUrl: "https://brapi.dev/api",
  brapiToken: "",
  auvpBaseUrl: "https://analitica.auvp.com.br",
  intervaloAtualizacaoGeralMs: 30000,
  intervaloAtualizacaoWatchlistMs: 30000,
  intervaloAtualizacaoPainelIndicesMs: 60000
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

function gerarSerieComparativaMensal(valorMensal, taxaAnual, meses, valorInicial = 0) {
  const labels = [];
  const total = [];
  const guardado = [];
  const investido = [];
  const lucro = [];

  const taxaMensal = taxaAnual / 100 / 12;
  let montante = Number(valorInicial) || 0;
  let acumuladoGuardado = 0;

  const hoje = new Date();

  for (let indice = 0; indice < meses; indice++) {
    acumuladoGuardado += valorMensal;
    const totalInvestido = (Number(valorInicial) || 0) + acumuladoGuardado;

    montante = (montante + valorMensal) * (1 + taxaMensal);
    const lucroAtual = montante - totalInvestido;

    const dataPonto = new Date(hoje.getFullYear(), hoje.getMonth() + indice, 1);
    labels.push(
      dataPonto.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit"
      })
    );

    guardado.push(acumuladoGuardado);
    investido.push(totalInvestido);
    total.push(montante);
    lucro.push(lucroAtual);
  }

  return { labels, total, guardado, investido, lucro };
}
import {
  atualizarGraficoInvestimentos,
  atualizarGraficoMensal
} from "./charts.js";

const valorInput = document.getElementById("valorInvestimento");
const mesesInput = document.getElementById("mesesInvestimento");
const resultadoContainer = document.getElementById("resultadoInvestimentos");
const resultadoContainerResumo = document.getElementById("resultadoInvestimentosResumo");
const opcoesRankingContainer = document.getElementById("opcoesRankingInvestimentos");
const barraPesquisaInput = document.getElementById("barraPesquisa");

const estadoComparativo = {
  investimentoSelecionado: null,
  resultados: []
};

const configuracaoPainelIndices = [
  { id: "selic", nome: "SELIC", descricao: "Taxa Selic anual", tipo: "taxa", unidade: "%", valorInicial: 14.75, rotulosAuvp: ["SELIC"] },
  { id: "cdi", nome: "CDI", descricao: "Certificado de Depósito Interbancário", tipo: "taxa", unidade: "%", valorInicial: 14.65, rotulosAuvp: ["CDI"] },
  { id: "ipca", nome: "IPCA", descricao: "Inflação oficial (acumulado)", tipo: "taxa", unidade: "%", valorInicial: 3.81, rotulosAuvp: ["IPCA"] },
  { id: "iafd", nome: "IAFD", descricao: "Índice Teva Ações Fundamentos", tipo: "pontos", valorInicial: 403.62, simbolos: ["IAFD"], rotulosAuvp: ["IAFD"] },
  { id: "ibov", nome: "IBOV", descricao: "Índice Bovespa", tipo: "pontos", valorInicial: 192201.16, simbolos: ["^BVSP", "IBOV"], rotulosAuvp: ["IBOV"] },
  { id: "ifix", nome: "IFIX", descricao: "Índice de Fundos Imobiliários", tipo: "pontos", valorInicial: 3890.63, simbolos: ["IFIX"], rotulosAuvp: ["IFIX"] },
  { id: "spx", nome: "SPX", descricao: "S&P 500", tipo: "pontos", valorInicial: 6782.81, simbolos: ["^GSPC", "SPX"], rotulosAuvp: ["SPX"] },
  { id: "bdrx", nome: "BDRX", descricao: "Índice de BDRs Não Patrocinados", tipo: "pontos", valorInicial: 23521.1, simbolos: ["BDRX"], rotulosAuvp: ["BDRX"] },
  { id: "dja", nome: "DJA", descricao: "Dow Jones Industrial Average", tipo: "pontos", valorInicial: 15639.76, simbolos: ["^DJI", "DJA"], rotulosAuvp: ["DJA"] },
  { id: "djt", nome: "DJT", descricao: "Dow Jones Transportation Average", tipo: "pontos", valorInicial: 20168.87, simbolos: ["^DJT", "DJT"], rotulosAuvp: ["DJT"] },
  { id: "dju", nome: "DJU", descricao: "Dow Jones Utility Average", tipo: "pontos", valorInicial: 1178.88, simbolos: ["^DJU", "DJU"], rotulosAuvp: ["DJU"] },
  { id: "ibra", nome: "IBRA", descricao: "Índice Brasil Amplo", tipo: "pontos", valorInicial: 7555.76, simbolos: ["IBRA"], rotulosAuvp: ["IBRA"] },
  { id: "ibxl", nome: "IBXL", descricao: "Índice Brasil 50", tipo: "pontos", valorInicial: 32505.39, simbolos: ["IBXL", "IBRX50"], rotulosAuvp: ["IBXL"] },
  { id: "ibxx", nome: "IBXX", descricao: "Índice Brasil 100", tipo: "pontos", valorInicial: 81222.46, simbolos: ["IBXX", "IBRX", "IBRX100"], rotulosAuvp: ["IBXX"] },
  { id: "ico2", nome: "ICO2", descricao: "Índice Carbono Eficiente", tipo: "pontos", valorInicial: 3512.29, simbolos: ["ICO2"], rotulosAuvp: ["ICO2"] },
  { id: "icon", nome: "ICON", descricao: "Índice de Consumo", tipo: "pontos", valorInicial: 3321, simbolos: ["ICON"], rotulosAuvp: ["ICON"] },
  { id: "idiv", nome: "IDIV", descricao: "Índice Dividendos", tipo: "pontos", valorInicial: 13459.15, simbolos: ["IDIV"], rotulosAuvp: ["IDIV"] },
  { id: "ieex", nome: "IEEX", descricao: "Índice Energia Elétrica", tipo: "pontos", valorInicial: 138975.97, simbolos: ["IEEX"], rotulosAuvp: ["IEEX"] },
  { id: "ifnc", nome: "IFNC", descricao: "Índice Financeiro", tipo: "pontos", valorInicial: 20333.2, simbolos: ["IFNC"], rotulosAuvp: ["IFNC"] },
  { id: "igct", nome: "IGCT", descricao: "Índice Governança Corporativa Trade", tipo: "pontos", valorInicial: 8602.38, simbolos: ["IGCT"], rotulosAuvp: ["IGCT"] },
  { id: "igcx", nome: "IGCX", descricao: "Índice de Ações com Governança Corporativa Diferenciada", tipo: "pontos", valorInicial: 29279.95, simbolos: ["IGCX"], rotulosAuvp: ["IGCX"] },
  { id: "ignm", nome: "IGNM", descricao: "Índice de Governança Corporativa - Novo Mercado", tipo: "pontos", valorInicial: 5203.72, simbolos: ["IGNM"], rotulosAuvp: ["IGNM"] },
  { id: "igpm", nome: "IGPM", descricao: "Índice Geral de Preços do Mercado", tipo: "taxa", unidade: "%", valorInicial: 0.52, rotulosAuvp: ["IGPM"] },
  { id: "imat", nome: "IMAT", descricao: "Índice de Materiais Básicos", tipo: "pontos", valorInicial: 6382.11, simbolos: ["IMAT"], rotulosAuvp: ["IMAT"] },
  { id: "imob", nome: "IMOB", descricao: "Índice Imobiliário", tipo: "pontos", valorInicial: 1499.62, simbolos: ["IMOB"], rotulosAuvp: ["IMOB"] },
  { id: "indx", nome: "INDX", descricao: "Índice do Setor Industrial", tipo: "pontos", valorInicial: 31085.28, simbolos: ["INDX"], rotulosAuvp: ["INDX"] },
  { id: "isee", nome: "ISEE", descricao: "Índice de Sustentabilidade Empresarial", tipo: "pontos", valorInicial: 4761.17, simbolos: ["ISEE"], rotulosAuvp: ["ISEE"] },
  { id: "itag", nome: "ITAG", descricao: "Índice de Ações com Tag Along Diferenciado", tipo: "pontos", valorInicial: 41792.47, simbolos: ["ITAG"], rotulosAuvp: ["ITAG"] },
  { id: "itbr-ipca-rendimento", nome: "ITBR IPCA Rendimento", descricao: "Índice Teva Tesouro IPCA rendimento", tipo: "pontos", valorInicial: 259.47, simbolos: ["ITBR"], rotulosAuvp: ["ITBR IPCA Rendimento"] },
  { id: "ivbx", nome: "IVBX", descricao: "Índice Valor", tipo: "pontos", valorInicial: 19873.33, simbolos: ["IVBX"], rotulosAuvp: ["IVBX"] },
  { id: "ixic", nome: "IXIC", descricao: "NASDAQ Composite", tipo: "pontos", valorInicial: 22634.99, simbolos: ["^IXIC", "IXIC"], rotulosAuvp: ["IXIC"] },
  { id: "mid", nome: "MID", descricao: "S&P MidCap 400", tipo: "pontos", valorInicial: 3523.96, simbolos: ["MID"], rotulosAuvp: ["MID"] },
  { id: "mlcx", nome: "MLCX", descricao: "Índice MidLarge Cap", tipo: "pontos", valorInicial: 3975.81, simbolos: ["MLCX"], rotulosAuvp: ["MLCX"] },
  { id: "ndx", nome: "NDX", descricao: "NASDAQ 100", tipo: "pontos", valorInicial: 24903.17, simbolos: ["^NDX", "NDX"], rotulosAuvp: ["NDX"] },
  { id: "nya", nome: "NYA", descricao: "NYSE Composite", tipo: "pontos", valorInicial: 22798.05, simbolos: ["^NYA", "NYA"], rotulosAuvp: ["NYA"] },
  { id: "oex", nome: "OEX", descricao: "S&P 100", tipo: "pontos", valorInicial: 3306.29, simbolos: ["^OEX", "OEX"], rotulosAuvp: ["OEX"] },
  { id: "rut", nome: "RUT", descricao: "Russell 2000", tipo: "pontos", valorInicial: 2620.46, simbolos: ["^RUT", "RUT"], rotulosAuvp: ["RUT"] },
  { id: "smll", nome: "SMLL", descricao: "Índice Small Caps", tipo: "pontos", valorInicial: 2484.58, simbolos: ["SMLL"], rotulosAuvp: ["SMLL"] },
  { id: "util", nome: "UTIL", descricao: "Índice Utilidade Pública", tipo: "pontos", valorInicial: 20371.21, simbolos: ["UTIL"], rotulosAuvp: ["UTIL"] },
  { id: "xax", nome: "XAX", descricao: "NYSE AMEX Composite", tipo: "pontos", valorInicial: 8933.36, simbolos: ["^XAX", "XAX"], rotulosAuvp: ["XAX"] }
];

const cachePainelIndices = {};
configuracaoPainelIndices.forEach((indice) => {
  if (Number.isFinite(indice.valorInicial)) {
    cachePainelIndices[indice.id] = indice.valorInicial;
  }
});

const estadoPainelIndices = {
  indiceSelecionadoId: configuracaoPainelIndices[0]?.id || null,
  filtroTexto: "",
  nivelExplicacao: "iniciante",
  perfilSimulacao: "moderado"
};

const explicacoesIndices = {
  iniciante: {
    selic: "A Selic funciona como o 'freio/acelerador' da economia. Quando sobe, aplicações pós-fixadas tendem a render mais.",
    cdi: "CDI é a referência de vários CDBs e fundos DI. Se você investe neles, acompanhar o CDI ajuda a prever ganhos.",
    ipca: "IPCA mede inflação. O objetivo é fazer seu dinheiro crescer mais do que o IPCA para não perder poder de compra.",
    ibov: "IBOV mostra o humor da bolsa brasileira. Quando ele cai, o mercado costuma estar mais cauteloso com risco.",
    ifix: "IFIX acompanha fundos imobiliários. É útil para quem quer entender renda mensal com imóveis na bolsa.",
    spx: "SPX representa as 500 maiores empresas dos EUA. É um termômetro global para comparar com o Brasil.",
    dja: "DJA reúne empresas tradicionais dos EUA e ajuda a enxergar a força da economia americana mais madura.",
    ibra: "IBRA mostra um retrato mais amplo da bolsa brasileira, além das ações mais famosas do IBOV.",
    ibrx100: "IBRX reflete as 100 ações mais negociadas, ajudando a entender o fluxo principal da bolsa.",
    idiv: "IDIV foca em empresas pagadoras de dividendos e é útil para estratégias de renda.",
    icon: "ICON acompanha empresas de consumo e pode sinalizar como o bolso das famílias está reagindo.",
    ifnc: "IFNC mostra o setor financeiro. Bancos fortes costumam indicar crédito e atividade econômica mais aquecidos.",
    igcx: "IGCX destaca empresas com melhor governança, reduzindo alguns riscos de gestão.",
    ieex: "IEEX acompanha energia elétrica, um setor tradicionalmente estável em muitos cenários.",
    padrao: "Use este índice para comparar risco, retorno e proteção contra inflação de forma prática."
  },
  tecnico: {
    selic: "Selic é a taxa básica definida pelo Copom e atua no custo de capital, curva prefixada e prêmio de risco dos ativos domésticos.",
    cdi: "CDI diário (over) baliza pós-fixados e funding bancário. Multiplicadores de CDI alteram retorno efetivo conforme duration.",
    ipca: "IPCA acumulado define retorno real: $r_{real} \approx \frac{1+r_{nominal}}{1+\pi}-1$. Estratégias indexadas protegem poder de compra.",
    ibov: "IBOV concentra liquidez e beta do mercado local. É benchmark de risco Brasil para alocação tática em renda variável.",
    ifix: "IFIX combina sensibilidade a juros reais, vacância e cap rate. Serve para monitorar prêmio de risco em FIIs.",
    spx: "SPX é proxy de risco global e earnings cycle dos EUA, influenciando fluxo estrangeiro e correlação com emergentes.",
    dja: "DJA possui composição mais price-weighted e cíclica tradicional, útil para leitura de setores maduros dos EUA.",
    ibra: "IBRA amplia universo investível frente ao IBOV, melhorando representatividade para estudos fatoriais e breadth de mercado.",
    ibrx100: "IBRX100 captura alta liquidez e amplitude setorial, útil para análises de dispersão e momentum local.",
    idiv: "IDIV tende a refletir fatores value/dividend yield e sensibilidade ao ciclo de juros e geração de caixa.",
    icon: "ICON concentra consumo discricionário e staples; é sensível a renda real, crédito e confiança do consumidor.",
    ifnc: "IFNC reage a spread bancário, inadimplência e política monetária, funcionando como termômetro do ciclo de crédito.",
    igcx: "IGCX prioriza companhias com melhores práticas de governança, mitigando risco de agência e potencialmente reduzindo desconto.",
    ieex: "IEEX reflete utilities elétricas, com perfil mais defensivo e sensibilidade a regulação, inflação e custo de dívida.",
    padrao: "Use o índice como benchmark para retorno ajustado ao risco e avaliação de alocação relativa."
  }
};

const perfisMiniGame = {
  conservador: {
    nome: "Conservador",
    fatorTaxa: 0.82,
    fatorVolatilidade: 0.65,
    dica: "Foco em estabilidade e menor oscilação."
  },
  moderado: {
    nome: "Moderado",
    fatorTaxa: 1,
    fatorVolatilidade: 1,
    dica: "Equilíbrio entre segurança e crescimento."
  },
  arrojado: {
    nome: "Arrojado",
    fatorTaxa: 1.18,
    fatorVolatilidade: 1.35,
    dica: "Busca maior retorno aceitando mais risco."
  }
};

// Atualiza automaticamente ao digitar
valorInput.addEventListener("input", atualizarAutomatico);
mesesInput.addEventListener("input", atualizarAutomatico);

// Atualização principal
function atualizarAutomatico() {

  const valor = unformatCurrency(valorInput.value);
  const meses = parseInt(mesesInput.value);

  if (!valor || valor <= 0 || !meses || meses <= 0) {
    if (resultadoContainer) resultadoContainer.innerHTML = "";
    if (resultadoContainerResumo) resultadoContainerResumo.innerHTML = "";
    if (opcoesRankingContainer) opcoesRankingContainer.innerHTML = "";
    return;
  }

  const resultados = simularTodosLocal(valor, meses);
  atualizarComparativoCompleto(resultados, valor, meses);
}

// Atualização automática a cada 30 segundos com valores padrão
setInterval(async () => {
  await atualizarIndices();

  const valorPadrao = unformatCurrency(document.getElementById("valorInvestimento").value) || 500;
  const mesesPadrao = parseInt(document.getElementById("mesesInvestimento").value, 10) || 12;

  const resultados = simularTodosLocal(valorPadrao, mesesPadrao);
  atualizarComparativoCompleto(resultados, valorPadrao, mesesPadrao);
}, configuracaoApi.intervaloAtualizacaoGeralMs);

function atualizarComparativoCompleto(resultados, valor, meses) {
  if (!Array.isArray(resultados) || !resultados.length) {
    return;
  }

  estadoComparativo.resultados = resultados;

  const possuiSelecionado = resultados.some((item) => item.nome === estadoComparativo.investimentoSelecionado);
  if (!possuiSelecionado) {
    estadoComparativo.investimentoSelecionado = resultados[0].nome;
  }

  criarTabelaRanking(resultados, estadoComparativo.investimentoSelecionado);
  renderizarOpcoesRanking(resultados, estadoComparativo.investimentoSelecionado);
  atualizarGraficoInvestimentos(resultados, estadoComparativo.investimentoSelecionado);

  const investimentoEscolhido = resultados.find((item) => item.nome === estadoComparativo.investimentoSelecionado) || resultados[0];
  const serieComparativa = gerarSerieComparativaMensal(valor, investimentoEscolhido.taxa, meses, 0);
  atualizarGraficoMensal(serieComparativa, investimentoEscolhido.nome);
}

function selecionarInvestimentoComparativo(nomeInvestimento) {
  if (!nomeInvestimento || !estadoComparativo.resultados.length) {
    return;
  }

  const existe = estadoComparativo.resultados.some((item) => item.nome === nomeInvestimento);
  if (!existe) {
    return;
  }

  estadoComparativo.investimentoSelecionado = nomeInvestimento;

  const valor = unformatCurrency(valorInput?.value || "") || 500;
  const meses = parseInt(mesesInput?.value, 10) || 12;

  atualizarComparativoCompleto(estadoComparativo.resultados, valor, meses);
}

if (resultadoContainer) {
  resultadoContainer.addEventListener("click", (evento) => {
    const linha = evento.target.closest("[data-investimento]");
    if (!linha) return;
    selecionarInvestimentoComparativo(linha.getAttribute("data-investimento"));
  });
}

if (resultadoContainerResumo) {
  resultadoContainerResumo.addEventListener("click", (evento) => {
    const linha = evento.target.closest("[data-investimento]");
    if (!linha) return;
    selecionarInvestimentoComparativo(linha.getAttribute("data-investimento"));
  });
}

if (opcoesRankingContainer) {
  opcoesRankingContainer.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-investimento]");
    if (!botao) return;
    selecionarInvestimentoComparativo(botao.getAttribute("data-investimento"));
  });
}

// 🔥 TABELA PROFISSIONAL
function criarTabelaRanking(resultados, investimentoSelecionado) {
  let html = `<table><tr><th>#</th><th>Investimento</th><th>Taxa</th><th>Total Final</th><th>Lucro</th></tr>`;
  resultados.forEach((r, i) => {
    const destaque = r.nome === investimentoSelecionado;
    html += `<tr class="linhaRanking${destaque ? " linhaRankingAtiva" : ""}" data-investimento="${r.nome}">
      <td>${i === 0 ? '🏆' : i + 1}</td>
      <td>${r.nome}</td>
      <td>${r.taxa.toFixed(2).replace('.', ',')}%</td>
      <td>R$ ${r.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>R$ ${r.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>`;
  });
  html += `</table>`;
  if (resultadoContainer) {
    resultadoContainer.innerHTML = html;
  }

  if (resultadoContainerResumo) {
    resultadoContainerResumo.innerHTML = html;
  }
}

function renderizarOpcoesRanking(resultados, investimentoSelecionado) {
  if (!opcoesRankingContainer) {
    return;
  }

  opcoesRankingContainer.innerHTML = resultados
    .map((resultado) => `
      <button
        type="button"
        class="opcaoRanking${resultado.nome === investimentoSelecionado ? " ativa" : ""}"
        data-investimento="${resultado.nome}">
        ${resultado.nome}
      </button>
    `)
    .join("");
}

function formatarNumeroPainel(valor, tipo, unidade) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return "--";
  }

  if (tipo === "taxa") {
    return `${numero.toFixed(2).replace(".", ",")}${unidade || "%"}`;
  }

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function obterIndicesFiltradosPainel() {
  const termo = normalizarTextoPesquisa(estadoPainelIndices.filtroTexto);
  if (!termo) {
    return configuracaoPainelIndices;
  }

  return configuracaoPainelIndices.filter((indice) => {
    const nome = normalizarTextoPesquisa(indice.nome);
    const descricao = normalizarTextoPesquisa(indice.descricao);
    const id = normalizarTextoPesquisa(indice.id);
    return nome.includes(termo) || descricao.includes(termo) || id.includes(termo);
  });
}

function renderizarPainelIndicesCards() {
  const grid = document.getElementById("gridIndicesCompletos");
  if (!grid) return;

  const indicesVisiveis = obterIndicesFiltradosPainel();

  if (!indicesVisiveis.length) {
    grid.innerHTML = `
      <article class="indicePainelMensagemVazia">
        <strong>Nenhum índice encontrado.</strong>
        <span>Tente outro termo na busca para localizar um investimento.</span>
      </article>
    `;
    renderizarDetalheIndiceSelecionado();
    return;
  }

  const indiceSelecionadoVisivel = indicesVisiveis.some((item) => item.id === estadoPainelIndices.indiceSelecionadoId);
  if (!indiceSelecionadoVisivel) {
    estadoPainelIndices.indiceSelecionadoId = indicesVisiveis[0]?.id || null;
  }

  grid.innerHTML = indicesVisiveis
    .map((indice) => {
      const valor = cachePainelIndices[indice.id];
      const ativo = indice.id === estadoPainelIndices.indiceSelecionadoId;
      return `
        <article class="indicePainelCard entrando${ativo ? " ativo" : ""}" data-indice-id="${indice.id}" role="button" tabindex="0" aria-pressed="${ativo ? "true" : "false"}">
          <div class="indicePainelTopo">
            <span class="indicePainelNome">${indice.nome}</span>
            <span class="indicePainelSeta">↗</span>
          </div>
          <div class="indicePainelValor">${formatarNumeroPainel(valor, indice.tipo, indice.unidade)}</div>
          <p class="indicePainelDescricao">${indice.descricao}</p>
        </article>
      `;
    })
    .join("");

  setTimeout(() => {
    grid.querySelectorAll(".indicePainelCard.entrando").forEach((card) => {
      card.classList.remove("entrando");
    });
  }, 170);

  renderizarDetalheIndiceSelecionado();
}

function obterConfigIndicePorId(indiceId) {
  return configuracaoPainelIndices.find((item) => item.id === indiceId) || configuracaoPainelIndices[0];
}

function obterNivelExplicacaoSelecionado() {
  const seletorNivel = document.getElementById("nivelExplicacaoIndice");
  const nivelSelecionado = seletorNivel?.value === "tecnico" ? "tecnico" : "iniciante";
  estadoPainelIndices.nivelExplicacao = nivelSelecionado;
  return nivelSelecionado;
}

function obterPerfilMiniGameSelecionado() {
  const seletorPerfil = document.getElementById("miniGamePerfil");
  const perfilSelecionado = seletorPerfil?.value || "moderado";
  estadoPainelIndices.perfilSimulacao = perfisMiniGame[perfilSelecionado] ? perfilSelecionado : "moderado";
  return estadoPainelIndices.perfilSimulacao;
}

function obterExplicacaoIndice(indiceId, nivel) {
  const grupo = explicacoesIndices[nivel] || explicacoesIndices.iniciante;
  return grupo[indiceId] || grupo.padrao;
}

function obterTaxaReferencialIndice(indice, valorAtual) {
  const taxaPorIndice = {
    selic: Number(cachePainelIndices.selic) || estadoIndicadores.selic,
    cdi: Number(cachePainelIndices.cdi) || estadoIndicadores.cdi,
    ipca: (Number(cachePainelIndices.ipca) || 4.5) + 2,
    ibov: 13.5,
    ifix: 11.2,
    spx: 12.4,
    dja: 10.8,
    ibra: 13.1,
    ibrx100: 12.9,
    idiv: 11.6,
    icon: 12.1,
    ifnc: 11.8,
    igcx: 12.3,
    ieex: 10.9
  };

  if (indice?.tipo === "taxa" && Number.isFinite(Number(valorAtual))) {
    return Number(valorAtual);
  }

  return taxaPorIndice[indice?.id] || (Number(cachePainelIndices.cdi) || estadoIndicadores.cdi);
}

function renderizarDetalheIndiceSelecionado() {
  const indice = obterConfigIndicePorId(estadoPainelIndices.indiceSelecionadoId);
  if (!indice) {
    return;
  }

  const nivelExplicacao = obterNivelExplicacaoSelecionado();
  const valorAtual = cachePainelIndices[indice.id];
  const titulo = document.getElementById("indiceDetalheTitulo");
  const descricao = document.getElementById("indiceDetalheDescricao");
  const pratica = document.getElementById("indiceDetalhePratica");

  if (titulo) {
    titulo.textContent = `${indice.nome} • ${formatarNumeroPainel(valorAtual, indice.tipo, indice.unidade)}`;
  }

  if (descricao) {
    descricao.textContent = indice.descricao;
  }

  if (pratica) {
    pratica.textContent = obterExplicacaoIndice(indice.id, nivelExplicacao);
  }

  executarMiniGameIndice();
}

function executarMiniGameIndice() {
  const indice = obterConfigIndicePorId(estadoPainelIndices.indiceSelecionadoId);
  const perfilId = obterPerfilMiniGameSelecionado();
  const perfil = perfisMiniGame[perfilId] || perfisMiniGame.moderado;
  const inputValor = document.getElementById("miniGameValor");
  const inputMeses = document.getElementById("miniGameMeses");
  const resultado = document.getElementById("miniGameResultado");

  if (!indice || !inputValor || !inputMeses || !resultado) {
    return;
  }

  const aporteMensal = Math.max(0, Number(inputValor.value) || 0);
  const meses = Math.max(1, Number(inputMeses.value) || 1);
  const valorAtual = cachePainelIndices[indice.id];
  const taxaBase = obterTaxaReferencialIndice(indice, valorAtual);
  const taxaAnual = Math.max(0.1, taxaBase * perfil.fatorTaxa);
  const montante = simularMensalLocal(aporteMensal, taxaAnual, meses);
  const totalAportado = aporteMensal * meses;
  const ipcaAnual = Number(cachePainelIndices.ipca) || 4.5;
  const fatorInflacao = Math.pow(1 + (ipcaAnual / 100), meses / 12);
  const montanteReal = montante / fatorInflacao;
  const venceuInflacao = montanteReal > totalAportado;

  const taxaMensal = taxaAnual / 100 / 12;
  const choque = taxaMensal * 0.28 * perfil.fatorVolatilidade;
  const taxaPessimista = Math.max(0.05, (taxaMensal - choque) * 12 * 100);
  const taxaOtimista = Math.max(0.05, (taxaMensal + choque) * 12 * 100);
  const montantePessimista = simularMensalLocal(aporteMensal, taxaPessimista, meses);
  const montanteOtimista = simularMensalLocal(aporteMensal, taxaOtimista, meses);

  const cenariosSuperandoInflacao = [montantePessimista, montante, montanteOtimista]
    .map((valor) => valor / fatorInflacao)
    .filter((valorReal) => valorReal > totalAportado).length;
  const probabilidadeSuperarInflacao = Math.round((cenariosSuperandoInflacao / 3) * 100);

  resultado.innerHTML = `
    <p><strong>Perfil:</strong> ${perfil.nome} (${perfil.dica})</p>
    <p><strong>Projeção base:</strong> ${formatarMoedaBRL(montante)} em ${meses} meses.</p>
    <p><strong>Faixa provável:</strong> ${formatarMoedaBRL(montantePessimista)} a ${formatarMoedaBRL(montanteOtimista)}.</p>
    <p><strong>Valor real (descontando IPCA):</strong> ${formatarMoedaBRL(montanteReal)}.</p>
    <p><strong>Chance de superar inflação:</strong> ${probabilidadeSuperarInflacao}% nos cenários simulados.</p>
    <p><strong>Desafio:</strong> ${venceuInflacao ? "✅ Você superou a inflação neste cenário." : "⚠️ Cenário abaixo da inflação: tente mais prazo ou maior aporte."}</p>
  `;
}

let temporizadorBuscaIndices = null;

function aplicarFiltroPainelIndicesComAnimacao(termoPesquisa) {
  const grid = document.getElementById("gridIndicesCompletos");
  if (!grid) {
    estadoPainelIndices.filtroTexto = termoPesquisa;
    return;
  }

  if (temporizadorBuscaIndices) {
    clearTimeout(temporizadorBuscaIndices);
  }

  const termoNormalizado = normalizarTextoPesquisa(termoPesquisa);
  const cards = Array.from(grid.querySelectorAll(".indicePainelCard"));

  cards.forEach((card) => {
    const nome = normalizarTextoPesquisa(card.querySelector(".indicePainelNome")?.textContent || "");
    const descricao = normalizarTextoPesquisa(card.querySelector(".indicePainelDescricao")?.textContent || "");
    const deveManter = !termoNormalizado || nome.includes(termoNormalizado) || descricao.includes(termoNormalizado);
    card.classList.toggle("saindo", !deveManter);
  });

  temporizadorBuscaIndices = setTimeout(() => {
    estadoPainelIndices.filtroTexto = termoPesquisa;
    renderizarPainelIndicesCards();
  }, 160);
}

const gridIndicesCompletos = document.getElementById("gridIndicesCompletos");
if (gridIndicesCompletos) {
  gridIndicesCompletos.addEventListener("click", (evento) => {
    const card = evento.target.closest("[data-indice-id]");
    if (!card) return;
    estadoPainelIndices.indiceSelecionadoId = card.getAttribute("data-indice-id");
    renderizarPainelIndicesCards();
  });

  gridIndicesCompletos.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" && evento.key !== " ") return;
    const card = evento.target.closest("[data-indice-id]");
    if (!card) return;
    evento.preventDefault();
    estadoPainelIndices.indiceSelecionadoId = card.getAttribute("data-indice-id");
    renderizarPainelIndicesCards();
  });
}

if (barraPesquisaInput) {
  barraPesquisaInput.addEventListener("input", (evento) => {
    aplicarFiltroPainelIndicesComAnimacao(evento.target.value);
  });
}

const btnMiniGameSimular = document.getElementById("btnMiniGameSimular");
if (btnMiniGameSimular) {
  btnMiniGameSimular.addEventListener("click", executarMiniGameIndice);
}

const seletorNivelExplicacao = document.getElementById("nivelExplicacaoIndice");
if (seletorNivelExplicacao) {
  seletorNivelExplicacao.addEventListener("change", () => {
    renderizarDetalheIndiceSelecionado();
  });
}

const seletorPerfilMiniGame = document.getElementById("miniGamePerfil");
if (seletorPerfilMiniGame) {
  seletorPerfilMiniGame.addEventListener("change", () => {
    executarMiniGameIndice();
  });
}

const inputMiniGameValor = document.getElementById("miniGameValor");
if (inputMiniGameValor) {
  inputMiniGameValor.addEventListener("input", () => {
    executarMiniGameIndice();
  });
}

const inputMiniGameMeses = document.getElementById("miniGameMeses");
if (inputMiniGameMeses) {
  inputMiniGameMeses.addEventListener("input", () => {
    executarMiniGameIndice();
  });
}

async function buscarQuoteAlpha(simbolo) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(simbolo)}&apikey=${API_KEY}`
    );
    const data = await response.json();
    const quote = data?.["Global Quote"];
    const preco = Number.parseFloat(quote?.["05. price"]);
    return Number.isFinite(preco) ? preco : null;
  } catch {
    return null;
  }
}

async function buscarIndiceMercadoComFallback(simbolos = []) {
  for (const simbolo of simbolos) {
    try {
      const quote = await buscarQuoteBrapi(simbolo);
      const valor = Number(quote?.regularMarketPrice);
      if (Number.isFinite(valor)) {
        return valor;
      }
    } catch {
    }
  }

  for (const simbolo of simbolos) {
    const valorAlpha = await buscarQuoteAlpha(simbolo);
    if (Number.isFinite(valorAlpha)) {
      return valorAlpha;
    }
  }

  return null;
}

async function atualizarPainelIndicesCompletos(indicadoresAuvp = {}) {
  cachePainelIndices.selic = estadoIndicadores.selic;
  cachePainelIndices.cdi = estadoIndicadores.cdi;

  const ipca = await buscarIpcaAcumulado12mBCB(4.5);
  cachePainelIndices.ipca = ipca;

  const ibovAtual = Number.isFinite(indicadoresAuvp.ibov)
    ? indicadoresAuvp.ibov
    : await buscarIndiceMercadoComFallback(["^BVSP", "IBOV"]);
  if (Number.isFinite(ibovAtual)) {
    cachePainelIndices.ibov = ibovAtual;
  }

  const ifixAtual = Number.isFinite(indicadoresAuvp.ifix)
    ? indicadoresAuvp.ifix
    : await buscarIndiceMercadoComFallback(["IFIX"]);
  if (Number.isFinite(ifixAtual)) {
    cachePainelIndices.ifix = ifixAtual;
  }

  configuracaoPainelIndices.forEach((item) => {
    if (Number.isFinite(indicadoresAuvp[item.id])) {
      cachePainelIndices[item.id] = indicadoresAuvp[item.id];
    }
  });

  const demaisConfigs = configuracaoPainelIndices.filter((item) => item.simbolos?.length);
  for (const item of demaisConfigs) {
    if (item.id === "ibov" || item.id === "ifix") continue;

    if (Number.isFinite(cachePainelIndices[item.id])) {
      continue;
    }

    const valorMercado = await buscarIndiceMercadoComFallback(item.simbolos);
    if (Number.isFinite(valorMercado)) {
      cachePainelIndices[item.id] = valorMercado;
    }
  }

  renderizarPainelIndicesCards();
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

function parseNumeroTexto(valorTexto) {
  const texto = String(valorTexto || "").trim();
  if (!texto) return NaN;

  const limpo = texto.replace(/[^\d,.-]/g, "");

  if (limpo.includes(",") && limpo.includes(".")) {
    return Number.parseFloat(limpo.replace(/\./g, "").replace(",", "."));
  }

  if (limpo.includes(",")) {
    return Number.parseFloat(limpo.replace(",", "."));
  }

  return Number.parseFloat(limpo);
}

function escaparRegExp(texto) {
  return String(texto || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extrairValorIndiceNoTexto(texto, rotulo) {
  if (!texto || !rotulo) {
    return null;
  }

  const regex = new RegExp(`${escaparRegExp(rotulo)}\\s+([\\d.,]+)\\s*(%|pontos)?`, "i");
  const match = texto.match(regex);
  if (!match?.[1]) {
    return null;
  }

  const valor = parseNumeroTexto(match[1]);
  return Number.isFinite(valor) ? valor : null;
}

function normalizarTextoPesquisa(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function htmlParaTexto(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatarDataBCB(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

async function buscarSerieBCB(codigoSerie, diasJanela = 90) {
  const hoje = new Date();
  const dataInicial = new Date(hoje);
  dataInicial.setDate(dataInicial.getDate() - diasJanela);

  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSerie}/dados?formato=json&dataInicial=${formatarDataBCB(dataInicial)}&dataFinal=${formatarDataBCB(hoje)}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error("Falha ao consultar série BCB");
  }

  const dados = await resposta.json();
  return Array.isArray(dados) ? dados : [];
}

async function buscarTextoPaginaAuvp(caminho) {
  const resposta = await fetch(`${configuracaoApi.auvpBaseUrl}${caminho}`);
  if (!resposta.ok) {
    throw new Error("Falha ao carregar página da AUVP");
  }

  const html = await resposta.text();
  return htmlParaTexto(html);
}

async function buscarIndicadoresAuvp() {
  const resultado = {};

  try {
    const textoIndices = await buscarTextoPaginaAuvp("/indices");
    configuracaoPainelIndices.forEach((indice) => {
      const rotulos = Array.isArray(indice.rotulosAuvp) && indice.rotulosAuvp.length
        ? indice.rotulosAuvp
        : [indice.nome];

      for (const rotulo of rotulos) {
        const valor = extrairValorIndiceNoTexto(textoIndices, rotulo);
        if (Number.isFinite(valor)) {
          resultado[indice.id] = valor;
          break;
        }
      }
    });
  } catch {
  }

  if (!Number.isFinite(resultado.cdi)) {
    try {
      const textoCdi = await buscarTextoPaginaAuvp("/indices/cdi");
      const matchCdi = textoCdi.match(/taxa\s+CDI\s+est[aá]\s+atualmente\s+em\s+([\d.,]+)/i);
      if (matchCdi?.[1]) {
        const valor = parseNumeroTexto(matchCdi[1]);
        if (Number.isFinite(valor)) {
          resultado.cdi = valor;
        }
      }
    } catch {
    }
  }

  if (!Number.isFinite(resultado.ibov)) {
    try {
      const textoIbov = await buscarTextoPaginaAuvp("/indices/IBOV");
      const matchIbov = textoIbov.match(/Ibovespa\s+est[aá]\s+cotado\s+em\s+([\d.,]+)\s+pontos/i);
      if (matchIbov?.[1]) {
        const valor = parseNumeroTexto(matchIbov[1]);
        if (Number.isFinite(valor)) {
          resultado.ibov = valor;
        }
      }
    } catch {
    }
  }

  if (!Number.isFinite(resultado.ifix)) {
    try {
      const textoIfix = await buscarTextoPaginaAuvp("/indices/ifix");
      const matchIfix = textoIfix.match(/IFIX\s+est[aá]\s+cotado\s+em\s+([\d.,]+)\s+pontos/i);
      if (matchIfix?.[1]) {
        const valor = parseNumeroTexto(matchIfix[1]);
        if (Number.isFinite(valor)) {
          resultado.ifix = valor;
        }
      }
    } catch {
    }
  }

  return resultado;
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

const configuracaoMoedasTicker = [
  { id: "dolar", chave: "USDBRL", titulo: "💵 Dólar" },
  { id: "euro", chave: "EURBRL", titulo: "💶 Euro" },
  { id: "libra", chave: "GBPBRL", titulo: "💷 Libra" },
  { id: "iene", chave: "JPYBRL", titulo: "💴 Iene" },
  { id: "yuan", chave: "CNYBRL", titulo: "💴 Yuan" },
  { id: "pesoArgentino", chave: "ARSBRL", titulo: "💱 Peso ARS" },
  { id: "dolarCanadense", chave: "CADBRL", titulo: "💵 Dólar CAD" },
  { id: "bitcoin", chave: "BTCBRL", titulo: "₿ Bitcoin" },
  { id: "ethereum", chave: "ETHBRL", titulo: "Ξ Ethereum" }
];

let tickerLayoutInicialAjustado = false;

async function atualizarMoedasTempoReal() {
  const pares = "USD-BRL,EUR-BRL,GBP-BRL,JPY-BRL,CNY-BRL,ARS-BRL,CAD-BRL,BTC-BRL,ETH-BRL";

  try {
    const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pares}`);
    const data = await response.json();

    configuracaoMoedasTicker.forEach((moeda) => {
      const item = data?.[moeda.chave];
      const valor = Number(item?.bid);
      const variacao = Number(item?.pctChange);

      if (Number.isFinite(valor)) {
        renderIndicadorApi(
          moeda.id,
          moeda.titulo,
          formatarMoedaBRL(valor),
          Number.isFinite(variacao) ? variacao : undefined,
          "https://analitica.auvp.com.br/indices"
        );
      }
    });

    if (!tickerLayoutInicialAjustado && tickerMoedasController?.recalcularLayout) {
      tickerMoedasController.recalcularLayout();
      tickerLayoutInicialAjustado = true;
    }
  } catch {
  }
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

async function buscarTaxaBCB(codigoSerie, fallback, diasJanela = 90) {
  try {
    const dados = await buscarSerieBCB(codigoSerie, diasJanela);
    if (!dados.length) return fallback;
    const ultimo = dados[dados.length - 1];
    const valor = parseFloat(ultimo.valor);
    return Number.isFinite(valor) ? valor : fallback;
  } catch {
    return fallback;
  }
}

function normalizarCdiParaAnual(cdiValor) {
  const numero = Number(cdiValor);
  if (!Number.isFinite(numero)) {
    return cdiValor;
  }

  if (numero > 0 && numero < 1) {
    return (Math.pow(1 + (numero / 100), 252) - 1) * 100;
  }

  return numero;
}

async function buscarIpcaAcumulado12mBCB(fallback = 4.5) {
  try {
    const dados = await buscarSerieBCB(433, 420);
    const ultimos12 = dados
      .slice(-12)
      .map((item) => Number.parseFloat(item.valor))
      .filter(Number.isFinite);

    if (ultimos12.length < 10) {
      return fallback;
    }

    const acumulado = ultimos12.reduce((acc, valorMes) => acc * (1 + valorMes / 100), 1);
    return (acumulado - 1) * 100;
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
  const indicadoresAuvp = await buscarIndicadoresAuvp();

  const [cdiBruto, selic] = await Promise.all([
    buscarTaxaBCB(12, Number.isFinite(indicadoresAuvp.cdi) ? indicadoresAuvp.cdi : 13.25),
    buscarTaxaBCB(432, 13.25)
  ]);

  const cdi = normalizarCdiParaAnual(cdiBruto);

  estadoIndicadores.cdi = cdi;
  estadoIndicadores.selic = selic;
  atualizarTaxasInvestimentos(estadoIndicadores);

  renderIndicadorApi("cdiTicker", "CDI", `${cdi.toFixed(2)}%`, undefined, "https://analitica.auvp.com.br/indices/cdi");
  renderIndicadorApi("selicTicker", "SELIC", `${selic.toFixed(2)}%`, undefined, "https://analitica.auvp.com.br/renda-fixa");

  try {
    const ibov = Number.isFinite(indicadoresAuvp.ibov)
      ? { valor: indicadoresAuvp.ibov, variacao: undefined }
      : await buscarIbovComFallback();

    if (ibov) {
      renderIndicadorApi("ibovTicker", "IBOV", formatarMoedaBRL(ibov.valor), ibov.variacao, "https://analitica.auvp.com.br/indices/IBOV");
    } else {
      renderIndicadorApi("ibovTicker", "IBOV", "R$ --", undefined, "https://analitica.auvp.com.br/indices/IBOV");
    }
  } catch {
    renderIndicadorApi("ibovTicker", "IBOV", "R$ --", undefined, "https://analitica.auvp.com.br/indices/IBOV");
  }

  try {
    const ifixAuvp = Number.isFinite(indicadoresAuvp.ifix)
      ? { regularMarketPrice: indicadoresAuvp.ifix, regularMarketChangePercent: undefined }
      : await buscarQuoteBrapi("IFIX");

    if (ifixAuvp) {
      renderIndicadorApi(
        "ifixTicker",
        "IFIX",
        formatarMoedaBRL(Number(ifixAuvp.regularMarketPrice || 0)),
        Number(ifixAuvp.regularMarketChangePercent),
        "https://analitica.auvp.com.br/indices/ifix"
      );
    } else {
      renderIndicadorApi("ifixTicker", "IFIX", "R$ --", undefined, "https://analitica.auvp.com.br/indices/ifix");
    }
  } catch {
    renderIndicadorApi("ifixTicker", "IFIX", "R$ --", undefined, "https://analitica.auvp.com.br/indices/ifix");
  }

  return indicadoresAuvp;
}

let tickerMoedasController = null;

async function atualizarIndices() {
  await atualizarMoedasTempoReal();
  const indicadoresAuvp = await atualizarIndicadoresApi();
  await atualizarPainelIndicesCompletos(indicadoresAuvp || {});
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
renderizarPainelIndicesCards();

setInterval(() => {
  atualizarPainelIndicesCompletos({ ibov: cachePainelIndices.ibov, ifix: cachePainelIndices.ifix });
}, configuracaoApi.intervaloAtualizacaoPainelIndicesMs);

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
  if (!input) return;
  input.addEventListener('input', function () {
    let value = this.value;
    this.value = formatCurrency(value);
  });
  input.addEventListener('focus', function () {
    if (this.value === 'R$ 0,00') this.value = '';
  });
  input.addEventListener('blur', function () {
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
applyCurrencyMask('reservaDespesaMensal');
applyCurrencyMask('reservaAtual');
applyCurrencyMask('rendaDesejadaMensal');
applyCurrencyMask('aporteInicialJC');
applyCurrencyMask('aporteMensalJC');
applyCurrencyMask('valorImovelAF');
applyCurrencyMask('entradaAF');
applyCurrencyMask('aluguelMensalAF');
applyCurrencyMask('patrimonioInicialPerfil');
applyCurrencyMask('aporteMensalPerfil');
applyCurrencyMask('patrimonioRebalanceamento');
applyCurrencyMask('precoVistaCVP');
applyCurrencyMask('valorParcelaCVP');
applyCurrencyMask('gastoMensalCartao');
applyCurrencyMask('anuidadeCartao');

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

document.getElementById("calcularMilhao").addEventListener("click", () => {

  const valorInicial = unformatCurrency(document.getElementById("valorInicial").value);
  const valorMensal = unformatCurrency(document.getElementById("valorMensal").value);
  const taxaAnual = parseFloat(document.getElementById("taxaJuros").value) / 100;

  // Validação: obrigar valor mensal a ser informado e positivo
  if (isNaN(valorMensal) || valorMensal <= 0) {
    mostrarAlerta('Por favor, insira um valor mensal válido e positivo.');
    return;
  }

  const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;

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

document.getElementById("calcularReserva")?.addEventListener("click", () => {
  const despesaMensal = unformatCurrency(document.getElementById("reservaDespesaMensal").value);
  const meses = Number(document.getElementById("reservaMeses").value);
  const reservaAtual = unformatCurrency(document.getElementById("reservaAtual").value);
  const alvo = despesaMensal * meses;
  const falta = Math.max(alvo - reservaAtual, 0);

  if (!Number.isFinite(despesaMensal) || despesaMensal <= 0 || !Number.isFinite(meses) || meses <= 0) {
    mostrarAlerta("Informe despesa mensal e meses válidos para calcular a reserva.");
    return;
  }

  document.getElementById("resultadoReserva").innerHTML = `
    <p><strong>Reserva ideal:</strong> ${formatarMoedaBRL(alvo)}</p>
    <p><strong>Já acumulado:</strong> ${formatarMoedaBRL(reservaAtual)}</p>
    <p><strong>Falta acumular:</strong> ${formatarMoedaBRL(falta)}</p>
  `;
});

document.getElementById("calcularRendaPassiva")?.addEventListener("click", () => {
  const rendaMensal = unformatCurrency(document.getElementById("rendaDesejadaMensal").value);
  const taxaAnual = Number(document.getElementById("rendimentoAnualCarteira").value) / 100;

  if (!Number.isFinite(rendaMensal) || rendaMensal <= 0 || !Number.isFinite(taxaAnual) || taxaAnual <= 0) {
    mostrarAlerta("Informe uma renda desejada e taxa anual válidas.");
    return;
  }

  const rendaAnual = rendaMensal * 12;
  const patrimonioNecessario = rendaAnual / taxaAnual;

  document.getElementById("resultadoRendaPassiva").innerHTML = `
    <p><strong>Renda anual alvo:</strong> ${formatarMoedaBRL(rendaAnual)}</p>
    <p><strong>Patrimônio estimado:</strong> ${formatarMoedaBRL(patrimonioNecessario)}</p>
  `;
});

document.getElementById("calcularJurosCompostos")?.addEventListener("click", () => {
  const aporteInicial = unformatCurrency(document.getElementById("aporteInicialJC").value);
  const aporteMensal = unformatCurrency(document.getElementById("aporteMensalJC").value);
  const prazoAnos = Number(document.getElementById("prazoAnosJC").value);
  const taxaAnual = Number(document.getElementById("taxaAnualJC").value) / 100;

  if (!Number.isFinite(prazoAnos) || prazoAnos <= 0 || !Number.isFinite(taxaAnual) || taxaAnual <= 0) {
    mostrarAlerta("Informe prazo e taxa anual válidos para simulação.");
    return;
  }

  const meses = prazoAnos * 12;
  const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  let montante = aporteInicial;

  for (let i = 0; i < meses; i++) {
    montante = montante * (1 + taxaMensal) + aporteMensal;
  }

  const totalAportado = aporteInicial + (aporteMensal * meses);
  const juros = montante - totalAportado;

  document.getElementById("resultadoJurosCompostos").innerHTML = `
    <p><strong>Total aportado:</strong> ${formatarMoedaBRL(totalAportado)}</p>
    <p><strong>Juros acumulados:</strong> ${formatarMoedaBRL(juros)}</p>
    <p><strong>Montante final:</strong> ${formatarMoedaBRL(montante)}</p>
  `;
});

document.getElementById("calcularAluguelFinanciamento")?.addEventListener("click", () => {
  const valorImovel = unformatCurrency(document.getElementById("valorImovelAF").value);
  const entrada = unformatCurrency(document.getElementById("entradaAF").value);
  const prazoAnos = Number(document.getElementById("prazoAnosAF").value);
  const taxaFinAnual = Number(document.getElementById("taxaFinanciamentoAF").value) / 100;
  const aluguelMensalInicial = unformatCurrency(document.getElementById("aluguelMensalAF").value);
  const inflacaoAluguel = Number(document.getElementById("inflacaoAluguelAF").value) / 100;
  const valorizacaoImovel = Number(document.getElementById("valorizacaoImovelAF").value) / 100;

  if (!Number.isFinite(valorImovel) || valorImovel <= 0 || !Number.isFinite(entrada) || entrada < 0 || entrada >= valorImovel || !Number.isFinite(prazoAnos) || prazoAnos <= 0 || !Number.isFinite(taxaFinAnual) || taxaFinAnual <= 0 || !Number.isFinite(aluguelMensalInicial) || aluguelMensalInicial <= 0) {
    mostrarAlerta("Preencha os dados de aluguel e financiamento com valores válidos.");
    return;
  }

  const principal = valorImovel - entrada;
  const meses = prazoAnos * 12;
  const taxaMensalFin = Math.pow(1 + taxaFinAnual, 1 / 12) - 1;
  const parcela = principal * (taxaMensalFin / (1 - Math.pow(1 + taxaMensalFin, -meses)));
  const totalFinanciamento = entrada + (parcela * meses);

  let aluguelAno = aluguelMensalInicial;
  let totalAluguel = 0;
  for (let ano = 1; ano <= prazoAnos; ano++) {
    totalAluguel += aluguelAno * 12;
    aluguelAno *= (1 + inflacaoAluguel);
  }

  const valorFuturoImovel = valorImovel * Math.pow(1 + valorizacaoImovel, prazoAnos);
  const custoLiquidoFin = totalFinanciamento - valorFuturoImovel;
  const diferenca = totalAluguel - custoLiquidoFin;
  const vencedor = diferenca > 0 ? "Financiamento" : "Aluguel";

  document.getElementById("resultadoAluguelFinanciamento").innerHTML = `
    <p><strong>Parcela estimada:</strong> ${formatarMoedaBRL(parcela)}</p>
    <p><strong>Total no aluguel:</strong> ${formatarMoedaBRL(totalAluguel)}</p>
    <p><strong>Custo líquido do financiamento:</strong> ${formatarMoedaBRL(custoLiquidoFin)}</p>
    <p><strong>Valor futuro do imóvel:</strong> ${formatarMoedaBRL(valorFuturoImovel)}</p>
    <p><strong>Cenário mais vantajoso:</strong> ${vencedor}</p>
  `;
});

document.getElementById("calcularPerfilCarteira")?.addEventListener("click", () => {
  const perfil = document.getElementById("perfilCarteira").value;
  const patrimonioInicial = unformatCurrency(document.getElementById("patrimonioInicialPerfil").value);
  const aporteMensal = unformatCurrency(document.getElementById("aporteMensalPerfil").value);
  const prazoAnos = Number(document.getElementById("prazoAnosPerfil").value);
  const retornoAnual = Number(document.getElementById("retornoAnualPerfil").value) / 100;

  if (!Number.isFinite(prazoAnos) || prazoAnos <= 0 || !Number.isFinite(retornoAnual) || retornoAnual <= 0) {
    mostrarAlerta("Informe prazo e retorno anual válidos para o perfil da carteira.");
    return;
  }

  const perfis = {
    conservador: { nome: "Conservador", alocacao: { "Renda Fixa": 70, "FIIs": 15, "Ações": 10, "Exterior": 5 } },
    moderado: { nome: "Moderado", alocacao: { "Renda Fixa": 45, "FIIs": 20, "Ações": 25, "Exterior": 10 } },
    arrojado: { nome: "Arrojado", alocacao: { "Renda Fixa": 20, "FIIs": 15, "Ações": 45, "Exterior": 20 } }
  };

  const meses = prazoAnos * 12;
  const taxaMensal = Math.pow(1 + retornoAnual, 1 / 12) - 1;
  let montante = patrimonioInicial;

  for (let i = 0; i < meses; i++) {
    montante = montante * (1 + taxaMensal) + aporteMensal;
  }

  const alocacao = perfis[perfil]?.alocacao || perfis.moderado.alocacao;
  const linhasAlocacao = Object.entries(alocacao)
    .map(([classe, percentual]) => `<p>${classe}: ${percentual}% (${formatarMoedaBRL(montante * (percentual / 100))})</p>`)
    .join("");

  document.getElementById("resultadoPerfilCarteira").innerHTML = `
    <p><strong>Perfil selecionado:</strong> ${perfis[perfil]?.nome || "Moderado"}</p>
    <p><strong>Montante projetado:</strong> ${formatarMoedaBRL(montante)}</p>
    ${linhasAlocacao}
  `;
});

document.getElementById("calcularRebalanceamento")?.addEventListener("click", () => {
  const patrimonio = unformatCurrency(document.getElementById("patrimonioRebalanceamento").value);

  const atuais = {
    "Renda Fixa": Number(document.getElementById("atualRF").value),
    "FIIs": Number(document.getElementById("atualFIIs").value),
    "Ações": Number(document.getElementById("atualAcoes").value),
    "Exterior": Number(document.getElementById("atualExterior").value)
  };

  const alvos = {
    "Renda Fixa": Number(document.getElementById("alvoRF").value),
    "FIIs": Number(document.getElementById("alvoFIIs").value),
    "Ações": Number(document.getElementById("alvoAcoes").value),
    "Exterior": Number(document.getElementById("alvoExterior").value)
  };

  const somaAtuais = Object.values(atuais).reduce((acc, valor) => acc + valor, 0);
  const somaAlvos = Object.values(alvos).reduce((acc, valor) => acc + valor, 0);

  if (!Number.isFinite(patrimonio) || patrimonio <= 0 || Math.abs(somaAtuais - 100) > 0.5 || Math.abs(somaAlvos - 100) > 0.5) {
    mostrarAlerta("Patrimônio inválido ou percentuais fora de 100% (atual/alvo).");
    return;
  }

  const ajustes = Object.keys(atuais).map((classe) => {
    const valorAtual = patrimonio * (atuais[classe] / 100);
    const valorAlvo = patrimonio * (alvos[classe] / 100);
    const ajuste = valorAlvo - valorAtual;
    const acao = ajuste > 0 ? "Comprar" : "Vender";
    return `<p>${acao} ${classe}: ${formatarMoedaBRL(Math.abs(ajuste))}</p>`;
  }).join("");

  document.getElementById("resultadoRebalanceamento").innerHTML = `
    <p><strong>Patrimônio:</strong> ${formatarMoedaBRL(patrimonio)}</p>
    ${ajustes}
  `;
});

document.getElementById("calcularVistaParcelado")?.addEventListener("click", () => {
  const precoVista = unformatCurrency(document.getElementById("precoVistaCVP").value);
  const qtdParcelas = Number(document.getElementById("qtdParcelasCVP").value);
  const valorParcela = unformatCurrency(document.getElementById("valorParcelaCVP").value);
  const rendimentoAnual = Number(document.getElementById("rendimentoCapitalCVP").value) / 100;

  if (!Number.isFinite(precoVista) || precoVista <= 0 || !Number.isFinite(qtdParcelas) || qtdParcelas <= 0 || !Number.isFinite(valorParcela) || valorParcela <= 0 || !Number.isFinite(rendimentoAnual) || rendimentoAnual < 0) {
    mostrarAlerta("Preencha os dados de compra com valores válidos.");
    return;
  }

  const taxaMensal = Math.pow(1 + rendimentoAnual, 1 / 12) - 1;
  let valorPresenteParcelado = 0;
  let saldoInvestido = precoVista;

  for (let parcela = 1; parcela <= qtdParcelas; parcela++) {
    valorPresenteParcelado += valorParcela / Math.pow(1 + taxaMensal, parcela);
    saldoInvestido = saldoInvestido * (1 + taxaMensal) - valorParcela;
  }

  const economiaPresente = precoVista - valorPresenteParcelado;
  const vencedor = economiaPresente >= 0 ? "Parcelado" : "À vista";

  document.getElementById("resultadoVistaParcelado").innerHTML = `
    <p><strong>Valor presente do parcelado:</strong> ${formatarMoedaBRL(valorPresenteParcelado)}</p>
    <p><strong>Saldo do capital ao final:</strong> ${formatarMoedaBRL(Math.max(saldoInvestido, 0))}</p>
    <p><strong>Diferença econômica:</strong> ${formatarMoedaBRL(Math.abs(economiaPresente))}</p>
    <p><strong>Melhor opção estimada:</strong> ${vencedor}</p>
  `;
});

document.getElementById("calcularCustosCartao")?.addEventListener("click", () => {
  const gastoMensal = unformatCurrency(document.getElementById("gastoMensalCartao").value);
  const cashbackPercentual = Number(document.getElementById("cashbackCartao").value) / 100;
  const anuidadeAnual = unformatCurrency(document.getElementById("anuidadeCartao").value);
  const percentualRotativo = Number(document.getElementById("percentualRotativoCartao").value) / 100;
  const jurosRotativoMensal = Number(document.getElementById("jurosRotativoCartao").value) / 100;

  if (!Number.isFinite(gastoMensal) || gastoMensal <= 0 || !Number.isFinite(cashbackPercentual) || cashbackPercentual < 0 || !Number.isFinite(anuidadeAnual) || anuidadeAnual < 0 || !Number.isFinite(percentualRotativo) || percentualRotativo < 0 || !Number.isFinite(jurosRotativoMensal) || jurosRotativoMensal < 0) {
    mostrarAlerta("Preencha os dados do cartão com valores válidos.");
    return;
  }

  const gastoAnual = gastoMensal * 12;
  const cashbackAnual = gastoAnual * cashbackPercentual;
  const baseRotativoMensal = gastoMensal * percentualRotativo;
  const custoRotativoAnual = baseRotativoMensal * (Math.pow(1 + jurosRotativoMensal, 12) - 1);
  const custoLiquidoAnual = anuidadeAnual + custoRotativoAnual - cashbackAnual;
  const cashbackEfetivo = ((cashbackAnual - anuidadeAnual - custoRotativoAnual) / gastoAnual) * 100;

  document.getElementById("resultadoCustosCartao").innerHTML = `
    <p><strong>Cashback anual:</strong> ${formatarMoedaBRL(cashbackAnual)}</p>
    <p><strong>Custo anual (anuidade + rotativo):</strong> ${formatarMoedaBRL(anuidadeAnual + custoRotativoAnual)}</p>
    <p><strong>Custo líquido anual:</strong> ${formatarMoedaBRL(custoLiquidoAnual)}</p>
    <p><strong>Cashback efetivo:</strong> ${cashbackEfetivo.toFixed(2)}%</p>
  `;
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
          borderDash: [5, 5],
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
            callback: function (value) {
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
      { selector: "#valorInicial", text: "Comece informando o valor inicial que você já possui." },
      { selector: "#valorMensal", text: "Aqui coloque o quanto irá investir todo mês (geralmente suas sobras)." },
      { selector: "#taxaJuros", text: "Informe a taxa de juros anual estimada (p.ex. 8%)." },
      { selector: "#resultadoMilhao", text: "O resultado aparecerá aqui com tempo para atingir 1 milhão." }
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
  const menuInicio = document.getElementById("menuInicio");
  const menuSimulacoes = document.getElementById("menuSimulacoes");
  const menuCalculadoras = document.getElementById("menuCalculadoras");
  const hubSimulacoes = document.getElementById("hubSimulacoes");
  const btnVoltarPainel = document.getElementById("btnVoltarPainel");
  const btnAjudaInvestimentos = document.getElementById("btnAjudaInvestimentos");
  const painelAjudaInvestimentos = document.getElementById("painelAjudaInvestimentos");
  const btnFecharAjudaInvestimentos = document.getElementById("btnFecharAjudaInvestimentos");
  const OFFSET_MINIMO_TOPO = 160;

  const ativarModoSimulacoes = () => {
    document.body.classList.add("simulacoes-only");
    if (hubSimulacoes) {
      hubSimulacoes.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const desativarModoSimulacoes = () => {
    document.body.classList.remove("simulacoes-only");
  };

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
        { selector: "#valorInvestimento", text: "Digite ou verifique o valor mensal disponível para investir." },
        { selector: "#mesesInvestimento", text: "Selecione por quantos meses você planeja investir." },
        { selector: "#resultadoInvestimentos", text: "Veja aqui o ranking dos investimentos e o lucro estimado." },
        { selector: ".ladoGrafico", text: "O gráfico mostra o crescimento mês a mês do melhor investimento." }
      ];
      startTour(stepsComparacao, perguntaMilhao);
    });
  }

  if (menuSimulacoes) {
    menuSimulacoes.addEventListener("click", (evento) => {
      evento.preventDefault();
      ativarModoSimulacoes();
    });
  }

  if (menuCalculadoras) {
    menuCalculadoras.addEventListener("click", (evento) => {
      evento.preventDefault();
      ativarModoSimulacoes();
    });
  }

  if (menuInicio) {
    menuInicio.addEventListener("click", () => {
      desativarModoSimulacoes();
    });
  }

  if (btnVoltarPainel) {
    btnVoltarPainel.addEventListener("click", () => {
      desativarModoSimulacoes();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (btnAjudaInvestimentos && painelAjudaInvestimentos) {
    btnAjudaInvestimentos.addEventListener("click", () => {
      const aberto = painelAjudaInvestimentos.classList.toggle("ativo");
      painelAjudaInvestimentos.setAttribute("aria-hidden", aberto ? "false" : "true");
    });
  }

  if (btnFecharAjudaInvestimentos && painelAjudaInvestimentos) {
    btnFecharAjudaInvestimentos.addEventListener("click", () => {
      painelAjudaInvestimentos.classList.remove("ativo");
      painelAjudaInvestimentos.setAttribute("aria-hidden", "true");
    });
  }

  if (painelAjudaInvestimentos) {
    const botoesQuadrantes = painelAjudaInvestimentos.querySelectorAll(".ajudaTitulo");
    botoesQuadrantes.forEach((botao) => {
      botao.addEventListener("click", () => {
        const quadrante = botao.closest(".ajudaQuadrante");
        if (!quadrante) return;
        quadrante.classList.toggle("ativo");
      });
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

function inicializarCursorFallback() {
  if (document.body.querySelector(".cursorDot")) {
    return;
  }

  document.body.classList.add("sei-neon-cursor");

  const pontoPrincipal = document.createElement("div");
  pontoPrincipal.className = "cursorDot";
  document.body.appendChild(pontoPrincipal);

  const trilhas = [];
  const quantidadeTrilhas = 8;

  for (let indice = 0; indice < quantidadeTrilhas; indice++) {
    const trilha = document.createElement("div");
    trilha.className = "cursorTrail";
    trilha.style.opacity = String(0.34 - indice * 0.03);
    document.body.appendChild(trilha);
    trilhas.push({ elemento: trilha, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }

  let alvoX = window.innerWidth / 2;
  let alvoY = window.innerHeight / 2;

  window.addEventListener("mousemove", (evento) => {
    alvoX = evento.clientX;
    alvoY = evento.clientY;
  });

  function animarCursorFallback() {
    trilhas.forEach((item, indice) => {
      const referencia = indice === 0 ? { x: alvoX, y: alvoY } : trilhas[indice - 1];
      item.x += (referencia.x - item.x) * 0.22;
      item.y += (referencia.y - item.y) * 0.22;

      item.elemento.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${1 - indice * 0.06})`;
    });

    pontoPrincipal.style.transform = `translate3d(${alvoX}px, ${alvoY}px, 0)`;
    requestAnimationFrame(animarCursorFallback);
  }

  requestAnimationFrame(animarCursorFallback);
}

function inicializarCursorNeon() {
  const dispositivoSemMouse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (dispositivoSemMouse || reduzirMovimento) {
    return;
  }

  inicializarCursorFallback();
}

inicializarCursorNeon();

function atualizarSimulacaoInvestimentos() {
  const valorInvestimento = unformatCurrency(document.getElementById("valorInvestimento").value);
  const mesesInvestimento = Number(document.getElementById("mesesInvestimento").value);
}
