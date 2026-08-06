// ==========================================
// MÓDULO DE REGISTROS
// Miniprojeto 2 - Etapa 1
// Responsável: editar (PUT) e remover (DELETE) via API
// ==========================================

const API_URL = 'http://localhost:3000/habitos';

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

/**
 * Traduz o erro para uma mensagem que o usuário entenda.
 * O fetch lança TypeError quando não consegue nem conectar no servidor.
 */
function mensagemDeErro(erro) {
  if (erro instanceof TypeError) {
    return 'Não foi possível conectar à API. Verifique se o json-server está rodando (npm run json-server).';
  }
  return erro.message;
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

/**
 * Mostra uma mensagem no lugar da lista (carregando ou erro).
 */
function mostrarMensagemNaLista(texto) {
  listaEl.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'vazio-msg';
  p.textContent = texto;
  listaEl.appendChild(p);
  contadorEl.textContent = '';
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
    removerRegistro(reg.id, btnRemover);
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

// ==========================================
// DELETE - remove o registro na API
// ==========================================
async function removerRegistro(id, botao) {
  const confirmar = window.confirm('Tem certeza que deseja remover este registro?');
  if (!confirmar) return;

  // Estado de carregamento: trava o botão durante a requisição
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Removendo...';
  }

  try {
    const resposta = await fetch(API_URL + '/' + id, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      throw new Error('Falha ao remover o registro (HTTP ' + resposta.status + ')');
    }

    // Só tira da lista da tela depois que a API confirmou a exclusão.
    // Comparação com String: o json-server usa ids em texto.
    registros = registros.filter(function (reg) {
      return String(reg.id) !== String(id);
    });

    renderizar();
    mostrarFeedback('Registro removido com sucesso.', 'sucesso');
  } catch (erro) {
    console.error('Erro no DELETE:', erro);
    mostrarFeedback(mensagemDeErro(erro), 'erro');

    // Devolve o botão ao normal para o usuário poder tentar de novo
    if (botao) {
      botao.disabled = false;
      botao.textContent = 'Remover';
    }
  }
}

function abrirModalEdicao(id) {
  const reg = registros.find(function (r) {
    return String(r.id) === String(id);
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

// ==========================================
// PUT - envia o registro editado para a API
// ==========================================
async function salvarEdicao(evento) {
  evento.preventDefault();

  // O id vem como texto do input hidden. NÃO converter para Number:
  // o json-server gera ids em string (ex: "a1b2c3").
  const id   = editarIdEl.value;
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
  if (agua > 10000) {
    mostrarFeedback('Valor de água inválido. Máximo permitido: 10.000ml.', 'erro');
    return;
  }

  const botaoSalvar = formEditarEl.querySelector('button[type="submit"]');
  const textoOriginal = botaoSalvar ? botaoSalvar.textContent : 'Salvar';
  if (botaoSalvar) {
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando...';
  }

  const registroAtualizado = {
    id: id,
    data: data,
    aguaConsumidaMl: agua,
    exercicioFeito: editarExercicioEl.checked,
    notas: editarNotasEl.value.trim()
  };

  try {
    const resposta = await fetch(API_URL + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registroAtualizado)
    });

    if (!resposta.ok) {
      throw new Error('Falha ao atualizar o registro (HTTP ' + resposta.status + ')');
    }

    const salvo = await resposta.json();

    // Atualiza a lista da tela com o que a API devolveu
    registros = registros.map(function (reg) {
      return String(reg.id) === String(id) ? salvo : reg;
    });

    renderizar();
    fecharModal();
    mostrarFeedback('Registro atualizado com sucesso.', 'sucesso');
  } catch (erro) {
    console.error('Erro no PUT:', erro);
    mostrarFeedback(mensagemDeErro(erro), 'erro');
  } finally {
    if (botaoSalvar) {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = textoOriginal;
    }
  }
}

buscaEl.addEventListener('input', renderizar);
filtroTipoEl.addEventListener('change', renderizar);
formEditarEl.addEventListener('submit', salvarEdicao);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);

modalEl.addEventListener('click', function (e) {
  if (e.target === modalEl) fecharModal();
});

// ==========================================
// GET - carrega a lista da API ao abrir a página
// (necessário para editar/remover: os ids têm que ser
//  os mesmos que existem no servidor)
// ==========================================
async function iniciar() {
  mostrarMensagemNaLista('Carregando registros...');

  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error('Falha ao buscar os registros (HTTP ' + resposta.status + ')');
    }

    registros = await resposta.json();
    renderizar();
  } catch (erro) {
    console.error('Erro no GET:', erro);
    registros = [];
    mostrarMensagemNaLista(mensagemDeErro(erro));
  }
}

iniciar();
