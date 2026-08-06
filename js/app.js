// ==========================================
// MÓDULO DE CADASTRO DE HÁBITOS 
// Responsável: Ryan Lucas
// Branch: feature/base-cadastro
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa o LocalStorage / Carga inicial da API
  if (typeof obterRegistros === 'function') {
    await obterRegistros();
  }

  // Seleção dos elementos do HTML
  const formCadastro = document.getElementById('form-cadastro');
  const campoData = document.getElementById('campo-data');
  const campoAgua = document.getElementById('campo-agua');
  const campoExercicio = document.getElementById('campo-exercicio');
  const campoNotas = document.getElementById('campo-notas');
  const msgFeedback = document.getElementById('mensagem-feedback');
  const btnSubmit = formCadastro ? formCadastro.querySelector('button[type="submit"]') : null;

  if (!formCadastro) return;

  // Define a data atual como padrão no campo de data
  const hoje = new Date().toISOString().split('T')[0];
  if (campoData) campoData.value = hoje;

  // Guarda a referência do timer da mensagem para evitar conflito
  let tempoFeedback = null;

  // Evento ao enviar o formulário
  formCadastro.addEventListener('submit', async (event) => {
    // Evita o recarregamento da página
    event.preventDefault();

    // Captura dos valores
    const dataVal = campoData.value;
    const aguaVal = Number(campoAgua.value);
    const exercicioVal = campoExercicio ? campoExercicio.checked : false;
    const notasVal = campoNotas ? campoNotas.value.trim() : '';

    // Define o limite máximo de água permitido por registro (10.000 ml = 10 litros)
    const LIMITE_MAXIMO_AGUA = 10000;

    // Validações dos campos
    if (!dataVal) {
      exibirFeedback('Por favor, informe a data do registro.', 'erro');
      return;
    }

    if (isNaN(aguaVal) || aguaVal < 0) {
      exibirFeedback('A quantidade de água não pode ser negativa.', 'erro');
      return;
    }

    if (aguaVal > LIMITE_MAXIMO_AGUA) {
      exibirFeedback('Informe um valor de água de no máximo 10.000 ml.', 'erro');
      return;
    }

    if (notasVal.length > 0 && notasVal.length < 3) {
      exibirFeedback('A nota precisa ter pelo menos 3 caracteres.', 'erro');
      return;
    }

    // Criação do objeto sem o ID fixo (deixando a API gerar a chave primária única)
    const novoRegistro = {
      data: dataVal,
      aguaConsumidaMl: aguaVal,
      exercicioFeito: exercicioVal,
      notas: notasVal
    };

    try {
      if (btnSubmit) btnSubmit.disabled = true;

      // Salva via API (com fallback no LocalStorage dentro da função)
      if (typeof adicionarRegistro === 'function') {
        await adicionarRegistro(novoRegistro);
      }

      // Feedback de sucesso
      exibirFeedback('Registro cadastrado com sucesso!', 'sucesso');

      // Reseta o formulário e restaura a data de hoje
      formCadastro.reset();
      if (campoData) campoData.value = hoje;

    } catch (erro) {
      console.error('Erro ao salvar registro:', erro);
      exibirFeedback('Erro ao salvar o registro na API.', 'erro');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
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

    // Meta diária de consumo de água em mililitros
    metaDiaria: 2000,

    // Consumos de água registrados no dia atual
    consumos: [],

    // Registro diário encontrado na API
    registroHoje: null,

    // Controla se o modal de meta atingida já foi exibido
    modalExibido: false,

    // Impede vários envios simultâneos
    processando: false,

    // Referências aos elementos da página
    elementos: {},

    /**
     * Inicializa o módulo de hidratação.
     */
    async iniciar() {
        this.carregarElementos();
        this.registrarEventos();

        await this.carregarDados();

        this.atualizarTela();
    },

    /**
     * Busca os elementos do hidratacao.html.
     */
    carregarElementos() {
        this.elementos.consumo =
            document.getElementById("consumo");

        this.elementos.barra =
            document.getElementById("barra-progresso");

        this.elementos.porcentagem =
            document.getElementById("porcentagem");

        this.elementos.statusMeta =
            document.getElementById("statusMeta");

        this.elementos.faltam =
            document.getElementById("faltam");

        this.elementos.btn250 =
            document.getElementById("btn250");

        this.elementos.btn500 =
            document.getElementById("btn500");

        this.elementos.btnAdicionar =
            document.getElementById("btnAdicionar");

        this.elementos.input =
            document.getElementById("aguaPersonalizada");

        this.elementos.historico =
            document.getElementById("historico");

        this.elementos.modal =
            document.getElementById("modal");

        this.elementos.fecharModal =
            document.getElementById("fecharModal");
    },

    /**
     * Registra os eventos dos botões.
     */
    registrarEventos() {
        if (this.elementos.btn250) {
            this.elementos.btn250.addEventListener(
                "click",
                async () => {
                    await this.adicionarAgua(250);
                }
            );
        }

        if (this.elementos.btn500) {
            this.elementos.btn500.addEventListener(
                "click",
                async () => {
                    await this.adicionarAgua(500);
                }
            );
        }

        if (this.elementos.btnAdicionar) {
            this.elementos.btnAdicionar.addEventListener(
                "click",
                async () => {
                    const quantidade = Number(
                        this.elementos.input
                            ? this.elementos.input.value
                            : 0
                    );

                    if (
                        !Number.isFinite(quantidade) ||
                        quantidade <= 0
                    ) {
                        alert("Digite uma quantidade válida.");
                        return;
                    }

                    await this.adicionarAgua(quantidade);

                    if (this.elementos.input) {
                        this.elementos.input.value = "";
                    }
                }
            );
        }

        if (this.elementos.fecharModal) {
            this.elementos.fecharModal.addEventListener(
                "click",
                () => {
                    this.fecharModal();
                }
            );
        }
    },

    /**
     * GET
     * Busca na API o registro correspondente ao dia atual.
     */
    async carregarDados() {
        try {
            const registros = await obterRegistros();
            const hoje = this.obterDataAtual();

            this.registroHoje =
                registros.find((registro) => {
                    return registro.data === hoje;
                }) || null;

            if (!this.registroHoje) {
                this.consumos = [];
                return;
            }

            /*
             * Caso o registro já possua um histórico
             * de consumos, carrega cada item.
             */
            if (Array.isArray(this.registroHoje.consumos)) {
                this.consumos =
                    this.registroHoje.consumos.map(
                        (consumo) => {
                            return {
                                horario: consumo.horario,
                                quantidade:
                                    Number(consumo.quantidade) || 0
                            };
                        }
                    );

                return;
            }

            /*
             * Compatibilidade com registros antigos que
             * possuem somente aguaConsumidaMl.
             */
            const totalSalvo =
                Number(
                    this.registroHoje.aguaConsumidaMl
                ) || 0;

            if (totalSalvo > 0) {
                this.consumos = [
                    {
                        horario: "Total salvo",
                        quantidade: totalSalvo
                    }
                ];
            } else {
                this.consumos = [];
            }

        } catch (erro) {
            console.error(
                "Erro ao carregar a hidratação:",
                erro
            );

            this.registroHoje = null;
            this.consumos = [];

            alert(
                "Não foi possível carregar os dados. " +
                "Verifique se o json-server está funcionando."
            );
        }
    },

    /**
     * Adiciona água ao consumo do dia.
     *
     * Usa POST quando o registro ainda não existe.
     * Usa PUT quando o registro já existe.
     */
    async adicionarAgua(quantidade) {
        if (this.processando) {
            return;
        }

        const totalAtual = this.calcularTotal();

        if (totalAtual >= this.metaDiaria) {
            alert(
                "Você já atingiu a meta diária de 2000 ml!"
            );

            return;
        }

        let quantidadeEfetiva = quantidade;

        if (
            totalAtual + quantidade >
            this.metaDiaria
        ) {
            quantidadeEfetiva =
                this.metaDiaria - totalAtual;

            alert(
                "Para não ultrapassar a meta, " +
                `foram adicionados apenas ${quantidadeEfetiva} ml.`
            );
        }

        const novoConsumo = {
            horario: new Date().toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ),

            quantidade: quantidadeEfetiva
        };

        const consumosAtualizados = [
            ...this.consumos,
            novoConsumo
        ];

        const novoTotal =
            totalAtual + quantidadeEfetiva;

        this.processando = true;
        this.alterarEstadoBotoes(true);

        try {
            await this.salvarDados(
                novoTotal,
                consumosAtualizados
            );

            this.consumos =
                consumosAtualizados;

            this.atualizarTela();

        } catch (erro) {
            console.error(
                "Erro ao registrar o consumo de água:",
                erro
            );

            alert(
                "Não foi possível salvar o consumo de água."
            );

        } finally {
            this.processando = false;
            this.alterarEstadoBotoes(false);
        }
    },

    /**
     * POST ou PUT
     * Salva o total e o histórico de consumo na API.
     */
    async salvarDados(
        totalConsumido,
        consumosAtualizados
    ) {
        const dadosDoDia = {
            data: this.obterDataAtual(),

            aguaConsumidaMl:
                totalConsumido,

            exercicioFeito:
                this.registroHoje
                    ? Boolean(
                        this.registroHoje.exercicioFeito
                    )
                    : false,

            notas:
                this.registroHoje &&
                this.registroHoje.notas
                    ? this.registroHoje.notas
                    : "Registro automático de hidratação",

            consumos:
                consumosAtualizados
        };

        /*
         * Se já existe registro para hoje,
         * realiza PUT.
         */
        if (this.registroHoje) {
            const registroAtualizado = {
                id: this.registroHoje.id,
                ...dadosDoDia
            };

            this.registroHoje =
                await atualizarRegistro(
                    this.registroHoje.id,
                    registroAtualizado
                );

            return;
        }

        /*
         * Se ainda não existe registro para hoje,
         * realiza POST.
         */
        this.registroHoje =
            await adicionarRegistro(dadosDoDia);
    },

    /**
     * DELETE
     * Exclui da API o registro do dia atual.
     */
    async excluirDadosHoje() {
        if (
            !this.registroHoje ||
            this.processando
        ) {
            return;
        }

        const confirmar = confirm(
            "Deseja excluir o registro de hidratação de hoje?"
        );

        if (!confirmar) {
            return;
        }

        this.processando = true;
        this.alterarEstadoBotoes(true);

        try {
            await excluirRegistro(
                this.registroHoje.id
            );

            this.registroHoje = null;
            this.consumos = [];
            this.modalExibido = false;

            this.fecharModal();
            this.atualizarTela();

            alert(
                "Registro de hidratação excluído com sucesso."
            );

        } catch (erro) {
            console.error(
                "Erro ao excluir o registro de hidratação:",
                erro
            );

            alert(
                "Não foi possível excluir o registro de hidratação."
            );

        } finally {
            this.processando = false;
            this.alterarEstadoBotoes(false);
        }
    },

    /**
     * Soma todos os consumos registrados no dia.
     */
    calcularTotal() {
        return this.consumos.reduce(
            (total, consumo) => {
                return (
                    total +
                    (
                        Number(consumo.quantidade) ||
                        0
                    )
                );
            },
            0
        );
    },

    /**
     * Retorna a data local no formato AAAA-MM-DD.
     */
    obterDataAtual() {
        const agora = new Date();

        const ano =
            agora.getFullYear();

        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    },

    /**
     * Ativa ou desativa os botões durante
     * as requisições.
     */
    alterarEstadoBotoes(desativar) {
        const botoes = [
            this.elementos.btn250,
            this.elementos.btn500,
            this.elementos.btnAdicionar
        ];

        botoes.forEach((botao) => {
            if (botao) {
                botao.disabled = desativar;
            }
        });
    },

    /**
     * Atualiza o total, a barra, a porcentagem
     * e o status da meta.
     */
    atualizarTela() {
        const totalConsumido =
            this.calcularTotal();

        if (this.elementos.consumo) {
            this.elementos.consumo.textContent =
                `${totalConsumido} ml / ${this.metaDiaria} ml`;
        }

        const percentual = Math.min(
            (
                totalConsumido /
                this.metaDiaria
            ) * 100,
            100
        );

        if (this.elementos.barra) {
            this.elementos.barra.style.width =
                `${percentual}%`;
        }

        if (this.elementos.porcentagem) {
            this.elementos.porcentagem.textContent =
                `${Math.round(percentual)}%`;
        }

        if (
            totalConsumido >=
            this.metaDiaria
        ) {
            if (this.elementos.statusMeta) {
                this.elementos.statusMeta.textContent =
                    "✅ Meta atingida";
            }

            if (this.elementos.faltam) {
                this.elementos.faltam.textContent =
                    "Parabéns! Continue se hidratando.";
            }

            if (!this.modalExibido) {
                this.abrirModal();
                this.modalExibido = true;
            }

        } else {
            if (this.elementos.statusMeta) {
                this.elementos.statusMeta.textContent =
                    "❌ Ainda não";
            }

            if (this.elementos.faltam) {
                this.elementos.faltam.textContent =
                    `Faltam ${
                        this.metaDiaria -
                        totalConsumido
                    } ml`;
            }

            this.modalExibido = false;
        }

        this.renderizarHistorico();
    },

    /**
     * Exibe o histórico e cria o botão DELETE.
     */
    renderizarHistorico() {
        if (!this.elementos.historico) {
            return;
        }

        this.elementos.historico.innerHTML = "";

        if (this.consumos.length === 0) {
            this.elementos.historico.innerHTML =
                '<p class="vazio">' +
                'Nenhum consumo registrado.' +
                '</p>';

            return;
        }

        this.consumos.forEach((consumo) => {
            const item =
                document.createElement("p");

            item.textContent =
                `${consumo.horario} - ` +
                `+${consumo.quantidade} ml`;

            this.elementos.historico.appendChild(
                item
            );
        });

        const botaoExcluir =
            document.createElement("button");

        botaoExcluir.type = "button";

        botaoExcluir.textContent =
            "Excluir registro de hoje";

        botaoExcluir.className =
            "btn-primary";

        botaoExcluir.addEventListener(
            "click",
            async () => {
                await this.excluirDadosHoje();
            }
        );

        this.elementos.historico.appendChild(
            botaoExcluir
        );
    },

    abrirModal() {
        if (this.elementos.modal) {
            this.elementos.modal.style.display =
                "flex";
        }
    },

    fecharModal() {
        if (this.elementos.modal) {
            this.elementos.modal.style.display =
                "none";
        }
    }
};

// Inicia somente na página de hidratação
if (document.getElementById("consumo")) {
    hidratacao.iniciar();
}
