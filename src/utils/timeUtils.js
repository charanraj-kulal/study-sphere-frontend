// timeUtils.js

export function formatTimeAgo(timestamp) {
  const now = new Date();
  const secondsPast = (now.getTime() - timestamp.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${parseInt(secondsPast)} seconds ago`;
  } else if (secondsPast < 3600) {
    return `${parseInt(secondsPast / 60)} minutes ago`;
  } else if (secondsPast <= 86400) {
    return `${parseInt(secondsPast / 3600)} hours ago`;
  } else {
    const day = timestamp.getDate();
    const month = timestamp
      .toLocaleString("default", { month: "short" })
      .slice(0, 3);
    const year = timestamp.getFullYear();
    return `${day} ${month} ${year}`;
  }
}
