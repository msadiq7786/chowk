"use client";

import { authClient } from "@/lib/better-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UnRequireAuthProps {
  children: React.ReactNode;
}

export function UnRequireAuth({ children }: UnRequireAuthProps) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <p>loading</p>;
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
}
