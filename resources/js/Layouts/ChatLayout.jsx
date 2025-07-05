import TextInput from "@/Components/TextInput";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import ConversationItem from "@/Components/App/ConversationItem";
import { useEventBus } from "@/EventBus";

const ChatLayout = ({ children }) => {
  const page = usePage();
  const conversations = page.props.conversations;
  const selectedConversation = page.props.selectedConversation;
  const [localConversations, setLocalConversations] = useState([]);
  const [sortedConversations, setSortedConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { on } = useEventBus();

  const isUserOnline = (userId) => onlineUsers[userId];

  const onSearch = (ev) => {
    const search = ev.target.value.toLowerCase();
    setLocalConversations(
      conversations.filter((conversation) => {
        return conversation.name.toLowerCase().includes(search);
      })
    );
  };

  const messageCreated = (message) => {
    setLocalConversations((oldUsers) => {
      return oldUsers.map((u) => {
        if (
          message.recevier_id &&
          !u.is_group &&
          (u.id == message.sender_id || u.id == message.recevier_id)
        ) {
          u.last_message = message.message;
          u.last_message_date = message.created_at;
          return u;
        }

        if (message.group_id && u.is_group && u.id == message.group_id) {
          u.last_message = message.message;
          u.last_message_date = message.created_at;
          return u;
        }
        return u;
      });
    });
  };

  const messageDeleted = ({ prevMessage }) => {
    if (!prevMessage) {
      return;
    }

    messageCreated(prevMessage);
  };

  useEffect(() => {
    const offCreated = on("message.created", messageCreated);
    const offDeleted = on("message.deleted", messageDeleted);
    return () => {
      offCreated();
      offDeleted();
    };
  }, [on]);

  useEffect(() => {
    setSortedConversations(
      localConversations.sort((a, b) => {
        if (a.blocked_at && b.blocked_at) {
          return a.blocked_at > b.blocked_at ? 1 : -1;
        } else if (a.blocked_at) {
          return 1;
        } else if (b.blocked_at) {
          return -1;
        }
        if (a.last_message_date && b.last_message_date) {
          return b.last_message_date.localeCompare(a.last_message_date);
        } else if (a.last_message_date) {
          return -1;
        } else if (b.last_message_date) {
          return 1;
        } else {
          return 0;
        }
      })
    );
  }, [localConversations]);

  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    Echo.join("online")
      .here((users) => {
        const onlineUsersObj = Object.fromEntries(
          users.map((user) => [user.id, user])
        );

        setOnlineUsers((prevOnlineUsers) => {
          return { ...prevOnlineUsers, ...onlineUsersObj };
        });
      })
      .joining((user) => {
        setOnlineUsers((prevOnlineUsers) => {
          const updatedUsers = { ...prevOnlineUsers };
          updatedUsers[user.id] = user;
          return updatedUsers;
        });
      })
      .leaving((user) => {
        setOnlineUsers((prevOnlineUsers) => {
          const updatedUsers = { ...prevOnlineUsers };
          delete updatedUsers[user.id];
          return updatedUsers;
        });
      })
      .error((error) => {
        console.error("error", error);
      });

    return () => {
      Echo.leave("online");
    };
  }, []);

  return (
    <>
      <div className="flex w-full overflow-hidden">
        <div
          className={`transition-all sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col ${
            selectedConversation ? "-ml-[100%] sm:ml-0" : ""
          }`}
        >
          <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
            My Conversations
            <div className="tooltip tooltip-left" data-tip="Create new Group">
              <button className="text-gray-400 hover:text-gray-200">
                <PencilSquareIcon className="w-4 n-4 inline-block ml-2" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <TextInput
              onKeyUp={onSearch}
              placeholder="Filter users and groups"
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-auto">
            {sortedConversations.map((conversation, index) => {
              const type = conversation?.is_group === true ? "group" : "user";
              const key = `conversation-${type}-${conversation.id}`;
              return (
                <ConversationItem
                  key={key}
                  conversation={conversation}
                  online={!!isUserOnline(conversation.id)}
                  selectedConversation={selectedConversation}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </>
  );
};

export default ChatLayout;
