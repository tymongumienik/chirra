import { LoaderCircle } from "lucide-react";

export const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex justify-center items-center text-4xl text-foreground">
    <LoaderCircle className="animate-spin" />
  </div>
);
