import { ActionIcon, Popover, Stack, Text, Divider, Select, SegmentedControl, RangeSlider, Button, Group, useMantineTheme } from '@mantine/core';
import { FiFilter } from 'react-icons/fi';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import classes from './FilterButton.module.css';

interface FilterButtonProps {
    opened: boolean;
    onChange: (opened: boolean) => void;
    jobType: string | null;
    setJobType: (value: string | null) => void;
}

export function FilterButton({ opened, onChange, jobType, setJobType }: FilterButtonProps) {
    const theme = useMantineTheme();
    const [workLocation, setWorkLocation] = useState('all');
    const [salaryRange, setSalaryRange] = useState<[number, number]>([50, 200]);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

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
                    data-opened={opened}
                >
                    <FiFilter size={18} />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap="md">
                    <Text fw={500} size="sm">Filters</Text>
                    
                    <Divider />

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Job Type</Text>
                        <Select
                            placeholder="Select job type"
                            data={['Full-time', 'Part-time', 'Contract', 'Internship']}
                            value={jobType}
                            onChange={setJobType}
                            clearable
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Work Location</Text>
                        <SegmentedControl
                            value={workLocation}
                            onChange={setWorkLocation}
                            data={[
                                { label: 'All', value: 'all' },
                                { label: 'Remote', value: 'remote' },
                                { label: 'On-site', value: 'onsite' },
                                { label: 'Hybrid', value: 'hybrid' },
                            ]}
                            fullWidth
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Salary Range (K)</Text>
                        <RangeSlider
                            value={salaryRange}
                            onChange={setSalaryRange}
                            min={0}
                            max={400}
                            step={10}
                            minRange={20}
                            marks={[
                                { value: 0, label: '$0k' },
                                { value: 200, label: '$200k' },
                                { value: 400, label: '$400k' },
                            ]}
                        />
                        <Text size="sm" c="dimmed" ta="center">
                            ${salaryRange[0]}k - ${salaryRange[1]}k
                        </Text>
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Posted Date</Text>
                        <DatePickerInput
                            type="range"
                            placeholder="Pick dates range"
                            value={dateRange}
                            onChange={setDateRange}
                            clearable
                        />
                    </Stack>

                    <Divider />

                    <Group justify="flex-end" gap="sm">
                        <Button 
                            variant="subtle" 
                            onClick={() => {
                                setJobType(null);
                                setWorkLocation('all');
                                setSalaryRange([50, 200]);
                                setDateRange([null, null]);
                            }}
                        >
                            Reset
                        </Button>
                        <Button onClick={() => onChange(false)}>
                            Apply Filters
                        </Button>
                    </Group>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
