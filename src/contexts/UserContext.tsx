import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { User } from "@/types/User";
import { Statistics, calculateUserStatistics } from "@/utils/applicationStats";

type UserContextType = {
    user: User;
    setUser: (user: User) => void;
    isLoading: boolean;
    statistics: Statistics | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Calculate statistics whenever user data changes
    const statistics = useMemo(() => calculateUserStatistics(user), [user]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/getUser");
                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, statistics }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
} 