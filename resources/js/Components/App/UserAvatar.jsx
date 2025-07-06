const UserAvatar = ({ user, online = null, profile = false }) => {
  let onlineClass =
    online === true ? "online" : online === false ? "offline" : "";

  const sizeClass = profile ? "w-40" : "w-12";

  return (
    <>
      {user.avatar_url && (
        <div className={`chat-image avatar ${onlineClass}`}>
          <div className={`rounded-full ${sizeClass}`}>
            <img src={user.avatar_url} />
          </div>
        </div>
      )}
      {!user.avatar_url && (
        <div
          className={`before:w-2 before:h-2 chat-image avatar placeholder ${onlineClass}`}
        >
          <div
            className={`bg-white border border-black/50 text-gray-800  rounded-full ${sizeClass}`}
          >
            <span className="text-2xl">{user.name.substring(0, 1)}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatar;
