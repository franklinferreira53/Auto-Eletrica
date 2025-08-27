import React, { useState, useEffect } from 'react';
import {
    Snackbar,
    Alert,
    Button,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import * as syncServiceImports from '../../services/syncService';
// Criar alias para syncService para manter compatibilidade
const syncService = syncServiceImports.default || syncServiceImports;

const DiagramNotifications = () => {
    const navigate = useNavigate();
    const [newDiagrams, setNewDiagrams] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Registrar ouvinte para novos diagramas
        const handleNewDiagrams = (diagrams) => {
            if (diagrams && diagrams.length > 0) {
                setNewDiagrams(prev => {
                    // Filtrar diagramas únicos combinando com os existentes
                    const uniqueDiagrams = [...prev];
                    diagrams.forEach(diagram => {
                        const existingIndex = uniqueDiagrams.findIndex(d => d._id === diagram._id);
                        if (existingIndex >= 0) {
                            uniqueDiagrams[existingIndex] = diagram; // Atualizar existente
                        } else {
                            uniqueDiagrams.push(diagram); // Adicionar novo
                        }
                    });
                    return uniqueDiagrams;
                });

                // Mostrar notificação
                setNotificationMessage(`${diagrams.length} ${diagrams.length === 1 ? 'novo diagrama disponível' : 'novos diagramas disponíveis'}!`);
                setShowNotification(true);
            }
        };

        // Registrar ouvintes para eventos de sincronização
        syncService.addSyncListener('onNewDiagrams', handleNewDiagrams);

        return () => {
            // Limpar ouvintes ao desmontar
            syncService.removeSyncListener('onNewDiagrams', handleNewDiagrams);
        };
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowNotification(false);
    };

    const handleViewDiagram = (diagramId) => {
        navigate(`/diagrams/${diagramId}`);
        handleClose();
        clearNotification(diagramId);
    };

    const handleDownloadAll = () => {
        if (newDiagrams.length > 0) {
            const diagramIds = newDiagrams.map(diagram => diagram._id);
            syncService.downloadDiagramsInBackground(diagramIds);
            setNotificationMessage('Iniciando download dos diagramas em segundo plano');
            setShowNotification(true);
            handleClose();
        }
    };

    const clearNotification = (diagramId) => {
        setNewDiagrams(prev => prev.filter(diagram => diagram._id !== diagramId));
    };

    const clearAllNotifications = () => {
        setNewDiagrams([]);
        handleClose();
    };

    // Função para formatar a data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Agrupar diagramas por tipo
    const getGroupedDiagrams = () => {
        const grouped = {};
        newDiagrams.forEach(diagram => {
            const type = diagram.type || 'other';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(diagram);
        });
        return grouped;
    };

    const renderDiagramType = (type) => {
        switch (type) {
            case 'electrical':
                return 'Diagrama Elétrico';
            case 'tracking':
                return 'Diagrama de Rastreamento';
            case 'general':
                return 'Diagrama Geral';
            default:
                return 'Outro Diagrama';
        }
    };

    const groupedDiagrams = getGroupedDiagrams();

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-controls={open ? 'notification-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Badge badgeContent={newDiagrams.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'notification-button',
                }}
                PaperProps={{
                    sx: {
                        maxHeight: '70vh',
                        width: '350px',
                        maxWidth: '90vw'
                    }
                }}
            >
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', ml: 1 }}>
                        Notificações de Diagramas
                    </Typography>
                    {newDiagrams.length > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={clearAllNotifications}
                        >
                            Limpar Tudo
                        </Button>
                    )}
                </Box>
                <Divider />

                {newDiagrams.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" sx={{ py: 1 }}>
                            Não há novas notificações
                        </Typography>
                    </MenuItem>
                ) : (
                    <>
                        {Object.keys(groupedDiagrams).map(type => (
                            <React.Fragment key={type}>
                                <Box sx={{ bgcolor: 'grey.100', px: 2, py: 1 }}>
                                    <Typography variant="caption" fontWeight="bold">
                                        {renderDiagramType(type)} ({groupedDiagrams[type].length})
                                    </Typography>
                                </Box>
                                <List dense sx={{ p: 0 }}>
                                    {groupedDiagrams[type].map(diagram => (
                                        <ListItem
                                            key={diagram._id}
                                            button
                                            onClick={() => handleViewDiagram(diagram._id)}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="download"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        syncService.downloadDiagramsInBackground([diagram._id]);
                                                        setNotificationMessage('Iniciando download em segundo plano');
                                                        setShowNotification(true);
                                                        clearNotification(diagram._id);
                                                    }}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: type === 'electrical' ? 'error.main' : 'primary.main' }}>
                                                    <DescriptionIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={diagram.title}
                                                secondary={formatDate(diagram.createdAt || diagram.updatedAt || new Date())}
                                                primaryTypographyProps={{ noWrap: true, style: { maxWidth: '200px' } }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </React.Fragment>
                        ))}
                        <Divider />
                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadAll}
                            >
                                Baixar Todos os Diagramas
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>

            <Snackbar
                open={showNotification}
                autoHideDuration={5000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleNotificationClose}
                    severity="info"
                    variant="filled"
                    action={
                        newDiagrams.length > 0 ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    handleNotificationClose();
                                    setAnchorEl(document.getElementById('notification-button'));
                                }}
                            >
                                VER
                            </Button>
                        ) : null
                    }
                >
                    {notificationMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DiagramNotifications;
