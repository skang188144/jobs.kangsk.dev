import { Container, Paper, Text, Title, Button, Center, Divider, Group } from '@mantine/core';
import { FaPaperPlane } from 'react-icons/fa';
import classes from './verify.module.css';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { LinkedInLoginButton } from '@/components/LinkedInLoginButton';
import Head from 'next/head';

const Verify = () => {
    return (
        <>
            <Head>
                <title>Verify Email | jobs.kangsk.dev</title>
            </Head>
            <Container size={420} my={120}>
                <Title ta="center" className={classes.title}>
                    Check your email
                </Title>

                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <div style={{ textAlign: 'center' }}>
                        <FaPaperPlane size={50} style={{ marginBottom: 20 }} />
                        <Text c="dimmed" size="sm">
                            A sign in email has been sent to your email address with further instructions. Please check your email.
                        </Text>
                    </div>
                </Paper>

                <Button
                    fullWidth
                    radius="xl"
                    mt="xl"
                >
                    Resend email
                </Button>

                <Divider label="Or continue with" labelPosition="center" my="lg" />

                <Group grow mb="md" mt="md">
                    <GoogleLoginButton radius="xl">Google</GoogleLoginButton>
                    <LinkedInLoginButton radius="xl">LinkedIn</LinkedInLoginButton>
                </Group>
            </Container>
        </>
    );
};

export default Verify;