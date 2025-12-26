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
