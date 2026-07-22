// ==========================================
// MÓDULO DE HIDRATAÇÃO
// Responsável: Bruno Jallon
// Branch: feature/hidratacao
// ==========================================

const hidratacao = {
    metaDiaria: 2000,
    consumos: [],
    modalExibido: false,

    elementos: {},

    iniciar() {
        this.carregarElementos();
        this.carregarDados();
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

        this.elementos.historico =
            document.getElementById("historico");

        this.elementos.modal =
            document.getElementById("modal");

        this.elementos.fecharModal =
            document.getElementById("fecharModal");
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

        this.elementos.fecharModal.addEventListener("click", () => {

            this.fecharModal();

        });
    },

    adicionarAgua(quantidade) {

        const agora = new Date();

        this.consumos.push({

            horario: agora.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            }),

            quantidade: quantidade

        });

        this.salvarDados();

        this.atualizarTela();
    },

    atualizarTela() {

        const totalConsumido = this.consumos.reduce((total, consumo) => {

            return total + consumo.quantidade;

        }, 0);

        this.elementos.consumo.textContent =
            `${totalConsumido} ml / ${this.metaDiaria} ml`;

        const percentual = Math.min(
            (totalConsumido / this.metaDiaria) * 100,
            100
        );

        this.elementos.barra.style.width = percentual + "%";
        this.elementos.porcentagem.textContent =
            `${Math.round(percentual)}%`;

        if (totalConsumido >= this.metaDiaria) {
            this.elementos.statusMeta.textContent = "✅ Meta atingida";
            this.elementos.faltam.textContent =
                "Parabéns! Continue se hidratando.";

            if (!this.modalExibido) {

                this.abrirModal();

                this.modalExibido = true;

            }
        } else {
            this.elementos.statusMeta.textContent = "❌ Ainda não";
            this.elementos.faltam.textContent =
                `Faltam ${this.metaDiaria - totalConsumido} ml`;

            this.modalExibido = false;
        }

        this.renderizarHistorico();
    },

    renderizarHistorico() {

        this.elementos.historico.innerHTML = "";

        if (this.consumos.length === 0) {

            this.elementos.historico.innerHTML =

                '<p class="vazio">Nenhum consumo registrado.</p>';

            return;
        }

        this.consumos.forEach((consumo) => {

            const item = document.createElement("p");

            item.textContent =
                `${consumo.horario} - +${consumo.quantidade} ml`;

            this.elementos.historico.appendChild(item);

        });

    },

    abrirModal() {

        this.elementos.modal.style.display = "flex";

    },

    fecharModal() {

        this.elementos.modal.style.display = "none";

    },

    salvarDados() {

        localStorage.setItem(
            "consumosHabitFlow",
            JSON.stringify(this.consumos)
        );

    },

    carregarDados() {

        const dados =
            localStorage.getItem("consumosHabitFlow");

        if (dados) {

            this.consumos = JSON.parse(dados);

        }

    }
};

hidratacao.iniciar();