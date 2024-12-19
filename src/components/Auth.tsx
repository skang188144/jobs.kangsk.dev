import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthLoading from "./AuthLoading";
import { AUTH_RESTRICTED_ROUTES, NO_AUTH_ROUTES, VERIFICATION_ROUTES, isProtectedRoute } from "@/config/routes";

const Auth = ({ children, pathname }: { children: React.ReactNode; pathname: string }) => {
    const { status } = useSession();
    const router = useRouter();
    const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
    const [isCheckingVerification, setIsCheckingVerification] = useState(true);
    const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean | null>(null);
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
    const isNoAuthRoute = NO_AUTH_ROUTES.includes(pathname);
    const isAuthRestrictedRoute = AUTH_RESTRICTED_ROUTES.includes(pathname);
    const isVerificationRoute = VERIFICATION_ROUTES.includes(pathname);

    // Comment out debug useEffect
    useEffect(() => {
        console.log('Debug Auth States:', {
            status,
            isCheckingVerification,
            isCheckingRegistration,
            isRegistrationComplete,
            pathname
        });
    }, [status, isCheckingVerification, isCheckingRegistration, isRegistrationComplete, pathname]);

    // Check verification status
    useEffect(() => {
        const checkVerification = async () => {
            console.log('Checking verification for email:', localStorage.getItem('pendingVerification'));
            const email = localStorage.getItem('pendingVerification');
            if (!email) {
                setIsCheckingVerification(false);
                return;
            }

            try {
                const res = await fetch(`/api/verify/status?email=${email}`);
                const data = await res.json();

                setIsAwaitingVerification(data.isAwaitingVerification);
                if (!data.isAwaitingVerification) {
                    localStorage.removeItem('pendingVerification');
                }
            } catch (error) {
                console.error('Verification check failed:', error);
            } finally {
                setIsCheckingVerification(false);
            }
        };

        checkVerification();
    }, [pathname]); // Re-run when route changes

    // Check registration status
    useEffect(() => {
        const checkRegistration = async () => {
            console.log('Checking registration status:', status);
            if (status !== "authenticated") {
                setIsRegistrationComplete(null);
                return;
            }

            setIsCheckingRegistration(true);
            try {
                const res = await fetch('/api/register/status');
                if (!res.ok) throw new Error('Registration check failed');
                const data = await res.json();
                setIsRegistrationComplete(data.isRegistrationComplete);
            } catch (error) {
                console.error('Registration check failed:', error);
                setIsRegistrationComplete(null);
            } finally {
                setIsCheckingRegistration(false);
            }
        };

        checkRegistration();
    }, [status, pathname]);

    // Handle redirects
    useEffect(() => {
        if (status === "loading" || isCheckingVerification || isCheckingRegistration || isRegistrationComplete === null) return;

        if (status === "authenticated") {
            localStorage.removeItem('pendingVerification');

            if (isRegistrationComplete) {
                if (isAuthRestrictedRoute || isVerificationRoute) {
                    router.replace('/dashboard');
                }
            } else {
                if (pathname !== '/register' && !isNoAuthRoute) {
                    router.replace('/register');
                }
            }
        } else if (status === "unauthenticated") {
            if (isVerificationRoute && !isAwaitingVerification) {
                router.replace('/login');
            } else if (isProtectedRoute(pathname)) {
                router.replace('/login');
            } else if (isAuthRestrictedRoute && pathname !== '/login') {
                router.replace('/login');
            }
        }
    }, [
        status,
        pathname,
        router,
        isAuthRestrictedRoute,
        isVerificationRoute,
        isAwaitingVerification,
        isCheckingVerification,
        isCheckingRegistration,
        isRegistrationComplete
    ]);

    // Don't show loading for public routes
    if (NO_AUTH_ROUTES.includes(pathname)) {
        return <>{children}</>;
    }

    if (status === 'authenticated') {
        if (isRegistrationComplete) {
            if (isAuthRestrictedRoute || isVerificationRoute) {
                return <AuthLoading />;
            } else {
                return <>{children}</>;
            }
        } else if (isRegistrationComplete === false) {
            if (pathname !== '/register' && !isNoAuthRoute) {
                return <AuthLoading />;
            } else {
                return <>{children}</>;
            }
        } else {
            return <AuthLoading />;
        }
    } else if (status === 'unauthenticated') {
        if (isAwaitingVerification) {
            if (isVerificationRoute) {
                return <>{children}</>;
            } else {
                return <AuthLoading />;
            }
        } else {
            if (isProtectedRoute(pathname) || pathname === 'register' || isVerificationRoute) {
                return <AuthLoading />;
            } else {
                return <>{children}</>;
            }
        }
    } else {
        return <AuthLoading />;
    }
};

export default Auth;