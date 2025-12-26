import { FormEvent, useState } from "react";

export function FriendsAddTab() {
  const [username, setUsername] = useState("");

  const sendRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(username);
  };

  return (
    <div className="p-8 pt-6">
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
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded transition-colors"
        >
          Send Friend Request
        </button>
      </form>
    </div>
  );
}
