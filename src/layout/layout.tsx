import * as React from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { UserProvider } from "@/contexts/UserContext";

interface RootLayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: RootLayoutProps) {
    return (
        <UserProvider>
            <AdminPanelLayout>
                {children}
            </AdminPanelLayout>
        </UserProvider>
    );
} 