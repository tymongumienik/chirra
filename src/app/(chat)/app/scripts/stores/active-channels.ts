import { create } from "zustand";

type ActiveChannelsIdState = {
  activeChannels: Record<string, string>; // Record<ServerId, ChannelId>
  setActiveChannels: (channels: Record<string, string>) => void;
  setActiveChannelInServer: (serverId: string, channelId: string) => void;
  getActiveChannelInServer: (serverId: string) => string;
};

export const useActiveChannelsIdStore = create<ActiveChannelsIdState>(
  (set, get) => ({
    activeChannels: {},
    setActiveChannels: (channels: Record<string, string>) =>
      set({ activeChannels: channels }),
    setActiveChannelInServer: (serverId: string, channelId: string) =>
      set((state) => ({
        activeChannels: {
          ...state.activeChannels,
          [serverId]: channelId,
        },
      })),
    getActiveChannelInServer: (serverId: string) =>
      get().activeChannels[serverId],
  }),
);
