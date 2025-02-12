'use client';

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./NotificationProvider";

export const AuthPorvider = ({children}) =>{
    return (
        <SessionProvider>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </SessionProvider>
    )
}