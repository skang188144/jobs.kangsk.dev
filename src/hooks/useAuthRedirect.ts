import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuthRedirect = (redirectTo: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAuthSession = async () => {
            try {
                const res = await fetch('/api/auth/user');
                if (res.ok) {
                    router.push(redirectTo);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('An error occurred. Please try again later.');
                setIsLoading(false);
            }
        };

        checkAuthSession();
    }, [redirectTo, router]);

    return { isLoading, error };
}; 