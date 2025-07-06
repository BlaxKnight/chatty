import { useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function ToggleTheme() {
  const [dark, setDark] = useState(false);

  const darkModeHandler = () => {
    setDark(!dark);
    const htmltag = document.getElementById("html");
    htmltag.classList.toggle("dark");
  };

  return (
    <div className="flex items-center">
      <button onClick={() => darkModeHandler()}>
        {dark && <SunIcon className="w-6" />}
        {!dark && <MoonIcon className="w-6" />}
      </button>
    </div>
  );
}
