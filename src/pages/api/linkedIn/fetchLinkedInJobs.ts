import type { NextApiRequest, NextApiResponse } from 'next';
import linkedIn from 'linkedin-jobs-api';
import { MongoError } from 'mongodb';
import type { LinkedInJob } from '@/types/LinkedInJob';
import { generateSearchPipeline, generateEmbedding } from '@/utils/LinkedInVectorSearch';
import { clientPromise } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { 
        query,
        location,
        dateSincePosted,
        jobType,
        remoteFilter,
        salary,
        experienceLevel,
        limit
    } = req.query;

    let limitNumber;
    let salaryNumber;

    if (limit === null) {
        limitNumber = 50;
    } else {
        limitNumber = Number(limit);
    }

    if (salary === 'NaN') {
        salaryNumber = null;
    } else {
        salaryNumber = Number(salary);
    }
    
    try {
        const client = await clientPromise;
        const db = client.db('jobs');
        const collection = db.collection<LinkedInJob>('scraped-linkedIn');

        const queryVector = await generateEmbedding(query as string);
        const pipeline = generateSearchPipeline(queryVector, {
            ...(location && { location: location as string }),
            ...(dateSincePosted && { dateSincePosted: dateSincePosted as string }),
            ...(jobType && { jobType: jobType as string }),
            ...(remoteFilter && { remoteFilter: remoteFilter as string }),
            ...(salaryNumber && { salary: salaryNumber }),
            ...(experienceLevel && { experienceLevel: experienceLevel as string }),
            limit: limitNumber
        });

        console.log('Search Pipeline:', JSON.stringify(pipeline, null, 2));
        
        const cachedResults = await collection.aggregate(pipeline).toArray();
        console.log('Cached Results Length:', cachedResults.length);
        console.log('First Cached Result:', cachedResults[0]);

        if (cachedResults && cachedResults.length > limitNumber) {
            return res.status(200).json(cachedResults);
        }

        // Get all existing job URLs from the database
        const existingJobUrls = await collection.distinct('jobUrl');
        console.log('Existing Job URLs count:', existingJobUrls.length);

        const linkedInApiResults = await linkedIn.query({
            keyword: query as string,
            location: location as string,
            dateSincePosted: dateSincePosted as string,
            jobType: jobType as string,
            remoteFilter: remoteFilter as string,
            salary: salary as string,
            experienceLevel: experienceLevel as string,
            limit: limit as string
        });

        // Filter out jobs that already exist in the database
        const newJobs = linkedInApiResults.filter((job: any) => 
            !existingJobUrls.includes(job.jobUrl)
        );

        // Get vector embeddings for new jobs and add them to database
        const processedLinkedInApiResults = newJobs.map((job : any) => {
            const { agoTime, date, salary, ...jobWithoutAgoTime } = job;
            return {
                ...jobWithoutAgoTime,
                scrapeDate: new Date(),
                jobType,
                remoteFilter,
                experienceLevel,
                salary: salary === 'NaN' ? null : Number(salary),
                date: new Date(date as string)
            };
        });

        // Only insert if there are new jobs
        if (processedLinkedInApiResults.length > 0) {
            await collection.insertMany(processedLinkedInApiResults);
            
            // Re-run the vector search to get updated results
            const updatedResults = await collection.aggregate(pipeline).toArray();
            return res.status(200).json(updatedResults);
        }

        // If no new jobs were added, return the original cached results
        return res.status(200).json(cachedResults);

    } catch (error) {
        console.error('Error in fetchLinkedInJobs:', error);
        
        // Determine error type and return appropriate response
        if (error instanceof MongoError) {
            return res.status(500).json({
                error: 'Database operation failed',
                details: error.message
            });
        }

        return res.status(500).json({
            error: 'An unexpected error occurred',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}