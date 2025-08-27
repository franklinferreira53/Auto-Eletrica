import React from 'react';
import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 4,
        px: { xs: 2, md: 0 },
        minHeight: 'calc(100vh - 120px)', // Altura mínima considerando header e footer
        backgroundColor: isAdminRoute ? '#f5f7fa' : '#fff',
      }}
    >
      <Container maxWidth={isAdminRoute ? 'xl' : 'lg'}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;