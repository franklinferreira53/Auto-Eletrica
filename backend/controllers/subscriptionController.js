const asyncHandler = require('../middleware/asyncHandler');
const paymentProviders = require('../utils/paymentProviders');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { DEMO_MODE } = require('../utils/demoMode');

// Função para verificar se estamos no modo de demonstração
const isDemoMode = () => DEMO_MODE.enabled;

/**
 * @desc    Criar uma nova assinatura
 * @route   POST /api/subscriptions
 * @access  Private
 */
const createSubscription = asyncHandler(async (req, res) => {
    const { plan, paymentMethod, provider, billingInfo } = req.body;

    // Verificar se o plano existe
    let subscription;

    if (isDemoMode()) {
        // Modo de demonstração - simular criação de assinatura
        subscription = {
            plan: plan,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            user: req.user._id
        };

        // Atualizar o usuário com a assinatura ativa
        await User.findByIdAndUpdate(req.user._id, {
            subscription: plan,
            subscriptionStatus: 'active',
            subscriptionExpiryDate: subscription.endDate
        });

        return res.status(201).json({
            success: true,
            data: subscription,
            message: 'Assinatura criada com sucesso (modo demonstração)'
        });
    }

    // Ambiente de produção - processar pagamento real
    try {
        // Buscar informações do plano
        const subscriptionPlan = await Subscription.findById(plan);
        if (!subscriptionPlan) {
            return res.status(404).json({
                success: false,
                message: 'Plano de assinatura não encontrado'
            });
        }

        // Preparar dados do pagamento
        const paymentData = {
            amount: subscriptionPlan.price,
            description: `Assinatura ${subscriptionPlan.name}`,
            customerName: billingInfo.name,
            customerEmail: req.user.email,
            customerDocument: billingInfo.document,
            paymentMethod: paymentMethod,
            reference: `subscription-${req.user._id}-${plan}`
        };

        // Adicionar dados do cartão se aplicável
        if (paymentMethod === 'credit_card' || paymentMethod === 'CREDIT_CARD') {
            paymentData.cardToken = billingInfo.cardToken;
            paymentData.cardHolderName = billingInfo.cardHolderName;
            paymentData.cardNumber = billingInfo.cardNumber;
            paymentData.cardExpiryMonth = billingInfo.cardExpiryMonth;
            paymentData.cardExpiryYear = billingInfo.cardExpiryYear;
            paymentData.cardCcv = billingInfo.cardCcv;
        }

        // Processar o pagamento
        const paymentResult = await paymentProviders.createPayment(provider, paymentData);

        // Criar a assinatura
        subscription = await Subscription.create({
            plan: subscriptionPlan._id,
            user: req.user._id,
            status: paymentResult.status === 'CONFIRMED' || paymentResult.status === 'paid' ? 'active' : 'pending',
            paymentId: paymentResult.id,
            paymentProvider: provider,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        });

        // Atualizar o usuário com a assinatura ativa
        await User.findByIdAndUpdate(req.user._id, {
            subscription: subscription._id,
            subscriptionStatus: subscription.status,
            subscriptionExpiryDate: subscription.endDate
        });

        res.status(201).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
            message: 'Erro ao processar pagamento'
        });
    }
});

/**
 * @desc    Verificar status de uma assinatura
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    if (isDemoMode()) {
        // No modo demonstração, sempre retorna assinatura ativa
        return res.status(200).json({
            success: true,
            data: {
                status: 'active',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
    }

    const subscription = await Subscription.findOne({
        user: req.user._id,
        _id: req.params.id
    });

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Assinatura não encontrada'
        });
    }

    res.status(200).json({
        success: true,
        data: subscription
    });
});

/**
 * @desc    Listar todas as assinaturas disponíveis
 * @route   GET /api/subscriptions
 * @access  Public
 */
const listSubscriptionPlans = asyncHandler(async (req, res) => {
    const plans = await Subscription.find({ isPublic: true });

    res.status(200).json({
        success: true,
        count: plans.length,
        data: plans
    });
});

/**
 * @desc    Cancelar uma assinatura
 * @route   DELETE /api/subscriptions/:id
 * @access  Private
 */
const cancelSubscription = asyncHandler(async (req, res) => {
    if (isDemoMode()) {
        // No modo demonstração, simula cancelamento
        return res.status(200).json({
            success: true,
            message: 'Assinatura cancelada com sucesso (modo demonstração)'
        });
    }

    const subscription = await Subscription.findOne({
        user: req.user._id,
        _id: req.params.id
    });

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Assinatura não encontrada'
        });
    }

    // Atualizar status da assinatura
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Atualizar o usuário
    await User.findByIdAndUpdate(req.user._id, {
        subscriptionStatus: 'cancelled'
    });

    res.status(200).json({
        success: true,
        data: subscription,
        message: 'Assinatura cancelada com sucesso'
    });
});

module.exports = {
    createSubscription,
    checkSubscriptionStatus,
    listSubscriptionPlans,
    cancelSubscription
};
