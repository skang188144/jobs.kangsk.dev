import { FaRegCircleCheck } from "react-icons/fa6";
import { Button, Container, Group, Image, List, Text, ThemeIcon, Title } from '@mantine/core';
import classes from './index.module.css';
import { Recursive } from 'next/font/google';
import { useRouter } from 'next/router';
import Head from 'next/head';

const recursive = Recursive({
    subsets: ['latin'],
    weight: ['700']
});

const Home = () => {
    const router = useRouter();

    const handleLearnMoreButtonPress = () => {
        router.push('/about');
    };

    const handleGetStartedButtonPress = () => {
        router.push('/login');
    };

    return (
        <>
            <Head>
                <title>jobs.kangsk.dev</title>
            </Head>
            <Container size="md">
                <div className={classes.inner}>
                    <div className={classes.content}>
                        <Title className={`${classes.title} ${recursive.className}`}>
                            An <span className={classes.highlight}>all-in-one</span> jobs <br /> platform
                        </Title>
                        <Text c="dimmed" mt="md">
                            Find jobs, manage large quantities of applications, generate company-specific coverletters, and track email responses - all in one platform.
                        </Text>

                        <List
                            mt={30}
                            spacing="sm"
                            size="sm"
                            icon={
                                <ThemeIcon size={20} radius="xl">
                                    <FaRegCircleCheck size={12} />
                                </ThemeIcon>
                            }
                        >
                            <List.Item>
                                <b>Find jobs</b> – search for jobs on multiple platforms at once
                            </List.Item>
                            <List.Item>
                                <b>Generate cover letters</b> – generate cover letters tailored to each company
                            </List.Item>
                            <List.Item>
                                <b>Track applications</b> – track your applications and email responses (beta)
                            </List.Item>
                        </List>

                        <Group mt={30}>
                            <Button 
                                radius="xl" 
                                size="md" 
                                className={classes.control}
                                onClick={handleLearnMoreButtonPress}
                            >
                                Learn more
                            </Button>
                            <Button 
                                variant="default" 
                                radius="xl" 
                                size="md" 
                                className={classes.control}
                                onClick={handleGetStartedButtonPress}
                            >
                                Get started
                            </Button>
                        </Group>
                    </div>
                    <Image src={'/home_image_2.svg'} className={classes.image} />
                </div>
            </Container>
        </>
    );
}

export default Home;