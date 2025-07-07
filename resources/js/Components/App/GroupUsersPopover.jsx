import { Popover, Transition } from "@headlessui/react";
import { UsersIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";

export default function GroupUsersPopover({ users = [] }) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`${open ? "text-gray-700 dark:text-gray-200" : "text-gray-500"
              } hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
          >
            <UsersIcon className="w-6" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-20 w-[300px] px-4 sm:px-0">
              <div className="overflow-hidden rounded-lg shadow ring-1 ring-black/5">
                <div className="bg-white/90 dark:bg-gray-800 px-4 dark:text-gray-200 text-gray-700 py-2">
                  {users.map((user) => (
                    <Link
                      href={route("chat.user", user.id)}
                      key={user.id}
                      className="transition-all flex items-center py-2 px-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl my-2"
                    >
                      <UserAvatar user={user} />
                      <div className="text-lg ml-3">{user.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
