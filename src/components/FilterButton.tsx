import { ActionIcon, Popover, Stack, Text, Button, Group, useMantineTheme, Radio, TextInput, SegmentedControl, Select, UnstyledButton, Title, Box } from '@mantine/core';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import classes from './FilterButton.module.css';

interface FilterButtonProps {
    opened: boolean;
    onChange: (opened: boolean) => void;
    filters: {
        jobType: string | null;
        remotePreference: string;
        location: string;
        salary: string;
        timeFrame: string;
        experienceLevel: string | null;
    };
    setFilters: (filters: {
        jobType: string | null;
        remotePreference: string;
        location: string;
        salary: string;
        timeFrame: string;
        experienceLevel: string | null;
    }) => void;
}

export function FilterButton({ opened, onChange, filters, setFilters }: FilterButtonProps) {
    const theme = useMantineTheme();
    const [expandedSections, setExpandedSections] = useState({
        experience: true,
        jobType: true,
        location: true,
        remote: true,
        salary: true,
        date: true
    });

    const FilterSection = ({ title, id, children }: { 
        title: string; 
        id: keyof typeof expandedSections; 
        children: React.ReactNode 
    }) => (
        <Box>
            <UnstyledButton 
                onClick={() => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))}
                style={{ width: '100%', padding: '8px 0' }}
            >
                <Group justify="space-between" align="center">
                    <Text size="sm">{title}</Text>
                    {expandedSections[id] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </Group>
            </UnstyledButton>
            {expandedSections[id] && (
                <Box mt="sm" mb="lg">
                    {children}
                </Box>
            )}
        </Box>
    );

    const handleReset = () => {
        setFilters({
            jobType: null,
            remotePreference: '',
            location: '',
            salary: '',
            timeFrame: 'any',
            experienceLevel: null
        });
    };

    return (
        <Popover opened={opened} onChange={onChange} position="bottom-end" width={320}>
            <Popover.Target>
                <ActionIcon 
                    size={42} 
                    radius="xl"
                    variant={opened ? "filled" : "default"}
                    className={classes.filterButton}
                    onClick={() => onChange(!opened)}
                    color={opened ? theme.primaryColor : "gray"}
                    styles={(theme) => ({
                        root: {
                            '&[data-opened="true"]:hover': {
                                backgroundColor: theme.colors[theme.primaryColor][6]
                            }
                        }
                    })}
                    data-opened={opened}
                >
                    <FiFilter size={18} />
                </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown p="lg">
                <Stack>
                    <Box mb="md">
                        <Text size="lg" fw={600}>Filter Jobs</Text>
                        <Text size="xs" c="dimmed">Refine your job search</Text>
                    </Box>

                    {/* Filter Sections */}
                    <Stack gap="xs">
                        <FilterSection title="Experience Level" id="experience">
                            <Select
                                size="sm"
                                value={filters.experienceLevel}
                                onChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                                placeholder="Select experience level"
                                clearable
                                styles={{ input: { color: 'var(--mantine-color-gray-6)' } }}
                                data={[
                                    { label: 'Internship', value: 'internship' },
                                    { label: 'Entry', value: 'entry level' },
                                    { label: 'Associate', value: 'associate' },
                                    { label: 'Senior', value: 'senior' },
                                    { label: 'Director', value: 'director' },
                                ]}
                            />
                        </FilterSection>

                        <FilterSection title="Job Type" id="jobType">
                            <Select
                                size="sm"
                                value={filters.jobType}
                                onChange={(value) => setFilters({ ...filters, jobType: value })}
                                placeholder="Select job type"
                                clearable
                                styles={{ input: { color: 'var(--mantine-color-gray-6)' } }}
                                data={[
                                    { label: 'Full Time', value: 'full time' },
                                    { label: 'Part Time', value: 'part time' },
                                    { label: 'Volunteer', value: 'volunteer' },
                                ]}
                            />
                        </FilterSection>

                        <FilterSection title="Location" id="location">
                            <TextInput
                                size="sm"
                                placeholder="Enter city, state, or country"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.currentTarget.value })}
                            />
                        </FilterSection>

                        <FilterSection title="Remote Preferences" id="remote">
                            <SegmentedControl
                                size="sm"
                                fullWidth
                                value={filters.remotePreference}
                                onChange={(value) => setFilters({ ...filters, remotePreference: value })}
                                data={[
                                    { label: 'On Site', value: 'on site' },
                                    { label: 'Remote', value: 'remote' },
                                    { label: 'Hybrid', value: 'hybrid' },
                                ]}
                            />
                        </FilterSection>

                        <FilterSection title="Salary Range" id="salary">
                            <Radio.Group value={filters.salary} onChange={(value) => setFilters({ ...filters, salary: value })} size="sm">
                                <Stack gap="xs">
                                    <Radio value="20000" label="Under $20,000" />
                                    <Radio value="40000" label="Under $40,000" />
                                    <Radio value="60000" label="Under $60,000" />
                                    <Radio value="80000" label="Under $80,000" />
                                    <Radio value="100000" label="Under $100,000" />
                                    <Radio value="100001" label="$100,000+" />
                                </Stack>
                            </Radio.Group>
                        </FilterSection>

                        <FilterSection title="Posted Date" id="date">
                            <SegmentedControl
                                size="sm"
                                fullWidth
                                value={filters.timeFrame}
                                onChange={(value) => setFilters({ ...filters, timeFrame: value })}
                                data={[
                                    { label: 'Past Day', value: '24hr' },
                                    { label: 'Past Week', value: 'past week' },
                                    { label: 'Past Month', value: 'past month' },
                                ]}
                            />
                        </FilterSection>
                    </Stack>

                    {/* Actions */}
                    <Group justify="flex-end" gap="xs" mt="lg">
                        <Button 
                            variant="subtle" 
                            size="sm"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button size="sm" onClick={() => onChange(false)}>
                            Apply
                        </Button>
                    </Group>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
