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

// Páginas de Veículos e Diagramas
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import DiagramsPage from './pages/DiagramsPage';
import DiagramDetailPage from './pages/DiagramDetailPage';

// Páginas do Cliente
import DashboardPage from './pages/client/DashboardPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';

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

              {/* Rotas de Veículos e Diagramas */}
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="/diagrams" element={<DiagramsPage />} />
              <Route path="/diagrams/:id" element={<DiagramDetailPage />} />

              {/* Rotas do Cliente */}
              <Route
                path="/dashboard"
                element={<PrivateRoute element={<DashboardPage />} />}
              />
              <Route
                path="/subscription/plans"
                element={<SubscriptionPlansPage />}
              />
              <Route
                path="/subscription"
                element={<PrivateRoute element={<SubscriptionPlansPage />} />}
              />
              <Route
                path="/payment-settings"
                element={<PrivateRoute element={<PaymentSettingsPage />} />}
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
