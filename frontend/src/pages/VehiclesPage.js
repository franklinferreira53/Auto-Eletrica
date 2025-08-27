import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
    Divider,
    CircularProgress,
    Pagination,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link as RouterLink } from 'react-router-dom';

const VehiclesPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        year: '',
        category: '',
    });

    // Opções de categoria
    const categories = [
        { value: 'sedan', label: 'Carro Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'motorcycle', label: 'Moto' },
        { value: 'truck', label: 'Caminhão' },
        { value: 'pickup', label: 'Picape' },
        { value: 'van', label: 'Van' },
        { value: 'bus', label: 'Ônibus' },
        { value: 'electric_vehicle', label: 'Veículo Elétrico' },
        { value: 'tractor', label: 'Trator' },
        { value: 'trailer', label: 'Carreta/Reboque' },
    ];

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axios.get('/api/brands');
                setBrands(res.data.data);
            } catch (err) {
                setError('Erro ao carregar marcas.');
                console.error('Erro ao carregar marcas:', err);
            }
        };

        fetchBrands();
    }, []);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                let queryString = `?page=${page}&limit=12`;

                if (filters.brand) queryString += `&brand=${filters.brand}`;
                if (filters.model) queryString += `&model=${filters.model}`;
                if (filters.year) queryString += `&year=${filters.year}`;
                if (filters.category) queryString += `&category=${filters.category}`;

                const res = await axios.get(`/api/vehicles${queryString}`);

                setVehicles(res.data.data);
                setTotalPages(Math.ceil(res.data.count / 12));
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar veículos.');
                console.error('Erro ao carregar veículos:', err);
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [page, filters]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setPage(1); // Reset para a primeira página ao filtrar
    };

    const handleClearFilters = () => {
        setFilters({
            brand: '',
            model: '',
            year: '',
            category: '',
        });
        setPage(1);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                <DirectionsCarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Veículos
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="body1" paragraph>
                    Selecione um veículo para ver os diagramas disponíveis para ele.
                </Typography>

                {/* Filtros */}
                <Card sx={{ mb: 4, p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Marca</InputLabel>
                                <Select
                                    name="brand"
                                    value={filters.brand}
                                    onChange={handleFilterChange}
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
                            <TextField
                                fullWidth
                                name="model"
                                label="Modelo"
                                value={filters.model}
                                onChange={handleFilterChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                name="year"
                                label="Ano"
                                value={filters.year}
                                onChange={handleFilterChange}
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 1900, max: 2030 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    label="Categoria"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleClearFilters}
                                sx={{ height: '56px' }}
                            >
                                Limpar Filtros
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : vehicles.length === 0 ? (
                <Alert severity="info" sx={{ mb: 4 }}>
                    Nenhum veículo encontrado com os critérios selecionados.
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {vehicles.map((vehicle) => {
                            const brand = brands.find(b => b._id === vehicle.brand)?.name || 'Marca';

                            return (
                                <Grid item key={vehicle._id} xs={12} sm={6} md={4}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                                boxShadow: 6,
                                            }
                                        }}
                                        component={RouterLink}
                                        to={`/vehicles/${vehicle._id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={vehicle.image || '/images/placeholder-car.jpg'}
                                            alt={`${vehicle.model}`}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" component="div" gutterBottom noWrap>
                                                {brand} {vehicle.model}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {vehicle.year}
                                                {vehicle.version && ` • ${vehicle.version}`}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {vehicle.engineType && `Motor: ${vehicle.engineType}`}
                                                {vehicle.fuelType && ` • ${vehicle.fuelType}`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Paginação */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default VehiclesPage;
