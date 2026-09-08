import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { admin } from "better-auth/plugins";

import { env } from "@/config/env.js";

const client = new MongoClient(env.MONGODB_URI);
const db = client.db(env.MONGODB_DB_NAME);

export const auth = betterAuth({
  appName: "Chowk",

  baseURL: env.BETTER_AUTH_URL,

  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: ["*"],

  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        default: null,
      },
    },
  },

  plugins: [
    admin({
      adminRoles: ["admin"],
      adminUserIds: env.ADMIN_IDS,
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
