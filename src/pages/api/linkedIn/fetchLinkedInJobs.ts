import type { NextApiRequest, NextApiResponse } from 'next';
import linkedIn from 'linkedin-jobs-api';
import { MongoError } from 'mongodb';
import type { LinkedInJob } from '@/types/LinkedInJob';
import { generateSearchPipeline, generateEmbedding } from '@/utils/LinkedInVectorSearch';
import { clientPromise } from '@/lib/db';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { 
        query = 'Software Engineer Intern',
        location,
        dateSincePosted,
        jobType,
        remoteFilter,
        salary,
        experienceLevel,
        limit = '50'
    } = req.query;
    
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
            ...(salary && { salary: salary as string }),
            ...(experienceLevel && { experienceLevel: experienceLevel as string }),
            limit: Number(limit)
        });

        const cachedResults = await collection.aggregate(pipeline).toArray();

        if (cachedResults && cachedResults.length > 0) {
            return res.status(200).json(cachedResults);
        }

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

        const processedLinkedInApiResults = linkedInApiResults.map((job : any) => {
            const { agoTime, date, salary, ...jobWithoutAgoTime } = job;
            return {
                ...jobWithoutAgoTime,
                scrapeDate: new Date(),
                jobType: jobType as string,
                remoteFilter: remoteFilter as string,
                experienceLevel: experienceLevel as string,
                salary: Number(salary as string),
                date: new Date(date as string)
            };
        });

        await collection.insertMany(processedLinkedInApiResults);
        return res.status(200).json(processedLinkedInApiResults);

    } catch (error) {
        console.error('Error:', error);
        
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