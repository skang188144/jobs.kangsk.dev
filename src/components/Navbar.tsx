import { Code, Group, ScrollArea, UnstyledButton, Collapse, Text } from '@mantine/core';
import Image from 'next/image';
import { FiHome, FiFileText, FiBriefcase, FiSettings, FiChevronRight, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import classes from './Navbar.module.css';
import packageInfo from '../../package.json';
import { useUser } from '@/hooks/useUser';

interface NavItem {
    label: string;
    icon: React.FC<{ size?: number }>;
    links?: Array<{
        label: string;
        link: string;
    }>;
}

interface NavItemProps {
    icon: React.FC<{ size?: number }>;
    label: string;
    initiallyOpened?: boolean;
    links?: Array<{
        label: string;
        link: string;
    }>;
}

const navigationItems: NavItem[] = [
    { label: 'Dashboard', icon: FiHome },
    {
        label: 'Jobs',
        icon: FiBriefcase,
        links: [
            { label: 'Browse Jobs', link: '/browse-jobs' },
            { label: 'Saved Jobs', link: '/saved-jobs' },
            { label: 'Applied Jobs', link: '/applied-jobs' },
        ],
    },
    {
        label: 'Cover Letters',
        icon: FiFileText,
        links: [
            { label: 'My Resume', link: '/my-resume' },
            { label: 'My Letters', link: '/my-letters' },
            { label: 'Generate New Letter', link: '/generate-new-letter' },
        ],
    },
    { label: 'Settings', icon: FiSettings },
];

function NavItem({ icon: Icon, label, initiallyOpened, links }: NavItemProps) {
    const [opened, setOpened] = useState(initiallyOpened || false);
    const hasLinks = Array.isArray(links);

    const ChevronIcon = FiChevronRight;

    return (
        <>
            <UnstyledButton
                onClick={() => setOpened((o) => !o)}
                className={classes.control}
            >
                <Group justify="space-between" gap={0}>
                    <Group gap="md">
                        <Icon size={18} />
                        <span>{label}</span>
                    </Group>
                    {hasLinks && (
                        <ChevronIcon
                            className={classes.chevron}
                            size={14}
                            style={{
                                transform: opened ? `rotate(90deg)` : 'none',
                                transition: 'transform 200ms ease',
                            }}
                        />
                    )}
                </Group>
            </UnstyledButton>
            {hasLinks && (
                <Collapse in={opened}>
                    <div className={classes.linksInner}>
                        {links.map((link) => (
                            <Text<'a'>
                                component="a"
                                className={classes.link}
                                href={link.link}
                                key={link.label}
                                onClick={(event) => event.preventDefault()}
                            >
                                {link.label}
                            </Text>
                        ))}
                    </div>
                </Collapse>
            )}
        </>
    );
}

function UserButton() {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <UnstyledButton className={classes.user}>
                <Group>
                    <FiUser size={20} />
                    <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                            Loading...
                        </Text>
                    </div>
                </Group>
            </UnstyledButton>
        );
    }

    return (
        <UnstyledButton className={classes.user}>
            <Group>
                <FiUser size={20} />
                <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                        {user ? user.username : 'Not logged in'}
                    </Text>
                    <Text c="dimmed" size="xs">
                        {user ? user.email : 'Please sign in'}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    );
}

export default function Navbar() {
    const navItems = navigationItems.map((item) => (
        <NavItem {...item} key={item.label} />
    ));

    return (
        <nav className={classes.navbar}>
            <div className={classes.header}>
                <Group justify="space-between">
                    <Group gap="sm">
                        <Image 
                            src="/Logo.svg" 
                            alt="logo" 
                            width={30} 
                            height={30} 
                            priority 
                        />
                        <Text fw={700}>jobs.kangsk.dev</Text>
                    </Group>
                    <Code fw={700}>v{packageInfo.version}</Code>
                </Group>
            </div>

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{navItems}</div>
            </ScrollArea>

            <div className={classes.footer}>
                <UserButton />
            </div>
        </nav>
    );
}