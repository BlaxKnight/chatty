import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Toast({}) {
  const [toasts, setToasts] = useState([]);
  const { on } = useEventBus();

  useEffect(() => {
    on("toast.show", (message) => {
      const uuid = uuidv4();

      setToasts((oldToasts) => [...oldToasts, { message, uuid }]);

      setTimeout(() => {
        setToasts((oldToasts) =>
          oldToasts.filter((toast) => toast.uuid !== uuid)
        );
      }, 5000);
    });
  }, [on]);

  return (
    <div className="toast min-w-[240px] w-full xs:w-auto">
      {toasts.map((toast, index) => {
        <div
          key={index}
          className="alert alert-success py-3 px-4 text-gray-100 rounded-md "
        >
          <span>New message arrived!</span>
        </div>;
      })}
    </div>
  );
}
