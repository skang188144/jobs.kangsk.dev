import { Stack, Text, Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import type UserWithoutPassword from '@/types/UserWithoutPassword';
import { withAuth, withAuthServerSideProps } from '@/components/withAuth';
import { JobSearch } from '@/components/JobSearch';
import { JobCard } from '@/components/JobCard';
import Pagination from '@/components/Pagination';
import classes from './browse-jobs.module.css';

// Update the mock data
const MOCK_JOBS = Array(20).fill(null).map((_, index) => ({
    title: [
        "Senior Software Engineer",
        "Full Stack Developer",
        "Frontend Engineer",
        "Backend Developer",
        "DevOps Engineer",
        "Product Manager",
        "UX Designer",
        "Data Scientist",
        "Mobile Developer",
        "Cloud Architect"
    ][index % 10],
    company: [
        "Tech Corp",
        "Startup Inc",
        "Design Co",
        "Data Systems",
        "Cloud Solutions",
        "Mobile Apps Ltd",
        "AI Research",
        "Security Pro",
        "Web Services",
        "Digital Agency"
    ][index % 10],
    location: [
        "San Francisco, CA",
        "New York, NY",
        "Remote",
        "Seattle, WA",
        "Austin, TX",
        "Boston, MA",
        "Chicago, IL",
        "Los Angeles, CA",
        "Miami, FL",
        "Denver, CO"
    ][index % 10],
    salary: [
        "$150k - $180k",
        "$120k - $150k",
        "$130k - $160k",
        "$140k - $170k",
        "$160k - $190k",
        "$145k - $175k",
        "$135k - $165k",
        "$155k - $185k",
        "$125k - $155k",
        "$165k - $195k"
    ][index % 10],
    type: ["Full-time", "Part-time", "Contract", "Internship"][index % 4],
    posted: [
        "2 days ago",
        "1 day ago",
        "3 days ago",
        "4 days ago",
        "5 days ago",
        "1 week ago",
        "2 weeks ago",
        "3 weeks ago",
        "1 month ago",
        "Just now"
    ][index % 10],
    logo: `https://via.placeholder.com/50?text=${index + 1}`
}));

const BrowseJobs = () => {
    const [userData, setUserData] = useState<{ user: UserWithoutPassword | null }>({
        user: null
    });
    const [jobType, setJobType] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 2;
    const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null);

    const filteredJobs = jobType ? MOCK_JOBS.filter(job => job.type === jobType) : MOCK_JOBS;
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/user', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.success) {
                    setUserData({ user: data.user });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    return (
        <Stack gap="md" p="md" style={{ marginTop: '2rem' }}>
            <JobSearch jobType={jobType} setJobType={setJobType} />
            <Stack gap="md" className={classes.cardList}>
                {currentJobs.map((job, index) => (
                    <JobCard key={index} job={job} onClick={() => setSelectedJob(job)} />
                ))}
            </Stack>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <Modal
                opened={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                title={selectedJob?.title}
            >
                {selectedJob && (
                    <>
                        <Text>{selectedJob.company}</Text>
                        <Text>{selectedJob.location}</Text>
                        <Text>{selectedJob.salary}</Text>
                        <Text>{selectedJob.posted}</Text>
                        <Text>Job description and requirements go here...</Text>
                    </>
                )}
            </Modal>
        </Stack>
    );
};

export const getServerSideProps = withAuthServerSideProps();
export default withAuth(BrowseJobs);
