import { SignIn } from "@clerk/nextjs";
import AuthBlurb from "@/app/components/auth-blurb";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="w-full max-w-md">
        <AuthBlurb />
      </div>
      <SignIn />
    </main>
  );
}
