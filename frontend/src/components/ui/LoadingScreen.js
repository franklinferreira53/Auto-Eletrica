import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Container,
    Paper,
    useTheme,
    Fade
} from '@mui/material';

/**
 * Componente de tela de carregamento para ser usado durante a inicialização do app
 * ou quando a aplicação está carregando dados essenciais
 * 
 * @param {Object} props Propriedades do componente
 * @param {boolean} props.isLoading Estado de carregamento
 * @param {string} props.message Mensagem de carregamento
 * @param {number} props.progress Progresso (0-100)
 * @param {React.ReactNode} props.children Conteúdo a exibir quando carregamento terminar
 * @param {Array} props.stages Estágios do carregamento para mostrar progresso detalhado
 */
const LoadingScreen = ({
    isLoading = true,
    message = "Carregando aplicação...",
    progress = 0,
    children,
    stages = []
}) => {
    const theme = useTheme();
    const [currentStage, setCurrentStage] = useState(0);

    useEffect(() => {
        // Se há estágios definidos, simula progresso entre eles
        if (stages.length > 0 && isLoading) {
            const interval = setInterval(() => {
                setCurrentStage(prev => {
                    if (prev < stages.length - 1) return prev + 1;
                    clearInterval(interval);
                    return prev;
                });
            }, 2000); // Cada estágio dura 2 segundos na simulação

            return () => clearInterval(interval);
        }
    }, [isLoading, stages.length]);

    const currentMessage = stages.length > 0 ? stages[currentStage] : message;

    if (!isLoading) return children || null;

    return (
        <Fade in={isLoading}>
            <Container
                maxWidth="sm"
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 6,
                        borderRadius: 2,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box
                        sx={{
                            mb: 4,
                            width: '120px',
                            height: '120px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: theme.palette.primary.main,
                            borderRadius: '50%'
                        }}
                    >
                        <Typography variant="h3" color="white">AE</Typography>
                    </Box>

                    <Typography variant="h5" gutterBottom>
                        Auto Elétrica
                    </Typography>

                    <Box sx={{ position: 'relative', mt: 4, mb: 2, width: '100%' }}>
                        <CircularProgress
                            variant={progress > 0 ? "determinate" : "indeterminate"}
                            value={progress}
                            size={60}
                            thickness={5}
                            color="primary"
                            sx={{ display: 'block', margin: '0 auto' }}
                        />
                        {progress > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="caption" component="div" color="text.secondary">
                                    {`${Math.round(progress)}%`}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        {currentMessage}
                    </Typography>

                    {stages.length > 0 && (
                        <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
                            {stages.map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        mx: 0.5,
                                        bgcolor: index <= currentStage ? 'primary.main' : 'action.disabled'
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Fade>
    );
};

export default LoadingScreen;
