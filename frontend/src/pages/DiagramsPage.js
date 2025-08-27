import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as syncServiceImports from '../services/syncService';
import ErrorHandler from '../components/ui/ErrorHandler';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { fallbackImages } from '../utils/fallbackImages';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Pagination,
    Breadcrumbs,
    Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DescriptionIcon from '@mui/icons-material/Description';

// Criar alias para syncService para manter compatibilidade
const syncService = syncServiceImports.default || syncServiceImports;

const DiagramsPage = () => {
    const navigate = useNavigate();
    const [diagrams, setDiagrams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 12;

    // Obter parâmetros de URL
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const typeFromUrl = queryParams.get('type');

    useEffect(() => {
        // Definir tipo inicial com base na URL
        if (typeFromUrl) {
            setSelectedType(typeFromUrl);
        }
    }, [typeFromUrl]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('Iniciando carregamento de dados');
                // Verificar se temos diagramas em cache
                const cachedDiagrams = syncService.getCachedDiagrams();
                console.log('Cache de diagramas:', cachedDiagrams ? cachedDiagrams.length : 0, 'itens');

                // Buscar marcas
                console.log('Buscando marcas...');
                const brandsRes = await axios.get('/api/brands');
                const brandsData = brandsRes.data.data || [];
                console.log('Marcas recebidas:', brandsData.length);
                setBrands(brandsData);

                // Buscar veículos
                console.log('Buscando veículos...');
                const vehiclesRes = await axios.get('/api/vehicles');
                const vehiclesData = vehiclesRes.data.data || [];
                console.log('Veículos recebidos:', vehiclesData.length);
                setVehicles(vehiclesData);
                setFilteredVehicles(vehiclesData);

                // Buscar diagramas - usar cache se disponível
                if (cachedDiagrams && cachedDiagrams.length > 0) {
                    console.log('Usando diagramas em cache:', cachedDiagrams.length);
                    // Ainda buscar do servidor para manter tudo atualizado
                    try {
                        fetchDiagrams();
                    } catch (err) {
                        console.warn('Erro ao atualizar diagramas do servidor, usando apenas cache:', err);
                    }

                    // Mas mostrar os do cache imediatamente para melhorar a experiência do usuário
                    const filtered = filterDiagramsFromCache(cachedDiagrams);
                    setDiagrams(filtered);
                    setLoading(false);
                } else {
                    // Se não temos cache, buscar do servidor
                    try {
                        await fetchDiagrams();
                    } catch (err) {
                        console.error('Erro ao buscar diagramas:', err);
                        setError('Não foi possível carregar os diagramas. Verifique sua conexão.');
                        // Usar dados mockados para garantir uma experiência mesmo em caso de falha
                        setDiagrams([]);
                    }
                    setLoading(false);
                }
            } catch (err) {
                setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
                console.error('Erro ao carregar dados:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Filtrar veículos baseado na marca selecionada
        if (selectedBrand) {
            const filtered = vehicles.filter(vehicle => vehicle.brand === selectedBrand);
            setFilteredVehicles(filtered);
            // Se o veículo selecionado não pertencer à marca, limpar a seleção
            if (selectedVehicle && !filtered.some(v => v._id === selectedVehicle)) {
                setSelectedVehicle('');
            }
        } else {
            setFilteredVehicles(vehicles);
        }
    }, [selectedBrand, vehicles, selectedVehicle]);

    useEffect(() => {
        // Buscar diagramas com os filtros aplicados
        fetchDiagrams();
    }, [searchQuery, selectedType, selectedBrand, selectedVehicle, selectedCategory, page]);

    // Função para filtrar diagramas do cache com os mesmos critérios que usaríamos na API
    const filterDiagramsFromCache = (cachedDiagrams) => {
        // Aplicar os mesmos filtros que usaríamos na API
        let filtered = [...cachedDiagrams];

        // Aplicar filtro por tipo
        if (selectedType) {
            filtered = filtered.filter(d => d.type === selectedType);
        }

        // Aplicar filtro por categoria
        if (selectedCategory) {
            // Obter veículos da categoria selecionada
            const vehiclesOfCategory = vehicles.filter(v => v.category === selectedCategory).map(v => v._id);
            if (vehiclesOfCategory.length > 0) {
                filtered = filtered.filter(d => vehiclesOfCategory.includes(d.vehicle));
            }
        }

        // Aplicar filtro por veículo
        if (selectedVehicle) {
            filtered = filtered.filter(d => d.vehicle === selectedVehicle);
        } else if (selectedBrand) {
            // Se temos uma marca selecionada mas nenhum veículo específico
            const vehiclesOfBrand = vehicles.filter(v => v.brand === selectedBrand).map(v => v._id);
            if (vehiclesOfBrand.length > 0) {
                filtered = filtered.filter(d => vehiclesOfBrand.includes(d.vehicle));
            }
        }

        // Aplicar filtro por termo de busca
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                d.title?.toLowerCase().includes(searchLower) ||
                d.description?.toLowerCase().includes(searchLower)
            );
        }

        // Ordenar por data de criação (mais recentes primeiro)
        filtered.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));

        // Paginar
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;

        // Calcular total de páginas
        setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);

        return filtered.slice(startIndex, endIndex);
    };

    const fetchDiagrams = async () => {
        setLoading(true);
        try {
            // Construir query params baseado nos filtros
            let params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', itemsPerPage);

            if (searchQuery) params.append('search', searchQuery);
            if (selectedType) params.append('type', selectedType);
            if (selectedVehicle) params.append('vehicle', selectedVehicle);

            // Se temos uma marca selecionada mas nenhum veículo específico,
            // buscar diagramas de todos os veículos dessa marca
            if (selectedBrand && !selectedVehicle) {
                // Para implementar isso, idealmente teríamos um endpoint no backend que aceita
                // filtro por marca. Como estamos assumindo que não temos, podemos fazer isso no frontend.
                // No backend real, você ajustaria essa lógica para usar um endpoint adequado.
                const vehiclesOfBrand = vehicles.filter(v => v.brand === selectedBrand).map(v => v._id);
                if (vehiclesOfBrand.length > 0) {
                    // Na prática, isso não funcionaria bem para muitos veículos, seria melhor
                    // ter um endpoint específico no backend
                    params.delete('vehicle');
                    params.append('vehicles', vehiclesOfBrand.join(','));
                }
            }

            // Verificar se podemos usar cache
            const cachedDiagrams = syncService.getCachedDiagrams();
            if (cachedDiagrams && cachedDiagrams.length > 0) {
                // Aplicar filtros no cache
                const filteredCache = filterDiagramsFromCache(cachedDiagrams);

                // Se temos resultados suficientes no cache, usá-los
                if (filteredCache.length > 0) {
                    setDiagrams(filteredCache);
                    setLoading(false);

                    // Ainda buscar do servidor em segundo plano para manter tudo atualizado
                    // mas não esperar a resposta para mostrar os dados
                    axios.get(`/api/diagrams?${params.toString()}`).then(res => {
                        if (res.data.data && res.data.data.length > 0) {
                            setDiagrams(res.data.data);
                        }
                    }).catch(err => {
                        console.error('Erro ao atualizar diagramas em segundo plano:', err);
                    });

                    return;
                }
            }

            // Se não temos cache ou não foi suficiente, buscar do servidor
            console.log('Buscando diagramas da API:', `/api/diagrams?${params.toString()}`);
            const res = await axios.get(`/api/diagrams?${params.toString()}`);

            if (res.data && res.data.data) {
                console.log(`Recebidos ${res.data.data.length} diagramas do servidor`);
                setDiagrams(res.data.data);

                // Calcular total de páginas
                const total = res.data.pagination?.total || res.data.data?.length || 0;
                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            } else {
                console.warn('Resposta da API sem dados:', res);
                setDiagrams([]);
                setError('Resposta do servidor sem dados. Tente novamente.');
            }

            setLoading(false);
        } catch (err) {
            // Verificar se temos cache para mostrar em caso de erro
            console.error('Erro ao carregar diagramas:', err);

            const cachedDiagrams = syncService.getCachedDiagrams();
            if (cachedDiagrams && cachedDiagrams.length > 0) {
                console.log('Usando dados em cache devido a erro de API');
                const filteredCache = filterDiagramsFromCache(cachedDiagrams);
                if (filteredCache.length > 0) {
                    setDiagrams(filteredCache);
                    setError('Usando dados em cache. Não foi possível conectar ao servidor.');
                } else {
                    setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
                    setDiagrams([]);
                }
            } else {
                setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
                setDiagrams([]);
            }

            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1);  // Reset para primeira página ao mudar a busca
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
        setPage(1);
    };

    const handleBrandChange = (event) => {
        setSelectedBrand(event.target.value);
        setSelectedVehicle('');  // Limpar seleção de veículo ao mudar marca
        setPage(1);
    };

    const handleVehicleChange = (event) => {
        setSelectedVehicle(event.target.value);
        setPage(1);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedType('');
        setSelectedBrand('');
        setSelectedVehicle('');
        setPage(1);
    };

    const handleDiagramClick = (id) => {
        navigate(`/diagrams/${id}`);
    };

    const renderDiagramTypeIcon = (type) => {
        switch (type) {
            case 'electrical':
                return <ElectricalServicesIcon />;
            case 'tracking':
                return <GpsFixedIcon />;
            default:
                return <DescriptionIcon />;
        }
    };

    const renderDiagramTypeLabel = (type) => {
        const types = {
            'electrical': 'Elétrico',
            'tracking': 'Rastreamento',
            'general': 'Geral',
        };

        return types[type] || type;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">
                    Início
                </Link>
                <Typography color="text.primary">Diagramas</Typography>
            </Breadcrumbs>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Diagramas
                    </Typography>
                    <Typography variant="subtitle1" paragraph color="text.secondary">
                        Busque diagramas elétricos e de rastreamento para veículos
                    </Typography>

                    {/* Componente de tratamento de erro */}
                    {error && (
                        <ErrorHandler
                            error={error}
                            onRetry={fetchDiagrams}
                            loading={loading}
                            message={error}
                            title="Erro ao carregar diagramas"
                        />
                    )}
                </Grid>

                {/* Filtros */}
                <Grid item xs={12}>
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <FilterListIcon sx={{ mr: 1 }} /> Filtros
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Buscar"
                                        variant="outlined"
                                        size="small"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            value={selectedType}
                                            onChange={handleTypeChange}
                                            label="Tipo"
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="electrical">Elétrico</MenuItem>
                                            <MenuItem value="tracking">Rastreamento</MenuItem>
                                            <MenuItem value="general">Geral</MenuItem>
                                            <MenuItem value="mechanical">Mecânico</MenuItem>
                                            <MenuItem value="electronics">Eletrônico</MenuItem>
                                            <MenuItem value="hybrid">Híbrido</MenuItem>
                                            <MenuItem value="diagnostic">Diagnóstico</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Categoria</InputLabel>
                                        <Select
                                            value={selectedCategory}
                                            onChange={handleCategoryChange}
                                            label="Categoria"
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            <MenuItem value="car">Carros</MenuItem>
                                            <MenuItem value="motorcycle">Motos</MenuItem>
                                            <MenuItem value="truck">Caminhões</MenuItem>
                                            <MenuItem value="bus">Ônibus</MenuItem>
                                            <MenuItem value="tractor">Tratores</MenuItem>
                                            <MenuItem value="suv">SUVs</MenuItem>
                                            <MenuItem value="pickup">Pickups</MenuItem>
                                            <MenuItem value="van">Vans</MenuItem>
                                            <MenuItem value="trailer">Reboques</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Marca</InputLabel>
                                        <Select
                                            value={selectedBrand}
                                            onChange={handleBrandChange}
                                            label="Marca"
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            {brands.map((brand) => (
                                                <MenuItem key={brand._id} value={brand._id}>
                                                    {brand.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Veículo</InputLabel>
                                        <Select
                                            value={selectedVehicle}
                                            onChange={handleVehicleChange}
                                            label="Veículo"
                                            disabled={filteredVehicles.length === 0}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {filteredVehicles.map((vehicle) => (
                                                <MenuItem key={vehicle._id} value={vehicle._id}>
                                                    {vehicle.model} {vehicle.year}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        onClick={handleClearFilters}
                                        size="small"
                                    >
                                        Limpar Filtros
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Resultados */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : diagrams.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Nenhum diagrama encontrado. Tente ajustar os filtros.
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {diagrams.map((diagram) => (
                            <Grid item key={diagram._id} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleDiagramClick(diagram._id)}
                                >
                                    {diagram.imageUrl ? (
                                        <ImageWithFallback
                                            src={diagram.imageUrl}
                                            fallbackSrc={
                                                diagram.type === 'tracking'
                                                    ? fallbackImages.trackerInstallation
                                                    : fallbackImages.electricalDiagram
                                            }
                                            fallbackType={diagram.type === 'tracking' ? 'tracking' : 'electrical'}
                                            alt={diagram.title}
                                            sx={{ height: 140, width: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                height: 140,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'grey.200',
                                            }}
                                        >
                                            {renderDiagramTypeIcon(diagram.type)}
                                        </Box>
                                    )}
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                mb: 1
                                            }}
                                        >
                                            <Typography variant="h6" component="div" gutterBottom>
                                                {diagram.title}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={renderDiagramTypeLabel(diagram.type)}
                                            size="small"
                                            color={diagram.type === 'electrical' ? 'error' : 'primary'}
                                            sx={{ mb: 1 }}
                                        />

                                        {diagram.vehicle && (
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                {/* Idealmente buscaríamos o modelo e marca, mas para simplificar usamos o ID */}
                                                {vehicles.find(v => v._id === diagram.vehicle)?.model || 'Veículo'}
                                            </Typography>
                                        )}

                                        {diagram.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {diagram.description.length > 80
                                                    ? `${diagram.description.substring(0, 80)}...`
                                                    : diagram.description}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default DiagramsPage;
