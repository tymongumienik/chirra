import { Plus } from "lucide-react";
import { useViewStore } from "../../scripts/stores/view";
import { ServerIcon } from "../server-icon";
import { useActiveServerIdStore } from "../../scripts/stores/active-server";
import Image from "next/image";

export function ServerSidebar() {
  const setView = useViewStore((s) => s.setView);
  const view = useViewStore((s) => s.view);

  const setActiveServerId = useActiveServerIdStore((s) => s.setActiveServerId);
  const activeServerId = useActiveServerIdStore((s) => s.activeServerId);

  return (
    <div className="flex flex-col items-center w-[72px] bg-background py-3">
      <button
        type="button"
        onClick={() => setView("friends")}
        className={`flex items-center justify-center w-12 h-12 rounded-[24px] transition-all duration-200 hover:rounded-[16px] mb-2 group ${
          view === "friends" || view === "dm"
            ? "bg-accent/90 rounded-[16px]"
            : "bg-gray-900 hover:bg-accent"
        }`}
      >
        <Image src="/logo-white.svg" alt="Logo" width={26} height={26} />
      </button>

      <div className="w-8 h-px bg-slate-600 rounded-full mb-2" />

      {[].map((server, idx) => (
        <ServerIcon
          key={["server", server].join("-")}
          name={server}
          active={view === "channel" && activeServerId === "test"}
          onClick={() => {
            setView("channel");
            setActiveServerId("test");
          }}
        />
      ))}

      <button
        type="button"
        className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-slate-800 hover:bg-lime-600 hover:rounded-[16px] transition-all duration-200 mt-2 group"
      >
        <Plus className="w-6 h-6 text-lime-600 group-hover:text-white" />
      </button>
    </div>
  );
}
