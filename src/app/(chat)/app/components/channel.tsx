import { Hash } from "lucide-react";

export function Channel({
  name,
  active,
  onClick,
}: {
  name: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 mx-2 rounded hover:bg-slate-800 group transition-colors ${
        active ? "bg-slate-800 text-white" : "text-slate-400"
      }`}
    >
      <Hash className="w-5 h-5" />
      <span className="text-sm font-medium">{name}</span>
    </button>
  );
}
