import { UserIcon } from "@heroicons/react/24/solid";

const GroupAvatar = ({}) => {
  return (
    <>
      <div className={`avatar placeholder`}>
        <div
          className={`bg-white border border-black/50 rounded-full w-12 text-gray-800`}
        >
          <span className="text-xl">
            <UserIcon className="w-6" />
          </span>
        </div>
      </div>
    </>
  );
};

export default GroupAvatar;
