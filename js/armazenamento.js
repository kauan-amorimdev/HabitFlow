const CHAVE_STORAGE = 'diario_habitos_dados';

/**
 * Recupera os registros salvos.
 * Se não houver nada, inicializa o LocalStorage com os dadosIniciais.
 */
function obterRegistros() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  
  if (!dados) {
    salvarRegistros(dadosIniciais);
    return dadosIniciais;
  }
  
  return JSON.parse(dados);
}

/**
 * Sobrescreve todo o array no LocalStorage.
 */
function salvarRegistros(registros) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(registros));
}

/**
 * Adiciona um novo registro e atualiza a base no LocalStorage.
 */
function adicionarRegistro(novoRegistro) {
  const registros = obterRegistros();
  registros.push(novoRegistro);
  salvarRegistros(registros);
  return registros;
}