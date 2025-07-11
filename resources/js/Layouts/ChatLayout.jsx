import TextInput from "@/Components/TextInput";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import ConversationItem from "@/Components/App/ConversationItem";
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";

const ChatLayout = ({ children }) => {
  const page = usePage();
  const conversations = page.props.conversations;
  const selectedConversation = page.props.selectedConversation;
  const [localConversations, setLocalConversations] = useState([]);
  const [sortedConversations, setSortedConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { emit, on } = useEventBus();

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
    const offModalShow = on("GroupModal.show", (group) => {
      setShowGroupModal(true);
    });

    const offGroupDelete = on("group.deleted", ({ id, name }) => {
      setLocalConversations((oldConversations) => {
        return oldConversations.filter((con) => con.id != id);
      });

      emit("toast.show", `Group "${name}" was deleted`);

      if (
        !selectedConversation ||
        (selectedConversation.is_group && selectedConversation.id == id)
      ) {
        router.visit(route("dashboard"));
      }
    });

    return () => {
      offCreated();
      offDeleted();
      offModalShow();
      offGroupDelete();
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
      <div className="flex mx-auto lg:min-w-[1024px] xl:min-w-[1280px] overflow-hidden shadow-lg my-6 rounded-2xl border border-gray-200 dark:border-slate-700">
        <div
          className={`transition-all p-2 md:w-[240px] lg:w-[320px] xl:w-[400px] bg-gray-100 dark:bg-slate-800 flex flex-col border-r border-gray-300 dark:border-slate-600 ${
            selectedConversation ? "-ml-[100%] sm:ml-0" : ""
          }`}
        >
          <div className="flex items-center justify-between py-2 px-3 text-2xl font-medium text-gray-700 dark:text-gray-200">
            My Conversations
            <div
              className="tooltip tooltip-left before:text-gray-700 dark:before:text-gray-200 before:bg-white/90 dark:before:bg-black/75"
              data-tip="Create new Group"
            >
              <button
                onClick={(ev) => setShowGroupModal(true)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <PencilSquareIcon className="w-6 n-4 inline-block ml-2" />
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
          <div className="flex-1 overflow-auto px-3 mr-[-0.5rem]">
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
        <div className="flex flex-1 flex-col border border-gray-200 dark:border-slate-700">
          {children}
        </div>
      </div>
      <GroupModal
        show={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </>
  );
};

export default ChatLayout;
