import Image from "next/image";
import { statusColors } from "../constants/status";

export function Member({
  username,
  status,
  avatar,
}: {
  username: string;
  status: "online" | "offline";
  avatar: string;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 mx-2 rounded hover:bg-gray-900/30 cursor-pointer group">
      <div className="relative">
        <Image
          src={"/default-avatar.png"}
          alt={username}
          className="rounded-full w-8 h-8"
          width={40}
          height={40}
        />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColors[status]}`}
        />
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white">
        {username}
      </span>
    </div>
  );
}
