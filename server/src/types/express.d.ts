type BetterUser = (typeof auth.$infer.Session)["user"];

declare global {
  namespace Express {
    interface Request {
      user: BetterUser;
    }
  }
}

export {};
