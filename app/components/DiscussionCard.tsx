import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { useGetMessageById } from "../hooks/api";

export function DiscussionCard({ discussion }: { discussion: string }) {
  const [expanded, setExpanded] = useState(false);

  const { data: messageData } = useGetMessageById(discussion);

  return (
    <div
      className="rounded-lg shadow-md border border-gray-300 bg-white"
      style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.7)", cursor: "pointer" }}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center px-3 py-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {messageData?.authorId.image ? (
            <img
              src={messageData.authorId.image}
              alt="Avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <User
              className="w-full h-full"
              style={{ color: "var(--foreground)" }}
            />
          )}
        </div>
        {/* Title/content */}
        <div className="flex-1 ml-3">
          <p className="font-medium text-[var(--foreground)] text-sm">
            {messageData?.text}
          </p>
        </div>
        {/* Dropdown Button */}
        <div
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-transform"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(90deg)" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 22C15.3 22 14.7 21.7 14.3 21.2L8.3 13.2C7.5 12.1 8.3 10.5 9.7 10.5H22.3C23.7 10.5 24.5 12.1 23.7 13.2L17.7 21.2C17.3 21.7 16.7 22 16 22Z"
              fill="#A7875A"
              stroke="#A7875A"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {expanded && (
        <MessageList
          messages={[]}
          mainUserId={messageData?.authorId._id || ""}
        />
      )}
    </div>
  );
}

function MessageList({
  messages,
  mainUserId,
}: {
  messages: any[];
  mainUserId: string;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="px-3 pb-3 pt-1 animate-fade-in-down">
      <div className="flex flex-col gap-2 mb-2">
        {messages.map((msg, idx) => {
          const alignRight = idx % 2 === 1;
          return (
            <div
              key={idx}
              className={`flex items-end ${
                alignRight ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mx-2">
                {msg.avatarUrl ? (
                  <Image
                    src={msg.avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className="w-full h-full"
                    style={{ color: "var(--foreground)" }}
                  />
                )}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  alignRight
                    ? "bg-green-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
                style={{ maxWidth: "70%" }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          placeholder="Opino que ..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            background: "white",
            color: "var(--foreground)",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            border: "1.5px solid rgb(0, 0, 0)",
            boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
            lineHeight: 1.1,
            minHeight: 0,
          }}
        />
        <button
          className="px-4 py-2 rounded-full text-sm font-medium transition-all w-fit"
          style={{
            background: "var(--color-chip-5)",
            color: "var(--foreground)",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            border: "1.5px solid rgb(0, 0, 0)",
            boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
            lineHeight: 1.1,
            minHeight: 0,
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
