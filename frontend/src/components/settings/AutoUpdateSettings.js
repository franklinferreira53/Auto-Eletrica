import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    AlertTitle,
    CircularProgress,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import * as syncServiceImports from '../../services/syncService';
import cacheService from '../../services/cacheService';

// Criar um alias para syncService para manter compatibilidade com o código existente
const syncService = syncServiceImports.default || syncServiceImports;

const AutoUpdateSettings = () => {
    const [autoDownload, setAutoDownloadState] = useState(syncService.isAutoDownloadEnabled());
    const [syncInterval, setSyncInterval] = useState(
        cacheService.getCache('settings-syncInterval') || 60
    ); // em minutos
    const [autoSync, setAutoSync] = useState(
        cacheService.getCache('settings-autoSync') !== false
    ); // default true
    const [syncStatus, setSyncStatus] = useState({
        lastSync: cacheService.getCache('diagrams-lastSync') || null,
        isSyncing: false
    });
    const [storageUsage, setStorageUsage] = useState({
        used: 0,
        total: 0,
        percentage: 0
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cacheInfo, setCacheInfo] = useState({
        diagrams: 0,
        vehicles: 0,
        brands: 0,
        downloads: 0
    });

    useEffect(() => {
        // Registrar ouvintes de sincronização
        const handleSyncStart = () => {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));
        };

        const handleSyncComplete = (data) => {
            setSyncStatus({
                lastSync: data.timestamp,
                isSyncing: false
            });
            updateCacheInfo();
        };

        const handleSyncError = () => {
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        };

        syncService.addSyncListener('onSyncStart', handleSyncStart);
        syncService.addSyncListener('onSyncComplete', handleSyncComplete);
        syncService.addSyncListener('onSyncError', handleSyncError);

        // Inicializar informações de cache
        updateCacheInfo();

        // Calcular uso de armazenamento
        calculateStorageUsage();

        return () => {
            // Remover ouvintes ao desmontar
            syncService.removeSyncListener('onSyncStart', handleSyncStart);
            syncService.removeSyncListener('onSyncComplete', handleSyncComplete);
            syncService.removeSyncListener('onSyncError', handleSyncError);
        };
    }, []);

    const updateCacheInfo = () => {
        const diagrams = cacheService.getCache('diagrams') || [];
        const vehicles = cacheService.getCache('vehicles') || [];
        const brands = cacheService.getCache('brands') || [];
        const downloads = cacheService.getCache('diagrams-downloads') || {};

        // Contar tipos específicos de diagramas
        const electrical = diagrams.filter(d => d.type === 'electrical').length;
        const tracking = diagrams.filter(d => d.type === 'tracking').length;

        setCacheInfo({
            diagrams: diagrams.length,
            vehicles: vehicles.length,
            brands: brands.length,
            downloads: Object.keys(downloads).length,
            electrical,
            tracking
        });
    };

    const calculateStorageUsage = () => {
        // Estimar o uso de armazenamento
        let storageEstimate = 0;

        // Calcular tamanho aproximado do localStorage
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                storageEstimate += (localStorage[key].length * 2) / 1024; // em KB
            }
        }

        // Calcular tamanho de downloads em cache
        const cachedDownloads = cacheService.getCache('diagrams-downloads') || {};
        let downloadSize = 0;

        for (const key in cachedDownloads) {
            if (cachedDownloads.hasOwnProperty(key)) {
                downloadSize += (cachedDownloads[key].size || 0) / 1024; // em KB
            }
        }

        // Total em KB
        const totalUsed = storageEstimate + downloadSize;

        // Limite aproximado (navegadores modernos ~ 5-10MB)
        const storageLimit = 5 * 1024; // 5MB em KB

        setStorageUsage({
            used: Math.round(totalUsed),
            total: storageLimit,
            percentage: Math.min(100, Math.round((totalUsed / storageLimit) * 100))
        });
    };

    const handleAutoDownloadChange = (event) => {
        const newValue = event.target.checked;
        setAutoDownloadState(newValue);
        syncService.setAutoDownload(newValue);
    };

    const handleAutoSyncChange = (event) => {
        const newValue = event.target.checked;
        setAutoSync(newValue);
        cacheService.setCache('settings-autoSync', newValue);
    };

    const saveSettings = () => {
        cacheService.setCache('settings-autoSync', autoSync);
        cacheService.setCache('settings-syncInterval', syncInterval);
        syncService.setAutoDownload(autoDownload);

        // Mostrar confirmação temporária
        alert("Configurações salvas com sucesso");
    };

    const handleSyncNow = async () => {
        try {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }));

            const results = await Promise.all([
                syncService.syncDiagrams(true),
                syncService.syncVehicles(true),
                syncService.syncBrands(true)
            ]);

            const timestamp = results[0].timestamp || Date.now();

            setSyncStatus({
                lastSync: timestamp,
                isSyncing: false
            });

            updateCacheInfo();
            calculateStorageUsage();
        } catch (error) {
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
            console.error('Erro ao sincronizar:', error);
        }
    };

    const handleClearCache = () => {
        setDialogOpen(true);
    };

    const confirmClearCache = () => {
        // Limpar todo o cache
        cacheService.clearAllCache();

        // Atualizar contadores
        updateCacheInfo();
        calculateStorageUsage();

        // Fechar diálogo
        setDialogOpen(false);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Nunca';
        const date = new Date(parseInt(timestamp));
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                        Configurações de Atualização Automática
                    </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <AlertTitle>Sobre atualizações automáticas</AlertTitle>
                    Este sistema mantém seus diagramas elétricos atualizados automaticamente. Novas atualizações
                    serão notificadas e poderão ser baixadas conforme suas configurações.
                </Alert>

                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoDownload}
                                onChange={handleAutoDownloadChange}
                                name="autoDownload"
                                color="primary"
                            />
                        }
                        label="Baixar automaticamente novos diagramas elétricos"
                    />
                    <Typography variant="body2" color="text.secondary">
                        Se ativado, novos diagramas elétricos serão baixados em segundo plano assim que disponíveis.
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                    Status da sincronização
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography variant="body2">
                                Última sincronização: {formatTimestamp(syncStatus.lastSync)}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={syncStatus.isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
                                    onClick={handleSyncNow}
                                    disabled={syncStatus.isSyncing}
                                >
                                    {syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Uso de armazenamento: {storageUsage.used} KB de {storageUsage.total} KB ({storageUsage.percentage}%)
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 10,
                                    bgcolor: 'grey.300',
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${storageUsage.percentage}%`,
                                        height: '100%',
                                        bgcolor: storageUsage.percentage > 90 ? 'error.main' : 'primary.main',
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                    Estatísticas de Diagramas
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" color="primary">
                                {cacheInfo.diagrams || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total de Diagramas
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" color="error">
                                {cacheInfo.electrical || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Diagramas Elétricos
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" color="info.main">
                                {cacheInfo.tracking || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Diagramas de Rastreamento
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h5" color="success.main">
                                {cacheInfo.downloads || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Downloads em Cache
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleClearCache}
                    >
                        Limpar Cache de Diagramas
                    </Button>
                </Box>

                {/* Diálogo de confirmação para limpar cache */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                >
                    <DialogTitle>Limpar Cache de Diagramas</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Tem certeza que deseja limpar o cache de diagramas? Esta ação removerá todos os diagramas
                            armazenados localmente e dados de sincronização.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmClearCache} color="error">Limpar Cache</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default AutoUpdateSettings;
