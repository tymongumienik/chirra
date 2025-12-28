/** biome-ignore-all lint/a11y/useKeyWithClickEvents: button doesn't fit here */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: button doesn't fit here */
import {
  Check,
  MessageCircle,
  MessageSquareDashed,
  MoreVertical,
  X,
} from "lucide-react";
import Image from "next/image";
import { statusColors } from "../constants/status";
import { useFriendsStore } from "../scripts/stores/friends";
import { useUserDataStore } from "../scripts/stores/user-data";

export function UserWidget({
  id,
  showUserName = true,
  buttons,
  topBorder = true,
  onClick,
  padding,
  active = false,
}: {
  id: string;
  showUserName?: boolean;
  buttons?: Partial<
    Record<"ACCEPT" | "DECLINE" | "CANCEL" | "MESSAGE", () => void>
  >;
  topBorder?: boolean;
  onClick?: () => void;
  padding?: string;
  active?: boolean;
}) {
  const userInfo = useUserDataStore((s) => s.getUser(id));
  const status = useFriendsStore(
    (s) => s.friends.find((x) => x.id === id)?.status,
  );

  if (!userInfo) return null;

  const buttonInfo = [
    { key: "ACCEPT", title: "Accept", Icon: Check },
    { key: "DECLINE", title: "Decline", Icon: X },
    { key: "CANCEL", title: "Cancel", Icon: X },
    { key: "MESSAGE", title: "Message", Icon: MessageCircle },
  ] as const;

  return (
    <div
      className={`flex items-center gap-2 ${padding ?? "px-2 py-3"} ${topBorder ? "border-t border-gray-800" : ""} ${active ? "bg-gray-900/30" : "hover:bg-gray-900/30 cursor-pointer"} group transition-colors`}
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold">
          <Image
            src={userInfo.profile?.avatar || "/default-avatar.png"}
            alt="Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        </div>
        {status !== undefined && (
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColors[status]}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white">{userInfo?.displayname}</div>
        {showUserName && (
          <div className="text-xs text-gray-300">{userInfo?.username}</div>
        )}
      </div>
      {buttons !== undefined && (
        <div className="flex items-center gap-2 transition-opacity">
          {buttonInfo.map(({ key, title, Icon }) =>
            buttons[key] ? (
              <button
                key={key}
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 cursor-pointer"
                onClick={buttons[key]}
                title={title}
              >
                <Icon className="w-5 h-5 text-gray-300" />
              </button>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
