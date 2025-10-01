import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gradientClasses =
    "text-transparent bg-clip-text bg-[linear-gradient(135deg,#ff1b6b,#a273b5,#45caff)] drop-shadow-lg";

  return (
    <main className="min-h-screen pb-4 px-2 md:px-2 lg:px-3">
      <header className="mt-1 bg-gray-800 flex justify-between items-center py-4 px-6 gap-4 h-16 rounded-lg md:rounded-xl">
        <Link
          href={"/"}
          className="font-extrabold text-2xl md:text-3xl tracking-wider font-sans"
        >
          <h1 className={gradientClasses}>TaskFlow</h1>
        </Link>
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      {children}
      <footer className="mt-1 rounded-lg md:rounded-xl bg-gray-800 text-gray-400">
        <div className="max-w-7xl mx-auto py-4 px-2">
          <div className="mb-2 flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0">
            <div className="flex md:flex-col items-center md:items-start  space-x-2">
              <Link
                href="/"
                className="font-extrabold text-xl tracking-widest font-sans"
              >
                <span className={gradientClasses}>TaskFlow</span>
              </Link>
              <p className="text-xs font-medium text-gray-500 hidden sm:inline">
                Organize, Focus, Achieve.
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} TaskFlow. <br /> All rights
                reserved.
              </p>
              <div className="mt-1 space-x-3 text-xs flex">
                <p className="hover:text-white transition-colors">
                  Privacy Policy
                </p>
                <span className="text-gray-600">|</span>
                <p className="hover:text-white transition-colors">
                  Terms of Service
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700/50 text-center text-xs text-gray-600">
            Authentication powered by{" "}
            <Link
              href="https://clerk.com?utm_source=taskflow&utm_medium=footer_link"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              Clerk
            </Link>
          </div>
        </div>
      </footer>

    
    </main>
  );
}
