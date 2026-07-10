"use client";

import Link from "next/link";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            Resume<span className="text-purple-400">Roaster</span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" prefetch className="text-gray-400 hover:text-white transition-colors text-sm">
            首页
          </Link>
          <Link
            href="/#how-it-works"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            怎么玩
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            我的吐槽
          </Link>
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-400 hover:text-white transition-colors"
            >
              首页
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-400 hover:text-white transition-colors"
            >
              怎么玩
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-400 hover:text-white transition-colors"
            >
              我的吐槽
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}