import Navbar from "@/components/Navbar";
import { AppShell } from '@mantine/core';
import classes from './dashboard.module.css';
import { withAuth, withAuthServerSideProps } from '@/components/withAuth';

const Dashboard = () => {
    return (
        <AppShell
            navbar={{ width: 300, breakpoint: 'sm' }}
            padding="md"
            className={classes.shell}
        >
            <AppShell.Navbar>
                <Navbar />
            </AppShell.Navbar>

            <AppShell.Main className={classes.main}>
                {/* Your main content will go here */}
            </AppShell.Main>
        </AppShell>
    );
};

// Apply both client and server-side protection
export const getServerSideProps = withAuthServerSideProps();
export default withAuth(Dashboard);