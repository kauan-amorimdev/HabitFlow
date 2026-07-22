// ==========================================
// MÓDULO DE HIDRATAÇÃO
// Responsável: Bruno Jallon
// Branch: feature/hidratacao
// ==========================================

const hidratacao = {
    metaDiaria: 2000,
    consumoAtual: 0,

    elementos: {},

    iniciar() {
        this.carregarElementos();
        this.registrarEventos();
        this.atualizarTela();
    },

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
    },

    registrarEventos() {
        this.elementos.btn250.addEventListener("click", () => {
            this.adicionarAgua(250);
        });

        this.elementos.btn500.addEventListener("click", () => {
            this.adicionarAgua(500);
        });

        this.elementos.btnAdicionar.addEventListener("click", () => {
            const quantidade = Number(this.elementos.input.value);

            if (quantidade > 0) {
                this.adicionarAgua(quantidade);
                this.elementos.input.value = "";
            } else {
                alert("Digite uma quantidade válida.");
            }
        });
    },

    adicionarAgua(quantidade) {
        this.consumoAtual += quantidade;
        this.atualizarTela();
    },

    atualizarTela() {
        this.elementos.consumo.textContent =
            `${this.consumoAtual} ml / ${this.metaDiaria} ml`;

        const percentual = Math.min(
            (this.consumoAtual / this.metaDiaria) * 100,
            100
        );

        this.elementos.barra.style.width = percentual + "%";
        this.elementos.porcentagem.textContent =
            `${Math.round(percentual)}%`;

        if (this.consumoAtual >= this.metaDiaria) {
            this.elementos.statusMeta.textContent = "✅ Meta atingida";
            this.elementos.faltam.textContent =
                "Parabéns! Continue se hidratando.";
        } else {
            this.elementos.statusMeta.textContent = "❌ Ainda não";
            this.elementos.faltam.textContent =
                `Faltam ${this.metaDiaria - this.consumoAtual} ml`;
        }
    }
};

hidratacao.iniciar();