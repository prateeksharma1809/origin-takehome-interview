"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="h-16 flex items-center justify-between px-5 border-b border-gradient-to-r from-blue-700 via-purple-700 to-pink-600 bg-gray-900/80 shadow-lg">
      <div className="flex items-center space-x-2">
        <Link href="/" aria-label="Go to Home">
          <Image
            src="https://cdn.prod.website-files.com/662ea18ff6f97fbaec8b0ac4/67ce096dd2c7bf26cf181ccb_Group%203.png"
            alt="Origin Therapy"
            width={150}
            height={50}
            priority
            className="drop-shadow-neon"
          />
        </Link>
      </div>
      <nav>
        <ul className="flex items-center gap-6">
          <li>
            <Link 
              href="/" 
              className="text-base font-semibold neon hover:underline"
            >
              Sessions
            </Link>
          </li>
          <li>
            <Link 
              href="/therapists" 
              className="text-base font-semibold neon hover:underline"
            >
              Therapists
            </Link>
          </li>
          <li>
            <Link 
              href="/patients" 
              className="text-base font-semibold neon hover:underline"
            >
              Patients
            </Link>
          </li>
          <li>
            <Link 
              href="/admin" 
              className="text-base font-semibold neon hover:underline"
            >
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
