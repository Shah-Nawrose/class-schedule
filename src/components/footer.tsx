// AppFooter.tsx
import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="h-16 w-full flex items-center justify-center border-t bg-card/50 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <Link to="#">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/shah.png"
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>
        {/* Text */}
        <span className="text-lg font-semibold text-gray-700">SHAH</span>
      </div>
    </footer>
  );
}
