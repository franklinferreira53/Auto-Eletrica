import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const PaymentSettingsPage = () => {
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [paymentSettings, setPaymentSettings] = useState({
        preferredProvider: 'asaas', // ou 'infinitePay'
        bankInfo: {
            bankCode: '',
            bankName: '',
            accountType: 'corrente',
            agency: '',
            account: '',
            documentType: 'cpf',
            document: '',
            accountHolder: ''
        }
    });

    // Lista de bancos brasileiros principais
    const bankOptions = [
        { code: '001', name: 'Banco do Brasil' },
        { code: '033', name: 'Santander' },
        { code: '104', name: 'Caixa Econômica Federal' },
        { code: '237', name: 'Bradesco' },
        { code: '341', name: 'Itaú' },
        { code: '756', name: 'Sicoob' },
        { code: '077', name: 'Inter' },
        { code: '212', name: 'Banco Original' },
        { code: '260', name: 'Nubank' },
        { code: '336', name: 'C6 Bank' },
    ];

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            setLoading(true);
            try {
                // Em produção, buscar da API
                // const res = await axios.get('/api/users/payment-settings');
                // setPaymentSettings(res.data.data);

                // Para demonstração, usar dados simulados
                setTimeout(() => {
                    setPaymentSettings({
                        preferredProvider: 'asaas',
                        bankInfo: {
                            bankCode: '001',
                            bankName: 'Banco do Brasil',
                            accountType: 'corrente',
                            agency: '1234',
                            account: '56789-0',
                            documentType: 'cpf',
                            document: '123.456.789-00',
                            accountHolder: user?.name || 'Nome do Titular'
                        }
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Erro ao carregar configurações de pagamento:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao carregar configurações de pagamento',
                    severity: 'error'
                });
                setLoading(false);
            }
        };

        if (user) {
            fetchPaymentSettings();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPaymentSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setPaymentSettings(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleBankSelect = (e) => {
        const code = e.target.value;
        const selectedBank = bankOptions.find(bank => bank.code === code);

        setPaymentSettings(prev => ({
            ...prev,
            bankInfo: {
                ...prev.bankInfo,
                bankCode: code,
                bankName: selectedBank.name
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Em produção, enviar para a API
            // const res = await axios.post('/api/users/payment-settings', paymentSettings);

            // Para demonstração
            setTimeout(() => {
                setSnackbar({
                    open: true,
                    message: 'Configurações de pagamento salvas com sucesso',
                    severity: 'success'
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Erro ao salvar configurações de pagamento:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar configurações de pagamento',
                severity: 'error'
            });
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading && !paymentSettings.bankInfo.bankCode) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h5" component="h1">
                        Configurações de Pagamento
                    </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Configure suas preferências de pagamento e dados bancários para recebimento dos valores de assinatura.
                </Alert>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Provedor de Pagamento Preferido</FormLabel>
                                <RadioGroup
                                    row
                                    name="preferredProvider"
                                    value={paymentSettings.preferredProvider}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="asaas" control={<Radio />} label="Asaas" />
                                    <FormControlLabel value="infinitePay" control={<Radio />} label="InfinitePay" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="subtitle2">Dados Bancários para Recebimento</Typography>
                            </Divider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Banco</InputLabel>
                                <Select
                                    name="bankInfo.bankCode"
                                    value={paymentSettings.bankInfo.bankCode}
                                    label="Banco"
                                    onChange={handleBankSelect}
                                >
                                    {bankOptions.map((bank) => (
                                        <MenuItem key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Conta</InputLabel>
                                <Select
                                    name="bankInfo.accountType"
                                    value={paymentSettings.bankInfo.accountType}
                                    label="Tipo de Conta"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="corrente">Conta Corrente</MenuItem>
                                    <MenuItem value="poupanca">Conta Poupança</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Agência"
                                name="bankInfo.agency"
                                value={paymentSettings.bankInfo.agency}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Conta (com dígito)"
                                name="bankInfo.account"
                                value={paymentSettings.bankInfo.account}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Documento</InputLabel>
                                <Select
                                    name="bankInfo.documentType"
                                    value={paymentSettings.bankInfo.documentType}
                                    label="Tipo de Documento"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="cpf">CPF</MenuItem>
                                    <MenuItem value="cnpj">CNPJ</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Número do Documento"
                                name="bankInfo.document"
                                value={paymentSettings.bankInfo.document}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome do Titular"
                                name="bankInfo.accountHolder"
                                value={paymentSettings.bankInfo.accountHolder}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default PaymentSettingsPage;
