import { UnRequireAuth } from "@/modules/auth/unrequire-auth";
import React from "react";

function AuthLayout({ children }: React.PropsWithChildren) {
  return <UnRequireAuth>{children}</UnRequireAuth>;
}

export default AuthLayout;
