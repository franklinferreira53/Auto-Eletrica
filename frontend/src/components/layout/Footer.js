import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Auto Elétrica
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema completo para instaladores de rastreamento veicular e auto elétrica automotiva.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Links Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                component={RouterLink}
                to="/"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/vehicles"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Veículos
              </Link>
              <Link
                component={RouterLink}
                to="/diagrams/tracking"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Rastreamento
              </Link>
              <Link
                component={RouterLink}
                to="/diagrams/electrical"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Auto Elétrica
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contato
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: contato@autoeletrica.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Telefone: (XX) XXXX-XXXX
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Auto Elétrica. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;