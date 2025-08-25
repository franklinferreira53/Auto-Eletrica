import React from 'react';
import { Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>
      <Typography variant="body1">
        Nome: {user?.name}
      </Typography>
      <Typography variant="body1">
        Email: {user?.email}
      </Typography>
      <Typography variant="body1">
        Função: {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
      </Typography>
    </Box>
  );
};

export default Profile;