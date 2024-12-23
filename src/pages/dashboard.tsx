import { Card, Group, RingProgress, Text, Grid, Stack, useMantineTheme, SimpleGrid } from '@mantine/core';
import classes from './dashboard.module.css';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

const Dashboard = () => {
    const theme = useMantineTheme();
    const { data: session } = useSession();

    const [userData] = useState({
        totalApplications: 42,
        responseRate: 65,
        recentApplications: [
            { company: 'Tech Corp', position: 'Senior Developer', date: '2024-03-15' },
            { company: 'StartUp Inc', position: 'Full Stack Engineer', date: '2024-03-14' },
        ],
        savedJobs: [
            { company: 'Innovation Labs', position: 'Frontend Developer', date: '2024-03-13' },
            { company: 'Digital Solutions', position: 'React Developer', date: '2024-03-12' },
        ],
        resumes: [
            { name: 'Software Developer Resume', lastModified: '2024-03-10' },
            { name: 'Full Stack Resume', lastModified: '2024-03-05' },
        ],
        coverLetters: [
            { name: 'General Tech Cover Letter', lastModified: '2024-03-08' },
            { name: 'Startup Cover Letter', lastModified: '2024-03-03' },
        ]
    });

    return (
        <>
            <Head>
                <title>Dashboard | jobs.kangsk.dev</title>
            </Head>
            <Stack gap="md" p="md">
                <div className={classes.welcomeContainer}>
                    <Text className={classes.welcomeText}>Welcome,</Text>
                    <Text className={classes.nameText}>
                        {session?.user?.firstName || 'User'}!
                    </Text>
                </div>

                <Grid gutter="md">
                    <Grid.Col span={8}>
                        <Stack gap="md">
                            <Card withBorder radius="1rem" p="xl" className={`${classes.card} ${classes.overviewCard}`}>
                                <Stack h="100%">
                                    <Text className={classes.label} fz="xl">Applications Overview</Text>
                                    
                                    <div className={classes.inner} style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <Text className={classes.lead} fz={96}>{userData.totalApplications}</Text>
                                            <Text fz="sm" c="dimmed">Total Applications</Text>
                                        </div>

                                        <div className={classes.ring}>
                                            <RingProgress
                                                size={200}
                                                roundCaps
                                                thickness={8}
                                                sections={[{ value: userData.responseRate, color: theme.primaryColor }]}
                                                label={
                                                    <div>
                                                        <Text ta="center" fz={30} className={classes.label}>
                                                            {userData.responseRate}%
                                                        </Text>
                                                        <Text ta="center" fz="sm" c="dimmed">
                                                            Response Rate
                                                        </Text>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                </Stack>
                            </Card>

                            <SimpleGrid cols={2} spacing="md">
                                <Card withBorder radius="1rem" p="xl" className={classes.card}>
                                    <Text className={classes.label} fz="xl" mb="lg">My Resumes</Text>
                                    <Stack gap="md">
                                        {userData.resumes.map((resume, index) => (
                                            <Group key={index} justify="space-between">
                                                <Text className={classes.label}>{resume.name}</Text>
                                                <Text fz="xs" c="dimmed">{resume.lastModified}</Text>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Card>

                                <Card withBorder radius="1rem" p="xl" className={classes.card}>
                                    <Text className={classes.label} fz="xl" mb="lg">My Cover Letters</Text>
                                    <Stack gap="md">
                                        {userData.coverLetters.map((letter, index) => (
                                            <Group key={index} justify="space-between">
                                                <Text className={classes.label}>{letter.name}</Text>
                                                <Text fz="xs" c="dimmed">{letter.lastModified}</Text>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Card>
                            </SimpleGrid>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <div className={classes.rightColumn}>
                            <Card withBorder radius="1rem" p="md" className={`${classes.card} ${classes.listCard}`}>
                                <Text className={classes.label} mb="sm">Recent Applications</Text>
                                <Stack gap="xs">
                                    {userData.recentApplications.map((app, index) => (
                                        <Group key={index} justify="space-between">
                                            <div>
                                                <Text size="sm" fw={500}>{app.company}</Text>
                                                <Text size="xs" c="dimmed">{app.position}</Text>
                                            </div>
                                            <Text size="xs" c="dimmed">{app.date}</Text>
                                        </Group>
                                    ))}
                                </Stack>
                            </Card>

                            <Card withBorder radius="1rem" p="md" className={`${classes.card} ${classes.listCard}`}>
                                <Text className={classes.label} mb="sm">Saved Jobs</Text>
                                <Stack gap="xs">
                                    {userData.savedJobs.map((job, index) => (
                                        <Group key={index} justify="space-between">
                                            <div>
                                                <Text size="sm" fw={500}>{job.company}</Text>
                                                <Text size="xs" c="dimmed">{job.position}</Text>
                                            </div>
                                            <Text size="xs" c="dimmed">{job.date}</Text>
                                        </Group>
                                    ))}
                                </Stack>
                            </Card>
                        </div>
                    </Grid.Col>
                </Grid>
            </Stack>
        </>
    );
};

export default Dashboard;