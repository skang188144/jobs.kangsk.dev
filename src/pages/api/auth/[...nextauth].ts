import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { clientPromise } from '@/lib/db'
import { Session } from 'next-auth'

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: 'auth',
        collections: {
            Users: 'users',
            Accounts: 'accounts',
            Sessions: 'sessions',
            VerificationTokens: 'verification_tokens',
        }
    }),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    callbacks: {
        async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
            // If the url is relative, prepend the baseUrl
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`
            }
            // If the url is already absolute but on the same origin as baseUrl,
            // allow it
            else if (new URL(url).origin === baseUrl) {
                return url
            }
            // Otherwise, return to the baseUrl
            return baseUrl
        },
        async session({ session, user }: { session: Session, user: any }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            }
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
        verifyRequest: '/verify',
        newUser: '/register',
    }
}

export default NextAuth(authOptions)