import { Calendar, PinIcon, User2Icon } from "lucide-react";
import { useUserDataStore } from "../scripts/stores/user-data";
import Image from "next/image";

export function UserModal({ userId }: { userId: string | null }) {
  const userData = useUserDataStore((s) => s.getUser(userId ?? ""));

  if (!userId) return null;
  if (!userData) return null;
  if (!userData.profile) return null;

  const metadata = [
    { icon: User2Icon, value: userData.profile.pronouns },
    { icon: PinIcon, value: userData.profile.location },
    {
      icon: Calendar,
      value: userData.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="inter">
      <div className="flex items-center gap-4 mb-5">
        <Image
          src={userData.profile.avatar ?? "/default-avatar.png"}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-semibold text-white truncate">
            {userData.displayname}
          </div>
          <div className="text-sm text-gray-400 truncate">
            {userData.username}
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        {metadata
          .filter((item) => item.value)
          .map((item, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fine in this case as the metadata array is static
              key={idx}
              className="flex items-center gap-1 px-3 py-1 bg-card/50 rounded-full"
            >
              <item.icon className="w-3 h-3 text-accent" />
              <span className="text-gray-200 wrap-break-word">
                {item.value}
              </span>
            </div>
          ))}
      </div>

      {userData.profile.bio && (
        <div className="mt-5">
          <span className="whitespace-pre-line text-sm text-gray-400 wrap-break-word">
            {userData.profile.bio}
          </span>
        </div>
      )}
    </div>
  );
}
