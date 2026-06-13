# 🚀 ETEC-SEI: Guia de Implementação

## ✅ FASE 1: COMPLETA - Integração Claude + Cronograma

### Arquivos Criados:

1. **`js/claude-investment-advisor.js`** - Módulo de IA
   - Filtra apenas perguntas sobre investimento
   - Integração com Claude API
   - Fallback inteligente

2. **`js/learning-schedule.js`** - Sistema de cronograma
   - 12 semanas de aprendizado estruturado
   - XP e níveis de usuário
   - Tracking de atividades completas

3. **`pages/tools.html`** - Página de calculadoras
   - 9 ferramentas financeiras movidas de main.html
   - Interface pronta para lógica

### Modificações em Arquivos Existentes:

1. **`js/server.js`**
   - ✅ Adicionado import do módulo Claude
   - ✅ Novo endpoint `POST /api/ask-tutor`
   - ✅ Nova rota `GET /tools`

2. **`js/tutor.js`**
   - ✅ Expandido para chamar `/api/ask-tutor`
   - ✅ Novo estado de carregamento
   - ✅ Integração com dados de mercado

---

## 📋 PRÓXIMAS ETAPAS (Fácil Implementação)

### 1️⃣ Configurar Claude API (5 minutos)

```bash
# 1. Criar arquivo .env na raiz do projeto
cp .env.example .env

# 2. Obter chave em https://console.anthropic.com
# Adicionar em .env:
CLAUDE_API_KEY=sk-ant-...

# 3. Reiniciar servidor
npm start
```

### 2️⃣ Criar arquivo `js/tools.js` (Copiar funções de main.html)

Copiar as seguintes funções de `js/app.js` para um novo arquivo `js/tools.js`:
- `formatCurrency()` / `unformatCurrency()`
- Funções de cálculo de cada ferramenta
- Event listeners dos botões

**Template básico:**
```javascript
// Copie as funções utilitárias de app.js
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Adicione event listeners para cada calculadora
document.getElementById('calcularReserva')?.addEventListener('click', () => {
  const despesa = unformatCurrency(document.getElementById('reservaDespesaMensal').value);
  const meses = parseInt(document.getElementById('reservaMeses').value);
  const valor = despesa * meses;
  document.getElementById('resultadoReserva').innerHTML = `Reserva necessária: ${formatCurrency(valor)}`;
});

// ... repetir para outras calculadoras
```

### 3️⃣ Adicionar Cronograma ao Dashboard

Editar `pages/dashboard.html` para mostrar cronograma:

```html
<!-- Adicionar após o seu header existente -->
<section class="card cronograma-section">
  <h2>📅 Seu Cronograma de Aprendizado</h2>
  <div id="cronogramaDisplay">
    <!-- Será preenchido por schedule-display.js -->
  </div>
</section>

<!-- Adicionar antes do fechamento de </body> -->
<script type="module" src="../js/schedule-display.js"></script>
```

Criar `js/schedule-display.js`:
```javascript
import { getScheduleSummary, getRecommendedActivities } from './learning-schedule.js';

const cronogramaDiv = document.getElementById('cronogramaDisplay');
if (cronogramaDiv) {
  const summary = getScheduleSummary();
  if (summary) {
    cronogramaDiv.innerHTML = `
      <div class="schedule-card">
        <h3>Semana ${summary.semanaAtual}/12: ${summary.tituloSemana}</h3>
        <p>Tema: ${summary.temaSemana}</p>
        <p>XP: ${summary.totalXP} | Nível: ${summary.nivelUsuario}</p>
        <div class="progress-bar">
          <div style="width: ${summary.progressoGeral}%"></div>
        </div>
      </div>
    `;
  }
}
```

### 4️⃣ Reorganizar Main.html

Remover seções que foram para pages/tools.html:
- Remover `<section class="card ferramentasExtras">`
- Manter: Painel de Índices, Hub Simulações, Comparação, Videoaulas

**Novo conteúdo para main.html:**
- Link para /tools para ferramentas
- Link para cronograma no dashboard

### 5️⃣ Testar Tudo

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Testar em browser
# http://localhost:3000/ai-tutor  <- Claude IA
# http://localhost:3000/tools      <- Calculadoras
# http://localhost:3000/dashboard  <- Cronograma (em desenvolvimento)
```

---

## 🔧 TECNOLOGIAS UTILIZADAS

### Frontend
- HTML5 + CSS3 (site.css existente)
- JavaScript ES6 modules
- Fetch API para requisições

### Backend
- Node.js + Express
- Claude API (Anthropic)
- Session management com express-session
- LocalStorage para cronograma

### APIs Externas
- **Claude 3.5 Sonnet** - IA conversacional ($20/mês recomendado)
- **Alpha Vantage** - Dados de mercado (gratuito)
- **AUVP Analytics** - Índices brasileiros
- **BRAPI** - Ações e fundos (gratuito)

---

## 💡 DICAS DE IMPLEMENTAÇÃO

### Para Calculadoras (tools.js):
1. Copie todas as funções de `app.js` que começam com `calcular*`
2. Use o mesmo padrão de `formatCurrency()`
3. Mantenha os mesmos IDs de elementos do HTML
4. Teste cada calculadora individualmente

### Para Claude:
1. Teste o endpoint primeiro com curl:
```bash
curl -X POST http://localhost:3000/api/ask-tutor \
  -H "Content-Type: application/json" \
  -d '{"question":"Como investir em ações?"}'
```

2. Se retornar fallback, significa que CLAUDE_API_KEY não está setada

3. Monitorar tokens: ~150 tokens por pergunta = 3.300+ perguntas/mês com $20

### Para Cronograma:
1. Inicializa automaticamente na primeira vez
2. Dados salvos em localStorage
3. Use `getScheduleSummary()` para exibir em qualquer página
4. Expanda com:
   - Badges/achievements
   - Badges por módulo completo
   - Notificações de progresso

---

## 📊 ESTRUTURA FINAL

```
ETEC-SEI/
├── pages/
│   ├── main.html (reorganizado)
│   ├── dashboard.html (+ cronograma)
│   ├── tutor.html (+ Claude)
│   ├── tools.html (NEW - calculadoras)
│   └── ...
├── js/
│   ├── server.js (+ /api/ask-tutor)
│   ├── tutor.js (expandido)
│   ├── tools.js (NEW - calculadoras)
│   ├── schedule-display.js (NEW)
│   ├── claude-investment-advisor.js (NEW)
│   ├── learning-schedule.js (NEW)
│   └── ...
├── .env (NEW - configuração)
└── ...
```

---

## 🚨 CHECKLIST FINAL

- [ ] Criar `.env` com CLAUDE_API_KEY
- [ ] Testar `/api/ask-tutor` manualmente
- [ ] Testar tutor.html com perguntas
- [ ] Copiar lógica de calculadoras para tools.js
- [ ] Adicionar chronograma ao dashboard
- [ ] Reorganizar main.html
- [ ] Testar login → cronograma → ferramentas
- [ ] Deploy e validar

---

## 🎯 PRÓXIMOS PASSOS AVANÇADOS

1. **Integração com B3 Market Data API**: Dados oficiais da bolsa brasileira
2. **Cache de respostas Claude**: Melhorar performance e economizar tokens
3. **Analytics**: Rastrear uso de ferramentas e perguntas populares
4. **Certificações**: Badges ao completar semanas
5. **Integrações**: Conectar com corretoras (brapi, alpaca, etc)

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Verificar console do navegador (F12)
2. Verificar logs do servidor (`npm start`)
3. Testar com curl direto
4. Validar `.env` está no diretório raiz
