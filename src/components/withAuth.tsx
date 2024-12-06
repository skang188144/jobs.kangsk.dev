import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

// Client-side HOC
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function WithAuthComponent(props: P) {
        const router = useRouter();

        useEffect(() => {
            fetch('/api/auth/user', {
                credentials: 'include'
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Not authenticated');
                }
                return res.json();
            })
            .catch(() => {
                router.push('/login');
            });
        }, [router]);

        return <WrappedComponent {...props} />;
    };
}

// Server-side protection
export const withAuthServerSideProps = (getServerSidePropsFunc?: GetServerSideProps) => {
    return async (context: any) => {
        const { req, res } = context;
        
        const response = await fetch(`${process.env.API_URL}/api/auth/user`, {
            headers: {
                cookie: req.headers.cookie || ''
            }
        });

        if (!response.ok) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        // If there's a getServerSideProps function passed, execute it
        if (getServerSidePropsFunc) {
            return await getServerSidePropsFunc(context);
        }

        // Otherwise return empty props
        return {
            props: {},
        };
    };
}; 