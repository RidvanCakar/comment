import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg-base" />}>
      <RegisterForm />
    </Suspense>
  );
}
