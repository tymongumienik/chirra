import { t } from "elysia";
import { TypeCompiler } from "elysia/type-system";

// GENERAL

export const ReceivedMessage = t.Object({
  message: t.String(),
  data: t.Record(t.String(), t.Unknown()),
});

export const ReceivedMessageCompiler = TypeCompiler.Compile(ReceivedMessage);

const Invite = t.Object({
  requester: t.Object({ id: t.String() }),
  addressee: t.Object({ id: t.String() }),
});

export const Message = t.Object({
  id: t.String(),
  createdAt: t.Date(),
  content: t.String(),
  authorId: t.String(),
  recipientId: t.Union([t.String(), t.Null()]),
  channelId: t.Union([t.String(), t.Null()]),
  updatedAt: t.Date(),
  edited: t.Boolean(),
});

// HANDLERS

export const SendFriendRequestData = t.Object({
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

export const DeleteFriendEntryData = t.Object({
  pair: Invite,
});

export const DeleteFriendEntryDataCompiler = TypeCompiler.Compile(
  DeleteFriendEntryData,
);

export const AcceptFriendRequestData = t.Object({
  pair: Invite,
});

export const AcceptFriendRequestDataCompiler = TypeCompiler.Compile(
  AcceptFriendRequestData,
);

export const RequestMessageHistoryData = t.Object({
  requestId: t.String(),
  location: t.Union([
    t.Object({
      channel: t.String(),
    }),
    t.Object({
      user: t.String(),
    }),
  ]),
  page: t.Number(),
});

export const RequestMessageHistoryDataCompiler = TypeCompiler.Compile(
  RequestMessageHistoryData,
);

export const RequestMessageHistoryResponse = t.Object({
  requestId: t.String(),
  messages: t.Array(Message),
});

export const RequestMessageHistoryResponseCompiler = TypeCompiler.Compile(
  RequestMessageHistoryResponse,
);

export const ChannelSetSubscriptionStateData = t.Object({
  location: t.Union([
    t.Object({
      channel: t.String(),
    }),
    t.Object({
      user: t.String(),
    }),
  ]),
  subscribed: t.Boolean(),
});

export const ChannelSetSubscriptionStateDataCompiler = TypeCompiler.Compile(
  ChannelSetSubscriptionStateData,
);

export const TypingUpdateStateData = t.Object({
  typing: t.Boolean(),
  location: t.Union([
    t.Object({
      channel: t.String(),
    }),
    t.Object({
      user: t.String(),
    }),
  ]),
});

export const TypingUpdateStateDataCompiler = TypeCompiler.Compile(
  TypingUpdateStateData,
);

// LETTERS

export const PendingInvitesLetter = t.Object({
  invites: t.Array(Invite),
});

export const PendingInvitesLetterCompiler =
  TypeCompiler.Compile(PendingInvitesLetter);

export const UserDetailsLetter = t.Object({
  users: t.Array(
    t.Object({
      id: t.String(),
      username: t.String(),
      createdAt: t.Date(),
      displayname: t.String(),
      profile: t.Union([
        t.Object({
          avatar: t.Union([t.String(), t.Null()]),
          bio: t.Union([t.String(), t.Null()]),
          pronouns: t.Union([t.String(), t.Null()]),
          location: t.Union([t.String(), t.Null()]),
        }),
        t.Null(),
      ]),
    }),
  ),
});

export const UserDetailsLetterCompiler =
  TypeCompiler.Compile(UserDetailsLetter);

export const FriendsListLetter = t.Object({
  friends: t.Array(t.String()),
});

export const FriendsListLetterCompiler =
  TypeCompiler.Compile(FriendsListLetter);

export const AnnounceStatusesLetter = t.Object({
  statuses: t.Record(t.String(), t.Boolean()),
});

export const AnnounceStatusesLetterCompiler = TypeCompiler.Compile(
  AnnounceStatusesLetter,
);

export const SideMessagesLetter = t.Object({
  users: t.Array(t.String()),
});

export const SideMessagesLetterCompiler =
  TypeCompiler.Compile(SideMessagesLetter);

export const DMBriefingLetter = t.Object({
  messages: t.Record(t.String(), t.Array(Message)),
});

export const DMBriefingLetterCompiler = TypeCompiler.Compile(DMBriefingLetter);

export const TypingStateLetter = t.Object({
  typingState: t.Boolean(),
  typerId: t.String(),
});

export const TypingStateLetterCompiler =
  TypeCompiler.Compile(TypingStateLetter);
