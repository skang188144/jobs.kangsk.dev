import { Center, Loader } from '@mantine/core';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export const withAuthRedirect = (WrappedComponent: React.ComponentType<any>, redirectTo: string) => {
    return function WithAuthRedirectWrapper(props: any) {
        const { isLoading, error } = useAuthRedirect(redirectTo);

        if (isLoading) {
            return (
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            );
        }

        return <WrappedComponent {...props} authError={error} />;
    };
}; 