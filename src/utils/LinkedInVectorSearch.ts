import { OpenAI } from "openai";

export const generateSearchPipeline = (queryVector: number[], filters: {
    location?: string;
    dateSincePosted?: string;
    jobType?: string;
    remoteFilter?: string;
    salary?: number;
    experienceLevel?: string;
    limit: number;
}) => {
    let postThreshold: Date | null = null;
    
    if (filters.dateSincePosted) {
        const now = new Date();
        switch (filters.dateSincePosted) {
            case '24hr':
                postThreshold = new Date(now.setDate(now.getDate() - 1));
                break;
            case 'past week':
                postThreshold = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'past month':
                postThreshold = new Date(now.setMonth(now.getMonth() - 1));
                break;
        }
    }

    const scrapeThreshold = new Date(new Date().setDate(new Date().getDate() - 1));

    return [
        {
            "$search": {
                "index": "default",
                "knnBeta": {
                    "vector": queryVector,
                    "path": "jobVector",
                    "k": filters.limit,
                    "filter": {
                        "compound": {
                            "must": [
                                ...(filters.location ? [{ "text": { "path": "location", "query": filters.location } }] : []),
                                ...(filters.jobType ? [{ "equals": { "path": "jobType", "value": filters.jobType } }] : []),
                                ...(filters.remoteFilter ? [{ "equals": { "path": "remoteFilter", "value": filters.remoteFilter } }] : []),
                                ...(filters.salary ? [{ "equals": { "path": "salary", "value": filters.salary } }] : []),
                                ...(filters.experienceLevel ? [{ "equals": { "path": "experienceLevel", "value": filters.experienceLevel } }] : []),
                                {
                                    "range": {
                                        "path": "scrapeDate",
                                        "gte": scrapeThreshold
                                    }
                                },
                                ...(postThreshold ? [{
                                    "range": {
                                        "path": "postDate",
                                        "gte": postThreshold
                                    }
                                }] : [])
                            ]
                        }
                    }
                }
            }
        },
        {
            "$limit": filters.limit || 100
        },
        {
            "$project": {
                "jobId": 1,
                "title": 1,
                "company": 1,
                "location": 1,
                "description": 1,
                "url": 1,
                "postedAt": 1,
                "score": { "$meta": "searchScore" }
            }
        }
    ];
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.embeddings.create({
            input: text,
            model: "text-embedding-ada-002",
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
} 