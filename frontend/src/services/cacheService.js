/**
 * Serviço de cache para melhorar a experiência offline e o desempenho da aplicação
 */

const CACHE_PREFIX = 'auto-eletrica-';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas padrão
const DEFAULT_CACHE_CONFIG = {
    vehicles: { ttl: CACHE_TTL * 3 }, // 3 dias
    diagrams: { ttl: CACHE_TTL * 7 }, // 7 dias
    brands: { ttl: CACHE_TTL * 14 }, // 14 dias
    user: { ttl: CACHE_TTL } // 1 dia
};

/**
 * Armazena dados no cache
 * @param {string} key - Chave do cache 
 * @param {any} data - Dados a serem armazenados
 * @param {object} options - Configurações opcionais
 * @param {number} options.ttl - Tempo de vida em milissegundos
 * @returns {boolean} - Sucesso da operação
 */
export const setCache = (key, data, options = {}) => {
    try {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const type = key.split('-')[0];
        const ttl = options.ttl || DEFAULT_CACHE_CONFIG[type]?.ttl || CACHE_TTL;

        const item = {
            data,
            expiry: Date.now() + ttl,
            timestamp: Date.now()
        };

        localStorage.setItem(cacheKey, JSON.stringify(item));
        return true;
    } catch (error) {
        console.error('Erro ao armazenar em cache:', error);
        return false;
    }
};

/**
 * Obtém dados do cache
 * @param {string} key - Chave do cache
 * @param {object} options - Configurações opcionais
 * @param {boolean} options.ignoreExpiry - Ignorar expiração (útil para modo offline)
 * @returns {any} - Dados armazenados ou null
 */
export const getCache = (key, options = {}) => {
    try {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const cachedItem = localStorage.getItem(cacheKey);

        if (!cachedItem) return null;

        const item = JSON.parse(cachedItem);

        // Verificar expiração, a menos que explicitamente ignorado
        if (!options.ignoreExpiry && Date.now() > item.expiry) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return item.data;
    } catch (error) {
        console.error('Erro ao recuperar do cache:', error);
        return null;
    }
};

/**
 * Remove item do cache
 * @param {string} key - Chave do cache
 * @returns {boolean} - Sucesso da operação
 */
export const removeCache = (key) => {
    try {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        localStorage.removeItem(cacheKey);
        return true;
    } catch (error) {
        console.error('Erro ao remover do cache:', error);
        return false;
    }
};

/**
 * Limpa todo o cache relacionado à aplicação
 * @returns {boolean} - Sucesso da operação
 */
export const clearAllCache = () => {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Erro ao limpar cache:', error);
        return false;
    }
};

/**
 * Verifica se o dispositivo está offline
 * @returns {boolean} - Status de conexão
 */
export const isOffline = () => {
    return !navigator.onLine;
};

/**
 * Realiza uma operação com fallback para cache
 * @param {Function} onlineOperation - Função a ser executada online
 * @param {string} cacheKey - Chave de cache para fallback
 * @param {object} options - Opções adicionais
 * @returns {Promise<any>} - Resultado da operação
 */
export const withCacheFallback = async (onlineOperation, cacheKey, options = {}) => {
    // Se estiver online, tenta executar a operação e cacheia o resultado
    if (!isOffline()) {
        try {
            const result = await onlineOperation();
            setCache(cacheKey, result, options);
            return result;
        } catch (error) {
            console.log('Erro na operação online, tentando cache:', error);
            // Em caso de erro, tenta retornar do cache
            const cachedData = getCache(cacheKey, { ignoreExpiry: true });
            if (cachedData) return cachedData;
            throw error;
        }
    }

    // Se estiver offline, usa dados em cache
    const cachedData = getCache(cacheKey, { ignoreExpiry: true });
    if (cachedData) {
        return cachedData;
    }

    throw new Error('Dispositivo está offline e não há dados em cache');
};

const cacheService = {
    setCache,
    getCache,
    removeCache,
    clearAllCache,
    isOffline,
    withCacheFallback
};

export default cacheService;
