import Image from "next/image";

export function Message({
  username,
  timestamp,
  content,
  avatar,
}: {
  username: string;
  timestamp: string;
  content: string;
  avatar: string;
}) {
  return (
    <div className="flex gap-2 px-4 py-2 hover:bg-gray-900/30 group">
      <div className="shrink-0 mr-1">
        <Image
          src={"/default-avatar.png"}
          alt={username}
          className="rounded-full"
          width={40}
          height={40}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
            {username}
          </span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-white text-sm leading-relaxed">{content}</div>
      </div>
    </div>
  );
}
