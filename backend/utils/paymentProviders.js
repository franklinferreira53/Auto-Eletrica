/**
 * Módulo de integração com gateways de pagamento
 * Suporte para InfinitePay e Asaas
 */

const axios = require('axios');

/**
 * Configuração das APIs de pagamento
 * Substitua por suas chaves reais de produção
 */
const PAYMENT_CONFIG = {
    infinitePay: {
        apiKey: 'API_KEY_INFINITEPAY', // Substitua pela sua chave real
        apiUrl: 'https://api.infinitepay.io',
        sandbox: true
    },
    asaas: {
        apiKey: 'API_KEY_ASAAS', // Substitua pela sua chave real
        apiUrl: 'https://sandbox.asaas.com/api/v3',
        sandbox: true
    }
};

/**
 * Cliente HTTP para a InfinitePay
 */
const infinitePayClient = axios.create({
    baseURL: PAYMENT_CONFIG.infinitePay.apiUrl,
    headers: {
        'Authorization': `Bearer ${PAYMENT_CONFIG.infinitePay.apiKey}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Cliente HTTP para a Asaas
 */
const asaasClient = axios.create({
    baseURL: PAYMENT_CONFIG.asaas.apiUrl,
    headers: {
        'access_token': PAYMENT_CONFIG.asaas.apiKey,
        'Content-Type': 'application/json'
    }
});

/**
 * Gera uma cobrança usando a InfinitePay
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resposta da API
 */
const createInfinitePayCharge = async (paymentData) => {
    try {
        const payload = {
            amount: paymentData.amount,
            currency: 'BRL',
            description: paymentData.description,
            capture: true,
            customer: {
                name: paymentData.customerName,
                email: paymentData.customerEmail,
                taxId: paymentData.customerDocument
            },
            paymentMethod: paymentData.paymentMethod || 'credit_card'
        };

        if (paymentData.cardToken) {
            payload.card = {
                token: paymentData.cardToken
            };
        }

        const response = await infinitePayClient.post('/charges', payload);
        return response.data;
    } catch (error) {
        console.error('Erro ao gerar cobrança na InfinitePay:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gera uma cobrança usando a Asaas
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resposta da API
 */
const createAsaasCharge = async (paymentData) => {
    try {
        const payload = {
            customer: paymentData.customerId || null,
            billingType: paymentData.paymentMethod || 'CREDIT_CARD',
            value: paymentData.amount,
            dueDate: paymentData.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
            description: paymentData.description,
            externalReference: paymentData.reference
        };

        // Se o cliente não existir, criar um novo
        if (!payload.customer) {
            const customerResponse = await asaasClient.post('/customers', {
                name: paymentData.customerName,
                email: paymentData.customerEmail,
                cpfCnpj: paymentData.customerDocument
            });
            payload.customer = customerResponse.data.id;
        }

        // Para cartão de crédito
        if (payload.billingType === 'CREDIT_CARD' && paymentData.cardToken) {
            payload.creditCard = {
                holderName: paymentData.cardHolderName,
                number: paymentData.cardNumber,
                expiryMonth: paymentData.cardExpiryMonth,
                expiryYear: paymentData.cardExpiryYear,
                ccv: paymentData.cardCcv
            };
            // Ou usar token
            if (paymentData.cardToken) {
                payload.creditCardToken = paymentData.cardToken;
                delete payload.creditCard;
            }
        }

        const response = await asaasClient.post('/payments', payload);
        return response.data;
    } catch (error) {
        console.error('Erro ao gerar cobrança na Asaas:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Função para gerar cobrança baseada no provedor selecionado
 * @param {string} provider - Provedor de pagamento ('infinitePay' ou 'asaas')
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resposta da API
 */
const createPayment = async (provider, paymentData) => {
    switch (provider.toLowerCase()) {
        case 'infinitepay':
            return createInfinitePayCharge(paymentData);
        case 'asaas':
            return createAsaasCharge(paymentData);
        default:
            throw new Error(`Provedor de pagamento '${provider}' não suportado`);
    }
};

module.exports = {
    createPayment,
    createInfinitePayCharge,
    createAsaasCharge
};
