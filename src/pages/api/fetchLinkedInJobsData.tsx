import type { NextApiRequest, NextApiResponse } from 'next';
import linkedIn from 'linkedin-jobs-api';
import { MongoClient } from 'mongodb';
import type { Job } from '@/types/Job';
import { generateSearchPipeline, generateEmbedding } from '@/utils/VectorSearch';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { 
        query = '',
        location,
        dateSincePosted,
        jobType,
        remoteFilter,
        salary,
        experienceLevel,
        limit = 100
    } = req.query;
    
    try {
        await client.connect();
        const db = client.db('jobs');
        const all = db.collection<Job>('all');

        const jobTypes = Array.isArray(jobType) ? jobType : jobType ? [jobType] : undefined;
        const remoteFilters = Array.isArray(remoteFilter) ? remoteFilter : remoteFilter ? [remoteFilter] : undefined;
        const experienceLevels = Array.isArray(experienceLevel) ? experienceLevel : experienceLevel ? [experienceLevel] : undefined;

        const queryVector = await generateEmbedding(query as string);

        const pipeline = generateSearchPipeline(queryVector, {
            ...(location && { location: location as string }),
            ...(dateSincePosted && { dateSincePosted: dateSincePosted as string }),
            ...(jobTypes && { jobType: jobTypes as string[] }),
            ...(remoteFilters && { remoteFilter: remoteFilters as string[] }),
            ...(salary && { salary: salary as string }),
            ...(experienceLevels && { experienceLevel: experienceLevels as string[] }),
            limit: limit as number
        });

        const semanticResults = await all.aggregate(pipeline).toArray();
        return res.status(200).json(semanticResults);
        
    } catch (error) {
        console.error('Error in semantic search:', error);
        return res.status(500).json({ error: 'Failed to perform semantic search' });
    }
}