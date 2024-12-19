import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { clientPromise } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, dateOfBirth } = req.body;

    try {
        const client = await clientPromise;
        const db = client.db('auth');

        await db.collection('users').updateOne(
            { email: session.user.email },
            {
                $set: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    registrationCompleted: true,
                }
            },
            { upsert: true }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
