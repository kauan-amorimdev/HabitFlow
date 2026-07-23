// ==========================================
// MÓDULO DE CADASTRO DE HÁBITOS 
// Responsável: Ryan Lucas
// Branch: feature/base-cadastro
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o LocalStorage com os mock data se estiver vazio
  if (typeof obterRegistros === 'function') {
    obterRegistros();
  }

  // Seleção dos elementos do HTML
  const formCadastro = document.getElementById('form-cadastro');
  const campoData = document.getElementById('campo-data');
  const campoAgua = document.getElementById('campo-agua');
  const campoExercicio = document.getElementById('campo-exercicio');
  const campoNotas = document.getElementById('campo-notas');
  const msgFeedback = document.getElementById('mensagem-feedback');

  if (!formCadastro) return;

  // Define a data atual como padrão no campo de data
  const hoje = new Date().toISOString().split('T')[0];
  if (campoData) campoData.value = hoje;

  // Guarda a referência do timer da mensagem para evitar conflito
  let tempoFeedback = null;

  // Evento ao enviar o formulário
  formCadastro.addEventListener('submit', (event) => {
    // Evita o recarregamento da página
    event.preventDefault();

    // Captura dos valores
    const dataVal = campoData.value;
    const aguaVal = Number(campoAgua.value);
    const exercicioVal = campoExercicio ? campoExercicio.checked : false;
    const notasVal = campoNotas ? campoNotas.value.trim() : '';

    // Validações dos campos
    if (!dataVal) {
      exibirFeedback('Por favor, informe a data do registro.', 'erro');
      return;
    }

    if (isNaN(aguaVal) || aguaVal < 0) {
      exibirFeedback('A quantidade de água não pode ser negativa.', 'erro');
      return;
    }

    if (notasVal.length > 0 && notasVal.length < 3) {
      exibirFeedback('A nota precisa ter pelo menos 3 caracteres.', 'erro');
      return;
    }

    // Criação do objeto
    const novoRegistro = {
      id: Date.now(),
      data: dataVal,
      aguaConsumidaMl: aguaVal,
      exercicioFeito: exercicioVal,
      notas: notasVal
    };

    // Salva no localStorage
    if (typeof adicionarRegistro === 'function') {
      adicionarRegistro(novoRegistro);
    }

    // Feedback de sucesso
    exibirFeedback('Registro cadastrado com sucesso!', 'sucesso');

    // Reseta o formulário e restaura a data de hoje
    formCadastro.reset();
    if (campoData) campoData.value = hoje;
  });

  /**
   * Exibe mensagens de alerta na tela com controle de temporizador
   */
  function exibirFeedback(texto, tipo) {
    if (!msgFeedback) return;
    if (tempoFeedback) clearTimeout(tempoFeedback);

    msgFeedback.textContent = texto;
    msgFeedback.className = `feedback-msg ${tipo}`;

    tempoFeedback = setTimeout(() => {
      msgFeedback.className = 'feedback-msg hidden';
    }, 4000);
  }
});

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

        if (this.elementos.btn250) {
            this.elementos.btn250.addEventListener("click", () => {
                this.adicionarAgua(250);
            });
        }

        if (this.elementos.btn500) {
            this.elementos.btn500.addEventListener("click", () => {
                this.adicionarAgua(500);
            });
        }

        if (this.elementos.btnAdicionar) {
            this.elementos.btnAdicionar.addEventListener("click", () => {
                const quantidade = Number(this.elementos.input ? this.elementos.input.value : 0);

                if (quantidade > 0) {
                    this.adicionarAgua(quantidade);
                    if (this.elementos.input) this.elementos.input.value = "";
                } else {
                    alert("Digite uma quantidade válida.");
                }
            });
        }

        if (this.elementos.fecharModal) {
            this.elementos.fecharModal.addEventListener("click", () => {
                this.fecharModal();
            });
        }
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

        this.salvarDados();
        this.atualizarTela();
    },

    // Atualiza todas as informações exibidas na página
    atualizarTela() {
        const totalConsumido = this.consumos.reduce((total, consumo) => {
            return total + consumo.quantidade;
        }, 0);

        if (this.elementos.consumo) {
            this.elementos.consumo.textContent = `${totalConsumido} ml / ${this.metaDiaria} ml`;
        }

        const percentual = Math.min(
            (totalConsumido / this.metaDiaria) * 100,
            100
        );

        if (this.elementos.barra) this.elementos.barra.style.width = percentual + "%";
        if (this.elementos.porcentagem) {
            this.elementos.porcentagem.textContent = `${Math.round(percentual)}%`;
        }

        if (totalConsumido >= this.metaDiaria) {
            if (this.elementos.statusMeta) this.elementos.statusMeta.textContent = "✅ Meta atingida";
            if (this.elementos.faltam) this.elementos.faltam.textContent = "Parabéns! Continue se hidratando.";

            if (!this.modalExibido) {
                this.abrirModal();
                this.modalExibido = true;
            }
        } else {
            if (this.elementos.statusMeta) this.elementos.statusMeta.textContent = "❌ Ainda não";
            if (this.elementos.faltam) this.elementos.faltam.textContent = `Faltam ${this.metaDiaria - totalConsumido} ml`;
            this.modalExibido = false;
        }

        this.renderizarHistorico();
    },

    // Exibe o histórico na tela
    renderizarHistorico() {
        if (!this.elementos.historico) return;

        this.elementos.historico.innerHTML = "";

        if (this.consumos.length === 0) {
            this.elementos.historico.innerHTML = '<p class="vazio">Nenhum consumo registrado.</p>';
            return;
        }

        this.consumos.forEach((consumo) => {
            const item = document.createElement("p");
            item.textContent = `${consumo.horario} - +${consumo.quantidade} ml`;
            this.elementos.historico.appendChild(item);
        });
    },

    abrirModal() {
        if (this.elementos.modal) this.elementos.modal.style.display = "flex";
    },

    fecharModal() {
        if (this.elementos.modal) this.elementos.modal.style.display = "none";
    },

    salvarDados() {
        localStorage.setItem(
            "consumosHabitFlow",
            JSON.stringify(this.consumos)
        );
        const totalConsumido = this.consumos.reduce((total, c) => total + c.quantidade, 0);
        const hojeIso = new Date().toISOString().split('T')[0];
        let registrosGerais = [];
        const salvos = localStorage.getItem('habitflow_dados');
        if (salvos) {
            registrosGerais = JSON.parse(salvos);
        } else if (typeof dadosIniciais !== 'undefined') {
            registrosGerais = [...dadosIniciais];
        }
        const indexHoje = registrosGerais.findIndex(r => r.data === hojeIso);
        if (indexHoje !== -1) {
            registrosGerais[indexHoje].aguaConsumidaMl = totalConsumido;
        } else {
            registrosGerais.push({
                id: Date.now(),
                data: hojeIso,
                aguaConsumidaMl: totalConsumido,
                exercicioFeito: false,
                notas: 'Registro automático de água'
            });
        }
        localStorage.setItem('habitflow_dados', JSON.stringify(registrosGerais));
    },

    carregarDados() {
        const dados = localStorage.getItem("consumosHabitFlow");
        if (dados) {
            this.consumos = JSON.parse(dados);
        }
    }
};

// Só inicia a hidratação se estiver na página que tem o elemento "consumo"
if (document.getElementById("consumo")) {
    hidratacao.iniciar();
}
