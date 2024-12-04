'use client';

import { SessionProvider } from "next-auth/react";

export const AuthPorvider = ({children}) =>{
    return <SessionProvider>{children}</SessionProvider>
}