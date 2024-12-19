import { Center, Container, Loader, Text } from "@mantine/core";

const AuthLoading = () => {
    return (
        <Center h="100vh">
            <Container size={420} style={{ textAlign: 'center' }}>
                <Text c="dimmed" size="sm" ta="center" mb={30}>
                    Loading your session...
                </Text>
                <Loader size="lg" />
            </Container>
        </Center>
    );
}

export default AuthLoading;