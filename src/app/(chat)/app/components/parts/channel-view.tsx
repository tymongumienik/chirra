import { Plus, Smile } from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type ChannelSetSubscriptionStateData,
  type RequestMessageHistoryData,
  RequestMessageHistoryResponseCompiler,
  TypingStateLetterCompiler,
  TypingUpdateStateData,
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
import { useUserStore } from "../../scripts/stores/who-am-i";
import { useUserDataStore } from "../../scripts/stores/user-data";

export function ChannelView() {
  const { subscribe, sendMessage, sendMessageAndWaitForReply } = useWebSocket();
  const user = useUserStore((s) => s.user);
  const view = useViewStore((s) => s.view);
  const currentDmUser = useActiveDmStore((s) => s.activeUserId);
  const activeServer = useActiveServerIdStore((s) => s.activeServerId);
  const activeChannel = useActiveChannelsIdStore((s) =>
    s.getActiveChannelInServer(activeServer),
  );
  const location =
    view === "dm" ? { user: currentDmUser } : { channel: activeChannel };
  const getUser = useUserDataStore((s) => s.getUser);

  const messages = useMessagesStore((s) => s.getMessages(location)) || [];
  const setMessagesForLocation = useMessagesStore(
    (s) => s.setMessagesForLocation,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const [typing, setTyping] = useState<string[]>([]);

  const [lastTypedAt, setLastTypedAt] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLastTypedAtChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length >= 2) {
      const now = Date.now();
      setLastTypedAt(now);

      if (!isTyping) setIsTyping(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        timeoutRef.current = null;
      }, 5000); // 5 seconds
    } else {
      setIsTyping(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

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

  useEffect(() => {
    sendMessage<typeof ChannelSetSubscriptionStateData>(
      "void:set-channel-subscription-state",
      { subscribed: true, location },
    );

    return () => {
      sendMessage<typeof ChannelSetSubscriptionStateData>(
        "void:set-channel-subscription-state",
        { subscribed: false, location },
      );
    };
  }, [sendMessage, location]);

  useEffect(() => {
    sendMessage<typeof TypingUpdateStateData>("void:typing-update-state", {
      typing: isTyping,
    });
  }, [sendMessage, isTyping]);

  useEffect(() => {
    const unsub = subscribe((message, data) => {
      if (message !== "letter:typing-state") return;
      if (!TypingStateLetterCompiler.Check(data)) return;
      if (data.typerId === user?.id) return;

      if (data.typingState === true) {
        setTyping((prev) => [
          ...prev.filter((id) => id !== data.typerId),
          data.typerId,
        ]);
      } else {
        setTyping((prev) => prev.filter((id) => id !== data.typerId));
      }
    });
    return unsub;
  }, [subscribe, user]);

  const [openUserModalId, setOpenUserModalId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // infinite scroll for older messages
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loadingRef.current) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setAtBottom(distanceFromBottom < 10);

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
        <div className="flex flex-col mt-auto gap-1 mb-4">
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

      <div className="px-4 pb-3 relative">
        <div
          className={`absolute bottom-0 left-0 w-full h-64 pointer-events-none transition-opacity ${
            atBottom ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
          }}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem(
              "message",
            ) as HTMLInputElement;
            setLastTypedAt(null);
            setIsTyping(false);
            console.log("Send:", input.value);
            input.value = "";
          }}
          className="flex items-center gap-4 bg-slate-800 rounded-lg px-4 py-3 relative"
        >
          <button type="button" className="hover:opacity-80">
            <Plus className="w-6 h-6 text-gray-400" />
          </button>
          <input
            type="text"
            name="message"
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none"
            placeholder="Send a message"
            onChange={handleLastTypedAtChange}
          />
          <button type="button" className="hover:opacity-80">
            <Smile className="w-6 h-6 text-gray-400" />
          </button>
        </form>

        {typing.length > 0 && (
          <div className="rounded-xl absolute h-4 w-[calc(100%-2rem)] -top-5 flex items-center bg-accent/5">
            <div className="flex items-center gap-0.5 ml-3">
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-slate-600 rounded-full animate-pulse delay-400"></div>
            </div>
            <span className="ml-2 text-xs">
              {typing.length <= 3 && (
                <>
                  {typing
                    .map((x) => getUser(x)?.displayname ?? null)
                    .filter((x) => x !== null)
                    .map((name, i, arr) => (
                      <span key={`typing-${name}`}>
                        <strong>{name}</strong>
                        {i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}{" "}
                  {(() => {
                    const filtered = typing
                      .map((x) => getUser(x)?.displayname ?? null)
                      .filter((x) => x !== null);
                    return filtered.length === 0
                      ? "Someone is typing..."
                      : filtered.length === 1
                        ? "is typing..."
                        : filtered.length > 1
                          ? "are typing..."
                          : "";
                  })()}
                </>
              )}
              {typing.length > 3 && "Multiple people are typing..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
