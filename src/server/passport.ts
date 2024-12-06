import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findUserByUsername, findUserById, verifyPassword } from './db';
import { ObjectId } from 'mongodb';
import UserWithoutPassword from '@/types/UserWithoutPassword';

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await findUserByUsername(username);
            
            if (!user) {
                return done(null, false, { message: 'User not found. Please try again.' });
            }

            const isValid = await verifyPassword(password, user.password);
            
            if (!isValid) {
                return done(null, false, { message: 'Invalid password. Please try again.' });
            }

            return done(null, user);
        } catch (error) {
            console.log('Error in passport', error);
            return done(error);
        }
    })
);

// Required for storing user in session
passport.serializeUser((user: any, done) => {
    done(null, (user as UserWithoutPassword)._id);
});

// Required for retrieving user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        console.log('Deserializing user with id:', id);
        // Convert string id to ObjectId
        const _id = new ObjectId(id);
        const user = await findUserById(_id);
        console.log('Found user:', user);
        if (!user) {
            console.log('No user found during deserialization');
            return done(null, null);
        }
        // Remove password from user object before sending to client
        const { password, ...userWithoutPassword } = user;
        console.log('Deserialized user:', userWithoutPassword);
        done(null, userWithoutPassword);
    } catch (err) {
        console.error('Error during deserialization:', err);
        done(err);
    }
});

export default passport; 