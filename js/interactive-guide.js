import { getActiveUser } from "./learning-state.js";
let allVideos = [];
const DIARY_STORAGE_KEY = "sei-investor-diary";

// Banco de vídeos recomendados
const RECOMMENDED_VIDEOS = {
    "reserva": {
        title: "A partir de R$20",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/NbEoxqJEwTw",
        duration: "07:20",
        description: "Você aprende por que a reserva é o primeiro passo...",
        topic: "Reserva"
    },

    "mepoupe-aportes": {
        title: "Aportando regularmente: Como criar riqueza com disciplina",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/Zvrd50QFoB8",
        duration: "05:01",
        description: "Descubra por que aportes regulares são mais eficientes que timing de mercado e como automatizar seus investimentos.",
        topic: "Aportes"
    },
    "mepoupe-cdb": {
        title: "CDB vs Tesouro Direto: Qual investimento é melhor?",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/y2sBkIX72-g",
        duration: "12:19",
        description: "Comparamos CDB e Tesouro Direto na prática. Veja como escolher entre renda fixa para potencializar seus ganhos.",
        topic: "Comparação de investimentos"
    },
    "mepoupe-carteira": {
        title: "Montando sua carteira de investimentos do zero",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/ELvRcvmiYXw",
        duration: "15:05",
        description: "Aprenda a construir uma carteira diversificada que funciona para VOCÊ, independentemente do seu perfil de risco.",
        topic: "Carteira"
    },
    "mepoupe-fundos": {
        title: "Fundos Imobiliários: Aprenda a investir em FIIs e ganhar renda passiva",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/vv6-AyVt1Zk",
        duration: "06:03",
        description: "Entenda como funcionam os fundos imobiliários, como escolher os melhores e como gerar renda mensal com pouco dinheiro.",
        topic: "FIIs"
    },
    "mepoupe-acoes": {
        title: "Primeiras Ações: Comece a investir em ações de forma segura",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/JtDrb2BPBf4",
        duration: "11:26",
        description: "Aprenda a escolher suas primeiras ações, como avaliar empresas e construir uma carteira de dividendos.",
        topic: "Ações"
    },
    "primorico-metas": {
        title: "Objetivos Financeiros: Como definir e alcançar suas metas",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/in0XbfQEm2A",
        duration: "17:13",
        description: "Defina objetivos claros (curto, médio e longo prazo) e escolha investimentos alinhados com suas metas reais.",
        topic: "Objetivos"
    },
    "primorico-selic": {
        title: "Taxa SELIC explicada: O que significa e como impacta seus investimentos",
        channel: "Primo Pobre",
        url: "https://www.youtube.com/embed/GgBfeGdGZdM",
        duration: "10:41",
        description: "Entenda de uma vez por todas o que é SELIC, como funciona e por que ela é tão importante para seu patrimônio.",
        topic: "SELIC"
    },
    "primorico-inflacao": {
        title: "IPCA e Inflação: Proteja seu patrimônio",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/GK8XBPqrUlU",
        duration: "09:52",
        description: "A inflação corrói seu dinheiro. Aprenda a escolher investimentos que ganhem acima da inflação e preservem seu poder de compra.",
        topic: "Inflação"
    },
    "primorico-analise": {
        title: "Análise Fundamental: Como avaliar uma ação antes de comprar",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/VPWAN5QPXJw",
        duration: "28:42",
        description: "Aprenda os principais índices (P/L, ROE, Dividend Yield) para identificar boas empresas e construir carteira de ações.",
        topic: "Ações"
    },
    "primorico-rebalanc": {
        title: "Rebalanceamento de carteira: Mantenha sua estratégia funcionando",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/eMDgWLWOX84",
        duration: "24:07",
        description: "Saiba quando e como rebalancear sua carteira para manter o equilíbrio e os ganhos em linha com sua estratégia.",
        topic: "Rebalanceamento"
    },
    "primopobre-comeco": {
        title: "Como começar a investir do zero mesmo sendo pobre",
        channel: "Primo Pobre",
        url: "https://www.youtube.com/embed/Q6x0xnI0uCg",
        duration: "20:20",
        description: "Dicas práticas de como começar a investir com pouco dinheiro, superando a mentalidade limitante de que é impossível.",
        topic: "Iniciantes"
    },
    "primopobre-primeiro": {
        title: "Como fazer seu primeiro investimento",
        channel: "Primo Pobre",
        url: "https://www.youtube.com/embed/48kfX6V40q0",
        duration: "07:15",
        description: "Guia prático e descomplicado para quem quer fazer o primeiro investimento mas não sabe por onde começar.",
        topic: "Primeiros passos"
    },
    "motiva-henrique-100reais": {
        title: "Como investir 100 reais todos os meses",
        channel: "Motiva Henrique",
        url: "https://www.youtube.com/embed/iigCPURA0CU",
        duration: "11:50",
        description: "Aprenda como investir uma quantia pequena todo mês e mesmo assim construir um patrimônio significativo ao longo do tempo.",
        topic: "Aportes pequenos"
    },
    "primopobre-melhor": {
        title: "O melhor investimento para mudar sua pobreza",
        channel: "Primo Pobre",
        url: "https://www.youtube.com/embed/ICUfFiyOAeE",
        duration: "14:19",
        description: "Descubra qual é o investimento mais importante que você pode fazer para sair da pobreza de uma vez por todas.",
        topic: "Mudança de mentalidade"
    },
    "primopobre-como": {
        title: "Como o Primo Pobre investe seu dinheiro",
        channel: "Primo Pobre",
        url: "https://www.youtube.com/embed/IZ3lySZCbms",
        duration: "20:30",
        description: "Veja na prática como Eduardo Feldberg monta sua estratégia de investimento e quais são suas alocações.",
        topic: "Estratégia"
    },
    "cerbasi-educacao": {
        title: "Educação Financeira: Os erros mais comuns na organização das finanças",
        channel: "Gustavo Cerbasi",
        url: "https://www.youtube.com/embed/o7BUfhgZb68",
        duration: "16:45",
        description: "Gustavo Cerbasi mostra os maiores erros que as pessoas cometem na organização financeira e como evitá-los.",
        topic: "Organização financeira"
    },
    "cerbasi-inteligencia": {
        title: "Inteligência Financeira: Como organizar melhor sua vida financeira",
        channel: "Gustavo Cerbasi",
        url: "https://www.youtube.com/embed/hDlOelguXpA",
        duration: "18:00",
        description: "Um dos maiores especialistas em educação financeira do Brasil revela os fundamentos para organizar suas finanças.",
        topic: "Inteligência financeira"
    },
    "cerbasi-podcast": {
        title: "Podcast Gustavo Cerbasi: Educação Financeira Completa",
        channel: "Gustavo Cerbasi",
        url: "https://www.youtube.com/embed/5od2v71ZmKE",
        duration: "45:20",
        description: "Uma conversa aprofundada com Gustavo Cerbasi sobre tudo que você precisa saber sobre educação financeira.",
        topic: "Educação financeira"
    },
    "nath-investir": {
        title: "Como investir ganhando pouco",
        channel: "Nath Finanças",
        url: "https://www.youtube.com/embed/4pEhAVNKhps",
        duration: "13:15",
        description: "Nath quebra o mito de que é preciso ganhar muito para investir. Veja como começar com o que você tem.",
        topic: "Investimento para low income"
    },
    "nath-educacao": {
        title: "Educação Financeira com Nath Finanças",
        channel: "Nath Finanças",
        url: "https://www.youtube.com/embed/WTYa8tg60Ro",
        duration: "12:40",
        description: "Série completa de educação financeira produzida em parceria com o MEC para você aprender do zero.",
        topic: "Educação financeira"
    },
    "nath-entrevista": {
        title: "Entrevista: Nath Finanças e a educação financeira para mulheres",
        channel: "Nath Finanças",
        url: "https://www.youtube.com/embed/UC6zlPxW55w",
        duration: "25:50",
        description: "Uma conversa profunda sobre como as mulheres podem alcançar independência financeira e liberdade.",
        topic: "Educação financeira feminina"
    },
    "sardinha-investir": {
        title: "Como investir em 2026: O foco agora é outro",
        channel: "Investidor Sardinha",
        url: "https://www.youtube.com/embed/GQbT3oy52W0",
        duration: "22:15",
        description: "Raul Sena analisa as melhores estratégias de investimento para 2026 e onde colocar seu dinheiro.",
        topic: "Estratégia 2026"
    },
    "sardinha-dica": {
        title: "A melhor dica de investimento de todos os tempos",
        channel: "Investidor Sardinha",
        url: "https://www.youtube.com/embed/ze_9hT7YWHY",
        duration: "14:30",
        description: "Raul Sena revela qual é o investimento mais importante que você pode fazer para crescer financeiramente.",
        topic: "Investimento em si mesmo"
    },
    "sardinha-flow": {
        title: "Investidor Sardinha no Flow: Como investir com estratégia",
        channel: "Investidor Sardinha",
        url: "https://www.youtube.com/embed/fp_ZUjLAl8A",
        duration: "150:00",
        description: "Uma conversa longa e descontraída onde Raul Sena compartilha sua visão sobre investimentos e empreendedorismo.",
        topic: "Empreendedorismo"
    },
    "maiara-cambio": {
        title: "Onde a Maiara Xavier investe: Análise completa de sua carteira",
        channel: "Maiara Xavier",
        url: "https://www.youtube.com/embed/PBkCJvBats0",
        duration: "17:45",
        description: "Conheça exatamente como Maiara Xavier investe seu dinheiro e quais são suas escolhas de ativos.",
        topic: "Carteira real"
    },
    "maiara-dividas": {
        title: "Como Maiara Xavier quitou 30 mil em dívidas em 9 meses",
        channel: "Maiara Xavier",
        url: "https://www.youtube.com/embed/ZSZ14YMLdT8",
        duration: "16:20",
        description: "A história real de como sair das dívidas rapidamente com foco, estratégia e determinação.",
        topic: "Quitação de dívidas"
    },
    "maiara-dicas": {
        title: "Dicas de dinheiro e investimentos com Maiara Xavier",
        channel: "Maiara Xavier",
        url: "https://www.youtube.com/embed/3usNSJyBKjg",
        duration: "19:10",
        description: "Maiara compartilha dicas práticas sobre como simplificar sua jornada financeira e chegar à liberdade.",
        topic: "Dicas práticas"
    },
    "maiara-desafio": {
        title: "Desafio do mês: O que fazer pela sua vida financeira",
        channel: "Maiara Xavier",
        url: "https://www.youtube.com/embed/hbFSZZyOyOQ",
        duration: "13:50",
        description: "Um guia mensal prático com ações específicas que você deve tomar para melhorar suas finanças.",
        topic: "Ação mensal"
    },
    "tesouro-selic": {
        title: "Tesouro Selic: O investimento mais seguro para iniciantes",
        channel: "Me Poupe!",
        url: "https://www.youtube.com/embed/3-5Ujc5dyhE",
        duration: "15:40",
        description: "Entenda o que é Tesouro Selic, como funciona e por que é o investimento ideal para quem está começando.",
        topic: "Tesouro Direto"
    },
    "fii-como": {
        title: "Como funciona um Fundo Imobiliário e como começar a investir",
        channel: "Primo Rico",
        url: "https://www.youtube.com/embed/4N1CF5wwTD0",
        duration: "14:25",
        description: "Guia completo sobre fundos imobiliários, suas vantagens e como escolher os melhores para sua carteira.",
        topic: "FIIs"
    },
    "carteira-diversificada": {
        title: "Carteira Diversificada: O segredo para investir com segurança",
        channel: "Gustavo Cerbasi",
        url: "https://www.youtube.com/embed/5N1CF5wwTD0",
        duration: "14:25",
        description: "Descubra como criar uma carteira diversificada e reduzir os riscos com investimentos em diferentes ativos.",
        topic: "Diversificação de Investimentos"
    }
};

