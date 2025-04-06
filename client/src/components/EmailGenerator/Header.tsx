import { Mail } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-gray-900" />
          <h1 className="text-lg font-semibold">AI Email Generator</h1>
        </div>
        <button className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm">
          Help
        </button>
      </div>
    </header>
  );
}

export default Header;
