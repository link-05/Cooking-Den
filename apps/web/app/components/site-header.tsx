"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function SiteHeader() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();

  // The cooking slideshow (/cook/[id]) is an immersive, screen-locked view
  // with its own Exit/progress bar — a global header would double-stack on top.
  if (pathname?.startsWith("/cook")) return null;

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <Link
        href={isSignedIn ? "/library" : "/"}
        className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Cooking Den
      </Link>

      {/* Render nothing until Clerk resolves auth state, to avoid a flash of
          the wrong control (logged-in avatar vs. logged-out buttons). */}
      <div className="flex items-center gap-3">
        {isLoaded &&
          (isSignedIn ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Library"
                  href="/library"
                  labelIcon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h10"
                      />
                    </svg>
                  }
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <>
              <SignInButton>
                <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                  Sign up
                </button>
              </SignUpButton>
            </>
          ))}
      </div>
    </header>
  );
}