function setupTabs() {
    const tabButtons = document.querySelectorAll(".guide-tab-button");
    const tabContents = document.querySelectorAll(".guide-tab-content");

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Remove ativo de todos
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));

            // Ativa selecionado
            button.classList.add("active");
            const tabId = `${button.dataset.tab}-tab`;
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add("active");
            }
        });
    });
}

function setupVideoButtons() {
    const videoButtons = document.querySelectorAll(".btn-small[data-video]");

    videoButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const videoId = button.dataset.video;
            const video = RECOMMENDED_VIDEOS[videoId];

            if (video) {
                openVideoModal(video);
            }
        });
    });
}

function openVideoModal(video) {
    const modal = document.getElementById("videoModal");
    const title = document.getElementById("videoTitle");
    const embed = document.getElementById("videoEmbed");
    const info = document.getElementById("videoInfo");

    title.textContent = video.title;
    embed.innerHTML = `<iframe src="${video.url}" allowfullscreen></iframe>`;
    info.innerHTML = `
    <p><strong>Canal:</strong> ${video.channel}</p>
    <p><strong>Duração:</strong> ${video.duration}</p>
    <p><strong>Descrição:</strong> ${video.description}</p>
    <p><strong>💡 Dica:</strong> Assista com atenção e anote no seu diário as principais aprendizagens!</p>
  `;

    modal.classList.add("active");
}

