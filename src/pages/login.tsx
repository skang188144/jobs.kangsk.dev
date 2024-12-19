import {
    Anchor,
    Button,
    Container,
    Paper,
    Text,
    TextInput,
    Title,
    Loader,
    Group,
    Divider,
} from '@mantine/core';
import classes from './login.module.css';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { LinkedInLoginButton } from '@/components/LinkedInLoginButton';
import { useForm } from '@mantine/form';
import Head from 'next/head';

const Login = ({ authError }: { authError?: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(authError || '');
    const router = useRouter();

    const form = useForm({
        initialValues: {
            email: '',
        },
        validate: {
            email: (val) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Invalid email'),
        },
    });

    const handleSubmit = (values: { email: string }) => {
        setErrorMsg('');
        setIsLoading(true);

        localStorage.setItem('pendingVerification', values.email);

        signIn('email', {
            email: values.email,
            callbackUrl: '/dashboard',
        });
    };

    return (
        <>
            <Head>
                <title>Sign In | jobs.kangsk.dev</title>
            </Head>
            <Container size={420} my={40}>
                <Title ta="center" className={classes.title}>
                    jobs.kangsk.dev
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Welcome! Please enter your email to continue
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={form.onSubmit(handleSubmit)}>
                    {errorMsg && (
                        <Text c="red" size="sm" mb="md">
                            {errorMsg}
                        </Text>
                    )}

                    <Group grow mb="md" mt="md">
                        <GoogleLoginButton radius="xl">Google</GoogleLoginButton>
                        <LinkedInLoginButton radius="xl">LinkedIn</LinkedInLoginButton>
                    </Group>

                    <Divider label="Or continue with email" labelPosition="center" my="lg" />

                    <TextInput 
                        label="Email" 
                        placeholder="your@email.com" 
                        required 
                        value={form.values.email}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                    />
                    
                    <Group justify="space-between" mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => router.push('/')} size="xs">
                            Back to home page
                        </Anchor>
                        <Button 
                            type="submit"
                            radius="xl"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader size="sm" /> : 'Sign in'}
                        </Button>
                    </Group>
                </Paper>
            </Container>
        </>
    );
};

export default Login;