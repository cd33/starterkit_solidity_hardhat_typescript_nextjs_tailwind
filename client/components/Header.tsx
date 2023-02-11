import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header aria-label="Site Header" className="bg-white sticky top-0 z-10">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/eth.png" width="30" height="45" alt="toto" />
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Site Nav" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="block p-2 text-gray-800 hover:bg-gray-200"
              >
                Home
              </Link>

              <Link
                href="/mint"
                className="block p-2 text-gray-800 hover:bg-gray-200"
              >
                Market Place
              </Link>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <ConnectButton />
            </div>

            <div>
              <button
                className="block rounded-full p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div
                className={`md:hidden fixed left-0 right-0 z-50 mt-3 py-2 bg-white ${
                  menuOpen ? "block" : "hidden"
                }`}
              >
                <Link
                  href="/"
                  className="block p-2 text-gray-800 hover:bg-gray-200"
                >
                  Home
                </Link>

                <Link
                  href="/mint"
                  className="block p-2 text-gray-800 hover:bg-gray-200"
                >
                  Market Place
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
