const API_URL = 'http://localhost:3000/habitos';

document.addEventListener('DOMContentLoaded', () => {
  inicializarHistoricoEPainel();
});

async function carregarRegistros() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error('Erro ao buscar dados do servidor');
    return await resposta.json();
  } catch (erro) {
    console.error('Erro na requisição GET via API, tentando localStorage:', erro);
    
    // Fallback para localStorage/dados locais caso a API esteja offline
    if (typeof obterRegistros === 'function') return obterRegistros();
    if (typeof carregarDados === 'function') return carregarDados();

    const salvos = localStorage.getItem('habitflow_dados') 
                || localStorage.getItem('diario_habitos_dados') 
                || localStorage.getItem('registros');

    if (salvos) {
      return JSON.parse(salvos);
    }

    return typeof dadosIniciais !== 'undefined' ? dadosIniciais : [];
  }
}

async function inicializarHistoricoEPainel() {
  const registros = await carregarRegistros();

  // Garante que registros seja uma lista válida antes de ordenar
  if (Array.isArray(registros)) {
    registros.sort((a, b) => new Date(b.data) - new Date(a.data));

    const streak = calcularStreak(registros);
    const metasAtingidas = registros.filter(r => r.aguaConsumidaMl >= 2000 && r.exercicioFeito).length;

    // Salva o streak para persistência local
    localStorage.setItem('habitflow_streak', JSON.stringify(streak));

    document.getElementById('streak-count').textContent = streak;
    document.getElementById('metas-atingidas-count').textContent = metasAtingidas;
    document.getElementById('total-dias-count').textContent = registros.length;

    renderizarHistorico(registros);
  }
}

function calcularStreak(registros) {
  if (!registros || registros.length === 0) return 0;

  const diasComExercicio = registros
    .filter(r => r.exercicioFeito)
    .map(r => r.data)
    .sort((a, b) => new Date(b) - new Date(a));

  if (diasComExercicio.length === 0) return 0;

  let streak = 0;
  let dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);

  const ultimaDataExercicio = new Date(diasComExercicio[0] + 'T00:00:00');
  const diferencaDiasInicial = Math.floor((dataAtual - ultimaDataExercicio) / (1000 * 60 * 60 * 24));

  if (diferencaDiasInicial > 1) {
    return 0;
  }

  let dataReferencia = ultimaDataExercicio;
  for (let i = 0; i < diasComExercicio.length; i++) {
    const dataRegistro = new Date(diasComExercicio[i] + 'T00:00:00');
    const diff = Math.floor((dataReferencia - dataRegistro) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === 1) {
      streak++;
      dataReferencia = dataRegistro;
    } else {
      break;
    }
  }

  return streak;
}

function renderizarHistorico(registros) {
  const container = document.getElementById('lista-historico');
  if (!container) return;

  if (!registros || registros.length === 0) {
    container.innerHTML = `
      <li class="empty-state">
        <div class="empty-content">
          <span class="empty-icon">🌱</span>
          <h3>Aqui começa a sua jornada!</h3>
          <p>Ainda não há registros no seu histórico. Cadastre os hábitos do seu primeiro dia na aba <strong>Cadastro</strong> para acender a sua chama da ofensiva!</p>
        </div>
      </li>
    `;
    return;
  }

  const itensHTML = registros.map(reg => {
    const metaCompleta = reg.aguaConsumidaMl >= 2000 && reg.exercicioFeito;
    
    const partesData = reg.data ? reg.data.split('-') : [];
    const dataFormatada = partesData.length === 3 ? `${partesData[2]}/${partesData[1]}/${partesData[0]}` : reg.data;

    return `
      <li class="historico-item">
        <div>
          <span class="historico-data">${dataFormatada}</span>
          <div class="historico-detalhes">
            <span>💧 ${reg.aguaConsumidaMl || 0} ml</span>
            <span>💪 ${reg.exercicioFeito ? 'Exercício feito' : 'Sem exercício'}</span>
          </div>
        </div>
        <div>
          <span class="status-badge ${metaCompleta ? 'meta-sim' : 'meta-nao'}">
            ${metaCompleta ? '🎯 Meta Cumprida' : 'Incompleto'}
          </span>
        </div>
      </li>
    `;
  });

  container.innerHTML = itensHTML.join('');
}
