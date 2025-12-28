import { Plus, Smile } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  type RequestMessageHistoryData,
  RequestMessageHistoryResponseCompiler,
} from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useWebSocket } from "@/app/libs/ws";
import { useActiveChannelsIdStore } from "../../scripts/stores/active-channels";
import { useActiveDmStore } from "../../scripts/stores/active-dm";
import { useActiveServerIdStore } from "../../scripts/stores/active-server";
import { useMessagesStore } from "../../scripts/stores/messages";
import { useViewStore } from "../../scripts/stores/view";
import { MessageView } from "../message-view";
import { ChannelTopBar } from "./channel-top-bar";
import { Modal } from "../modal";
import { UserModal } from "../user-modal";

export function ChannelView() {
  const { sendMessageAndWaitForReply } = useWebSocket();
  const view = useViewStore((s) => s.view);
  const currentDmUser = useActiveDmStore((s) => s.activeUserId);
  const activeServer = useActiveServerIdStore((s) => s.activeServerId);
  const activeChannel = useActiveChannelsIdStore((s) =>
    s.getActiveChannelInServer(activeServer),
  );
  const location =
    view === "dm" ? { user: currentDmUser } : { channel: activeChannel };

  const messages = useMessagesStore((s) => s.getMessages(location)) || [];
  const setMessagesForLocation = useMessagesStore(
    (s) => s.setMessagesForLocation,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);

  const fetchMessages = useCallback(
    async (pageToFetch: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const requestId = crypto.randomUUID();

      await sendMessageAndWaitForReply<typeof RequestMessageHistoryData>(
        "over:request-message-history",
        { requestId, location, page: pageToFetch },
        (message, data) => {
          if (message !== "response:request-message-history") return false;
          if (!RequestMessageHistoryResponseCompiler.Check(data)) return false;
          if (data.requestId !== requestId) return false;

          // compute new array before calling store
          if (pageToFetch === 0) {
            setMessagesForLocation(location, data.messages);
          } else {
            const oldMessages =
              useMessagesStore.getState().getMessages(location) || [];
            setMessagesForLocation(location, [
              ...data.messages,
              ...oldMessages,
            ]);
          }

          loadingRef.current = false;
          return true;
        },
      );
    },
    [location, sendMessageAndWaitForReply, setMessagesForLocation],
  );

  // initial fetch + scroll to bottom before render
  useLayoutEffect(() => {
    fetchMessages(0).then(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      pageRef.current = 0;
    });
  }, [fetchMessages]);

  const [openUserModalId, setOpenUserModalId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // infinite scroll for older messages
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loadingRef.current) return;

    if (container.scrollTop < 100) {
      const nextPage = pageRef.current + 1;
      const oldScrollHeight = container.scrollHeight;

      fetchMessages(nextPage).then(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight -
            oldScrollHeight +
            container.scrollTop;
        }
        pageRef.current = nextPage;
      });
    }
  };

  const closeModal = () => setIsUserModalOpen(false);

  return (
    <div className="flex-1 flex flex-col inter">
      <ChannelTopBar />

      <Modal isOpen={isUserModalOpen} onClose={closeModal}>
        <UserModal userId={openUserModalId} />
      </Modal>

      <div
        className="flex-1 flex flex-col overflow-y-auto"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="flex flex-col mt-auto">
          {messages.map((msg) => (
            <MessageView
              key={msg.id}
              authorId={msg.authorId}
              message={msg}
              onUserClick={() => {
                setOpenUserModalId(msg.authorId);
                setIsUserModalOpen(true);
              }}
            />
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
  );
}
