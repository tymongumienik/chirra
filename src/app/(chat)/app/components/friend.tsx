import { MessageCircle, MoreVertical } from "lucide-react";

export function Friend({
  username,
  status,
  statusText,
  avatar,
}: {
  username: string;
  status: "online" | "idle" | "dnd" | "offline";
  statusText: string;
  avatar: string;
}) {
  return (
    <div className="flex items-center gap-4 px-8 py-3 border-t border-gray-800 hover:bg-gray-900/30 group transition-colors">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold">
          {avatar}
        </div>
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColors[status]}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{username}</div>
        <div className="text-xs text-gray-300">{statusText}</div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-gray-300" />
        </button>
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}
