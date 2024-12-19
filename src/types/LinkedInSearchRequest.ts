export interface JobSearchRequest {
    query: string;
    location?: string;
    dateSincePosted?: '24hr' | 'past week' | 'past month';
    jobType?: 'full time' | 'part time' | 'volunteer' | 'internship';
    remoteFilter?: 'on site' | 'remote' | 'hybrid';
    salary?: number;
    experienceLevel?: 'internship' | 'entry level' | 'associate' | 'senior' | 'director';
    limit?: number;
}