import { t } from "elysia";
import { TypeCompiler } from "elysia/type-system";

const ReceivedMessage = t.Object({
  message: t.String(),
  data: t.Record(t.String(), t.Unknown()),
});

export const ReceivedMessageCompiler = TypeCompiler.Compile(ReceivedMessage);

const SendFriendRequestData = t.Object({
  username: t.String(),
});

export const SendFriendRequestDataCompiler = TypeCompiler.Compile(
  SendFriendRequestData,
);

export const SendFriendRequestResponse = t.Object({
  success: t.Boolean(),
  error: t.Optional(t.String()),
});

export const SendFriendRequestResponseCompiler = TypeCompiler.Compile(
  SendFriendRequestResponse,
);
