import axios from 'axios';
import { getCache, setCache } from './cacheService';

/**
 * Baixa um diagrama e salva em cache
 * @param {string} diagramId - ID do diagrama
 * @param {boolean} forceDownload - Forçar download mesmo se já existir em cache
 * @returns {Promise<object>} - Informações do diagrama baixado
 */
export const downloadDiagram = async (diagramId, forceDownload = false) => {
    try {
        // Verificar se já está em cache
        const cachedDiagram = getCache(`diagram-download-${diagramId}`);
        if (cachedDiagram && !forceDownload) {
            return {
                success: true,
                data: cachedDiagram,
                fromCache: true
            };
        }

        // Baixar do servidor
        const response = await axios.get(`/api/diagrams/${diagramId}/download`, {
            responseType: 'blob'
        });

        // Criar URL do blob
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);

        // Extrair informações do header
        const contentDisposition = response.headers['content-disposition'] || '';
        const filename = contentDisposition.split('filename=')[1] || `diagram-${diagramId}.pdf`;
        const contentType = response.headers['content-type'] || 'application/pdf';

        // Salvar em cache
        const diagramData = {
            id: diagramId,
            url,
            blob,
            filename,
            contentType,
            downloadedAt: new Date()
        };

        setCache(`diagram-download-${diagramId}`, diagramData, { ttl: 7 * 24 * 60 * 60 * 1000 }); // 7 dias

        return {
            success: true,
            data: diagramData,
            fromCache: false
        };
    } catch (error) {
        console.error('Erro ao baixar diagrama:', error);
        return {
            success: false,
            error: error.message || 'Erro ao baixar diagrama'
        };
    }
};

/**
 * Abre um diagrama para visualização
 * @param {object} diagramData - Dados do diagrama (do cache ou download)
 */
export const openDiagram = (diagramData) => {
    if (!diagramData || !diagramData.url) {
        console.error('Dados do diagrama inválidos');
        return false;
    }

    // Abrir em uma nova janela
    window.open(diagramData.url, '_blank');
    return true;
};

/**
 * Salva um diagrama no dispositivo do usuário
 * @param {object} diagramData - Dados do diagrama (do cache ou download)
 */
export const saveDiagram = (diagramData) => {
    if (!diagramData || !diagramData.url || !diagramData.blob) {
        console.error('Dados do diagrama inválidos');
        return false;
    }

    // Criar elemento de link
    const link = document.createElement('a');
    link.href = diagramData.url;
    link.download = diagramData.filename || `diagram-${diagramData.id}.pdf`;

    // Adicionar à página, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
};

/**
 * Obter lista de diagramas baixados
 * @returns {Array} - Lista de diagramas baixados
 */
export const getDownloadedDiagrams = () => {
    // Buscar todos os itens que começam com "diagram-download-"
    const downloadedDiagrams = [];

    // Lista de chaves em localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auto-eletrica-diagram-download-')) {
            try {
                const item = getCache(key.replace('auto-eletrica-', ''));
                if (item) {
                    downloadedDiagrams.push(item);
                }
            } catch (error) {
                console.error(`Erro ao ler diagrama em cache: ${key}`, error);
            }
        }
    }

    return downloadedDiagrams.sort((a, b) =>
        new Date(b.downloadedAt) - new Date(a.downloadedAt)
    );
};

/**
 * Limpar diagramas baixados do cache
 * @param {string} diagramId - ID do diagrama (opcional, se não informado limpa todos)
 */
export const clearDownloadedDiagrams = (diagramId = null) => {
    if (diagramId) {
        // Limpar um diagrama específico
        const key = `diagram-download-${diagramId}`;
        try {
            const item = getCache(key);
            if (item && item.url) {
                URL.revokeObjectURL(item.url);
            }
        } catch (error) {
            console.error(`Erro ao revogar URL do diagrama: ${diagramId}`, error);
        }

        localStorage.removeItem(`auto-eletrica-${key}`);
        return;
    }

    // Limpar todos os diagramas
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auto-eletrica-diagram-download-')) {
            try {
                const rawData = localStorage.getItem(key);
                const data = JSON.parse(rawData);
                if (data && data.data && data.data.url) {
                    URL.revokeObjectURL(data.data.url);
                }
            } catch (error) {
                console.error(`Erro ao revogar URL do diagrama: ${key}`, error);
            }

            localStorage.removeItem(key);
            i--; // Ajustar índice após remoção
        }
    }
};

export default {
    downloadDiagram,
    openDiagram,
    saveDiagram,
    getDownloadedDiagrams,
    clearDownloadedDiagrams
};
