import { TextInput, TextInputProps, ActionIcon, useMantineTheme } from '@mantine/core';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { FilterButton } from './FilterButton';
import { useState } from 'react';
import classes from './JobSearch.module.css';

interface JobSearchProps extends TextInputProps {
    jobType: string | null;
    setJobType: (value: string | null) => void;
}

export function JobSearch({ jobType, setJobType, ...props }: JobSearchProps) {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <div className={classes.searchWrapper}>
            <TextInput
                radius="xl"
                size="md"
                placeholder="Search jobs..."
                rightSectionWidth={42}
                leftSection={<FiSearch size={18} />}
                rightSection={
                    <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled">
                        <FiArrowRight size={18} />
                    </ActionIcon>
                }
                style={{ flex: 1 }}
                {...props}
            />
            <FilterButton 
                opened={opened}
                onChange={setOpened}
                jobType={jobType}
                setJobType={setJobType}
            />
        </div>
    );
} 