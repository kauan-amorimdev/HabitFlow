// ==========================================
// CAMADA DE ACESSO À API REST
// json-server
// ==========================================

const API_URL = "http://localhost:3000/habitos";

/**
 * GET
 * Busca todos os registros de hábitos na API.
 */
async function obterRegistros() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(
                `Erro ao buscar registros: ${resposta.status}`
            );
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Erro na requisição GET:", erro);
        throw erro;
    }
}

/**
 * POST
 * Adiciona um novo registro na API.
 */
async function adicionarRegistro(novoRegistro) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoRegistro)
        });

        if (!resposta.ok) {
            throw new Error(
                `Erro ao adicionar registro: ${resposta.status}`
            );
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Erro na requisição POST:", erro);
        throw erro;
    }
}

/**
 * PUT
 * Atualiza completamente um registro existente.
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
            throw new Error(
                `Erro ao atualizar registro: ${resposta.status}`
            );
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Erro na requisição PUT:", erro);
        throw erro;
    }
}

/**
 * DELETE
 * Exclui um registro pelo ID.
 */
async function excluirRegistro(id) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error(
                `Erro ao excluir registro: ${resposta.status}`
            );
        }

        return true;
    } catch (erro) {
        console.error("Erro na requisição DELETE:", erro);
        throw erro;
    }
}