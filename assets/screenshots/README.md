# Screenshots do portfólio — SEI

Esta pasta guarda as capturas de tela usadas no `README.md` e na landing page para apresentar o projeto visualmente.

## Como capturar e nomear

| Arquivo sugerido | Página a capturar | URL / caminho |
|---|---|---|
| `home.png` | Landing page com ticker | `index.html` |
| `dashboard.png` | Dashboard pessoal | `pages/dashboard.html` |
| `simulator.png` | Simulador de juros | `pages/simulator.html` |
| `glossary.png` | Glossário | `pages/glossary.html` |
| `tutor.png` | Tutor financeiro | `pages/tutor.html` |
| `lessons.png` | Trilhas / Aulas | `pages/lessons.html` |
| `login.png` | Tela de login | `pages/login.html` |

## Passo a passo

1. Abra o projeto localmente com um servidor (ex.: Five Server no VS Code).
2. Navegue até a página desejada.
3. Use a ferramenta de captura do sistema operacional ou a extensão **Full Page Screen Capture** do navegador para capturar a tela inteira.
4. Salve o arquivo com o nome da tabela acima (ex.: `home.png`) nesta pasta.
5. Faça commit e push do arquivo.

## Dicas

- Prefira resolução mínima de **1280 × 800 px** para boa qualidade.
- Use formato **PNG** para capturas com texto nítido.
- Se quiser demonstrar interação (ex.: ticker atualizando), use um **GIF** e nomeie como `home-ticker.gif`.

## Referenciar no README

Após adicionar as imagens, inclua no `README.md`:

```markdown
![Landing page](assets/screenshots/home.png)
![Dashboard](assets/screenshots/dashboard.png)
```
