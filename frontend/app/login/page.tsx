import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg-base" />}>
      <LoginForm />
    </Suspense>
  );
}
