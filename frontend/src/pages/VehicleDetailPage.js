import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const VehicleDetailPage = () => {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [brand, setBrand] = useState(null);
    const [diagrams, setDiagrams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicleAndDiagrams = async () => {
            setLoading(true);
            try {
                // Carregar dados do veículo
                const vehicleRes = await axios.get(`/api/vehicles/${id}`);
                setVehicle(vehicleRes.data.data);

                // Carregar dados da marca
                if (vehicleRes.data.data.brand) {
                    const brandRes = await axios.get(`/api/brands/${vehicleRes.data.data.brand}`);
                    setBrand(brandRes.data.data);
                }

                // Carregar diagramas relacionados ao veículo
                const diagramRes = await axios.get(`/api/diagrams?vehicle=${id}`);
                setDiagrams(diagramRes.data.data);

                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar dados do veículo.');
                console.error('Erro ao carregar dados do veículo:', err);
                setLoading(false);
            }
        };

        fetchVehicleAndDiagrams();
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        component={RouterLink}
                        to="/vehicles"
                    >
                        Voltar para Veículos
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!vehicle) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="warning">Veículo não encontrado.</Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        component={RouterLink}
                        to="/vehicles"
                    >
                        Voltar para Veículos
                    </Button>
                </Box>
            </Container>
        );
    }

    const renderCategoryLabel = (category) => {
        const categories = {
            'car': 'Carro',
            'motorcycle': 'Moto',
            'truck': 'Caminhão',
            'pickup': 'Picape',
            'van': 'Van',
            'bus': 'Ônibus',
        };

        return categories[category] || category;
    };

    const renderFuelTypeLabel = (fuelType) => {
        const fuelTypes = {
            'gasoline': 'Gasolina',
            'diesel': 'Diesel',
            'ethanol': 'Etanol',
            'flex': 'Flex',
            'electric': 'Elétrico',
            'hybrid': 'Híbrido',
        };

        return fuelTypes[fuelType] || fuelType;
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
                <Link component={RouterLink} to="/vehicles" underline="hover" color="inherit">
                    Veículos
                </Link>
                <Typography color="text.primary">
                    {brand?.name} {vehicle.model}
                </Typography>
            </Breadcrumbs>

            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to="/vehicles"
                sx={{ mb: 3 }}
            >
                Voltar para Veículos
            </Button>

            {/* Informações do veículo */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0}>
                            <CardMedia
                                component="img"
                                height="240"
                                image={vehicle.image || '/images/placeholder-car.jpg'}
                                alt={`${vehicle.model}`}
                                sx={{ borderRadius: 1 }}
                            />
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h4" component="h1">
                                {brand?.name} {vehicle.model}
                            </Typography>
                        </Box>

                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            {vehicle.year} {vehicle.version && `• ${vehicle.version}`}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={renderCategoryLabel(vehicle.category)}
                                color="primary"
                                sx={{ mr: 1, mb: 1 }}
                            />
                            {vehicle.fuelType && (
                                <Chip
                                    label={renderFuelTypeLabel(vehicle.fuelType)}
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                />
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            {vehicle.engineType && (
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Motor:
                                    </Typography>
                                    <Typography variant="body1">{vehicle.engineType}</Typography>
                                </Grid>
                            )}

                            {vehicle.engineCapacity && (
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cilindrada:
                                    </Typography>
                                    <Typography variant="body1">{vehicle.engineCapacity}</Typography>
                                </Grid>
                            )}

                            {vehicle.transmissionType && (
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Transmissão:
                                    </Typography>
                                    <Typography variant="body1">
                                        {vehicle.transmissionType === 'manual' ? 'Manual' :
                                            vehicle.transmissionType === 'automatic' ? 'Automática' :
                                                vehicle.transmissionType === 'cvt' ? 'CVT' :
                                                    vehicle.transmissionType}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Diagramas disponíveis */}
            <Typography variant="h5" component="h2" gutterBottom>
                Diagramas Disponíveis
            </Typography>

            {diagrams.length === 0 ? (
                <Alert severity="info" sx={{ mb: 4 }}>
                    Não há diagramas disponíveis para este veículo.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {diagrams.map((diagram) => (
                        <Grid item key={diagram._id} xs={12} sm={6} md={4}>
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
                                to={`/diagrams/${diagram._id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                        <DescriptionIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                                        <Typography variant="h6" component="div">
                                            {diagram.title}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={renderDiagramTypeLabel(diagram.type)}
                                        size="small"
                                        color="secondary"
                                        sx={{ mb: 2 }}
                                    />

                                    {diagram.description && (
                                        <Typography variant="body2" paragraph>
                                            {diagram.description.length > 100
                                                ? `${diagram.description.substring(0, 100)}...`
                                                : diagram.description
                                            }
                                        </Typography>
                                    )}

                                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Visualizações: {diagram.views || 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Downloads: {diagram.downloads || 0}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default VehicleDetailPage;
