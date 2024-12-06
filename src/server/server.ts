import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

import express, { NextFunction, Request, Response } from 'express';
import next from 'next';
import session from 'express-session';
import passport from './passport';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserByUsername } from './db';

const dev = process.env.NODE_ENV !== 'production';
const app = next({
    dev: dev
});
const handle = app.getRequestHandler();

// Export the handler for Vercel
export default async function handler(req: Request, res: Response) {
    await app.prepare();
    const server = express();

    if (!process.env.SESSION_SECRET) {
        throw new Error('Missing SESSION_SECRET');
    }

    // Add body parser middleware
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    server.use((req: Request, res: Response, next: NextFunction) => {
        const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
        res.locals.nonce = nonce;
        next();
    });

    const helmetConfig = {
        contentSecurityPolicy: dev ? false : {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'", 
                    (req: any, res: any) => `'nonce-${res.locals.nonce}'`,
                    "'unsafe-eval'"
                ],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "data:"],
            },
        },
        crossOriginEmbedderPolicy: !dev,
        crossOriginOpenerPolicy: !dev,
        crossOriginResourcePolicy: !dev,
    };

    server.use(helmet(helmetConfig));
    server.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    }));

    // Set up session middleware with MongoDB store
    server.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 14 * 24 * 60 * 60,
            crypto: {
                secret: process.env.SESSION_SECRET
            },
            autoRemove: 'native',
            dbName: 'auth',
            collectionName: 'sessions'
        }),
        cookie: {
            httpOnly: true,
            secure: !dev,
            maxAge: 1000 * 60 * 60 * 24 * 14,
            sameSite: 'lax'
        }
    }));

    // Initialize Passport
    server.use(passport.initialize());
    server.use(passport.session());

    // API routes should be defined BEFORE the catch-all route
    server.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (err: any, user: Express.User, info: any) => {
            if (err) {
                return next(err);
            } 
            
            if (!user) {
                return res.status(401).json({ success: false, message: info.message });
            }
            
            req.logIn(user, (err: any) => {
                if (err) {
                    return next(err);
                }
                
                // Save the session before responding
                req.session.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    console.log('Login successful, session:', req.session);
                    console.log('User after login:', req.user);
                    res.status(200).json({ success: true, user, message: 'Logged in successfully!' });
                });
            });
        })(req, res, next);
    });

    // Logout route
    server.post('/api/auth/logout', (req: Request, res: Response, next: NextFunction) => {
        req.logout((err: any) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed. Please contact support.' });
            }
            res.status(200).json({ success: true, message: 'Logged out successfully!' });
        });
    });

    // Register route
    server.post('/api/auth/register', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, username, password, firstName, lastName } = req.body;
    
            // Validate input
            if (!email || !username || !password || !firstName || !lastName) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields. Please try again.' 
                });
                
                return;
            }

            // Validate names
            if (firstName.length < 1 || lastName.length < 1) {
                res.status(400).json({ 
                    success: false, 
                    message: 'First and last names are required. Please try again.' 
                });
                
                return;
            }

            // Validate email
            const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!re.test(email)) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email. Please try again.'
                });
                
                return;
            }

            // Check if email already exists
            const existingEmail = await findUserByEmail(email);
            if (existingEmail) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Email already exists. Please try again.'
                });
                
                return;
            }

            // Validate username
            if (username.length < 3) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Username must be at least 3 characters long. Please try again.'
                });
                
                return;
            }
    
            // Check if username already exists
            const existingUser = await findUserByUsername(username);
            if (existingUser) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Username already exists. Please try again.'
                });
                
                return;
            }

            // Validate password
            if (password.length < 8) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 8 characters long. Please try again.'
                });
                
                return;
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Create new user
            const result = await createUser(email, username, hashedPassword, firstName, lastName);
    
            if (!result) {
                res.status(500).json({ 
                    success: false, 
                    message: 'An unexpected database connection error occurred. Please try again.'
                });
                
                return;
            }
    
            // Create user response
            const userResponse = {
                _id: result.insertedId,
                email,
                username,
                firstName,
                lastName
            };
    
            res.status(201).json({ 
                success: true, 
                message: 'User registered successfully!',
                user: userResponse 
            });

            return;
        } catch (error) {
            next(error);
        }
    });

    // Get current user route
    server.get('/api/auth/user', (req: Request, res: Response, next: NextFunction) => {
        console.log('Session:', req.session);
        console.log('User in request:', req.user);
        console.log('Is authenticated:', req.isAuthenticated());
        
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
            return;
        }
    
        res.status(200).json({ 
            success: true, 
            user: req.user
        });

        return;
    });

    // Handle all other routes using Next.js
    server.all('*', (req: Request, res: Response, next) => {
        return handle(req, res);
    });

    // Instead of server.listen, return the handler
    return server(req, res);
}

