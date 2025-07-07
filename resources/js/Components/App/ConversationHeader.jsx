import { Link, usePage } from "@inertiajs/react";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import GroupUsersPopover from "./GroupUsersPopover";
import GroupDescriptionPopover from "./GroupDescriptionPopover";
import { useEventBus } from "@/EventBus";

const ConversationHeader = ({ selectedConversation }) => {
  const authUser = usePage().props.auth.user;
  const { emit } = useEventBus();

  const onDeleteGroup = () => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }
    axios
      .delete(route("group.destroy", selectedConversation))
      .then((res) => {
        console.log(res);
        emit("toast.show", res.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {selectedConversation && (
        <div className="bg-gray-200 dark:bg-slate-700 p-3 flex justify-between items-center border-b border-gray-300 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <Link href={route("dashboard")} className="inline-block sm:hidden">
              <ArrowLeftIcon className="w-6" />
            </Link>
            {selectedConversation.is_user && (
              <UserAvatar user={selectedConversation} />
            )}
            {selectedConversation.is_group && <GroupAvatar />}
            <div className="text-gray-800 dark:text-gray-100">
              <h3 className="text-xl">{selectedConversation.name}</h3>
              {selectedConversation.is_group && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversation.users.length} members
                </p>
              )}
            </div>
          </div>
          {selectedConversation.is_group && (
            <div className="flex gap-3">
              <GroupDescriptionPopover
                description={selectedConversation.description}
              />
              <GroupUsersPopover users={selectedConversation.users} />
              {selectedConversation.owner_id == authUser.id && (
                <>
                  <div className="tooltip tooltip-left before:text-gray-700 dark:before:text-gray-200 before:bg-white/90 dark:before:bg-black/75" data-tip="Edit Group">
                    <button
                      onClick={(ev) =>
                        emit("GroupModal.show", selectedConversation)
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <PencilSquareIcon className="w-6" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-left before:text-gray-700 dark:before:text-gray-200 before:bg-white/90 dark:before:bg-black/75" data-tip="Delete Group">
                    <button
                      onClick={onDeleteGroup}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <TrashIcon className="w-6" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ConversationHeader;
