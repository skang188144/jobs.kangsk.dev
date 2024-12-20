import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { AppProps } from 'next/app';
import { createTheme, MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { SessionProvider } from 'next-auth/react'
import Auth from '@/components/Auth';
import { NO_NAVBAR_ROUTES } from '@/config/routes';

const theme = createTheme({
    /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const shouldShowNavbar = !NO_NAVBAR_ROUTES.includes(router.pathname);

    return (
        <SessionProvider>
            <MantineProvider theme={theme}>
                <Notifications />
                <ModalsProvider>
                    <Auth pathname={router.pathname}>
                        <AppShell
                            navbar={shouldShowNavbar ? { width: 300, breakpoint: 'sm' } : undefined}
                        >
                            {shouldShowNavbar && (
                                <AppShell.Navbar>
                                    <Navbar />
                                </AppShell.Navbar>
                            )}

                            <AppShell.Main>
                                <Component {...pageProps} />
                            </AppShell.Main>
                        </AppShell>
                    </Auth>
                </ModalsProvider>
            </MantineProvider>
        </SessionProvider>
    );
}