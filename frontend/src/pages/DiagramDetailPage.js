import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import * as syncServiceImports from '../services/syncService';
import downloadService from '../services/downloadService';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Criar aliases para funções do syncService para manter compatibilidade
const syncService = syncServiceImports.default || syncServiceImports;

const DiagramDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [diagram, setDiagram] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [relatedDiagrams, setRelatedDiagrams] = useState([]);

    useEffect(() => {
        const fetchDiagramDetails = async () => {
            setLoading(true);

            try {
                // Verificar se temos o diagrama em cache
                const cachedDiagrams = syncService.getCachedDiagrams();
                const cachedDiagram = cachedDiagrams.find(d => d._id === id);

                // Se temos o diagrama em cache, usá-lo primeiro para carregamento rápido
                if (cachedDiagram) {
                    setDiagram(cachedDiagram);

                    // Tentar encontrar veículo e marca relacionados em cache
                    if (cachedDiagram.vehicle) {
                        // Aqui precisaríamos de um sistema de cache para veículos também
                        // Por enquanto, ainda carregamos do servidor
                    }

                    // Buscar diagramas relacionados do cache
                    const relatedFromCache = cachedDiagrams
                        .filter(d => d._id !== id &&
                            (d.vehicle === cachedDiagram.vehicle || d.type === cachedDiagram.type))
                        .slice(0, 4);

                    if (relatedFromCache.length > 0) {
                        setRelatedDiagrams(relatedFromCache);
                    }

                    // Verificar se diagrama está nos favoritos do usuário
                    setBookmarked(localStorage.getItem(`bookmark_${id}`) === 'true');
                }

                // Buscar detalhes do diagrama do servidor (mesmo se já temos em cache, para atualizar)
                const diagramRes = await axios.get(`/api/diagrams/${id}`);
                setDiagram(diagramRes.data.data);

                // Se o diagrama tem veículo associado, buscar detalhes do veículo
                if (diagramRes.data.data.vehicle) {
                    const vehicleRes = await axios.get(`/api/vehicles/${diagramRes.data.data.vehicle}`);
                    setVehicle(vehicleRes.data.data);

                    // Buscar marca do veículo
                    if (vehicleRes.data.data.brand) {
                        const brandRes = await axios.get(`/api/brands/${vehicleRes.data.data.brand}`);
                        setBrand(brandRes.data.data);
                    }

                    // Buscar diagramas relacionados (do mesmo veículo ou tipo)
                    const relatedRes = await axios.get(`/api/diagrams?vehicle=${diagramRes.data.data.vehicle}&limit=4`);
                    setRelatedDiagrams(relatedRes.data.data.filter(d => d._id !== id) || []);
                }

                // Verificar se diagrama está nos favoritos do usuário
                // Na prática, isso precisaria de uma rota API específica
                setBookmarked(localStorage.getItem(`bookmark_${id}`) === 'true');

                // Incrementar contagem de visualizações
                await axios.put(`/api/diagrams/${id}/view`);

                setLoading(false);
            } catch (err) {
                // Se temos erro mas já temos o diagrama do cache, manter ele visível
                if (diagram) {
                    setLoading(false);
                    setError('Não foi possível atualizar os dados do diagrama. Usando dados em cache.');
                } else {
                    setError('Erro ao carregar detalhes do diagrama.');
                    console.error('Erro ao carregar detalhes do diagrama:', err);
                    setLoading(false);
                }
            }
        };

        fetchDiagramDetails();
    }, [id]);

    const handleDownload = async () => {
        try {
            setLoading(true);

            // Verificar se já temos indicação de download anterior
            const alreadyDownloaded = downloadService.hasDownloaded(id);

            // Criar nome do arquivo com base no título do diagrama
            let filename = diagram.title
                ? `${diagram.title.replace(/[^\w\s-]/g, '')}.pdf`
                : `diagrama-${id}.pdf`;

            // Usar o novo serviço de download
            const downloadResult = await downloadService.downloadDiagram(id, filename);

            if (downloadResult.success) {
                // Incrementar contador de downloads na API apenas para novos downloads
                if (!alreadyDownloaded) {
                    await axios.put(`/api/diagrams/${id}/download`);
                }

                // Também atualizar nosso cache
                syncService.downloadDiagramsInBackground([id]);

                // Atualizar a interface para mostrar que o diagrama foi baixado
                const updatedDiagram = { ...diagram };
                updatedDiagram.downloads = (updatedDiagram.downloads || 0) + 1;
                setDiagram(updatedDiagram);

                // Se foi um download do cache, mostrar mensagem
                if (downloadResult.fromCache) {
                    console.log('Download do cache realizado com sucesso');
                }
            } else {
                // Se o download falhou, tentar o método antigo como fallback
                if (diagram.fileUrl) {
                    window.open(diagram.fileUrl, '_blank');
                } else {
                    alert('Não foi possível baixar o diagrama. Verifique sua conexão.');
                }
            }
        } catch (err) {
            console.error('Erro ao fazer download:', err);
            alert('Erro ao fazer download. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        // Implementação para compartilhar o diagrama
        // Aqui poderia abrir um modal com opções de compartilhamento
        // ou usar a Web Share API se disponível
        if (navigator.share) {
            navigator.share({
                title: diagram.title,
                text: diagram.description,
                url: window.location.href,
            });
        } else {
            // Fallback: copiar URL para clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('URL copiada para área de transferência!');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const toggleBookmark = () => {
        const newState = !bookmarked;
        setBookmarked(newState);
        // Salvar estado no localStorage
        localStorage.setItem(`bookmark_${id}`, newState);
    };

    const handleZoomToggle = () => {
        setZoomOpen(!zoomOpen);
    };

    const renderDiagramTypeLabel = (type) => {
        const types = {
            'electrical': 'Elétrico',
            'tracking': 'Rastreamento',
            'general': 'Geral',
        };

        return types[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !diagram) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Diagrama não encontrado'}</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        component={RouterLink}
                        to="/diagrams"
                    >
                        Voltar para Diagramas
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">
                    Início
                </Link>
                <Link component={RouterLink} to="/diagrams" underline="hover" color="inherit">
                    Diagramas
                </Link>
                {vehicle && (
                    <Link
                        component={RouterLink}
                        to={`/vehicles/${vehicle._id}`}
                        underline="hover"
                        color="inherit"
                    >
                        {brand?.name} {vehicle.model}
                    </Link>
                )}
                <Typography color="text.primary">{diagram.title}</Typography>
            </Breadcrumbs>

            {/* Botão voltar */}
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to="/diagrams"
                sx={{ mb: 3 }}
            >
                Voltar para Diagramas
            </Button>

            {/* Conteúdo principal */}
            <Grid container spacing={3}>
                {/* Lado esquerdo - Diagrama e detalhes */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h4" gutterBottom>
                                {diagram.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip
                                    label={renderDiagramTypeLabel(diagram.type)}
                                    color={diagram.type === 'electrical' ? 'error' : 'primary'}
                                />

                                {vehicle && (
                                    <Chip
                                        icon={<DirectionsCarIcon />}
                                        label={`${brand?.name || ''} ${vehicle.model} ${vehicle.year}`}
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            {diagram.description && (
                                <Typography variant="body1" paragraph>
                                    {diagram.description}
                                </Typography>
                            )}
                        </Box>

                        {/* Imagem do diagrama */}
                        <Box
                            sx={{
                                position: 'relative',
                                textAlign: 'center',
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 1,
                                overflow: 'hidden',
                                bgcolor: 'grey.100'
                            }}
                        >
                            {diagram.imageUrl ? (
                                <>
                                    <Box
                                        component="img"
                                        src={diagram.imageUrl}
                                        alt={diagram.title}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '600px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            }
                                        }}
                                        onClick={handleZoomToggle}
                                    >
                                        <ZoomInIcon />
                                    </IconButton>
                                </>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Imagem não disponível
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Botões de ação */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                            >
                                Download
                            </Button>

                            <Box>
                                <IconButton onClick={handleShare} title="Compartilhar">
                                    <ShareIcon />
                                </IconButton>
                                <IconButton onClick={handlePrint} title="Imprimir">
                                    <PrintIcon />
                                </IconButton>
                                <IconButton onClick={toggleBookmark} title="Favorito">
                                    {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Estatísticas */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {diagram.views || 0} visualizações
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {diagram.downloads || 0} downloads
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Instruções ou conteúdo adicional */}
                    {diagram.content && (
                        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Instruções
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1">
                                {diagram.content}
                            </Typography>
                        </Paper>
                    )}
                </Grid>

                {/* Lado direito - Informações adicionais */}
                <Grid item xs={12} md={4}>
                    {/* Detalhes do diagrama */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Detalhes
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <TableContainer component={Box}>
                            <Table size="small">
                                <TableBody>
                                    {diagram.createdAt && (
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ borderBottom: 'none', pl: 0, py: 1, width: '40%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">Data de criação</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: 'none', py: 1 }}>
                                                <Typography variant="body2">{formatDate(diagram.createdAt)}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {diagram.author && (
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ borderBottom: 'none', pl: 0, py: 1, width: '40%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">Autor</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: 'none', py: 1 }}>
                                                <Typography variant="body2">{diagram.author}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {vehicle && (
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ borderBottom: 'none', pl: 0, py: 1, width: '40%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">Veículo</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: 'none', py: 1 }}>
                                                <Typography variant="body2">
                                                    <Link component={RouterLink} to={`/vehicles/${vehicle._id}`} underline="hover">
                                                        {brand?.name} {vehicle.model} ({vehicle.year})
                                                    </Link>
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {diagram.version && (
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ borderBottom: 'none', pl: 0, py: 1, width: '40%' }}>
                                                <Typography variant="body2">Versão</Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: 'none', py: 1 }}>
                                                <Typography variant="body2">{diagram.version}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Adicione mais detalhes aqui conforme necessário */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Diagramas relacionados */}
                    {relatedDiagrams.length > 0 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Diagramas Relacionados
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {relatedDiagrams.map((related) => (
                                    <Card
                                        key={related._id}
                                        variant="outlined"
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                        onClick={() => navigate(`/diagrams/${related._id}`)}
                                    >
                                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {related.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <Chip
                                                    label={renderDiagramTypeLabel(related.type)}
                                                    size="small"
                                                    color={related.type === 'electrical' ? 'error' : 'primary'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    {formatDate(related.createdAt || related.updatedAt)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>

                            <Button
                                component={RouterLink}
                                to="/diagrams"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Ver todos os diagramas
                            </Button>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Modal de zoom da imagem */}
            <Dialog
                open={zoomOpen}
                onClose={handleZoomToggle}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle>
                    {diagram.title}
                    <IconButton
                        onClick={handleZoomToggle}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        &times;
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Box
                            component="img"
                            src={diagram.imageUrl}
                            alt={diagram.title}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh'
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default DiagramDetailPage;
