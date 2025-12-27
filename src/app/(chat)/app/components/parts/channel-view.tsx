import { Plus, Smile } from "lucide-react";
import { Member } from "../member";
import { MessageView } from "../message-view";
import { ChannelTopBar } from "./channel-top-bar";
import { useViewStore } from "../../scripts/stores/view";
import { useWebSocket } from "@/app/libs/ws";
import {
  RequestMessageHistoryData,
  RequestMessageHistoryResponseCompiler,
} from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useMessagesStore } from "../../scripts/stores/messages";
import { useActiveChannelsIdStore } from "../../scripts/stores/active-channels";
import { useActiveServerIdStore } from "../../scripts/stores/active-server";
import { useActiveDmStore } from "../../scripts/stores/active-dm";
import { useEffect, useRef, useState, useCallback } from "react";

export function ChannelView() {
  const { sendMessageAndWaitForResponse } = useWebSocket();
  const view = useViewStore((s) => s.view);
  const currentDmUser = useActiveDmStore((s) => s.activeUserId);
  const activeServer = useActiveServerIdStore((s) => s.activeServerId);
  const activeChannel = useActiveChannelsIdStore((s) =>
    s.getActiveChannelInServer(activeServer),
  );
  const location =
    view === "dm" ? { user: currentDmUser } : { channel: activeChannel };

  const messages = useMessagesStore((s) => s.getMessages(location));
  const setMessagesForLocation = useMessagesStore(
    (s) => s.setMessagesForLocation,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: adding messages causes infinite loop
  const fetchMessages = useCallback(async (pageToFetch: number) => {
    if (loading) return;
    setLoading(true);

    const requestId = crypto.randomUUID();

    await sendMessageAndWaitForResponse<typeof RequestMessageHistoryData>(
      "over:request-message-history",
      {
        requestId,
        location,
        page: pageToFetch,
      },
      (message, data) => {
        if (message !== "response:request-message-history") return false;
        if (!RequestMessageHistoryResponseCompiler.Check(data)) return false;
        if (data.requestId !== requestId) return false;

        if (page === 0) {
          setMessagesForLocation(location, data.messages);
        } else {
          setMessagesForLocation(location, [
            ...data.messages,
            ...(messages || []),
          ]);
        }

        setLoading(false);
        return true;
      },
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMessages(0);
  }, [fetchMessages]);

  // Infinite scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loading) return;

    if (container.scrollTop < 100) {
      const nextPage = page + 1;
      fetchMessages(nextPage);
      setPage(nextPage);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col inter">
        <ChannelTopBar />

        <div
          className="flex-1 overflow-y-auto"
          ref={containerRef}
          onScroll={handleScroll}
        >
          <div>
            {messages?.map((msg) => (
              <MessageView key={msg.id} authorId={msg.authorId} message={msg} />
            ))}
          </div>
        </div>

        <div className="px-4 pb-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "message",
              ) as HTMLInputElement;
              console.log("Send:", input.value);
              input.value = "";
            }}
            className="flex items-center gap-4 bg-slate-800 rounded-lg px-4 py-3"
          >
            <button type="button" className="hover:opacity-80">
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
            <input
              type="text"
              name="message"
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none"
              placeholder="Send a message"
            />
            <button type="button" className="hover:opacity-80">
              <Smile className="w-6 h-6 text-gray-400" />
            </button>
          </form>
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
