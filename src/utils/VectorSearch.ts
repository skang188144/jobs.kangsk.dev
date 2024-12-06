export const generateSearchPipeline = (queryVector: number[], filters: {
    location?: string;
    dateSincePosted?: string;
    jobType?: string[];
    remoteFilter?: string[];
    salary?: string;
    experienceLevel?: string[];
    limit: number;
}) => {
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
                                ...(filters.jobType ? [{ "in": { "path": "jobType", "value": filters.jobType } }] : []),
                                ...(filters.remoteFilter ? [{ "in": { "path": "remoteFilter", "value": filters.remoteFilter } }] : []),
                                ...(filters.salary ? [{ "equals": { "path": "salary", "value": filters.salary } }] : []),
                                ...(filters.experienceLevel ? [{ "in": { "path": "experienceLevel", "value": filters.experienceLevel } }] : []),
                                ...(filters.dateSincePosted ? [{ "equals": { "path": "dateSincePosted", "value": filters.dateSincePosted } }] : [])
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
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: text,
            model: "text-embedding-ada-002"
        })
    });

    const result = await response.json();
    return result.data[0].embedding;
} 