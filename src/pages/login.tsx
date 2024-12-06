import {
    Anchor,
    Button,
    Container,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
    Loader,
    Center,
} from '@mantine/core';
import classes from './login.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withAuthRedirect } from '@/components/withAuthRedirect';

const Login = ({ authError }: { authError?: string }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(authError || '');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                const data = await res.json();
                setErrorMsg(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('An error occurred. Please try again later.');
        }
    };

    const handleRouteToRegister = () => {
        router.push('/register');
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" className={classes.title}>
                jobs.kangsk.dev
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Do not have an account yet?{' '}
                <Anchor size="sm" component="button" onClick={handleRouteToRegister}>
                    Create account
                </Anchor>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleSubmit}>
                {errorMsg && (
                    <Text c="red" size="sm" mb="md">
                        {errorMsg}
                    </Text>
                )}
                <TextInput 
                    label="Username" 
                    placeholder="Username" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <PasswordInput 
                    label="Password" 
                    placeholder="Password" 
                    required 
                    mt="md" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" fullWidth mt="xl">
                    Sign in
                </Button>
            </Paper>
        </Container>
    );
};

export default withAuthRedirect(Login, '/dashboard');