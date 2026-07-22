document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o LocalStorage com os mock data se estiver vazio
  obterRegistros();

  // Seleção dos elementos do HTML
  const formCadastro = document.getElementById('form-cadastro');
  const campoData = document.getElementById('campo-data');
  const campoAgua = document.getElementById('campo-agua');
  const campoExercicio = document.getElementById('campo-exercicio');
  const campoNotas = document.getElementById('campo-notas');
  const msgFeedback = document.getElementById('mensagem-feedback');

  if (!formCadastro) return;

  // Evento ao enviar o formulário
  formCadastro.addEventListener('submit', (event) => {
    // Evita o recarregamento da página (Prevenção Padrão)
    event.preventDefault();

    // Captura dos valores
    const dataVal = campoData.value;
    const aguaVal = Number(campoAgua.value);
    const exercicioVal = campoExercicio.checked;
    const notasVal = campoNotas.value.trim();

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
    adicionarRegistro(novoRegistro);

    // Feedback de sucesso
    exibirFeedback('Registro cadastrado com sucesso!', 'sucesso');

    // Reseta o formulário
    formCadastro.reset();
  });

  /**
   * Exibe mensagens de alerta na tela
   */
  function exibirFeedback(texto, tipo) {
    msgFeedback.textContent = texto;
    msgFeedback.className = `feedback-msg ${tipo}`;

    // Remove a mensagem após 4 segundos
    setTimeout(() => {
      msgFeedback.className = 'feedback-msg hidden';
    }, 4000);
  }
});