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
} from '@mantine/core';
import classes from './login.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import Head from 'next/head';

const Register = ({ authError }: { authError?: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(authError || '');
    const router = useRouter();

    useEffect(() => {
        const channel = new BroadcastChannel('auth');
        channel.onmessage = (event) => {
            if (event.data === 'REGISTRATION_COMPLETE') {
                router.push('/dashboard');
            }
        };
        return () => channel.close();
    }, [router]);

    const form = useForm({
        initialValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
        },
        validate: {
            firstName: (val) => (val.length < 3 ? 'First name must be at least 3 characters' : null),
            lastName: (val) => (val.length < 3 ? 'Last name must be at least 3 characters' : null),
            dateOfBirth: (val) => (!val ? 'Date of birth is required' : null),
        },
    });

    const handleSubmit = async (values: { firstName: string; lastName: string; dateOfBirth: string }) => {
        setErrorMsg('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/register/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const channel = new BroadcastChannel('auth');
            channel.postMessage('REGISTRATION_COMPLETE');
            
            await router.push('/dashboard');
        } catch (error) {
            setErrorMsg('Registration failed due to an unknown error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Create Account | jobs.kangsk.dev</title>
            </Head>
            <Container size={420} my={40}>
                <Title ta="center" className={classes.title}>
                    jobs.kangsk.dev
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Create an account
                </Text>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={form.onSubmit(handleSubmit)}>
                    {errorMsg && (
                        <Text c="red" size="sm" mb="md">
                            {errorMsg}
                        </Text>
                    )}

                    <TextInput 
                        label="First Name" 
                        placeholder="John" 
                        required 
                        value={form.values.firstName}
                        onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
                        error={form.errors.firstName}
                        mb="md"
                    />

                    <TextInput 
                        label="Last Name" 
                        placeholder="Doe" 
                        required 
                        value={form.values.lastName}
                        onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
                        error={form.errors.lastName}
                        mb="md"
                    />

                    <TextInput 
                        type="date"
                        label="Date of Birth" 
                        required 
                        value={form.values.dateOfBirth}
                        onChange={(event) => form.setFieldValue('dateOfBirth', event.currentTarget.value)}
                        error={form.errors.dateOfBirth}
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
                            {isLoading ? <Loader size="sm" /> : 'Create account'}
                        </Button>
                    </Group>
                </Paper>
            </Container>
        </>
    );
};

export default Register;