import type { Request, Response, NextFunction } from "express";
import { auth } from "./better-auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { ACCESSROLES } from "@/constants.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }

    req.user = session.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export const authorizeRoles = (...allowedRoles: ACCESSROLES[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: No user session found" });
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role);

    if (!hasRole) {
      res
        .status(403)
        .json({ message: "Forbidden: You do not have permission" });
      return;
    }

    next();
  };
};
