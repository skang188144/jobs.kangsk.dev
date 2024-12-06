import '@mantine/core/styles.css';
import '@mantine/core/styles/global.css';

import type { AppProps } from 'next/app';
import { createTheme, MantineProvider, AppShell } from '@mantine/core';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';

const theme = createTheme({
    /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    
    // Define routes where navbar should be hidden
    const noNavbarRoutes = ['/', '/login', '/register'];
    const shouldShowNavbar = !noNavbarRoutes.includes(router.pathname);

    return (
        <MantineProvider theme={theme}>
            <AppShell
                navbar={shouldShowNavbar ? { width: 300, breakpoint: 'sm' } : undefined}
                padding="md"
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
        </MantineProvider>
    );
}