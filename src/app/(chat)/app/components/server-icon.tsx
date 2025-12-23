export function ServerIcon({
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
      className={`flex items-center justify-center w-12 h-12 rounded-[24px] transition-all duration-200 hover:rounded-[16px] mb-2 ${
        active
          ? "bg-accent text-white rounded-[16px]"
          : "bg-slate-900 text-slate-400 hover:bg-accent hover:text-white"
      }`}
    >
      <span className="font-semibold text-lg">{name[0]}</span>
    </button>
  );
}
