import axios from 'axios';
import cacheService from './cacheService';

const DOWNLOAD_CACHE_KEY = 'diagram_downloads';
const DOWNLOAD_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Serviço para gerenciar downloads de diagramas com suporte a cache
 */
const downloadService = {
    /**
     * Realiza o download de um diagrama e o armazena em cache
     * @param {string} diagramId - ID do diagrama
     * @param {string} filename - Nome do arquivo para download
     * @returns {Promise} - Promise com resultado do download
     */
    downloadDiagram: async (diagramId, filename) => {
        try {
            // Verificar se já temos o diagrama em cache
            const cachedDownloads = cacheService.get(DOWNLOAD_CACHE_KEY) || {};

            if (cachedDownloads[diagramId]) {
                console.log('Usando diagrama em cache para download:', diagramId);
                // Se temos em cache, retornar o objeto armazenado
                return {
                    success: true,
                    message: 'Download do cache',
                    data: cachedDownloads[diagramId],
                    fromCache: true
                };
            }

            // Se não temos em cache, buscar do servidor
            const response = await axios.get(`/api/diagrams/${diagramId}/download`, {
                responseType: 'blob'
            });

            // Criar URL para o blob recebido
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || `diagrama-${diagramId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Armazenar em cache
            cachedDownloads[diagramId] = {
                id: diagramId,
                downloadedAt: new Date().toISOString(),
                filename: filename || `diagrama-${diagramId}.pdf`
            };

            cacheService.set(DOWNLOAD_CACHE_KEY, cachedDownloads, DOWNLOAD_TTL);

            return {
                success: true,
                message: 'Download realizado com sucesso',
                data: cachedDownloads[diagramId]
            };
        } catch (error) {
            console.error('Erro ao realizar download:', error);
            return {
                success: false,
                message: 'Falha ao realizar download. Verifique sua conexão.',
                error: error.message
            };
        }
    },

    /**
     * Verifica se um diagrama já foi baixado
     * @param {string} diagramId - ID do diagrama
     * @returns {boolean} - True se já foi baixado
     */
    hasDownloaded: (diagramId) => {
        const cachedDownloads = cacheService.get(DOWNLOAD_CACHE_KEY) || {};
        return !!cachedDownloads[diagramId];
    },

    /**
     * Obtém informações sobre downloads de diagramas
     * @returns {Object} - Objeto com informações de downloads
     */
    getDownloadInfo: () => {
        return cacheService.get(DOWNLOAD_CACHE_KEY) || {};
    },

    /**
     * Limpa o cache de downloads
     */
    clearDownloadCache: () => {
        cacheService.remove(DOWNLOAD_CACHE_KEY);
    }
};

export default downloadService;
