import { Plus, Smile } from "lucide-react";
import { Member } from "../member";
import { Message } from "../message";
import { ChannelTopBar } from "./channel-top-bar";
import { useViewStore } from "../../scripts/stores/view";

export function ChannelView() {
  const view = useViewStore((s) => s.view);

  return (
    <>
      <div className="flex-1 flex flex-col inter">
        <ChannelTopBar />

        <div className="flex-1 overflow-y-auto">
          <div>
            {[].map((msg, idx) => (
              <Message key={msg.id} {...msg} />
            ))}
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-4 bg-slate-800 rounded-lg px-4 py-3">
            <button type="button" className="hover:opacity-80">
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
            <input
              type="text"
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none"
              placeholder="Send a message"
            />
            <button type="button" className="hover:opacity-80">
              <Smile className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {view === "channel" && (
        <div className="w-60 bg-card overflow-y-auto">
          <div className="pt-4">
            <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Online — {[].filter((m) => m.status === "online").length}
            </div>
            {[]
              .filter((m) => m.status === "online")
              .map((member, idx) => (
                <Member key={idx} {...member} />
              ))}

            <div className="px-2 mb-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Offline — {[].filter((m) => m.status === "offline").length}
            </div>
            {[]
              .filter((m) => m.status === "offline")
              .map((member, idx) => (
                <Member key={idx} {...member} />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
