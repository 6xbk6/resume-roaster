import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold text-lg">
                Resume<span className="text-purple-400">Roaster</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              AI 花式吐槽你的简历，让求职者在笑声中发现简历问题，提升求职竞争力。
            </p>
          </div>

          {/* 链接 */}
          <div>
            <h4 className="text-white font-medium mb-3">产品</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" prefetch className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/dashboard" prefetch className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                  我的吐槽
                </Link>
              </li>
            </ul>
          </div>

          {/* 法律 */}
          <div>
            <h4 className="text-white font-medium mb-3">法律</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-500 text-sm">隐私政策</span>
              </li>
              <li>
                <span className="text-gray-500 text-sm">服务条款</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Resume Roaster. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}