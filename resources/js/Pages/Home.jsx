import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import MessageInput from "@/Components/App/MessageInput";
import { useEventBus } from "@/EventBus";
import axios from "axios";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal";

const Home = () => {
  const { selectedConversation = null, messages = null } = usePage().props;
  const [localMessages, setLocalMessages] = useState([]);
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [scrollFromBottom, setScrollFromBottom] = useState(0);
  const loadMoreIntersect = useRef(null);
  const messagesCtrRef = useRef(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState({});
  const { on } = useEventBus();

  const messageCreated = (message) => {
    if (
      selectedConversation &&
      selectedConversation.is_group &&
      selectedConversation.id == message.group_id
    ) {
      setLocalMessages((prevMessages) => [...prevMessages, message]);
    }
    if (
      selectedConversation &&
      selectedConversation.is_user &&
      (selectedConversation.id == message.sender_id ||
        selectedConversation.id == message.receiver_id)
    ) {
      setLocalMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const messageDeleted = ({ message }) => {
    if (
      selectedConversation &&
      selectedConversation.is_group &&
      selectedConversation.id == message.group_id
    ) {
      setLocalMessages((prevMessages) => {
        return prevMessages.filter((m) => m.id !== message.id);
      });
    }
    if (
      selectedConversation &&
      selectedConversation.is_user &&
      (selectedConversation.id == message.sender_id ||
        selectedConversation.id == message.receiver_id)
    ) {
      setLocalMessages((prevMessages) => {
        return prevMessages.filter((m) => m.id !== message.id);
      });
    }
  };

  const loadMoreMessages = useCallback(() => {
    if (noMoreMessages) {
      return;
    }
    const firstMessage = localMessages[0];
    axios.get(route("message.loadOlder", firstMessage.id)).then(({ data }) => {
      if (data.data.length === 0) {
        setNoMoreMessages(true);
        return;
      }
      const scrollHeight = messagesCtrRef.current.scrollHeight;
      const scrollTop = messagesCtrRef.current.scrollTop;
      const clientHeight = messagesCtrRef.current.clientHeight;
      const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
      console.log("tmpScrollFromBottom ", tmpScrollFromBottom);
      setScrollFromBottom(scrollHeight - scrollTop - clientHeight);

      setLocalMessages((prevMessages) => {
        return [...data.data.reverse(), ...prevMessages];
      });
    });
  }, [localMessages, noMoreMessages]);

  const onAttachmentClick = (attachments, ind) => {
    setPreviewAttachment({
      attachments,
      ind,
    });
    setShowAttachmentPreview(true);
  };

  useEffect(() => {
    setTimeout(() => {
      if (messagesCtrRef.current) {
        messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
      }
    }, 10);

    const offCreated = on("message.created", messageCreated);
    const offDeleted = on("message.deleted", messageDeleted);

    setScrollFromBottom(0);
    setNoMoreMessages(false);

    return () => {
      offCreated();
      offDeleted();
    };
  }),
    [selectedConversation];

  useEffect(() => {
    setLocalMessages(messages ? messages.data.reverse() : []);
  }, [messages]);

  useEffect(() => {
    if (messagesCtrRef.current && scrollFromBottom !== null) {
      messagesCtrRef.current.scrollTop =
        messagesCtrRef.current.scrollHeight -
        messagesCtrRef.current.offsetHeight -
        scrollFromBottom;
    }

    if (noMoreMessages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => entry.isIntersecting && loadMoreMessages()),
      {
        rootMargin: "0px 0px 250px 0px",
      }
    );

    if (loadMoreIntersect.current) {
      setTimeout(() => {
        observer.observe(loadMoreIntersect.current);
      }, 100);
    }

    return () => {
      observer.disconnect();
    };
  }, [localMessages]);

  return (
    <>
      {!messages && (
        <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
          <div className="text-2xl md:text-4xl p-16 text-slate-700 dark:text-slate-200">
            Please select conversation to see messages
          </div>
          <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
        </div>
      )}
      {messages && (
        <>
          <ConversationHeader selectedConversation={selectedConversation} />
          <div
            ref={messagesCtrRef}
            className="shadow-[inset_0_0px_4px_rgba(0,0,0,0.2)] flex flex-1 justify-center overflow-y-auto p-5 overflow-hidden relative m-auto w-full bg-white dark:bg-gray-900"
          >
            {}

            {localMessages.length === 0 && (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="text-6xl text-slate-200 opacity-40 mb-3">
                  ¯\_(ツ)_/¯
                </div>
                <div className="text-lg text-slate-200 opacity-40">
                  No messages found.
                </div>
                <div className="text-lg text-slate-200 opacity-40">
                  Start the conversation!
                </div>
              </div>
            )}
            {localMessages.length > 0 && (
              <div className="flex-1 flex flex-col">
                <div ref={loadMoreIntersect}></div>
                {localMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    attachmentClick={onAttachmentClick}
                  />
                ))}
              </div>
            )}
          </div>
          <MessageInput conversation={selectedConversation} />
        </>
      )}

      {previewAttachment.attachments && (
        <AttachmentPreviewModal
          attachments={previewAttachment.attachments}
          index={previewAttachment.ind}
          show={showAttachmentPreview}
          onClose={() => setShowAttachmentPreview(false)}
        />
      )}
    </>
  );
};

Home.layout = (page) => {
  return (
    <AuthenticatedLayout user={page.props.auth.user}>
      <ChatLayout children={page} />
    </AuthenticatedLayout>
  );
};

export default Home;
