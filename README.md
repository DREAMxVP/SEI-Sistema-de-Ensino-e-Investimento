# SEI — Sistema de Ensino e Investimento

> **TCC · Etec · Desenvolvimento de Sistemas**

Plataforma web de **educação financeira** que reúne trilhas de aprendizado, indicadores de mercado em tempo real, simulador de juros compostos, glossário interativo e tutor guiado — tudo em front-end puro, sem back-end ou servidor dedicado.

[![GitHub Pages](https://img.shields.io/badge/Demo%20ao%20vivo-GitHub%20Pages-2fd680?style=for-the-badge&logo=github)](https://dreamxvp.github.io/SEI-Sistema-de-Ensino-e-Investimento/)

---

## 🎯 Objetivo do projeto

Tornar a educação financeira acessível para jovens e adultos iniciantes, oferecendo conteúdo estruturado, ferramentas práticas e indicadores atualizados sem exigir cadastro obrigatório para explorar o conteúdo.

---

## ✨ Funcionalidades principais

| Recurso | Descrição |
|---|---|
| 📈 Ticker de mercado | CDI, SELIC, IPCA e Ibovespa atualizados a cada 30 s |
| 🔐 Login / Cadastro | Autenticação local via `localStorage` (sem back-end) |
| 📊 Dashboard | Painel pessoal com progresso e métricas |
| 📖 Glossário | Termos de investimento com exemplos claros |
| 🧮 Simulador | Juros compostos com visualização de cenários |
| 🤖 Tutor | Orientação interativa por perguntas guiadas |
| 🎓 Aulas / Trilhas | Módulos do básico ao avançado |

---

## 🚀 Demo

**Acesse agora:** [https://dreamxvp.github.io/SEI-Sistema-de-Ensino-e-Investimento/](https://dreamxvp.github.io/SEI-Sistema-de-Ensino-e-Investimento/)

> Nenhuma instalação necessária. Basta abrir o link no navegador.

---

## 🛠 Tecnologias

- **HTML5** — estrutura semântica
- **CSS3** — layout responsivo com Grid e variáveis CSS (sem framework)
- **JavaScript (ES Modules)** — lógica de indicadores, simulador, tutor e autenticação

---

## 🔗 Fontes e APIs

Os indicadores são obtidos diretamente de fontes oficiais:

| Indicador | Fonte | Identificador |
|---|---|---|
| CDI | Banco Central (BCB) | série `12` |
| SELIC | Banco Central (BCB) | série `11` |
| IPCA | Banco Central (BCB) | série `433` |
| Ibovespa | Brapi | `^BVSP` |

### Estratégia de contingência

Se alguma API externa falhar (rede/proxy/CORS), o sistema:

1. Usa o último valor salvo em `localStorage`.
2. Se não houver cache, usa valor padrão seguro.
3. Exibe no rodapé do ticker que está em modo contingência.

---

## 📸 Screenshots

> Veja [`assets/screenshots/README.md`](assets/screenshots/README.md) para instruções de como capturar e adicionar imagens ao portfólio.

---

## 📁 Estrutura do projeto

```
SEI-Sistema-de-Ensino-e-Investimento/
├── index.html              # Landing page com ticker
├── pages/
│   ├── login.html          # Login
│   ├── register.html       # Cadastro
│   ├── dashboard.html      # Dashboard pessoal
│   ├── glossary.html       # Glossário de termos
│   ├── simulator.html      # Simulador de juros compostos
│   ├── tutor.html          # Tutor financeiro interativo
│   └── lessons.html        # Trilhas e aulas
├── css/
│   └── site.css            # Estilos globais (tema escuro, responsivo)
├── js/
│   ├── market-data.js      # Busca e cache de indicadores financeiros
│   ├── home.js             # Script da landing page
│   └── ...                 # Scripts de cada página
├── src/
│   └── img/                # Logotipos e ícones
└── assets/
    └── screenshots/        # Capturas de tela para o portfólio
```

---

## ▶️ Como executar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/DREAMxVP/SEI-Sistema-de-Ensino-e-Investimento.git
   ```
2. Abra a pasta no VS Code e inicie o **Live Server** (Five Server ou equivalente).
3. Acesse `http://localhost:5500` (ou a porta indicada pelo servidor).

> **Nota:** o projeto usa ES Modules (`type="module"`), por isso é necessário um servidor local — não funciona abrindo o arquivo diretamente no navegador (`file://`).

### Login local (exemplo)

- O projeto usa autenticação **100% local** no navegador com `localStorage`.
- Ao criar conta ou entrar, a sessão fica salva em `sei-active-user`.
- Quando a pessoa volta ao site no mesmo navegador, continua logada automaticamente.
- Cada conta salva um `investorProfile` próprio (perfil de investidor básico).

---

## 🗺 Próximos passos

- [ ] Adicionar screenshots reais em `assets/screenshots/`
- [ ] Melhorar acessibilidade (ARIA, contraste)
- [ ] Expandir conteúdo das trilhas de aula
- [ ] Adicionar modo claro

---

## 👤 Autor

Desenvolvido como Trabalho de Conclusão de Curso (TCC) na **Etec** — Curso de Desenvolvimento de Sistemas.

- Repositório: [github.com/DREAMxVP/SEI-Sistema-de-Ensino-e-Investimento](https://github.com/DREAMxVP/SEI-Sistema-de-Ensino-e-Investimento)
- Demo: [dreamxvp.github.io/SEI-Sistema-de-Ensino-e-Investimento](https://dreamxvp.github.io/SEI-Sistema-de-Ensino-e-Investimento/)
