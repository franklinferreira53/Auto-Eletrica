import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';

const AdminDashboardPage = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Painel Administrativo
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Usuários
                        </Typography>
                        <Typography variant="h4">0</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Veículos
                        </Typography>
                        <Typography variant="h4">0</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Diagramas
                        </Typography>
                        <Typography variant="h4">0</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Assinaturas Ativas
                        </Typography>
                        <Typography variant="h4">0</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboardPage;
