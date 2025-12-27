import { Hash, Pin } from "lucide-react";
import { useViewStore } from "../../scripts/stores/view";
import { useUserDataStore } from "../../scripts/stores/user-data";
import { useActiveDmStore } from "../../scripts/stores/active-dm";
import Image from "next/image";

export function ChannelTopBar() {
  const view = useViewStore((s) => s.view);
  const currentDmUser = useActiveDmStore((s) => s.activeUserId);
  const getUserData = useUserDataStore((s) => s.getUser);

  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-slate-900 shadow-sm">
      <div className="flex items-center gap-2">
        {view === "dm" ? (
          <>
            <Image
              src={
                getUserData(currentDmUser)?.profile?.avatar ||
                "/default-avatar.png"
              }
              alt="Avatar"
              width={32}
              height={32}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white">
              {getUserData(currentDmUser)?.displayname}
            </span>
          </>
        ) : (
          <>
            <Hash className="w-6 h-6 text-gray-400" />
            <span className="text-white">#active-channel</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Pin className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" />
      </div>
    </div>
  );
}
