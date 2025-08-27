import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormHelperText,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login } from '../redux/auth/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .required('Senha é obrigatória')
    .min(4, 'Senha deve ter pelo menos 4 caracteres'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Se o usuário já estiver autenticado, redirecionar
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(login({ email: values.email, password: values.password }));
    setSubmitting(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 2 }}>
              <LockOutlinedIcon color="primary" fontSize="large" />
              <Typography variant="h5" component="h1" sx={{ mt: 1 }}>
                Login
              </Typography>
            </Box>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Stack spacing={2}>
                  <Field name="email">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        fullWidth
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isSubmitting || loading}
                      />
                    )}
                  </Field>

                  <Field name="password">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Senha"
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                        disabled={isSubmitting || loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <Box sx={{ mt: 2 }}>
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Esqueceu a senha?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Não tem uma conta? Cadastre-se"}
                </Link>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Acesso rápido para teste:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              admin@admin.com / admin
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;