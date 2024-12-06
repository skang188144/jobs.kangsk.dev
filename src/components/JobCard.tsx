import { Card, Group, Text, Badge, ActionIcon, Stack, Collapse, Button } from '@mantine/core';
import { FiBookmark, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';
import classes from './JobCard.module.css';

interface JobCardProps {
    job: {
        title: string;
        company: string;
        location: string;
        salary: string;
        type: string;
        posted: string;
        logo: string;
    };
    onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder 
            className={classes.jobCard} 
            onClick={() => setExpanded(!expanded)}
        >
            <Group align="flex-start" wrap="nowrap">
                <img src={job.logo} alt={`${job.company} logo`} className={classes.companyLogo} />
                <div style={{ flex: 1 }}>
                    <Group justify="space-between" mb="xs">
                        <Text fw={600} size="lg" style={{ color: '#2C3E50' }}>{job.title}</Text>
                        <Group gap="xs">
                            <ActionIcon 
                                variant="subtle" 
                                color="gray" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Add save functionality here
                                }}
                            >
                                <FiBookmark size={18} />
                            </ActionIcon>
                            <Badge variant="light" color="blue">{job.type}</Badge>
                        </Group>
                    </Group>

                    <Group mb="xs">
                        <Text c="dimmed" size="sm">{job.company}</Text>
                        <Text c="dimmed" size="sm">•</Text>
                        <Text c="dimmed" size="sm">{job.location}</Text>
                    </Group>

                    <Group justify="space-between" mt="md">
                        <Text fw={500} c="blue.6">{job.salary}</Text>
                        <Group gap="xs" align="center">
                            <Text size="sm" c="dimmed">{job.posted}</Text>
                            <FiChevronDown 
                                size={18} 
                                style={{ 
                                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 200ms ease',
                                }} 
                            />
                        </Group>
                    </Group>

                    <Collapse in={expanded} mt="md">
                        <Stack gap="md" p="md" style={{ 
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            borderRadius: 'var(--mantine-radius-md)',
                        }}>
                            <Text fw={500}>Job Description</Text>
                            <Text size="sm">
                                This is where the detailed job description would go. You can include requirements,
                                responsibilities, and other relevant information.
                            </Text>
                            <Button onClick={(e) => {
                                e.stopPropagation();
                                onClick?.();
                            }}>
                                Apply Now
                            </Button>
                        </Stack>
                    </Collapse>
                </div>
            </Group>
        </Card>
    );
} 