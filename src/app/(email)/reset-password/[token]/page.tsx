"use server";

import ResetPassword from "./component";

export default async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  return <ResetPassword token={token} />;
};
