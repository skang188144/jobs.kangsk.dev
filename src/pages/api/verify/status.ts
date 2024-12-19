import { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('auth');

        const verificationToken = await db.collection('verification_tokens').findOne({
            identifier: email,
            expires: { $gt: new Date() }
        });

        return res.json({
            isAwaitingVerification: !!verificationToken
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 