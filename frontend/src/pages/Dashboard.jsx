import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Build as DiagramIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [recentDiagrams, setRecentDiagrams] = useState([]);
  const [popularDiagrams, setPopularDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recentResponse, popularResponse] = await Promise.all([
        axios.get('/api/diagrams?limit=6&sortBy=createdAt&sortOrder=desc'),
        axios.get('/api/diagrams?limit=6&sortBy=views&sortOrder=desc')
      ]);

      setRecentDiagrams(recentResponse.data.diagrams);
      setPopularDiagrams(popularResponse.data.diagrams);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'basico': return 'success';
      case 'intermediario': return 'warning';
      case 'avancado': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'basico': return 'Básico';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return difficulty;
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'alarme': 'Alarme',
      'rastreamento': 'Rastreamento',
      'som_automotivo': 'Som Automotivo',
      'ar_condicionado': 'Ar Condicionado',
      'vidro_eletrico': 'Vidro Elétrico',
      'trava_eletrica': 'Trava Elétrica',
      'sistema_injecao': 'Sistema de Injeção',
      'ignicao_eletronica': 'Ignição Eletrônica',
      'outros': 'Outros'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          {isAuthenticated ? `Bem-vindo, ${user?.name}!` : 'Bem-vindo ao Auto-Elétrica!'}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Sistema completo para instaladores de equipamentos automotivos
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
          Acesse diagramas de instalação, gerencie veículos e consulte informações técnicas.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <CarIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Consultar Veículos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Navegue pela base de dados de veículos e encontre especificações técnicas.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                component={Link} 
                to="/vehicles" 
                variant="contained" 
                startIcon={<CarIcon />}
              >
                Ver Veículos
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                <DiagramIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Diagramas de Instalação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acesse diagramas detalhados para instalação de equipamentos automotivos.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                component={Link} 
                to="/diagrams" 
                variant="contained" 
                color="secondary"
                startIcon={<DiagramIcon />}
              >
                Ver Diagramas
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Diagrams */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Diagramas Recentes
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {recentDiagrams.map((diagram) => (
          <Grid item xs={12} sm={6} md={4} key={diagram._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {diagram.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {diagram.description.substring(0, 100)}...
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={getCategoryLabel(diagram.category)} 
                    size="small" 
                    color="primary" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={getDifficultyLabel(diagram.difficulty)} 
                    size="small" 
                    color={getDifficultyColor(diagram.difficulty)} 
                  />
                </Box>
                {diagram.vehicle && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {diagram.vehicle.brand} {diagram.vehicle.model} {diagram.vehicle.year}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {diagram.views} visualizações
                  </Typography>
                  <LikeIcon fontSize="small" sx={{ ml: 2, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {diagram.likeCount || 0} curtidas
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  component={Link} 
                  to={`/diagrams/${diagram._id}`} 
                  size="small"
                >
                  Ver Detalhes
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Popular Diagrams */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Diagramas Populares
      </Typography>
      <Grid container spacing={3}>
        {popularDiagrams.map((diagram) => (
          <Grid item xs={12} sm={6} md={4} key={diagram._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {diagram.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {diagram.description.substring(0, 100)}...
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={getCategoryLabel(diagram.category)} 
                    size="small" 
                    color="primary" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={getDifficultyLabel(diagram.difficulty)} 
                    size="small" 
                    color={getDifficultyColor(diagram.difficulty)} 
                  />
                </Box>
                {diagram.vehicle && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {diagram.vehicle.brand} {diagram.vehicle.model} {diagram.vehicle.year}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {diagram.views} visualizações
                  </Typography>
                  <LikeIcon fontSize="small" sx={{ ml: 2, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {diagram.likeCount || 0} curtidas
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  component={Link} 
                  to={`/diagrams/${diagram._id}`} 
                  size="small"
                >
                  Ver Detalhes
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {recentDiagrams.length === 0 && popularDiagrams.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum diagrama encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seja o primeiro a adicionar diagramas ao sistema!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;