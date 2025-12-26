import {
  SendFriendRequestData,
  SendFriendRequestDataCompiler,
  SendFriendRequestResponseCompiler,
} from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useWebSocket } from "@/app/libs/ws";
import { LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export function FriendsAddTab() {
  const { sendMessage, subscribe } = useWebSocket();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ color: "white", text: "" });

  const sendRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    sendMessage<typeof SendFriendRequestData>("over:send-friend-request", {
      username,
    });
    setMessage({ color: "", text: "" });
  };

  useEffect(() => {
    const unsub = subscribe((message, data) => {
      if (message === "response:send-friend-request") {
        if (!SendFriendRequestResponseCompiler.Check(data)) return;

        if (data.success) {
          setLoading(false);
          setMessage({
            color: "green",
            text: "Success! A friend invite has been sent.",
          });
        } else {
          setLoading(false);
          setMessage({ color: "red", text: `${data.error}` });
        }
      }
    });
    return unsub;
  }, [subscribe]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white uppercase mb-2">
          Add Friend
        </h2>
        <p className="text-sm text-gray-300">
          You can add friends with their username.
        </p>
      </div>
      <form
        onSubmit={sendRequest}
        className="flex items-center gap-4 px-4 py-2 bg-gray-900 rounded-lg border border-gray-900"
      >
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onInput={(e) =>
            setUsername(e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, ""))
          }
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="relative px-4 py-2 bg-accent text-white text-sm font-medium rounded flex justify-center items-center"
        >
          <span className={loading ? "invisible" : ""}>
            Send Friend Request
          </span>

          {loading && <LoaderCircle className="absolute animate-spin" />}
        </button>
      </form>
      {message.text !== "" && (
        <p className="mt-2 text-sm" style={{ color: message.color }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
