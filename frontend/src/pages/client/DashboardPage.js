import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tab,
    Tabs,
    CircularProgress,
    Alert
} from '@mui/material';
import AutoUpdateSettings from '../../components/settings/AutoUpdateSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DownloadIcon from '@mui/icons-material/Download';

// Componente para exibir o status da assinatura
const SubscriptionStatus = ({ user }) => {
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            try {
                // Em produção, deve buscar da API
                // const res = await axios.get(`/api/subscriptions/${user.subscription}`);
                // setSubscriptionDetails(res.data.data);

                // Para demonstração, dados simulados
                setSubscriptionDetails({
                    name: 'Premium',
                    status: 'active',
                    startDate: new Date('2025-07-25'),
                    expiryDate: new Date('2025-08-25'),
                    nextBillingDate: new Date('2025-08-25'),
                    amount: 'R$ 99,90',
                    features: [
                        'Acesso ilimitado a diagramas',
                        'Download de diagramas em alta resolução',
                        'Suporte técnico prioritário',
                        'Atualizações automáticas'
                    ]
                });

                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar detalhes da assinatura:', error);
                setLoading(false);
            }
        };

        fetchSubscriptionDetails();
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!subscriptionDetails) {
        return (
            <Alert severity="warning">
                Não foi possível carregar os detalhes da assinatura.
            </Alert>
        );
    }

    const isActive = subscriptionDetails.status === 'active';
    const daysRemaining = Math.ceil(
        (new Date(subscriptionDetails.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
                title="Status da Assinatura"
                subheader={isActive ? "Ativa" : "Inativa"}
                avatar={
                    <Chip
                        icon={isActive ? <CheckCircleIcon /> : <AccessTimeIcon />}
                        label={isActive ? "Ativa" : "Inativa"}
                        color={isActive ? "success" : "warning"}
                    />
                }
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Plano: <strong>{subscriptionDetails.name}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Valor: <strong>{subscriptionDetails.amount}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Próxima cobrança: <strong>{new Date(subscriptionDetails.nextBillingDate).toLocaleDateString()}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dias restantes: <strong>{daysRemaining}</strong>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                    Recursos incluídos:
                </Typography>

                <List dense disablePadding>
                    {subscriptionDetails.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircleIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
            <CardActions>
                <Button size="small" startIcon={<CreditCardIcon />}>
                    Alterar Plano
                </Button>
                <Button size="small" color="primary">
                    Detalhes
                </Button>
            </CardActions>
        </Card>
    );
};

// Componente para exibir estatísticas do usuário
const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular chamada de API
        setTimeout(() => {
            setStats({
                diagrams: {
                    viewed: 28,
                    downloaded: 12,
                    favorites: 5
                },
                lastActivity: new Date('2025-08-23T15:32:00')
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Sua Atividade
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="primary">
                            {stats.diagrams.viewed}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Visualizações
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="secondary">
                            {stats.diagrams.downloaded}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Downloads
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="info.main">
                            {stats.diagrams.favorites}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Favoritos
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
                Última atividade: {new Date(stats.lastActivity).toLocaleString()}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<DownloadIcon />}>
                    Downloads
                </Button>
                <Button size="small" startIcon={<BookmarkIcon />}>
                    Favoritos
                </Button>
            </Box>
        </Paper>
    );
};

// Componente para as configurações de pagamento
const PaymentSettings = () => {
    const navigate = useNavigate();

    const handleViewPlans = () => {
        navigate('/subscription/plans');
    };

    const handlePaymentSettings = () => {
        navigate('/payment-settings');
    };

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Métodos de Pagamento
            </Typography>

            <List>
                <ListItem>
                    <ListItemIcon>
                        <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Mastercard •••• 4321"
                        secondary="Expira em 12/2027"
                    />
                    <Chip label="Principal" size="small" color="primary" />
                </ListItem>
            </List>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<CreditCardIcon />}
                    size="small"
                    onClick={handlePaymentSettings}
                >
                    Configurações de Pagamento
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleViewPlans}
                >
                    Ver Planos
                </Button>
            </Box>
        </Paper>
    );
};

const DashboardPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const { user } = useSelector(state => state.auth);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard do Cliente
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab icon={<AccountBoxIcon />} label="Visão Geral" />
                    <Tab icon={<SettingsIcon />} label="Configurações" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <UserStats />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SubscriptionStatus user={user} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PaymentSettings />
                    </Grid>
                </Grid>
            )}

            {tabValue === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <AutoUpdateSettings />
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default DashboardPage;
