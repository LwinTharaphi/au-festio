'use client';

import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { NotificationProvider } from "./NotificationProvider";

export const AuthPorvider = ({children}) =>{
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}