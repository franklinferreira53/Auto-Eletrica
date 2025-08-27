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
    FormControlLabel,
    Checkbox,
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { register } from '../redux/auth/authSlice';

const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
    password: Yup.string()
        .required('Senha é obrigatória')
        .min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Senhas devem ser iguais')
        .required('Confirmação de senha é obrigatória'),
    phone: Yup.string(),
    company: Yup.string(),
    profileType: Yup.string()
        .required('Selecione seu perfil profissional'),
    acceptTerms: Yup.boolean()
        .oneOf([true], 'Você deve aceitar os termos do período de teste')
        .required('Você deve aceitar os termos do período de teste'),
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileOptions] = useState([
        { value: 'installer', label: 'Instalador de Rastreadores' },
        { value: 'electrician', label: 'Eletricista Automotivo' },
        { value: 'both', label: 'Ambos' }
    ]);

    useEffect(() => {
        // Se o usuário já estiver autenticado, redirecionar
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (values, { setSubmitting }) => {
        const { name, email, password, phone, company, profileType } = values;
        dispatch(register({
            name,
            email,
            password,
            phone,
            company,
            profileType,
            trialStart: new Date().toISOString(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias a partir de hoje
        }));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
                px: 2,
            }}
        >
            <Card sx={{ maxWidth: 600, width: '100%' }}>
                <CardHeader
                    title="Criar Conta"
                    subheader="Registre-se para acessar o sistema"
                    avatar={<PersonAddIcon fontSize="large" color="primary" />}
                    titleTypographyProps={{ align: 'center' }}
                    subheaderTypographyProps={{ align: 'center' }}
                    sx={{ pb: 0 }}
                />
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Formik
                        initialValues={{
                            name: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            phone: '',
                            company: '',
                            profileType: '',
                            acceptTerms: false
                        }}
                        validationSchema={RegisterSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, isValid, dirty }) => (
                            <Form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="name"
                                            label="Nome Completo"
                                            error={Boolean(errors.name && touched.name)}
                                            helperText={touched.name && errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="email"
                                            label="Email"
                                            type="email"
                                            error={Boolean(errors.email && touched.email)}
                                            helperText={touched.email && errors.email}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="password"
                                            label="Senha"
                                            type={showPassword ? 'text' : 'password'}
                                            error={Boolean(errors.password && touched.password)}
                                            helperText={touched.password && errors.password}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="confirmPassword"
                                            label="Confirmar Senha"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            error={Boolean(errors.confirmPassword && touched.confirmPassword)}
                                            helperText={touched.confirmPassword && errors.confirmPassword}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            edge="end"
                                                        >
                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="phone"
                                            label="Telefone"
                                            error={Boolean(errors.phone && touched.phone)}
                                            helperText={touched.phone && errors.phone}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            name="company"
                                            label="Empresa"
                                            error={Boolean(errors.company && touched.company)}
                                            helperText={touched.company && errors.company}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            select
                                            fullWidth
                                            name="profileType"
                                            label="Perfil Profissional"
                                            error={Boolean(errors.profileType && touched.profileType)}
                                            helperText={touched.profileType && errors.profileType}
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value=""></option>
                                            {profileOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Field>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="acceptTerms"
                                                    id="acceptTerms"
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2">
                                                    Concordo com os termos do período de teste gratuito de 7 dias.
                                                    Entendo que terei acesso limitado aos diagramas e que não poderei
                                                    fazer download ou acessar offline.
                                                </Typography>
                                            }
                                        />
                                        {errors.acceptTerms && touched.acceptTerms && (
                                            <FormHelperText error>{errors.acceptTerms}</FormHelperText>
                                        )}
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    disabled={loading || !(isValid && dirty)}
                                    sx={{ mt: 3 }}
                                >
                                    {loading ? 'Processando...' : 'Registrar'}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                    <Divider sx={{ my: 3 }} />
                    <Stack direction="row" justifyContent="center">
                        <Typography variant="body2" color="text.secondary">
                            Já tem uma conta?{' '}
                            <Link component={RouterLink} to="/login" variant="body2">
                                Faça login aqui
                            </Link>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterPage;
