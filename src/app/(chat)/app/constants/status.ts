const statusColors = {
  online: "bg-green-700",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

const statusLabels = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export type UserStatus = keyof typeof statusColors;

export { statusColors, statusLabels };
