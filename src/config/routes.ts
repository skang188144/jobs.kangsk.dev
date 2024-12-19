export const NO_NAVBAR_ROUTES = ['/', '/login', '/register', '/verify'] as string[];
export const AUTH_RESTRICTED_ROUTES = ['/login', '/register'] as string[];
export const NO_AUTH_ROUTES = ['/'] as string[];
export const VERIFICATION_ROUTES = ['/verify'] as string[];

export const isProtectedRoute = (pathname: string) => {
    return !AUTH_RESTRICTED_ROUTES.includes(pathname) && 
           !NO_AUTH_ROUTES.includes(pathname) && 
           !VERIFICATION_ROUTES.includes(pathname);
};