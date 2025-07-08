export const formatMessageDateLong = (date) => {
  const now = new Date(date);
  const inputDate = new Date(date);

  if (isToday(inputDate)) {
    return inputDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday(inputDate)) {
    return (
      "Yesterday " +
      inputDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (inputDate.getFullYear() === now.getFullYear()) {
    return inputDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  } else {
    return inputDate.toLocaleDateString();
  }
};

export const formatMessageDateShort = (date) => {
  const now = new Date(date);
  const inputDate = new Date(date);

  if (isToday(inputDate)) {
    return inputDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday(inputDate)) {
    return "Yesterday";
  } else if (inputDate.getFullYear() === now.getFullYear()) {
    return inputDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  } else {
    return inputDate.toLocaleDateString();
  }
};

export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const getMimeType = (attachment) => {
  const raw = attachment?.mime || attachment?.type || "";
  return raw.toLowerCase().split("/");
};

export const isImage = (attachment) => {
  const [type] = getMimeType(attachment);
  return type === "image";
};

export const isVideo = (attachment) => {
  const [type] = getMimeType(attachment);
  return type === "video";
};

export const isAudio = (attachment) => {
  const [type] = getMimeType(attachment);
  return type === "audio";
};

export const isPDF = (attachment) => {
  const mime = (attachment?.mime || attachment?.type || "").toLowerCase();
  return mime === "application/pdf";
};

export const isPreviewable = (attachment) => {
  return (
    isImage(attachment) ||
    isVideo(attachment) ||
    isAudio(attachment) ||
    isPDF(attachment)
  );
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  let i = 0;
  let size = bytes;
  while (size >= k) {
    size /= k;
    i++;
  }

  return parseFloat(size.toFixed(dm)) + " " + sizes[i];
};
