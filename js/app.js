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

    // Reseta o formulário e restaura a data de hoje
    formCadastro.reset();
    campoData.value = hoje;
  });

  /**
   * Exibe mensagens de alerta na tela com controle de temporizador
   */
  function exibirFeedback(texto, tipo) {
    if (tempoFeedback) clearTimeout(tempoFeedback);

    msgFeedback.textContent = texto;
    msgFeedback.className = `feedback-msg ${tipo}`;

    tempoFeedback = setTimeout(() => {
      msgFeedback.className = 'feedback-msg hidden';
    }, 4000);
  }
});