"use client";
import { useSession } from "next-auth/react";
import { NotificationProvider } from "./NotificationProvider";

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // Avoid rendering while loading

  const isAuthenticated = status === "authenticated" && session?.user?.role === "organizer";

  return isAuthenticated ? (
    <NotificationProvider>{children}</NotificationProvider>
  ) : (
    children
  );
}
