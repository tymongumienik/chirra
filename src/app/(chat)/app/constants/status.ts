const statusColors = {
  online: "bg-green-700",
  offline: "bg-gray-500",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
};

export type UserStatus = keyof typeof statusColors;

export { statusColors, statusLabels };
