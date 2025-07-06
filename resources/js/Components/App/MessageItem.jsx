import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import React from "react";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, attachmentClick }) => {
  const currentUser = usePage().props.auth.user;

  return (
    <div
      className={
        "chat pb-6 pt-0 gap-x-5 " +
        (message.sender_id === currentUser.id ? "chat-end" : "chat-start")
      }
    >
      {<UserAvatar user={message.sender} />}

      <div className="chat-header text-base text-gray-500 dark:text-gray-400">
        {message.sender_id !== currentUser.id ? message.sender.name : ""}
        <time className="text-xs opacity-85 ml-2">
          {formatMessageDateLong(message.created_at)}
        </time>
      </div>

      <div
        className={
          "chat-bubble max-w-[500px] relative shadow " +
          (message.sender_id === currentUser.id
            ? " chat-bubble-info bg-gray-100 dark:bg-gray-600 dark:text-gray-200"
            : "bg-gray-50 text-gray-800 dark:bg-gray-300 dark:text-gray-900")
        }
      >
        {message.sender_id == currentUser.id && (
          <MessageOptionsDropdown message={message} />
        )}
        <div className="chat-message">
          <div className="chat-message-content">
            <ReactMarkdown>{message.message}</ReactMarkdown>
          </div>
          <MessageAttachments
            attachments={message.attachments}
            attachmentClick={attachmentClick}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
