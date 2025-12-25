import { t } from "elysia";
import { TypeCompiler } from "elysia/type-system";

const ReceivedMessage = t.Object({
  message: t.String(),
  data: t.Record(t.String(), t.Unknown()),
});

export const ReceivedMessageCompiler = TypeCompiler.Compile(ReceivedMessage);
