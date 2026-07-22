// ==========================================
// MÓDULO DE HIDRATAÇÃO
// Responsável: Bruno Jallon
// Branch: feature/hidratacao
// ==========================================

const hidratacao = {

    // Meta diária de consumo de água (em ml)
    metaDiaria: 2000,

    // Armazena todos os registros de consumo do dia
    consumos: [],

    // Controla se o modal já foi exibido
    modalExibido: false,

    // Guarda referências aos elementos HTML
    elementos: {},

    // Inicializa o módulo
    iniciar() {
        this.carregarElementos();
        this.carregarDados();
        this.registrarEventos();
        this.atualizarTela();
    },

    // Busca os elementos da página
    carregarElementos() {
        this.elementos.consumo = document.getElementById("consumo");
        this.elementos.barra = document.getElementById("barra-progresso");
        this.elementos.porcentagem = document.getElementById("porcentagem");
        this.elementos.statusMeta = document.getElementById("statusMeta");
        this.elementos.faltam = document.getElementById("faltam");

        this.elementos.btn250 = document.getElementById("btn250");
        this.elementos.btn500 = document.getElementById("btn500");
        this.elementos.btnAdicionar = document.getElementById("btnAdicionar");

        this.elementos.input = document.getElementById("aguaPersonalizada");

        this.elementos.historico = document.getElementById("historico");

        this.elementos.modal = document.getElementById("modal");
        this.elementos.fecharModal = document.getElementById("fecharModal");
    },

    // Registra todos os eventos da interface
    registrarEventos() {

        // Botão de 250 ml
        this.elementos.btn250.addEventListener("click", () => {
            this.adicionarAgua(250);
        });

        // Botão de 500 ml
        this.elementos.btn500.addEventListener("click", () => {
            this.adicionarAgua(500);
        });

        // Botão para quantidade personalizada
        this.elementos.btnAdicionar.addEventListener("click", () => {

            const quantidade = Number(this.elementos.input.value);

            if (quantidade > 0) {
                this.adicionarAgua(quantidade);
                this.elementos.input.value = "";
            } else {
                alert("Digite uma quantidade válida.");
            }
        });

        // Fecha o modal
        this.elementos.fecharModal.addEventListener("click", () => {
            this.fecharModal();
        });
    },

    // Adiciona um novo consumo de água
    adicionarAgua(quantidade) {

        const agora = new Date();

        this.consumos.push({

            horario: agora.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            }),

            quantidade: quantidade

        });

        // Salva os dados e atualiza a tela
        this.salvarDados();
        this.atualizarTela();
    },

    // Atualiza todas as informações exibidas na página
    atualizarTela() {

        // Soma todos os consumos utilizando reduce()
        const totalConsumido = this.consumos.reduce((total, consumo) => {
            return total + consumo.quantidade;
        }, 0);

        // Atualiza o texto da meta
        this.elementos.consumo.textContent =
            `${totalConsumido} ml / ${this.metaDiaria} ml`;

        // Calcula a porcentagem da barra
        const percentual = Math.min(
            (totalConsumido / this.metaDiaria) * 100,
            100
        );

        this.elementos.barra.style.width = percentual + "%";
        this.elementos.porcentagem.textContent =
            `${Math.round(percentual)}%`;

        // Verifica se a meta foi atingida
        if (totalConsumido >= this.metaDiaria) {

            this.elementos.statusMeta.textContent =
                "✅ Meta atingida";

            this.elementos.faltam.textContent =
                "Parabéns! Continue se hidratando.";

            // Exibe o modal apenas uma vez
            if (!this.modalExibido) {
                this.abrirModal();
                this.modalExibido = true;
            }

        } else {

            this.elementos.statusMeta.textContent =
                "❌ Ainda não";

            this.elementos.faltam.textContent =
                `Faltam ${this.metaDiaria - totalConsumido} ml`;

            this.modalExibido = false;
        }

        // Atualiza o histórico de consumo
        this.renderizarHistorico();
    },

    // Exibe o histórico na tela
    renderizarHistorico() {

        this.elementos.historico.innerHTML = "";

        if (this.consumos.length === 0) {

            this.elementos.historico.innerHTML =
                '<p class="vazio">Nenhum consumo registrado.</p>';

            return;
        }

        // Cria um elemento para cada consumo registrado
        this.consumos.forEach((consumo) => {

            const item = document.createElement("p");

            item.textContent =
                `${consumo.horario} - +${consumo.quantidade} ml`;

            this.elementos.historico.appendChild(item);
        });
    },

    // Abre o modal de conclusão da meta
    abrirModal() {
        this.elementos.modal.style.display = "flex";
    },

    // Fecha o modal
    fecharModal() {
        this.elementos.modal.style.display = "none";
    },

    // Salva os dados no LocalStorage
    salvarDados() {
        localStorage.setItem(
            "consumosHabitFlow",
            JSON.stringify(this.consumos)
        );
    },

    // Recupera os dados salvos anteriormente
    carregarDados() {

        const dados = localStorage.getItem("consumosHabitFlow");

        if (dados) {
            this.consumos = JSON.parse(dados);
        }
    }
};

// Inicia o módulo quando a página é carregada
hidratacao.iniciar();