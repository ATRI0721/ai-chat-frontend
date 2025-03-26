import { ClassifiedConversations, Conversation } from "./types";

export function classifyConversations(
  conversations: Conversation[]
): ClassifiedConversations[] {
  const sortedConversations = conversations.sort(
    (a, b) =>
      b.update_time - a.update_time
  );
  const t: ClassifiedConversations[] = [
    {
      group_name: "今天",
      date_before: new Date().setHours(0, 0, 0, 0),
      conversations: [],
    },
    {
      group_name: "昨天",
      date_before: new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000,
      conversations: [],
    },
    {
      group_name: "七天内",
      date_before: new Date().setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000,
      conversations: [],
    },
    {
      group_name: "三十天内",
      date_before: new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000,
      conversations: [],
    },
  ];
  let i = 0;
  for (const conversation of sortedConversations) {
    while (i < t.length && conversation.update_time < t[i].date_before) {
      i++;
    }
    if (i === t.length) {
      const year = new Date(conversation.update_time).getFullYear();
      const month = new Date(conversation.update_time).getMonth();
      t.push({
        group_name: `${year}年${month + 1}月`,
        date_before: new Date(year, month, 1).getTime(),
        conversations: [],
      });
    }
    t[i].conversations.push(conversation);
  }
  return t.filter((c) => c.conversations.length > 0);
}

const DATA_THEME_KEY = "data-theme";

const THEMES = ["system", "light", "dark"];

function systemThemeListener(event: MediaQueryListEvent) {
  const theme = event.matches ? "dark" : "light";
  document.documentElement.setAttribute(DATA_THEME_KEY, theme);
}

function setSystemTheme() {
  if (!window.matchMedia){
    document.documentElement.setAttribute(DATA_THEME_KEY, "light");
    return;
  }
  const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
  const systemTheme = mediaQueryList.matches ? "dark" : "light";
  document.documentElement.setAttribute(DATA_THEME_KEY, systemTheme);
  mediaQueryList.addEventListener("change", systemThemeListener);
}

function removeSystemThemeListener() {
  if (!window.matchMedia) {
    return;
  }
  const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQueryList.removeEventListener("change", systemThemeListener);
}

export function themeInitializer() {
  setTheme(getTheme());
}

export function setTheme(theme: string) {
  if (!THEMES.includes(theme) || theme === "system") {
    setSystemTheme();
    localStorage.setItem(DATA_THEME_KEY, "system");
    return;
  }
  removeSystemThemeListener();
  localStorage.setItem(DATA_THEME_KEY, theme);
  document.documentElement.setAttribute(DATA_THEME_KEY, theme);
}

export function getTheme() {
  const storedTheme = localStorage.getItem(DATA_THEME_KEY);
  if (!storedTheme || !THEMES.includes(storedTheme)) {
    setTheme("system");
    return "system";
  }
  return storedTheme;
}
