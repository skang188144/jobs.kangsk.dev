import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import UserWithPassword from '@/types/UserWithPassword';

if (!process.env.MONGODB_URI) {
    console.log(process.env.MONGODB_URI);
    throw new Error('Missing MongoDB URI')
}

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;

async function getClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }

    return client;
}

/**
 * FOR DEVELOPMENT PURPOSES ONLY -- TODO: REMOVE BEFORE DEPLOYING
 */
process.on('SIGINT', async () => {
    await client?.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

export async function findUserByUsername(username: string) {
    try {
        const client = await getClient();
        const database = client.db('auth');
        return await database.collection<UserWithPassword>('accounts').findOne({ username });
    } catch (error) {
        console.error('Error finding user by username:', error);
        return null;
    }
}

export async function findUserByEmail(email: string) {
    try {
        const client = await getClient();
        const database = client.db('auth');
        return await database.collection<UserWithPassword>('accounts').findOne({ email });
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
}

export async function findUserById(_id: ObjectId) {
    try {
        const client = await getClient();
        const database = client.db('auth');
        return await database.collection<UserWithPassword>('accounts').findOne({ _id });
    } catch (error) {
        console.error('Error finding user by id:', error);
        return null;
    }
}

export async function createUser(
    email: string, 
    username: string, 
    password: string,
    firstName: string, 
    lastName: string, 
) {
    try {
        const client = await getClient();
        const database = client.db('auth');
        return await database.collection('accounts').insertOne({ 
            email, 
            username, 
            password,
            firstName, 
            lastName 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
}

export async function verifyPassword(inputPassword: string, hashedPassword: string) {
    return await bcrypt.compare(inputPassword, hashedPassword);
}