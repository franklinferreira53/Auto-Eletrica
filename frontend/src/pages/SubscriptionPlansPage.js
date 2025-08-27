import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const SubscriptionPlansPage = () => {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                // Em produção, buscar da API
                // const res = await axios.get('/api/subscriptions/plans');
                // setPlans(res.data.data);

                // Para demonstração, usar dados simulados
                setTimeout(() => {
                    setPlans([
                        {
                            _id: 'plan1',
                            name: 'Básico',
                            description: 'Acesso aos recursos básicos',
                            price: 49.90,
                            billingPeriod: 'monthly',
                            features: [
                                'Acesso a 50 diagramas por mês',
                                'Suporte por email',
                                'Download em PDF',
                                'Acesso pelo navegador'
                            ],
                            recommended: false,
                            mostPopular: false
                        },
                        {
                            _id: 'plan2',
                            name: 'Premium',
                            description: 'Acesso completo ao sistema',
                            price: 99.90,
                            billingPeriod: 'monthly',
                            features: [
                                'Acesso ilimitado a diagramas',
                                'Suporte prioritário',
                                'Download em PDF e CAD',
                                'Acesso offline',
                                'Atualizações automáticas',
                                'Sincronização em múltiplos dispositivos'
                            ],
                            recommended: true,
                            mostPopular: true
                        },
                        {
                            _id: 'plan3',
                            name: 'Profissional',
                            description: 'Para oficinas e profissionais',
                            price: 199.90,
                            billingPeriod: 'monthly',
                            features: [
                                'Tudo do plano Premium',
                                'Até 3 usuários simultâneos',
                                'Treinamento personalizado',
                                'API para integração',
                                'Suporte 24/7',
                                'Banco de dados personalizado'
                            ],
                            recommended: false,
                            mostPopular: false
                        }
                    ]);

                    // Simular plano atual do usuário
                    if (user) {
                        setCurrentPlan('plan2'); // Premium
                    }

                    setLoading(false);
                }, 1000);

            } catch (err) {
                console.error('Erro ao carregar planos:', err);
                setError('Não foi possível carregar os planos de assinatura.');
                setLoading(false);
            }
        };

        fetchPlans();
    }, [user]);

    const handleSubscribe = (plan) => {
        if (!user) {
            navigate('/login', { state: { from: '/subscription/plans', plan: plan._id } });
            return;
        }

        setSelectedPlan(plan);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleConfirmSubscription = () => {
        setOpenDialog(false);
        navigate('/payment', { state: { plan: selectedPlan } });
    };

    const handleChangePlan = () => {
        navigate('/payment-settings');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Planos de Assinatura
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Escolha o plano que melhor se adapta às suas necessidades
                </Typography>
            </Box>

            {user && currentPlan && (
                <Box sx={{ mb: 4 }}>
                    <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            Você está atualmente no plano{' '}
                            <strong>
                                {plans.find(p => p._id === currentPlan)?.name || 'Premium'}
                            </strong>.
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleChangePlan}
                            sx={{ ml: 2 }}
                        >
                            Gerenciar Assinatura
                        </Button>
                    </Alert>
                </Box>
            )}

            <Grid container spacing={3} justifyContent="center">
                {plans.map((plan) => (
                    <Grid item xs={12} sm={6} md={4} key={plan._id}>
                        <Card
                            raised={plan.recommended}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                border: plan.recommended ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                            }}
                        >
                            {plan.mostPopular && (
                                <Chip
                                    icon={<StarIcon />}
                                    label="Mais Popular"
                                    color="primary"
                                    sx={{
                                        position: 'absolute',
                                        top: '-12px',
                                        right: '20px',
                                    }}
                                />
                            )}

                            <CardHeader
                                title={plan.name}
                                subheader={plan.description}
                                titleTypographyProps={{ align: 'center' }}
                                subheaderTypographyProps={{ align: 'center' }}
                                sx={{ pb: 0 }}
                            />

                            <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    <Typography component="h2" variant="h3">
                                        R$ {plan.price.toFixed(2)}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        /mês
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <List dense>
                                    {plan.features.map((feature, index) => (
                                        <ListItem key={index} disableGutters>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CheckIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={feature} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>

                            <CardActions>
                                <Button
                                    fullWidth
                                    variant={plan.recommended ? "contained" : "outlined"}
                                    color="primary"
                                    startIcon={<CreditCardIcon />}
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={currentPlan === plan._id}
                                >
                                    {currentPlan === plan._id ? 'Plano Atual' : 'Assinar'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirmar Assinatura
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Você está prestes a assinar o plano <strong>{selectedPlan?.name}</strong> por R$ {selectedPlan?.price.toFixed(2)}/mês.
                        Deseja prosseguir para a página de pagamento?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmSubscription} color="primary" variant="contained" autoFocus>
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SubscriptionPlansPage;
