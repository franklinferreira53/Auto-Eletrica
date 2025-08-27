import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Paper, useTheme } from '@mui/material';
import { Fade } from '@mui/material';

/**
 * Componente para exibir feedback visual durante carregamento
 * @param {object} props - Propriedades do componente
 * @param {string} props.type - Tipo de loader ('circular', 'linear', 'skeleton')
 * @param {string} props.message - Mensagem de carregamento
 * @param {boolean} props.isLoading - Estado de carregamento
 * @param {number} props.progress - Valor de progresso (0-100)
 * @param {React.ReactNode} props.children - Conteúdo a ser exibido quando não estiver carregando
 * @param {string} props.variant - Variante do loader ('determinate', 'indeterminate')
 * @param {object} props.sx - Estilos adicionais
 */
const LoadingFeedback = ({
    type = 'circular',
    message = 'Carregando...',
    isLoading = true,
    progress = 0,
    children,
    variant = 'indeterminate',
    sx = {},
    minHeight = 200,
}) => {
    const theme = useTheme();

    // Render conteúdo se não estiver carregando
    if (!isLoading) {
        return children || null;
    }

    const loadingIndicator = () => {
        switch (type) {
            case 'circular':
                return (
                    <CircularProgress
                        variant={variant}
                        value={progress}
                        size={50}
                        color="primary"
                        thickness={5}
                    />
                );
            case 'linear':
                return (
                    <Box sx={{ width: '100%', maxWidth: 400, mt: 2, mb: 2 }}>
                        <LinearProgress
                            variant={variant}
                            value={progress}
                            color="primary"
                        />
                    </Box>
                );
            case 'skeleton':
                return (
                    <Box sx={{ width: '100%', p: 2 }}>
                        {Array(3).fill(0).map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    height: 24,
                                    borderRadius: 1,
                                    mb: 1,
                                    background: theme.palette.action.hover,
                                    width: `${100 - (index * 20)}%`,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    '@keyframes pulse': {
                                        '0%': { opacity: 0.6 },
                                        '50%': { opacity: 1 },
                                        '100%': { opacity: 0.6 }
                                    }
                                }}
                            />
                        ))}
                    </Box>
                );
            default:
                return <CircularProgress />;
        }
    };

    return (
        <Fade in={isLoading} timeout={300}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight={minHeight}
                sx={{
                    width: '100%',
                    p: 3,
                    ...sx
                }}
            >
                {loadingIndicator()}

                {message && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={2}
                        textAlign="center"
                    >
                        {message}
                    </Typography>
                )}
            </Box>
        </Fade>
    );
};

/**
 * Componente que mostra um feedback visual do estado de carregamento
 * com suporte a diferentes tipos de loaders e transições suaves
 */
export const LoadingContainer = ({
    isLoading,
    children,
    message = "Carregando dados...",
    type = "circular",
    variant = "indeterminate",
    elevated = true,
    progress = 0,
    sx = {},
    minHeight = 200
}) => {
    const Component = elevated ? Paper : Box;

    return (
        <Component
            sx={{
                position: 'relative',
                width: '100%',
                minHeight,
                ...sx
            }}
        >
            <LoadingFeedback
                isLoading={isLoading}
                message={message}
                type={type}
                variant={variant}
                progress={progress}
                minHeight={minHeight}
            />

            <Box
                sx={{
                    opacity: isLoading ? 0 : 1,
                    transition: theme => theme.transitions.create('opacity', {
                        duration: theme.transitions.duration.standard,
                    }),
                    position: isLoading ? 'absolute' : 'static',
                    top: 0,
                    width: '100%'
                }}
            >
                {children}
            </Box>
        </Component>
    );
};

export default LoadingFeedback;
