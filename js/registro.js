let registros = [];
let feedbackTimeout = null;

const META_AGUA = 2000;
const listaEl      = document.getElementById('lista-registros');
const buscaEl      = document.getElementById('campo-busca');
const filtroTipoEl = document.getElementById('filtro-tipo');
const contadorEl   = document.getElementById('contador-registros');
const feedbackEl   = document.getElementById('mensagem-feedback');
const modalEl           = document.getElementById('modal-editar');
const formEditarEl      = document.getElementById('form-editar');
const editarIdEl        = document.getElementById('editar-id');
const editarDataEl      = document.getElementById('editar-data');
const editarAguaEl      = document.getElementById('editar-agua');
const editarExercicioEl = document.getElementById('editar-exercicio');
const editarNotasEl     = document.getElementById('editar-notas');
function obterRegistros() {
  if (typeof carregarDados === 'function') {
    return carregarDados();
  }
  const salvos = localStorage.getItem('habitflow_dados');
  if (salvos) return JSON.parse(salvos);
  return (typeof dadosIniciais !== 'undefined') ? [...dadosIniciais] : [];
}

function persistir() {
  if (typeof salvarDados === 'function') {
    salvarDados(registros);
  } else {
    localStorage.setItem('habitflow_dados', JSON.stringify(registros));
  }
}
function mostrarFeedback(texto, tipo) {
  feedbackEl.textContent = texto;
  feedbackEl.className = 'feedback-msg ' + tipo;
  feedbackEl.classList.remove('hidden');

  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(function () {
    feedbackEl.classList.add('hidden');
  }, 3000);
}

function aplicarFiltros(lista) {
  const termo = buscaEl.value.trim().toLowerCase();
  const tipo  = filtroTipoEl.value;

  return lista
    .filter(function (reg) {
      if (!termo) return true;
      const notas = (reg.notas || '').toLowerCase();
      const data  = (reg.data  || '').toLowerCase();
      return notas.includes(termo) || data.includes(termo);
    })
    .filter(function (reg) {
      switch (tipo) {
        case 'com-exercicio': return reg.exercicioFeito === true;
        case 'sem-exercicio': return reg.exercicioFeito === false;
        case 'meta-agua':     return reg.aguaConsumidaMl >= META_AGUA;
        default:              return true;
      }
    });
}

function formatarData(dataIso) {
  if (!dataIso) return '';
  const partes = dataIso.split('-');
  if (partes.length !== 3) return dataIso;
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function criarCard(reg) {
  const card = document.createElement('div');
  card.className = 'registro-card';

  const header = document.createElement('div');
  header.className = 'registro-header';

  const dataSpan = document.createElement('span');
  dataSpan.className = 'registro-data';
  dataSpan.textContent = formatarData(reg.data);

  const badges = document.createElement('div');
  badges.className = 'badges';

  const bateuMeta = reg.aguaConsumidaMl >= META_AGUA;
  const badgeAgua = document.createElement('span');
  badgeAgua.className = 'badge badge-agua' + (bateuMeta ? ' meta' : '');
  badgeAgua.textContent = '💧 ' + reg.aguaConsumidaMl + 'ml' + (bateuMeta ? ' ✓' : '');

  const badgeEx = document.createElement('span');
  if (reg.exercicioFeito) {
    badgeEx.className = 'badge badge-exercicio-sim';
    badgeEx.textContent = '🏃 Exercício';
  } else {
    badgeEx.className = 'badge badge-exercicio-nao';
    badgeEx.textContent = 'Sem exercício';
  }

  badges.appendChild(badgeAgua);
  badges.appendChild(badgeEx);
  header.appendChild(dataSpan);
  header.appendChild(badges);

  const notas = document.createElement('p');
  if (reg.notas && reg.notas.trim()) {
    notas.className = 'registro-notas';
    notas.textContent = reg.notas;
  } else {
    notas.className = 'registro-notas vazio';
    notas.textContent = 'Sem notas para este dia.';
  }

  const acoes = document.createElement('div');
  acoes.className = 'registro-acoes';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'btn-acao btn-editar';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function () {
    abrirModalEdicao(reg.id);
  });

  const btnRemover = document.createElement('button');
  btnRemover.className = 'btn-acao btn-remover';
  btnRemover.textContent = 'Remover';
  btnRemover.addEventListener('click', function () {
    removerRegistro(reg.id);
  });

  acoes.appendChild(btnEditar);
  acoes.appendChild(btnRemover);

  card.appendChild(header);
  card.appendChild(notas);
  card.appendChild(acoes);
  return card;
}

function renderizar() {
  listaEl.innerHTML = '';

  const filtrados = aplicarFiltros(registros);

  filtrados.sort(function (a, b) {
    return (a.data < b.data) ? 1 : -1;
  });

  contadorEl.textContent =
    filtrados.length + ' de ' + registros.length + ' registro(s)';

  if (filtrados.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'vazio-msg';
    vazio.textContent = (registros.length === 0)
      ? 'Nenhum registro ainda. Adicione hábitos na página de Cadastro.'
      : 'Nenhum registro encontrado para essa pesquisa.';
    listaEl.appendChild(vazio);
    return;
  }

  filtrados.forEach(function (reg) {
    listaEl.appendChild(criarCard(reg));
  });
}

function removerRegistro(id) {
  const confirmar = window.confirm('Tem certeza que deseja remover este registro?');
  if (!confirmar) return;

  registros = registros.filter(function (reg) {
    return reg.id !== id;
  });

  persistir();
  renderizar();
  mostrarFeedback('Registro removido com sucesso.', 'sucesso');
}

function abrirModalEdicao(id) {
  const reg = registros.find(function (r) {
    return r.id === id;
  });
  if (!reg) return;

  editarIdEl.value          = reg.id;
  editarDataEl.value        = reg.data;
  editarAguaEl.value        = reg.aguaConsumidaMl;
  editarExercicioEl.checked = reg.exercicioFeito;
  editarNotasEl.value       = reg.notas || '';

  modalEl.classList.remove('hidden');
}

function fecharModal() {
  modalEl.classList.add('hidden');
}

function salvarEdicao(evento) {
  evento.preventDefault();

  const id   = Number(editarIdEl.value);
  const data = editarDataEl.value;
  const agua = Number(editarAguaEl.value);

  if (!data) {
    mostrarFeedback('Informe uma data válida.', 'erro');
    return;
  }
  if (isNaN(agua) || agua < 0) {
    mostrarFeedback('A água consumida deve ser 0 ou mais.', 'erro');
    return;
  }

  registros = registros.map(function (reg) {
    if (reg.id === id) {
      return {
        ...reg,
        data: data,
        aguaConsumidaMl: agua,
        exercicioFeito: editarExercicioEl.checked,
        notas: editarNotasEl.value.trim()
      };
    }
    return reg;
  });

  persistir();
  renderizar();
  fecharModal();
  mostrarFeedback('Registro atualizado com sucesso.', 'sucesso');
}

buscaEl.addEventListener('input', renderizar);
filtroTipoEl.addEventListener('change', renderizar);
formEditarEl.addEventListener('submit', salvarEdicao);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);

modalEl.addEventListener('click', function (e) {
  if (e.target === modalEl) fecharModal();
});

function iniciar() {
  registros = obterRegistros();
  renderizar();
}

iniciar();