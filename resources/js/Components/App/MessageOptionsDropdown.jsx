import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useEventBus } from "@/EventBus";

export default function MessageOptionsDropdown({ message }) {
  const { emit } = useEventBus();

  const onMessageDelete = () => {
    console.log("Delete Message");

    axios
      .delete(route("message.destroy", message.id))
      .then((res) => {
        emit("message.deleted", { message, prevMessage: res.data.message });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="absolute right-full text-gray-700 top-1/2 -translate-y-1/2 z-[10]">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="transition-all flex justify-center items-center w-8 h-8 rounded-full hover:bg-gray-200 mr-1">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="transition-all absolute right-0 mt-2 w-48 rounded-md bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow-lg z-[100]">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onMessageDelete}
                    className={`${
                      active
                        ? "bg-black/5 dark:bg-black/10 text-gray-700 dark:text-white"
                        : "dark:text-gray-100 text-gray-800"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
