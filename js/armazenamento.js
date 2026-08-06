// ==========================================
// CAMADA DE ACESSO À API REST & LOCALSTORAGE
// Branch: feature/base-cadastro
// ==========================================

const HABIT_API_URL = "http://localhost:3000/habitos";
const CHAVE_LOCAL = "diario_habitos_dados";

/**
 * Utilitários para manipular o LocalStorage como backup/fallback
 */
function obterLocal() {
  const dados = localStorage.getItem(CHAVE_LOCAL);
  if (!dados && typeof dadosIniciais !== 'undefined') {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(dadosIniciais));
    return dadosIniciais;
  }
  return dados ? JSON.parse(dados) : [];
}

function salvarLocal(registros) {
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(registros));
}

/**
 * GET
 * Busca todos os registros na API. Em caso de falha, recupera do LocalStorage.
 */
async function obterRegistros() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error(`Erro ao buscar registros: ${resposta.status}`);
    }

    const registros = await resposta.json();
    salvarLocal(registros); // Atualiza o cache local
    return registros;
  } catch (erro) {
    console.warn("Falha ao buscar da API (usando LocalStorage):", erro);
    return obterLocal();
  }
}

/**
 * POST
 * Adiciona um novo registro na API e salva no LocalStorage.
 */
async function adicionarRegistro(novoRegistro) {
  try {
    const resposta = await fetch(HABIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(novoRegistro)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao adicionar registro: ${resposta.status}`);
    }

    const registroSalvo = await resposta.json();

    // Sincroniza localmente
    const locais = obterLocal();
    locais.push(registroSalvo);
    salvarLocal(locais);

    return registroSalvo;
  } catch (erro) {
    console.warn("Falha no POST da API (salvando apenas localmente):", erro);

    // Adiciona ID temporário no padrão string se offline
    const registroOffline = { ...novoRegistro, id: String(Date.now()) };
    const locais = obterLocal();
    locais.push(registroOffline);
    salvarLocal(locais);

    return registroOffline;
  }
}

/**
 * PUT
 * Atualiza um registro na API e no LocalStorage.
 */
async function atualizarRegistro(id, registroAtualizado) {
  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registroAtualizado)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao atualizar registro: ${resposta.status}`);
    }

    const itemAtualizado = await resposta.json();

    // Sincroniza localmente
    const locais = obterLocal().map(item => item.id == id ? itemAtualizado : item);
    salvarLocal(locais);

    return itemAtualizado;
  } catch (erro) {
    console.warn("Falha no PUT da API (atualizando apenas localmente):", erro);

    const locais = obterLocal().map(item => item.id == id ? { ...registroAtualizado, id } : item);
    salvarLocal(locais);

    return { ...registroAtualizado, id };
  }
}

/**
 * DELETE
 * Exclui um registro na API e do LocalStorage.
 */
async function excluirRegistro(id) {
  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao excluir registro: ${resposta.status}`);
    }

    // Sincroniza localmente
    const locais = obterLocal().filter(item => item.id != id);
    salvarLocal(locais);

    return true;
  } catch (erro) {
    console.warn("Falha no DELETE da API (removendo apenas localmente):", erro);

    const locais = obterLocal().filter(item => item.id != id);
    salvarLocal(locais);

    return true;
  }
}
