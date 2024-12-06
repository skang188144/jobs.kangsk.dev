export interface JobSearchRequest {
    query: string;
    location?: string;
    dateSincePosted?: 'day' | 'week' | 'month';
    jobType?: 'full-time' | 'part-time' | 'volunteer' | 'internship';
    remoteFilter?: 'on-site' | 'remote' | 'hybrid';
    salary?: number;
    experienceLevel?: 'internship' | 'entry-level' | 'associate' | 'senior' | 'director';
    limit?: number;
}