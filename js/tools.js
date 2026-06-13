/**
 * Tools - Calculadoras Financeiras
 * 
 * Lógica para todas as ferramentas da página tools.html
 */

// Utilitários de formatação
function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function unformatCurrency(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ===== CALCULADORA: Reserva de Emergência =====
document.getElementById('calcularReserva')?.addEventListener('click', () => {
  const despesa = unformatCurrency(document.getElementById('reservaDespesaMensal').value);
  const meses = parseInt(document.getElementById('reservaMeses').value) || 6;
  const atual = unformatCurrency(document.getElementById('reservaAtual').value);

  if (!despesa || despesa <= 0) {
    alert('Digite uma despesa mensal válida');
    return;
  }

  const necessaria = despesa * meses;
  const faltando = Math.max(0, necessaria - atual);

  const resultado = document.getElementById('resultadoReserva');
  resultado.innerHTML = `
    <div class="resultado-item">
      <strong>Reserva Necessária:</strong> ${formatCurrency(necessaria)}
      <p style="font-size: 0.9em; color: #666;">para ${meses} meses de proteção</p>
    </div>
    <div class="resultado-item">
      <strong>Valor Já Guardado:</strong> ${formatCurrency(atual)}
    </div>
    <div class="resultado-item" style="background: #e8f5e9; padding: 10px; border-radius: 5px;">
      <strong>Ainda Falta:</strong> ${formatCurrency(faltando)}
      <p style="font-size: 0.9em; color: #2e7d32;">Para completar sua segurança</p>
    </div>
  `;
});

// ===== CALCULADORA: Renda Passiva =====
document.getElementById('calcularRendaPassiva')?.addEventListener('click', () => {
  const rendaDesejada = unformatCurrency(document.getElementById('rendaDesejadaMensal').value);
  const rendimentoAnual = parseFloat(document.getElementById('rendimentoAnualCarteira').value) || 10;

  if (!rendaDesejada || rendaDesejada <= 0) {
    alert('Digite uma renda desejada válida');
    return;
  }

  const rendimentoMensal = rendimentoAnual / 100 / 12;
  const patrimonioNecessario = rendaDesejada / rendimentoMensal;

  const resultado = document.getElementById('resultadoRendaPassiva');
  resultado.innerHTML = `
    <div class="resultado-item">
      <strong>Meta de Renda Passiva:</strong> ${formatCurrency(rendaDesejada)}/mês
    </div>
    <div class="resultado-item">
      <strong>Rendimento Anual:</strong> ${rendimentoAnual.toFixed(2)}%
      <p style="font-size: 0.9em; color: #666;">${(rendimentoMensal * 100).toFixed(2)}% ao mês</p>
    </div>
    <div class="resultado-item" style="background: #e3f2fd; padding: 10px; border-radius: 5px;">
      <strong>Patrimônio Necessário:</strong> ${formatCurrency(patrimonioNecessario)}
      <p style="font-size: 0.9em; color: #1565c0;">Investindo a essa taxa, você gera a renda desejada</p>
    </div>
  `;
});

// ===== CALCULADORA: Juros Compostos =====
document.getElementById('calcularJurosCompostos')?.addEventListener('click', () => {
  const aporteInicial = unformatCurrency(document.getElementById('aporteInicialJC').value);
  const aporteMensal = unformatCurrency(document.getElementById('aporteMensalJC').value);
  const prazoAnos = parseInt(document.getElementById('prazoAnosJC').value) || 10;
  const taxaAnual = parseFloat(document.getElementById('taxaAnualJC').value) || 12;

  const taxaMensal = taxaAnual / 100 / 12;
  const meses = prazoAnos * 12;
  let montante = aporteInicial;
  let totalAportado = aporteInicial;

  for (let i = 0; i < meses; i++) {
    montante = (montante + aporteMensal) * (1 + taxaMensal);
    totalAportado += aporteMensal;
  }

  const lucro = montante - totalAportado;

  const resultado = document.getElementById('resultadoJurosCompostos');
  resultado.innerHTML = `
    <div class="resultado-item">
      <strong>Aporte Total Investido:</strong> ${formatCurrency(totalAportado)}
    </div>
    <div class="resultado-item">
      <strong>Montante Final:</strong> ${formatCurrency(montante)}
    </div>
    <div class="resultado-item" style="background: #f3e5f5; padding: 10px; border-radius: 5px;">
      <strong>Lucro com Juros:</strong> ${formatCurrency(lucro)}
      <p style="font-size: 0.9em; color: #7b1fa2;">Rendimento de ${((lucro / totalAportado) * 100).toFixed(1)}% sobre investido</p>
    </div>
  `;
});

// ===== CALCULADORA: Aluguel vs Financiamento =====
document.getElementById('calcularAluguelFinanciamento')?.addEventListener('click', () => {
  const valorImovel = unformatCurrency(document.getElementById('valorImovelAF').value);
  const entrada = unformatCurrency(document.getElementById('entradaAF').value);
  const prazoAnos = parseInt(document.getElementById('prazoAnosAF').value) || 30;
  const taxaFinanciamento = parseFloat(document.getElementById('taxaFinanciamentoAF').value) || 11;
  const aluguelMensal = unformatCurrency(document.getElementById('aluguelMensalAF').value);
  const inflacaoAluguel = parseFloat(document.getElementById('inflacaoAluguelAF').value) || 5;
  const valorizacaoImovel = parseFloat(document.getElementById('valorizacaoImovelAF').value) || 4;

  const meses = prazoAnos * 12;
  const saldoDevedor = valorImovel - entrada;
  const taxaMensalFin = taxaFinanciamento / 100 / 12;
  
  // Calculando prestação fixa (Price)
  const prestacao = saldoDevedor * (taxaMensalFin * Math.pow(1 + taxaMensalFin, meses)) / (Math.pow(1 + taxaMensalFin, meses) - 1);
  
  // Cenário financiamento
  const totalFinanciamento = entrada + (prestacao * meses);
  const imovelFinalFinanc = valorImovel * Math.pow(1 + valorizacaoImovel / 100, prazoAnos);
  const liquidoFinanc = imovelFinalFinanc - totalFinanciamento;

  // Cenário aluguel
  let aluguelAcumulado = 0;
  let aluguelAtual = aluguelMensal;
  for (let i = 0; i < meses; i++) {
    aluguelAcumulado += aluguelAtual;
    if (i % 12 === 11) {
      aluguelAtual *= (1 + inflacaoAluguel / 100);
    }
  }
  const patrimonioLiquidoAluguel = entrada; // Mantém só a entrada, não tem imóvel

  const resultado = document.getElementById('resultadoAluguelFinanciamento');
  resultado.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Cenário</th>
          <th style="padding: 10px; text-align: right;">Custo Total</th>
          <th style="padding: 10px; text-align: right;">Patrimônio Final</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Financiamento</strong></td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(totalFinanciamento)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: green;"><strong>${formatCurrency(liquidoFinanc)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Aluguel</strong></td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(aluguelAcumulado)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;color: red;">-${formatCurrency(aluguelAcumulado)}</td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 5px; font-size: 0.9em;">
      💡 Dica: Compare qual cenário deixa você com mais patrimônio ao final dos ${prazoAnos} anos.
    </p>
  `;
});

// ===== CALCULADORA: Carteira por Perfil =====
document.getElementById('calcularPerfilCarteira')?.addEventListener('click', () => {
  const patrimonioInicial = unformatCurrency(document.getElementById('patrimonioInicialPerfil').value);
  const aporteMensal = unformatCurrency(document.getElementById('aporteMensalPerfil').value);
  const prazoAnos = parseInt(document.getElementById('prazoAnosPerfil').value) || 10;
  const retornoAnual = parseFloat(document.getElementById('retornoAnualPerfil').value) || 12;
  const perfil = document.getElementById('perfilCarteira').value || 'moderado';

  const taxaMensal = retornoAnual / 100 / 12;
  const meses = prazoAnos * 12;
  let montante = patrimonioInicial;
  let totalAportado = patrimonioInicial;

  for (let i = 0; i < meses; i++) {
    montante = (montante + aporteMensal) * (1 + taxaMensal);
    totalAportado += aporteMensal;
  }

  const lucro = montante - totalAportado;

  const perfilInfo = {
    conservador: { descricao: 'Pouco risco, segurança', cor: '#4caf50' },
    moderado: { descricao: 'Equilíbrio risco-retorno', cor: '#2196f3' },
    arrojado: { descricao: 'Alto risco, maior retorno', cor: '#f44336' }
  };

  const resultado = document.getElementById('resultadoPerfilCarteira');
  resultado.innerHTML = `
    <div style="background: ${perfilInfo[perfil].cor}22; padding: 15px; border-radius: 5px; border-left: 4px solid ${perfilInfo[perfil].cor};">
      <p><strong>Perfil:</strong> ${perfil.toUpperCase()} - ${perfilInfo[perfil].descricao}</p>
    </div>
    <div class="resultado-item" style="margin-top: 15px;">
      <strong>Patrimônio Final (${prazoAnos} anos):</strong> ${formatCurrency(montante)}
    </div>
    <div class="resultado-item">
      <strong>Total Investido:</strong> ${formatCurrency(totalAportado)}
    </div>
    <div class="resultado-item" style="background: #f0f4ff; padding: 10px; border-radius: 5px;">
      <strong>Ganho com Retorno:</strong> ${formatCurrency(lucro)}
    </div>
  `;
});

// ===== CALCULADORA: Rebalanceamento =====
document.getElementById('calcularRebalanceamento')?.addEventListener('click', () => {
  const patrimonioTotal = unformatCurrency(document.getElementById('patrimonioRebalanceamento').value);
  
  const atualRF = parseFloat(document.getElementById('atualRF').value) || 0;
  const atualFIIs = parseFloat(document.getElementById('atualFIIs').value) || 0;
  const atualAcoes = parseFloat(document.getElementById('atualAcoes').value) || 0;
  const atualExterior = parseFloat(document.getElementById('atualExterior').value) || 0;

  const alvoRF = parseFloat(document.getElementById('alvoRF').value) || 0;
  const alvoFIIs = parseFloat(document.getElementById('alvoFIIs').value) || 0;
  const alvoAcoes = parseFloat(document.getElementById('alvoAcoes').value) || 0;
  const alvoExterior = parseFloat(document.getElementById('alvoExterior').value) || 0;

  if (!patrimonioTotal || patrimonioTotal <= 0) {
    alert('Digite um patrimônio válido');
    return;
  }

  // Calcula valores atuais e alvos
  const atual = {
    rf: (atualRF / 100) * patrimonioTotal,
    fiis: (atualFIIs / 100) * patrimonioTotal,
    acoes: (atualAcoes / 100) * patrimonioTotal,
    exterior: (atualExterior / 100) * patrimonioTotal
  };

  const alvo = {
    rf: (alvoRF / 100) * patrimonioTotal,
    fiis: (alvoFIIs / 100) * patrimonioTotal,
    acoes: (alvoAcoes / 100) * patrimonioTotal,
    exterior: (alvoExterior / 100) * patrimonioTotal
  };

  const ajuste = {
    rf: alvo.rf - atual.rf,
    fiis: alvo.fiis - atual.fiis,
    acoes: alvo.acoes - atual.acoes,
    exterior: alvo.exterior - atual.exterior
  };

  const resultado = document.getElementById('resultadoRebalanceamento');
  resultado.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Classe</th>
          <th style="padding: 10px; text-align: right;">Atual</th>
          <th style="padding: 10px; text-align: right;">Alvo</th>
          <th style="padding: 10px; text-align: right;">Ajuste</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">RF (Renda Fixa)</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(atual.rf)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(alvo.rf)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: ${ajuste.rf >= 0 ? 'green' : 'red'};"><strong>${formatCurrency(Math.abs(ajuste.rf))}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">FIIs</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(atual.fiis)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(alvo.fiis)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: ${ajuste.fiis >= 0 ? 'green' : 'red'};"><strong>${formatCurrency(Math.abs(ajuste.fiis))}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Ações</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(atual.acoes)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(alvo.acoes)}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd; color: ${ajuste.acoes >= 0 ? 'green' : 'red'};"><strong>${formatCurrency(Math.abs(ajuste.acoes))}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px;">Exterior</td>
          <td style="padding: 10px; text-align: right;">${formatCurrency(atual.exterior)}</td>
          <td style="padding: 10px; text-align: right;">${formatCurrency(alvo.exterior)}</td>
          <td style="padding: 10px; text-align: right; color: ${ajuste.exterior >= 0 ? 'green' : 'red'};"><strong>${formatCurrency(Math.abs(ajuste.exterior))}</strong></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 15px; padding: 10px; background: #fce4ec; border-radius: 5px; font-size: 0.85em;">
      💡 <strong>Verde:</strong> Compre | <strong>Vermelho:</strong> Venda para atingir o alvo
    </p>
  `;
});

// ===== CALCULADORA: Vista x Parcelado =====
document.getElementById('calcularVistaParcelado')?.addEventListener('click', () => {
  const precoVista = unformatCurrency(document.getElementById('precoVistaCVP').value);
  const qtdParcelas = parseInt(document.getElementById('qtdParcelasCVP').value) || 12;
  const valorParcela = unformatCurrency(document.getElementById('valorParcelaCVP').value);
  const rendimentoCapital = parseFloat(document.getElementById('rendimentoCapitalCVP').value) || 12;

  const taxaMensal = rendimentoCapital / 100 / 12;
  const totalParcelado = valorParcela * qtdParcelas;
  
  // Calcula valor presente do parcelado
  let vpParcelado = 0;
  for (let i = 1; i <= qtdParcelas; i++) {
    vpParcelado += valorParcela / Math.pow(1 + taxaMensal, i);
  }

  const diferenca = precoVista - vpParcelado;
  const melhorOpcao = diferenca > 0 ? 'VISTA' : 'PARCELADO';

  const resultado = document.getElementById('resultadoVistaParcelado');
  resultado.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
        <p><strong>À Vista:</strong></p>
        <p style="font-size: 1.2em; color: #2196f3;">${formatCurrency(precoVista)}</p>
      </div>
      <div style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
        <p><strong>Parcelado (${qtdParcelas}x):</strong></p>
        <p style="font-size: 1.1em;">Parcela: ${formatCurrency(valorParcela)}</p>
        <p style="font-size: 0.9em;">Total: ${formatCurrency(totalParcelado)}</p>
      </div>
    </div>
    <div style="margin-top: 15px; padding: 15px; background: ${melhorOpcao === 'VISTA' ? '#c8e6c9' : '#bbdefb'}; border-radius: 5px; border-left: 4px solid ${melhorOpcao === 'VISTA' ? '#4caf50' : '#2196f3'};">
      <p><strong>Melhor Opção:</strong> ${melhorOpcao}</p>
      <p style="font-size: 0.9em;">Economiza ${formatCurrency(Math.abs(diferenca))} ${melhorOpcao === 'VISTA' ? 'comprando' : 'parcelando'}</p>
    </div>
  `;
});

// ===== CALCULADORA: Custos de Cartão =====
document.getElementById('calcularCustosCartao')?.addEventListener('click', () => {
  const gastoMensal = unformatCurrency(document.getElementById('gastoMensalCartao').value);
  const cashback = parseFloat(document.getElementById('cashbackCartao').value) || 0;
  const anuidade = unformatCurrency(document.getElementById('anuidadeCartao').value) || 0;
  const percentualRotativo = parseFloat(document.getElementById('percentualRotativoCartao').value) || 0;
  const jurosRotativo = parseFloat(document.getElementById('jurosRotativoCartao').value) || 0;

  const ganhoAnualCashback = (gastoMensal * 12) * (cashback / 100);
  const custoAnualRotativo = (gastoMensal * (percentualRotativo / 100)) * 12 * (jurosRotativo / 100 / 12);
  const custoBruto = anuidade + custoAnualRotativo;
  const custeLiquido = custoBruto - ganhoAnualCashback;

  const resultado = document.getElementById('resultadoCustosCartao');
  resultado.innerHTML = `
    <div style="background: #fff9c4; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
      <p><strong>Gasto Anual:</strong> ${formatCurrency(gastoMensal * 12)}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px;">Ganho com Cashback (${cashback}%)</td>
          <td style="padding: 10px; text-align: right; color: green;"><strong>+ ${formatCurrency(ganhoAnualCashback)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px;">Anuidade</td>
          <td style="padding: 10px; text-align: right; color: red;">- ${formatCurrency(anuidade)}</td>
        </tr>
        <tr>
          <td style="padding: 10px;">Juros Rotativo</td>
          <td style="padding: 10px; text-align: right; color: red;">- ${formatCurrency(custoAnualRotativo)}</td>
        </tr>
        <tr style="background: #ffe0b2; border-top: 2px solid #ff9800;">
          <td style="padding: 10px;"><strong>Custo Líquido Anual</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(custeLiquido)}</strong></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 15px; padding: 10px; background: #e8eaf6; border-radius: 5px; font-size: 0.9em;">
      💡 Dica: ${custeLiquido < 0 ? 'O cartão é lucrativo! ' : 'Cuidado com custos. '}
      ${percentualRotativo > 0 ? 'Evite deixar saldo em rotativo, é muito caro!' : 'Mantenha assim!'}
    </p>
  `;
});

// ===== CALCULADORA: Primeiro Milhão =====
document.getElementById('calcularMilhao')?.addEventListener('click', () => {
  const valorInicial = unformatCurrency(document.getElementById('valorInicial').value);
  const valorMensal = unformatCurrency(document.getElementById('valorMensal').value);
  const taxaJuros = parseFloat(document.getElementById('taxaJuros').value) || 12;

  if (!valorMensal || valorMensal <= 0) {
    alert('Digite um valor mensal válido');
    return;
  }

  const taxaMensal = taxaJuros / 100 / 12;
  const meta = 1000000;
  let montante = valorInicial;
  let meses = 0;

  while (montante < meta && meses < 1200) { // Limite de 100 anos
    montante = (montante + valorMensal) * (1 + taxaMensal);
    meses++;
  }

  const anos = Math.floor(meses / 12);
  const mesesResto = meses % 12;

  const resultado = document.getElementById('resultadoMilhao');
  resultado.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #fff8e1; border-radius: 5px; margin-bottom: 20px;">
      <h3 style="color: #ff6f00; margin: 0;">🎯 Seu Caminho para R$ 1.000.000</h3>
      <p style="font-size: 1.5em; color: #ff6f00; margin: 10px 0;">
        <strong>${anos} anos e ${mesesResto} meses</strong>
      </p>
      <p style="font-size: 0.9em; color: #666;">
        Investindo ${formatCurrency(valorMensal)}/mês a ${taxaJuros}% ao ano
      </p>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
        <p style="color: #666;">Total Investido:</p>
        <p style="font-size: 1.3em; color: #2e7d32;"><strong>${formatCurrency(valorInicial + (valorMensal * meses))}</strong></p>
      </div>
      <div style="background: #f3e5f5; padding: 15px; border-radius: 5px;">
        <p style="color: #666;">Ganho com Juros:</p>
        <p style="font-size: 1.3em; color: #7b1fa2;"><strong>${formatCurrency(montante - (valorInicial + (valorMensal * meses)))}</strong></p>
      </div>
    </div>
  `;
});

console.log('✅ Tools.js carregado - Todas as calculadoras ativas');
