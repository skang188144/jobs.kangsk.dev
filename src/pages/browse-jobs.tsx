import { Stack, Text, Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import { JobSearch } from '@/components/JobSearch';
import { JobCard } from '@/components/JobCard';
import Pagination from '@/components/Pagination';
import classes from './browse-jobs.module.css';
import Head from 'next/head';
import type { LinkedInJob } from '@/types/LinkedInJob';

const BrowseJobs = () => {
    const [jobType, setJobType] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState<LinkedInJob | null>(null);
    const [jobs, setJobs] = useState<LinkedInJob[]>([]);
    const [loading, setLoading] = useState(true);
    const jobsPerPage = 10;

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/linkedIn/fetchLinkedInJobs?${new URLSearchParams({
                    ...(jobType && { jobType }),
                    limit: '50'
                })}`);
                const data = await response.json();
                setJobs(data.map(job => ({
                    ...job,
                    date: new Date(job.date)
                })));
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [jobType]);

    const filteredJobs = jobs;
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    return (
        <>
            <Head>
                <title>Browse Jobs | jobs.kangsk.dev</title>
            </Head>
            <Stack gap="md" p="md" style={{ marginTop: '2rem' }}>
                <JobSearch jobType={jobType} setJobType={setJobType} />
                <Stack gap="md" className={classes.cardList}>
                    {loading ? (
                        <Text>Loading jobs...</Text>
                    ) : (
                        currentJobs.map((job, index) => (
                            <JobCard 
                                key={index} 
                                job={{
                                    title: job.position,
                                    company: job.company,
                                    location: job.location,
                                    salary: job.salary,
                                    type: job.jobType,
                                    posted: job.date,
                                    logo: job.companyLogo,
                                    remoteFilter: job.remoteFilter
                                }} 
                                onClick={() => setSelectedJob(job)} 
                            />
                        ))
                    )}
                </Stack>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
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