// Only call listen in development
if (dev) {
    app.prepare().then(() => {
        const server = express();

        if (!process.env.SESSION_SECRET) {
            throw new Error('Missing SESSION_SECRET');
        }

        // Add body parser middleware
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));

        server.use((req: Request, res: Response, next: NextFunction) => {
            const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
            res.locals.nonce = nonce;
            next();
        });

        const helmetConfig = {
            contentSecurityPolicy: dev ? false : {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'", 
                        (req: any, res: any) => `'nonce-${res.locals.nonce}'`,
                        "'unsafe-eval'"
                    ],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'", "data:"],
                },
            },
            crossOriginEmbedderPolicy: !dev,
            crossOriginOpenerPolicy: !dev,
            crossOriginResourcePolicy: !dev,
        };

        server.use(helmet(helmetConfig));
        server.use(cors({
            origin: process.env.CLIENT_URL,
            credentials: true
        }));

        // Set up session middleware with MongoDB store
        server.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                ttl: 14 * 24 * 60 * 60,
                crypto: {
                    secret: process.env.SESSION_SECRET
                },
                autoRemove: 'native',
                dbName: 'auth',
                collectionName: 'sessions'
            }),
            cookie: {
                httpOnly: true,
                secure: !dev,
                maxAge: 1000 * 60 * 60 * 24 * 14,
                sameSite: 'lax'
            }
        }));

        // Initialize Passport
        server.use(passport.initialize());
        server.use(passport.session());

        // API routes should be defined BEFORE the catch-all route
        server.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate('local', (err: any, user: Express.User, info: any) => {
                if (err) {
                    return next(err);
                } 
                
                if (!user) {
                    return res.status(401).json({ success: false, message: info.message });
                }
                
                req.logIn(user, (err: any) => {
                    if (err) {
                        return next(err);
                    }
                    
                    // Save the session before responding
                    req.session.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        console.log('Login successful, session:', req.session);
                        console.log('User after login:', req.user);
                        res.status(200).json({ success: true, user, message: 'Logged in successfully!' });
                    });
                });
            })(req, res, next);
        });

        // Logout route
        server.post('/api/auth/logout', (req: Request, res: Response, next: NextFunction) => {
            req.logout((err: any) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Logout failed. Please contact support.' });
                }
                res.status(200).json({ success: true, message: 'Logged out successfully!' });
            });
        });

        // Register route
        server.post('/api/auth/register', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { email, username, password, firstName, lastName } = req.body;
        
                // Validate input
                if (!email || !username || !password || !firstName || !lastName) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Missing required fields. Please try again.' 
                    });
                    
                    return;
                }

                // Validate names
                if (firstName.length < 1 || lastName.length < 1) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'First and last names are required. Please try again.' 
                    });
                    
                    return;
                }

                // Validate email
                const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                if (!re.test(email)) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Invalid email. Please try again.'
                    });
                    
                    return;
                }

                // Check if email already exists
                const existingEmail = await findUserByEmail(email);
                if (existingEmail) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Email already exists. Please try again.'
                    });
                    
                    return;
                }

                // Validate username
                if (username.length < 3) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Username must be at least 3 characters long. Please try again.'
                    });
                    
                    return;
                }
        
                // Check if username already exists
                const existingUser = await findUserByUsername(username);
                if (existingUser) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Username already exists. Please try again.'
                    });
                    
                    return;
                }

                // Validate password
                if (password.length < 8) {
                    res.status(400).json({ 
                        success: false, 
                        message: 'Password must be at least 8 characters long. Please try again.'
                    });
                    
                    return;
                }
        
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
        
                // Create new user
                const result = await createUser(email, username, hashedPassword, firstName, lastName);
        
                if (!result) {
                    res.status(500).json({ 
                        success: false, 
                        message: 'An unexpected database connection error occurred. Please try again.'
                    });
                    
                    return;
                }
        
                // Create user response
                const userResponse = {
                    _id: result.insertedId,
                    email,
                    username,
                    firstName,
                    lastName
                };
        
                res.status(201).json({ 
                    success: true, 
                    message: 'User registered successfully!',
                    user: userResponse 
                });

                return;
            } catch (error) {
                next(error);
            }
        });

        // Get current user route
        server.get('/api/auth/user', (req: Request, res: Response, next: NextFunction) => {
            console.log('Session:', req.session);
            console.log('User in request:', req.user);
            console.log('Is authenticated:', req.isAuthenticated());
            
            if (!req.user) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Not authenticated' 
                });
                return;
            }
        
            res.status(200).json({ 
                success: true, 
                user: req.user
            });

            return;
        });

        // Handle all other routes using Next.js
        server.all('*', (req: Request, res: Response, next) => {
            return handle(req, res);
        });

        // Start server
        server.listen(3000, () => {
            console.log('Ready on http://localhost:3000');
        });
    });
}
