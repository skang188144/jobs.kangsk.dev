import { Stack, Text, Modal, Loader } from '@mantine/core';
import { useState, useEffect } from 'react';
import { JobSearch } from '@/components/JobSearch';
import { JobCard } from '@/components/JobCard';
import Pagination from '@/components/Pagination';
import classes from './browse-jobs.module.css';
import Head from 'next/head';
import type { LinkedInJob } from '@/types/LinkedInJob';

const BrowseJobs = () => {
    const jobSuggestions = [
        'Software Engineer',
        'Product Manager',
        'Data Scientist',
        'UX Designer',
        'DevOps Engineer',
        'Full Stack Developer',
        'Project Manager',
        'Business Analyst',
        'Marketing Manager',
        'Sales Representative'
    ];

    const getRandomSuggestions = () => {
        return [...jobSuggestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
    };

    const [filters, setFilters] = useState({
        jobType: null,
        remotePreference: '',
        location: '',
        salary: '',
        timeFrame: 'any',
        experienceLevel: null
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState<LinkedInJob | null>(null);
    const [jobs, setJobs] = useState<LinkedInJob[]>([]);
    const [loading, setLoading] = useState(false);
    const jobsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const totalPages = Math.ceil(jobs.length / jobsPerPage);
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

    const handleSearch = async (immediateQuery?: string) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                query: immediateQuery || searchQuery,
                ...(filters.location && { location: filters.location }),
                ...(filters.timeFrame && { dateSincePosted: filters.timeFrame }),
                ...(filters.jobType && { jobType: filters.jobType }),
                ...(filters.remotePreference && { remoteFilter: filters.remotePreference }),
                ...(filters.salary && { salary: filters.salary }),
                ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
                limit: '50'
            });

            const response = await fetch(`/api/linkedIn/fetchLinkedInJobs?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            const objectifiedData = data.map((job: LinkedInJob) => ({
                ...job,
                date: new Date(job.date),
                scrapeDate: new Date(job.scrapeDate)
            }));
            setJobs(objectifiedData);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Browse Jobs | jobs.kangsk.dev</title>
            </Head>
            <Stack
                gap="md"
                p="md"
                style={{
                    minHeight: '100vh',
                    justifyContent: 'center'
                }}
            >
                {(!jobs.length) ? (
                    <Stack align="center" gap="xl">
                        {loading ? (
                            <Loader size="xl" />
                        ) : (
                            <>
                                <Text
                                    size="xl"
                                    fw={700}
                                    ta="center"
                                    style={{
                                        fontSize: '3.5rem',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    Browse Jobs
                                </Text>
                                <JobSearch
                                    filters={filters}
                                    setFilters={setFilters}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    onSearch={handleSearch}
                                />
                                <Stack gap="md">
                                    <Text ta="center" c="dimmed">Popular searches</Text>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {getRandomSuggestions().map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSearchQuery(suggestion);
                                                    handleSearch(suggestion);
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '20px',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </Stack>
                            </>
                        )}
                    </Stack>
                ) : (
                    <Stack gap="md" p="md" style={({ marginTop: '2rem' })}>
                        <JobSearch
                            filters={filters}
                            setFilters={setFilters}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                        />
                        <Stack gap="md" className={classes.cardList}>
                            {loading ? (
                                <Loader size="xl" />
                            ) : (
                                <>
                                    {currentJobs.map((job, index) => (
                                        <JobCard
                                            key={index}
                                            job={job}
                                            onClick={() => setSelectedJob(job)}
                                        />
                                    ))}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </>
                            )}
                        </Stack>
                    </Stack>
                )}
                <Modal
                    opened={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                    title={selectedJob?.position}
                >
                    {selectedJob && (
                        <>
                            <Text>{selectedJob.company}</Text>
                            <Text>{selectedJob.location}</Text>
                            <Text>{selectedJob.salary}</Text>
                            <Text>{selectedJob.date?.toLocaleDateString()}</Text>
                            <Text>
                                <a href={selectedJob.jobUrl} target="_blank" rel="noopener noreferrer">
                                    View on LinkedIn
                                </a>
                            </Text>
                        </>
                    )}
                </Modal>
            </Stack>
        </>
    );
};

export default BrowseJobs;
