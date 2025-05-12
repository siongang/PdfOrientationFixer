"use client";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-neutral-100 text-black border-b border-neutral-300">
      <Link href="/" className="text-xl font-bold hover:text-gray-600 transition">
        PDF Orientation Fixer
      </Link>
      <a
        href="https://github.com/your-username/your-repo"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md  hover:text-gray-600 transition"
      >
        <Github className="w-5 h-5" />
        
      </a>{" "}
    </header>
  );
}
