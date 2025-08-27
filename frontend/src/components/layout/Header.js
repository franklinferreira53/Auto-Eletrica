import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { logout } from '../../redux/auth/authSlice';
import DiagramNotifications from '../notifications/DiagramNotifications';
import * as syncServiceImports from '../../services/syncService';
// Criar alias para syncService para manter compatibilidade
const syncService = syncServiceImports.default || syncServiceImports;

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Inicializar o serviço de sincronização quando o componente é montado
  useEffect(() => {
    if (isAuthenticated) {
      // Iniciar serviço de sincronização automática
      syncService.initSyncService();
    }
  }, [isAuthenticated]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleCloseUserMenu();
  };

  // Opções de navegação para usuários autenticados
  const navItems = [
    { label: 'Veículos', path: '/vehicles', icon: <DirectionsCarIcon /> },
    { label: 'Rastreamento', path: '/diagrams?type=tracking', icon: <DirectionsCarIcon /> },
    { label: 'Auto Elétrica', path: '/diagrams?type=electrical', icon: <ElectricalServicesIcon /> },
  ];

  // Opções de navegação para visitantes
  const publicNavItems = [
    { label: 'Planos', path: '/plans' },
    { label: 'Contato', path: '/contact' },
  ];

  // Opções do menu do usuário
  const userMenuItems = [
    { label: 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Meu Perfil', path: '/profile' },
    { label: 'Favoritos', path: '/favorites' },
    { label: 'Assinatura', path: '/subscription' },
    { label: 'Sair', onClick: handleLogout, icon: <LogoutIcon fontSize="small" /> },
  ];

  if (user?.role === 'admin') {
    userMenuItems.splice(1, 0, { label: 'Admin', path: '/admin' });
  }

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo para desktop */}
          <DirectionsCarIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Auto Elétrica
          </Typography>

          {/* Menu para mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {isAuthenticated
                ? navItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => handleMenuClick(item.path)}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                      <Typography textAlign="center">{item.label}</Typography>
                    </Box>
                  </MenuItem>
                ))
                : publicNavItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => handleMenuClick(item.path)}>
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
            </Menu>
          </Box>

          {/* Logo para mobile */}
          <DirectionsCarIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Auto Elétrica
          </Typography>

          {/* Menu para desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated
              ? navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))
              : publicNavItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {item.label}
                </Button>
              ))}
          </Box>

          {/* Botões de login/registro ou menu de usuário */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {/* Componente de notificações */}
                <Box sx={{ mr: 1 }}>
                  <DiagramNotifications />
                </Box>

                <Tooltip title="Abrir configurações">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user?.name}
                      src={user?.avatar}
                      sx={{ bgcolor: 'secondary.main' }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2">{user?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={item.onClick ? item.onClick : () => {
                        navigate(item.path);
                        handleCloseUserMenu();
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                        <Typography textAlign="left">{item.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ color: 'white', mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  color="secondary"
                >
                  Cadastrar
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;