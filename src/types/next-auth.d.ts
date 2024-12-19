import 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            firstName: string
            lastName: string
            email: string
        }
    }
} 