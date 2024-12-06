import {
    Anchor,
    Button,
    Container,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import classes from './login.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withAuthRedirect } from '@/components/withAuthRedirect';

const Register = ({ authError }: { authError?: string }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(authError || '');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            if (res.status === 201) {
                router.push('/login');
            } else {
                const data = await res.json();
                setErrorMsg(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('An error occurred. Please try again later.');
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" className={classes.title}>
                jobs.kangsk.dev
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Create an account
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleSubmit}>
                {errorMsg && (
                    <Text c="red" size="sm" mb="md">
                        {errorMsg}
                    </Text>
                )}
                <TextInput 
                    label="Email" 
                    placeholder="Email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextInput 
                    label="Username" 
                    placeholder="Username" 
                    required 
                    mt="md" 
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
                    Create account
                </Button>
            </Paper>
        </Container>
    );
};

export default withAuthRedirect(Register, '/dashboard');