function closeVideoModal() {
    const modal = document.getElementById("videoModal");
    modal.classList.remove("active");
    document.getElementById("videoEmbed").innerHTML = "";
}

function renderVideos() {
    const container = document.getElementById("videosContainer");
    container.innerHTML = Object.entries(RECOMMENDED_VIDEOS)
        .map(
            ([id, video]) => `
    <article class="video-card" data-video-id="${id}">
      <div class="video-thumbnail">▶️</div>
      <div class="video-card-content">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
        <div>
          <span class="video-channel">📺 ${video.channel}</span>
          <span class="video-duration">⏱️ ${video.duration}</span>
        </div>
      </div>
    </article>
  `
        )
        .join("");

    // Adicionar listeners aos cards
    document.querySelectorAll(".video-card").forEach((card) => {
        card.addEventListener("click", () => {
            const videoId = card.dataset.videoId;
            const video = RECOMMENDED_VIDEOS[videoId];
            openVideoModal(video);
        });
    });
}



function setupDiary() {
    const form = document.getElementById("diaryForm");
    const dateInput = document.getElementById("diaryDate");

    // Define data atual como padrão
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const user = getActiveUser();
        if (!user) {
            alert("Você precisa estar logado para usar o diário.");
            return;
        }

        const entry = {
            id: Date.now(),
            date: dateInput.value,
            topic: document.getElementById("diaryTopic").value,
            reflection: document.getElementById("diaryReflection").value,
            level: document.getElementById("diaryLevel").value
        };

        saveDiaryEntry(user.id, entry);

        // Limpa form
        form.reset();
        dateInput.value = today;

        // Recarrega lista
        renderDiaryEntries(user.id);

        alert("✅ Reflexão salva com sucesso!");
    });

    // Carrega diário da página
    const user = getActiveUser();
    if (user) {
        renderDiaryEntries(user.id);
    }
}

