import { useState, useEffect } from 'react';
import UserWithoutPassword from '@/types/UserWithoutPassword';

interface UseUserReturn {
    user: UserWithoutPassword | null;
    loading: boolean;
    error: string | null;
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<UserWithoutPassword | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/user', {
                    credentials: 'include', // Important for sending cookies
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setError('Failed to fetch user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    return { user, loading, error };
} 