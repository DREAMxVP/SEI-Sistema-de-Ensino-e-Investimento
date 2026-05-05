# SEI — Sistema de Ensino e Investimento

Projeto front-end com foco em educação financeira, layout responsivo e indicadores de mercado atualizados automaticamente.

## Páginas principais

- `index.html` — Landing page com ticker de mercado
- `pages/login.html` — Login
- `pages/register.html` — Cadastro
- `pages/dashboard.html` — Dashboard
- `pages/glossary.html` — Glossário de termos
- `pages/simulator.html` — Simulador de juros compostos
- `pages/tutor.html` — Tutor financeiro interativo
- `pages/lessons.html` — Trilhas e aulas

## Atualização automática de APIs

Os indicadores `CDI`, `SELIC`, `IPCA` e `Ibovespa` são atualizados a cada **30 segundos** por `js/market-data.js`.

### Fontes usadas

- Banco Central (BCB):
  - CDI: série `12`
  - SELIC: série `11`
  - IPCA: série `433`
- Brapi:
  - Ibovespa: `^BVSP`

### Estratégia de contingência

Se alguma API externa falhar (rede/proxy/CORS), o sistema:

1. Usa o último valor salvo em `localStorage`.
2. Se não houver cache, usa valor padrão seguro.
3. Exibe no rodapé do ticker que está em modo contingência.

## Execução local

Abra `index.html` com seu servidor local (ex.: Five Server no VS Code).
