import axios from 'axios';
import cacheService from './cacheService';

// Intervalo de sincronização em milissegundos (padrão: 1 hora)
const SYNC_INTERVAL = 60 * 60 * 1000;

// Status de sincronização
let lastSyncTimestamp = 0;
let isInitialized = false;
let syncInterval = null;

// Eventos de sincronização
const syncListeners = {
    onSyncStart: [],
    onSyncComplete: [],
    onSyncError: [],
    onNewContent: []
};

// Adicionar ouvintes de eventos
export const addSyncListener = (event, callback) => {
    if (syncListeners[event]) {
        syncListeners[event].push(callback);
        return true;
    }
    return false;
};

// Remover ouvintes de eventos
export const removeSyncListener = (event, callback) => {
    if (syncListeners[event] && syncListeners[event].includes(callback)) {
        syncListeners[event] = syncListeners[event].filter(cb => cb !== callback);
        return true;
    }
    return false;
};

// Disparar eventos
const triggerEvent = (event, data) => {
    if (syncListeners[event]) {
        syncListeners[event].forEach(callback => callback(data));
    }
};

/**
 * Sincroniza dados com o servidor
 * @param {object} options - Configurações da sincronização
 * @param {string} options.endpoint - Endpoint da API para sincronização
 * @param {string} options.cacheKey - Chave para armazenamento em cache
 * @param {boolean} options.force - Forçar sincronização mesmo se recente
 * @returns {Promise<object>} - Resultado da sincronização
 */
