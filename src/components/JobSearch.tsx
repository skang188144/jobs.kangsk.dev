import { TextInput, TextInputProps, ActionIcon, useMantineTheme } from '@mantine/core';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { FilterButton } from './FilterButton';
import { useState } from 'react';
import classes from './JobSearch.module.css';

interface JobSearchProps extends TextInputProps {
    filters: {
        jobType: string | null;
        remotePreference: string;
        location: string;
        salary: string;
        timeFrame: string;
        experienceLevel: string | null;
    };
    setFilters: (filters: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: () => void;
}

export function JobSearch({ filters, setFilters, searchQuery, setSearchQuery, onSearch, ...props }: JobSearchProps) {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <div className={classes.searchWrapper}>
            <TextInput
                radius="xl"
                size="md"
                placeholder="Browse jobs..."
                rightSectionWidth={42}
                leftSection={<FiSearch size={18} />}
                rightSection={
                    <ActionIcon 
                        size={32} 
                        radius="xl" 
                        color={theme.primaryColor} 
                        variant="filled"
                        onClick={onSearch}
                    >
                        <FiArrowRight size={18} />
                    </ActionIcon>
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSearch();
                    }
                }}
                style={{ flex: 1 }}
                {...props}
            />
            <FilterButton 
                opened={opened}
                onChange={setOpened}
                filters={filters}
                setFilters={setFilters}
            />
        </div>
    );
} 