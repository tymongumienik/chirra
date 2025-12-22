"use server";

import VerifyEmail from "./component";

export default async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  return <VerifyEmail token={token} />;
};
