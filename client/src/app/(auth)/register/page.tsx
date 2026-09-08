import { RegisterForm } from "@/modules/auth/register/register-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Chowk.
          </h1>
          <p className="text-muted-foreground text-sm">
            Already have an account?
            <Link
              href="/login"
              className="text-foreground hover:text-primary underline underline-offset-4 ml-1 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}
