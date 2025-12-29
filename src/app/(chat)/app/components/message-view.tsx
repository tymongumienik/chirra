/** biome-ignore-all lint/a11y/useSemanticElements: using span as interactive element for username click */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: using span as interactive element for username click */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: using span as interactive element for username click */
import Image from "next/image";
import type { Message } from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useUserDataStore } from "../scripts/stores/user-data";

export function MessageView({
  authorId,
  message,
  onUserClick = () => {},
}: {
  authorId: string;
  message: (typeof Message)["static"];
  onUserClick?: () => void;
}) {
  const author = useUserDataStore((s) => s.getUser(authorId));

  const now = new Date();
  const created = message.createdAt;

  const isToday =
    created.getDate() === now.getDate() &&
    created.getMonth() === now.getMonth() &&
    created.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    created.getDate() === yesterday.getDate() &&
    created.getMonth() === yesterday.getMonth() &&
    created.getFullYear() === yesterday.getFullYear();

  const time = created.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const full = created.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateLabel = isToday
    ? `Today at ${time}`
    : isYesterday
      ? `Yesterday at ${time}`
      : full;

  return (
    <div className="flex gap-2 px-4 py-2 hover:bg-gray-900/30 group">
      <div className="shrink-0 mr-1">
        <Image
          src={"/default-avatar.png"}
          alt={author?.displayname || author?.username || ""}
          className="rounded-full cursor-pointer"
          width={40}
          height={40}
          onClick={onUserClick}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-semibold text-sm text-white cursor-pointer"
            onClick={onUserClick}
          >
            {author?.displayname}
          </span>
          <span className="text-xs text-gray-500">{dateLabel}</span>
        </div>
        <div className="text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
