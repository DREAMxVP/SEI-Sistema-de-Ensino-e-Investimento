# 📚 Guia Interativo de Investimentos

## Visão Geral

O Guia Interativo é uma ferramenta educacional completa projetada para ensinar os princípios fundamentais de investimento em português, com abordagem prática e progressiva.

## Estrutura dos 3 Níveis

### 🟢 Nível 1: Iniciante - Fundamentos de Investimento

**Objetivo:** Construir uma base sólida com organização financeira, objetivos claros e primeiros passos seguros.

#### Aulas:
1. **Reserva de emergência** (40 XP)
   - O primeiro passo para investir com segurança
   - Meta: 6 a 12 meses de despesas em ativos de liquidez diária
   - Exemplo: R$ 2.500 mensais → R$ 15.000 a R$ 30.000
   - Vídeo recomendado: Me Poupe! - "Reserva de Emergência"

2. **Objetivos financeiros** (40 XP)
   - Defina metas para escolher melhor seus investimentos
   - Separar por prazo: curto, médio, longo
   - Exemplo: Curto (reserva) | Médio (viagem) | Longo (aposentadoria)
   - Vídeo recomendado: Primo Rico - "Objetivos Financeiros"

3. **Primeiros aportes com consistência** (45 XP)
   - Disciplina supera timing de mercado
   - Automatize aportes mensais
   - Exemplo: R$ 300/mês × 24 meses criam hábito
   - Vídeo recomendado: Me Poupe! - "Aportando regularmente"

---

### 🟠 Nível 2: Intermediário - Renda Fixa e Inflação

**Objetivo:** Compare produtos pós-fixados e entenda retorno real acima da inflação.

#### Aulas:
1. **CDI, SELIC e Tesouro Selic** (50 XP)
   - O trio base da renda fixa
   - SELIC = Taxa básica da economia
   - CDI = Referencia para produtos bancários
   - Tesouro = Acompanha com risco soberano
   - Exemplo: SELIC alta → Pós-fixados melhor no curto/médio
   - Vídeo recomendado: Primo Rico - "Taxa SELIC explicada"

2. **CDB, LCI e LCA na prática** (50 XP)
   - Compare rentabilidade líquida e prazo
   - Avalie: percentual do CDI, liquidez, tributação
   - Exemplo: CDB 110% CDI pode superar LCI menor
   - Vídeo recomendado: Me Poupe! - "CDB vs Tesouro Direto"

3. **Inflação e IPCA** (50 XP)
   - Proteja seu patrimônio da inflação
   - Escolha investimentos que ganhem acima da inflação
   - Exemplo: Inflação 10% a.a. → investimento com 8% perde poder de compra
   - Vídeo recomendado: Primo Rico - "IPCA e Inflação"

---

### 🔴 Nível 3: Avançado - Ações, Fundos e Estratégias

**Objetivo:** Domine análise de ativos, construa carteiras diversificadas e aplique estratégias para longo prazo.

#### Aulas:
1. **Análise fundamental de ações** (60 XP)
   - Estude balanços, índices e fundamentos
   - Diferencie empresas de qualidade
   - ⚠️ P/L baixo não garante qualidade
   - Analise também: ROE, endividamento, crescimento
   - Vídeo recomendado: Primo Rico - "Análise Fundamental"

2. **Carteira por perfil de risco** (60 XP)
   - Construa alocação alinhada com seu perfil
   - Diversifique entre renda fixa, ações, FIIs, exterior
   - Exemplo perfil moderado:
     - 45% Renda fixa
     - 25% Ações
     - 20% FIIs
     - 10% Exterior
   - Vídeo recomendado: Me Poupe! - "Montando sua carteira"

3. **Rebalanceamento e decisões** (60 XP)
   - Mantenha sua estratégia
   - Rebalanceie a cada 6 meses ou desvio > 5%
   - Exemplo: Ações subiram muito → Venda e recompre renda fixa
   - Vídeo recomendado: Primo Rico - "Rebalanceamento de carteira"

---

## 📹 Canais YouTube Recomendados

### Me Poupe! (Nathalia Arcuri)
- **Foco:** Educação financeira prática e acessível
- **Tópicos cobertos:**
  - Reserva de emergência
  - Aportando regularmente com disciplina
  - CDB e comparações de renda fixa
  - Montando carteira diversificada

**Por que:** Linguagem clara, foco em pessoas iniciantes, exemplos práticos do dia a dia.

### Primo Rico (Thiago Nigro)
- **Foco:** Investimento com profundidade técnica
- **Tópicos cobertos:**
  - SELIC, CDI e indicadores
  - IPCA e inflação
  - Análise fundamental de ações
  - Rebalanceamento de carteira

**Por que:** Conteúdo técnico mas acessível, análises aprofundadas, estratégias para longo prazo.

---

## 🎯 Recurso de Diário do Investidor

### Como funciona:
1. **Registre sua reflexão** após assistir um vídeo ou completar uma aula
2. **Defina seu nível de compreensão:**
   - ✅ Compreendi bem
   - ⚠️ Compreendi parcialmente
   - ❓ Tenho dúvidas
3. **Salve automaticamente** no localStorage (dados locais do navegador)
4. **Revise suas notas** a qualquer momento

### Por que usar:
- **Consolidação de aprendizado:** Escrever ajuda a fixar conhecimento
- **Acompanhamento:** Veja sua evolução ao longo do curso
- **Identificação de lacunas:** Dúvidas registradas ajudam a revisar

---

## 🎮 Experiência de Usuário

### Aba "Estrutura do Curso"
- **Cards organizados por nível** com descrição completa
- **Botões "Ver vídeo"** para abrir player modal
- **Badge de XP** indicando pontuação por aula

### Aba "Vídeos Recomendados"
- **Grid de vídeos** com thumbnails
- **Informações de canal e duração**
- **Modal player** para assistir inline

### Aba "Meu Diário"
- **Formulário estruturado** com data, tópico, reflexão
- **Seleção de nível de compreensão**
- **Lista de reflexões** com data e nível
- **Botão deletar** para gerenciar entradas antigas

---

## 🔧 Implementação Técnica

### Arquivos criados:
- `pages/interactive-guide.html` - Página principal
- `css/interactive-guide.css` - Estilos (design responsivo)
- `js/interactive-guide.js` - Lógica (tabs, vídeos, diário)

### Funcionalidades:
- ✅ Sistema de abas interativo
- ✅ Modal de vídeo com embed YouTube
- ✅ Formulário de reflexão com validação
- ✅ Persistência de dados com localStorage
- ✅ Exclusão de reflexões com confirmação
- ✅ Responsivo (mobile, tablet, desktop)

### Dependências:
- `learning-state.js` - Autenticação e estado do usuário
- `auth-guard.js` - Proteção de rota (requer login)

---

## 📊 Navegação

O Guia Interativo está acessível em:
- **URL:** `/pages/interactive-guide.html`
- **Menu:** Todas as páginas principais incluem link "Guia Interativo"
- **Acesso:** Requer login (protegido por auth-guard)

---

## 🚀 Próximos Passos Sugeridos

1. **Quiz integrado:** Quiz automático após cada vídeo
2. **Badges e certificados:** Ao completar nível
3. **Estatísticas:** Dashboard de progresso por nível
4. **Exportação de diário:** PDF com todas as reflexões
5. **Comunidade:** Compartilhar reflexões com outros usuários

---

**Criado em:** Dezembro 2024
**Versão:** 1.0
**Status:** Produção