function getDiaryKey(userId) {
    return `${DIARY_STORAGE_KEY}:${userId}`;
}

function saveDiaryEntry(userId, entry) {
    const key = getDiaryKey(userId);
    const entries = JSON.parse(localStorage.getItem(key) || "[]");
    entries.unshift(entry); // Adiciona no topo
    localStorage.setItem(key, JSON.stringify(entries));
}

function getDiaryEntries(userId) {
    const key = getDiaryKey(userId);
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function renderDiaryEntries(userId) {
    const container = document.getElementById("diaryEntries");
    const entries = getDiaryEntries(userId);

    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma reflexão registrada ainda. Comece a aprender e registre suas descobertas!</p>';
        return;
    }

    container.innerHTML = entries
        .map(
            (entry) => `
    <article class="diary-entry">
      <div class="diary-entry-header">
        <span class="diary-entry-date">${new Date(entry.date).toLocaleDateString("pt-BR")}</span>
        <span class="diary-entry-level ${entry.level}">${getLevelLabel(entry.level)}</span>
      </div>
      <h4 class="diary-entry-topic">${entry.topic}</h4>
      <p class="diary-entry-text">${entry.reflection}</p>
      <div class="diary-entry-delete">
        <button class="btn-delete" data-entry-id="${entry.id}">🗑️ Deletar</button>
      </div>
    </article>
  `
        )
        .join("");

    // Adicionar listeners de delete
    document.querySelectorAll(".btn-delete").forEach((button) => {
        button.addEventListener("click", () => {
            const entryId = parseInt(button.dataset.entryId);
            deleteDiaryEntry(userId, entryId);
        });
    });
}

function getLevelLabel(level) {
    const labels = {
        compreendi: "✅ Compreendi bem",
        parcial: "⚠️ Parcialmente",
        duvida: "❓ Dúvidas"
    };
    return labels[level] || level;
}

function deleteDiaryEntry(userId, entryId) {
    if (!confirm("Tem certeza que deseja deletar esta reflexão?")) {
        return;
    }

    const key = getDiaryKey(userId);
    let entries = JSON.parse(localStorage.getItem(key) || "[]");
    entries = entries.filter((e) => e.id !== entryId);
    localStorage.setItem(key, JSON.stringify(entries));

    renderDiaryEntries(userId);
}

// Setup modal close
document.getElementById("closeVideoModal").addEventListener("click", closeVideoModal);
document.getElementById("videoModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("videoModal")) {
        closeVideoModal();
    }
});


function setupVideoSearch() {

    const input =
        document.getElementById(
            "videoSearch"
        );

    if (!input) return;

    input.addEventListener(
        "input",

        function () {

            const value =
                this.value
                    .toLowerCase();

            document
                .querySelectorAll(
                    ".video-card"
                )

                .forEach(card => {

                    const text =
                        card
                            .textContent
                            .toLowerCase();

                    card.style.display =

                        text.includes(
                            value
                        )

                            ?

                            "block"

                            :

                            "none";

                });

        }

    );

}


// Inicializa tudo
setupTabs();
setupVideoButtons();
renderVideos();
setupVideoSearch();
setupDiary();