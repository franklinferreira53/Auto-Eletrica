import React, { useState, useEffect } from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componente para tratamento de erro com opção de retry
const ErrorHandler = ({
    error,
    onRetry,
    loading = false,
    message = 'Ocorreu um erro ao carregar os dados.',
    title = 'Erro',
    severity = 'error'
}) => {
    const [countdown, setCountdown] = useState(0);
    const [autoRetrying, setAutoRetrying] = useState(false);

    useEffect(() => {
        // Se não há erro, não fazer nada
        if (!error) return;

        // Definir um contador regressivo para retry automático
        setCountdown(15);
        setAutoRetrying(true);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setAutoRetrying(false);
                    onRetry();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [error, onRetry]);

    if (!error) return null;

    return (
        <Box sx={{ my: 2 }}>
            <Alert
                severity={severity}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setAutoRetrying(false);
                            onRetry();
                        }}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Carregando...' : 'Tentar novamente'}
                    </Button>
                }
            >
                <AlertTitle>{title}</AlertTitle>
                <Typography variant="body2">{message}</Typography>
                {autoRetrying && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Tentando novamente em {countdown} segundos...
                    </Typography>
                )}
            </Alert>
        </Box>
    );
};

export default ErrorHandler;
