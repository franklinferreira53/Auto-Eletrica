import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { loadUser } from './redux/auth/authSlice';

// Tema
import theme from './theme';

// Componentes de Layout
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Páginas Públicas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas do Cliente
import DashboardPage from './pages/client/DashboardPage';

// Páginas do Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const App = () => {
    useEffect(() => {
        // Carregar usuário se o token estiver no localStorage
        store.dispatch(loadUser());
    }, []);

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Header />
                    <Layout>
                        <Routes>
                            {/* Rotas Públicas */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Rotas do Cliente */}
                            <Route
                                path="/dashboard"
                                element={<PrivateRoute element={<DashboardPage />} />}
                            />

                            {/* Rotas do Admin */}
                            <Route
                                path="/admin"
                                element={<AdminRoute element={<AdminDashboardPage />} />}
                            />

                            {/* Rota de Fallback */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Layout>
                    <Footer />
                    <ToastContainer />
                </Router>
            </ThemeProvider>
        </Provider>
    );
};

export default App;
