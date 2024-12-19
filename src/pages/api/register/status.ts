import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { clientPromise } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('auth');

        const user = await db.collection('users').findOne({
            email: session.user.email,
            registrationCompleted: true
        });

        return res.json({
            isRegistrationComplete: !!user
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