export const syncData = async (options) => {
    const {
        endpoint = '/api/diagrams/sync',
        cacheKey = 'diagrams',
        force = false
    } = options;

    // Evitar sincronização redundante em curto espaço de tempo
    const now = Date.now();
    if (!force && now - lastSyncTimestamp < SYNC_INTERVAL) {
        console.log('Sincronização recente, pulando...');
        return { skipped: true };
    }

    // Verificar conexão com a internet
    if (cacheService.isOffline()) {
        console.log('Dispositivo offline, usando dados em cache');
        triggerEvent('onSyncError', { message: 'Dispositivo offline, usando dados em cache' });
        return { offline: true };
    }

    try {
        triggerEvent('onSyncStart', { type: cacheKey });

        // Obter timestamp da última sincronização
        const lastSyncKey = `${cacheKey}-lastSync`;
        const storedLastSync = localStorage.getItem(lastSyncKey) || '0';

        // Buscar conteúdo atualizado desde a última sincronização
        const response = await axios.get(endpoint, {
            params: { lastSync: storedLastSync }
        });

        // Armazenar dados no localStorage
        if (response.data.success) {
            const newItems = response.data.data || [];

            // Atualizar timestamp de sincronização
            lastSyncTimestamp = now;
            localStorage.setItem(lastSyncKey, now.toString());

            // Se há novos itens, processar e armazenar em cache
            if (newItems.length > 0) {
                console.log(`${newItems.length} novos itens disponíveis para ${cacheKey}`);

                // Mesclar com dados em cache existentes
                const cachedItems = cacheService.getCache(cacheKey) || [];
                const mergedItems = mergeData(cachedItems, newItems);

                // Salvar no cache aprimorado
                cacheService.setCache(cacheKey, mergedItems);

                // Notificar ouvintes
                triggerEvent('onNewContent', { type: cacheKey, items: newItems });
            }

            // Se não há novos itens, mas também não temos nada em cache,
            // podemos fazer uma busca completa inicial
            else if (!(cacheService.getCache(cacheKey))) {
                const fullDataResponse = await axios.get(endpoint.replace('/sync', ''));
                if (fullDataResponse.data.success) {
                    const items = fullDataResponse.data.data || [];
                    cacheService.setCache(cacheKey, items);
                }
            }

            triggerEvent('onSyncComplete', {
                type: cacheKey,
                timestamp: now,
                newItems: newItems.length
            });

            return {
                success: true,
                newItems: newItems.length,
                timestamp: now
            };
        } else {
            throw new Error(response.data.message || 'Erro na sincronização');
        }
    } catch (error) {
        console.error(`Erro ao sincronizar ${cacheKey}:`, error);

        triggerEvent('onSyncError', {
            type: cacheKey,
            error: error.message,
            timestamp: now
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Fazer download automático de diagramas em segundo plano com cache aprimorado
 * @param {Array} diagramIds - IDs dos diagramas para download
 * @returns {Promise<void>}
 */
export const downloadDiagramsInBackground = async (diagramIds) => {
    if (!diagramIds || diagramIds.length === 0) return;

    try {
        console.log(`Baixando ${diagramIds.length} diagramas em segundo plano...`);

        // Obter lista de downloads pendentes
        const pendingDownloadsKey = 'diagrams-pending-downloads';
        const pendingDownloads = cacheService.getCache(pendingDownloadsKey) || [];

        // Adicionar novos diagramas à lista de downloads pendentes
        diagramIds.forEach(id => {
            if (!pendingDownloads.includes(id)) {
                pendingDownloads.push(id);
            }
        });

        cacheService.setCache(pendingDownloadsKey, pendingDownloads);

        // Processar um download por vez para não sobrecarregar
        const processNextDownload = async () => {
            // Obter lista atualizada
            const currentPending = cacheService.getCache(pendingDownloadsKey) || [];

            if (currentPending.length === 0) return;

            // Obter próximo diagrama para download
            const nextId = currentPending.shift();
            cacheService.setCache(pendingDownloadsKey, currentPending);

            try {
                // Verificar se já temos este diagrama em cache
                const diagramDownloads = cacheService.getCache('diagrams-downloads') || {};
                const cachedItem = diagramDownloads[nextId];

                // Se já temos este diagrama e ele não é muito antigo, pular
                if (cachedItem && Date.now() - cachedItem.timestamp < 7 * 24 * 60 * 60 * 1000) {
                    console.log(`Diagrama ${nextId} já em cache, pulando download`);

                    // Continuar para o próximo download
                    if (currentPending.length > 0) {
                        setTimeout(processNextDownload, 1000);
                    }
                    return;
                }

                // Fazer download do diagrama
                const response = await axios.get(`/api/diagrams/${nextId}/download`, {
                    responseType: 'blob'
                });

                // Armazenar no cache
                const blob = new Blob([response.data]);

                // Armazenar URL do blob
                const url = URL.createObjectURL(blob);
                diagramDownloads[nextId] = {
                    url,
                    timestamp: Date.now(),
                    size: blob.size
                };

                cacheService.setCache('diagrams-downloads', diagramDownloads, { ttl: 30 * 24 * 60 * 60 * 1000 });
                console.log(`Download do diagrama ${nextId} concluído`);

                // Continuar para o próximo download
                if (currentPending.length > 0) {
                    setTimeout(processNextDownload, 2000); // Intervalo de 2 segundos entre downloads
                }
            } catch (error) {
                console.error(`Erro ao baixar diagrama ${nextId}:`, error);
                // Continuar para o próximo mesmo em caso de erro
                if (currentPending.length > 0) {
                    setTimeout(processNextDownload, 2000);
                }
            }
        };

        // Iniciar processamento de downloads
        processNextDownload();

    } catch (error) {
        console.error('Erro ao iniciar downloads em segundo plano:', error);
    }
};

/**
 * Sincroniza diagramas com o servidor (função legada mantida para compatibilidade)
 */
export const syncDiagrams = async (force = false) => {
    return syncData({
        endpoint: '/api/diagrams/sync',
        cacheKey: 'diagrams',
        force
    });
};

/**
 * Sincroniza veículos com o servidor
 */
export const syncVehicles = async (force = false) => {
    return syncData({
        endpoint: '/api/vehicles/sync',
        cacheKey: 'vehicles',
        force
    });
};

/**
 * Sincroniza marcas com o servidor
 */
export const syncBrands = async (force = false) => {
    return syncData({
        endpoint: '/api/brands/sync',
        cacheKey: 'brands',
        force
    });
};

/**
 * Inicializa o serviço de sincronização
 * @param {boolean} runImmediate - Executar sincronização imediatamente
 */
export const initSyncService = (runImmediate = false) => {
    if (isInitialized) return;

    console.log('Inicializando serviço de sincronização...');

    // Configurar intervalo de sincronização
    syncInterval = setInterval(async () => {
        console.log('Executando sincronização automática');
        await Promise.all([
            syncDiagrams(),
            syncVehicles(),
            syncBrands()
        ]);
    }, SYNC_INTERVAL);

    // Sincronizar imediatamente se solicitado
    if (runImmediate) {
        Promise.all([
            syncDiagrams(true),
            syncVehicles(true),
            syncBrands(true)
        ]).then(([diagramResult]) => {
            if (diagramResult.success && diagramResult.newItems > 0) {
                // Se houver novos diagramas, verificar se devemos baixá-los automaticamente
                const shouldAutoDownload = cacheService.getCache('settings-autoDownload') || false;

                if (shouldAutoDownload) {
                    // Obter diagramas em cache
                    const cachedDiagrams = cacheService.getCache('diagrams') || [];

                    // Filtrar apenas os diagramas elétricos para download automático
                    const electricalDiagrams = cachedDiagrams
                        .filter(diagram => diagram.type === 'electrical')
                        .map(diagram => diagram._id);

                    if (electricalDiagrams.length > 0) {
                        downloadDiagramsInBackground(electricalDiagrams);
                    }
                }
            }
        });
    }

    // Configurar detecção de estado online/offline
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    isInitialized = true;
};

/**
 * Finaliza o serviço de sincronização
 */
export const stopSyncService = () => {
    if (!isInitialized) return;

    clearInterval(syncInterval);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    isInitialized = false;
};

// Manipuladores de eventos de conectividade
const handleOnline = () => {
    console.log('Dispositivo online, sincronizando dados...');
    Promise.all([
        syncDiagrams(true),
        syncVehicles(true),
        syncBrands(true)
    ]);
};

const handleOffline = () => {
    console.log('Dispositivo offline, usando dados em cache');
    triggerEvent('onSyncError', { message: 'Dispositivo offline, usando dados em cache' });
};

// Função auxiliar para mesclar dados novos com dados existentes
const mergeData = (existingItems, newItems) => {
    const result = [...existingItems];

    newItems.forEach(newItem => {
        const existingIndex = result.findIndex(item => item._id === newItem._id);
        if (existingIndex >= 0) {
            result[existingIndex] = newItem; // Atualizar item existente
        } else {
            result.push(newItem); // Adicionar novo item
        }
    });

    return result;
};

/**
 * Obtém dados armazenados em cache com fallback para API
 * @param {string} type - Tipo de dado (diagrams, vehicles, brands)
 * @param {string} endpoint - Endpoint da API para busca
 * @param {object} options - Opções adicionais
 */
export const getCachedData = async (type, endpoint, options = {}) => {
    return cacheService.withCacheFallback(
        async () => {
            const response = await axios.get(endpoint);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Erro ao buscar dados');
        },
        type,
        options
    );
};

/**
 * Verifica se o download automático está ativado
 * @returns {boolean} Status da configuração
 */
export const isAutoDownloadEnabled = () => {
    return cacheService.getCache('settings-autoDownload') || false;
};

/**
 * Ativa ou desativa download automático
 * @param {boolean} enabled - Estado da configuração
 */
export const setAutoDownload = (enabled) => {
    cacheService.setCache('settings-autoDownload', enabled);
};

/**
 * Obtém diagramas do cache (função legada para compatibilidade)
 * @param {object} filter - Filtros a serem aplicados
 * @returns {Array} - Diagramas filtrados
 */
export const getCachedDiagrams = (filter = {}) => {
    const diagrams = cacheService.getCache('diagrams') || [];

    // Aplicar filtros se existirem
    if (Object.keys(filter).length > 0) {
        return diagrams.filter(diagram => {
            return Object.keys(filter).every(key => {
                if (filter[key] === undefined || filter[key] === '') return true;
                return diagram[key] === filter[key];
            });
        });
    }

    return diagrams;
};

// Exportar como default para compatibilidade
const syncServiceExports = {
    syncData,
    syncDiagrams,
    syncVehicles,
    syncBrands,
    initSyncService,
    stopSyncService,
    addSyncListener,
    removeSyncListener,
    getCachedData,
    getCachedDiagrams,
    isAutoDownloadEnabled,
    setAutoDownload,
    downloadDiagramsInBackground
};

export default syncServiceExports;
