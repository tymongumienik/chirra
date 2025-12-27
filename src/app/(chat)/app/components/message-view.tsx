import Image from "next/image";
import { useUserDataStore } from "../scripts/stores/user-data";
import { Message } from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useUserStore } from "../scripts/stores/who-am-i";

export function MessageView({
  authorId,
  message,
}: {
  authorId: string;
  message: (typeof Message)["static"];
}) {
  const user = useUserStore((s) => s.user);
  const authorOther = useUserDataStore((s) => s.getUser(authorId));

  const author = user?.id === authorId ? user : authorOther;

  return (
    <div className="flex gap-2 px-4 py-2 hover:bg-gray-900/30 group">
      <div className="shrink-0 mr-1">
        <Image
          src={"/default-avatar.png"}
          alt={author?.displayname || author?.username || ""}
          className="rounded-full"
          width={40}
          height={40}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
            {author?.displayname || author?.username || ""}
          </span>
          <span className="text-xs text-gray-500">
            {message.createdAt.toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
