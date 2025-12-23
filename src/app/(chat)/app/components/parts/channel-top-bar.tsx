import { Hash, Pin } from "lucide-react";

export function ChannelTopBar() {
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-slate-900 shadow-sm">
      <div className="flex items-center gap-2">
        <Hash className="w-6 h-6 text-gray-400" />
        <span className="font-semibold text-white">#active-channel</span>
      </div>
      <div className="flex items-center gap-4">
        <Pin className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
      </div>
    </div>
  );
}
