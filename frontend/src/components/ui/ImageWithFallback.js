import React, { useState } from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';

// Componente para carregar imagem com fallback
const ImageWithFallback = ({
    src,
    alt,
    fallbackType = 'auto',
    fallbackIcon,
    ...props
}) => {
    const [error, setError] = useState(false);

    // Determinar cor de fundo baseado no tipo
    let bgColor = '#f5f5f5';
    let iconColor = '#1976d2';
    let iconContent = null;

    if (error) {
        if (fallbackType === 'tracking') {
            bgColor = '#e3f2fd';
            iconContent = (
                <SvgIcon sx={{ fontSize: 40, color: iconColor }}>
                    <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,12.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 15,12.5A1.5,1.5 0 0,1 13.5,14A1.5,1.5 0 0,1 12,12.5M12,7.2C14.2,7.2 16,9 16,11.2C16,14 12,18 12,18C12,18 8,14 8,11.2C8,9 9.8,7.2 12,7.2Z" />
                </SvgIcon>
            );
        } else if (fallbackType === 'electrical') {
            bgColor = '#fff8e1';
            iconContent = (
                <SvgIcon sx={{ fontSize: 40, color: iconColor }}>
                    <path d="M14.69,17.3L13.31,16.7C13.13,17.26 12.7,17.74 12.15,18A0.7,0.7 0 0,0 12.85,19A2.7,2.7 0 0,0 15.55,17.85L14.69,17.3M11.64,5V4H7.64V5L8.64,6V7H7.64V8H10.64V7H9.64V6L11.64,5M15.34,18.65C14.55,19.77 13.18,20.46 11.82,20.13C10.24,19.77 9.04,18.42 8.96,16.82C8.87,15 9.92,13.39 11.55,12.82C13.35,12.19 15.33,13.04 16.13,14.78C16.69,16 16.69,17.38 16.13,18.6L16.14,18.63L15.34,18.65M16.96,7.78L11.91,10.82L14,13.91L8.93,15.93L7.04,13.77L4.5,15.96L5.33,12.84L12.5,8.6L10.96,6.47L13.93,5.5L16.96,7.78Z" />
                </SvgIcon>
            );
        } else if (fallbackType === 'vehicle') {
            bgColor = '#e8f5e9';
            iconContent = (
                <SvgIcon sx={{ fontSize: 40, color: iconColor }}>
                    <path d="M18.9,5C18.9,5 17.53,2 13.5,2C9.47,2 8.1,5 8.1,5H4V15H5L6,19H9V17H15V19H18L19,15H20V5H18.9M10,6L11,4H13L14,6H10M7,14V8H17V14H7Z" />
                </SvgIcon>
            );
        } else {
            // fallbackType === 'auto' ou qualquer outro valor
            iconContent = (
                <SvgIcon sx={{ fontSize: 40, color: iconColor }}>
                    <path d="M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z" />
                </SvgIcon>
            );
        }

        return (
            <Box
                sx={{
                    width: props.sx?.width || '100%',
                    height: props.sx?.height || '200px',
                    backgroundColor: bgColor,
                    borderRadius: props.sx?.borderRadius || '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...props.sx
                }}
            >
                {fallbackIcon || iconContent}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {alt || 'Imagem não disponível'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={src}
            alt={alt}
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;
