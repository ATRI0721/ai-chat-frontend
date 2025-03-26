import { create } from "zustand";
import { Message, Conversation } from "../types";
import { chatAPI } from "../api/chat";

interface ChatState {
  // 对话相关
  conversations: Conversation[];
  currentConversationId: string;
  // 消息相关
  messages: Message[];
  isloading: boolean;
  isInit: boolean;
  messageCache: Map<string, Message[]>;

  init: () => Promise<void>;

  // 对话操作
  fetchConversations: () => Promise<void>;
  createConversation: (message: string) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  reNameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
  getMessages: (id: string) => Promise<void>;
  regenerateMessage: (id: string) => Promise<void>;

  // 消息操作
  sendMessage: (content: string) => Promise<void>;
}

function checkToken() {
  const token = localStorage.getItem("token");
  return token && token.trim().length > 0;
}

async function handleStream(stream: ReadableStream, handleMessage: (data: any) => void) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  async function read(): Promise<void> {
    return reader.read().then(({ value, done }) => {
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n\n");
      buffer = lines.pop() || "";
      lines.forEach((line) => {
        try {
          const data = JSON.parse(line);
          handleMessage(data);
        } catch (error) {
          console.error("Failed to parse message", line, error);
        }
      });
      return read();
    });
  }

  await read();
  if (buffer.trim().length > 0) {
    const data = JSON.parse(buffer);
    handleMessage(data);
  }

}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: localStorage.getItem("currentConversationId") || "",
  messages: [],
  isloading: false,
  isInit: false,
  messageCache: new Map(),

  fetchConversations: async () => {
    if (!checkToken()) return;
    return chatAPI
      .getConversations()
      .then((response) => {
        set({
          conversations: response.map((c) => ({ ...c, isloading: false })),
        });
      })
      .catch((e) => console.error(e));
  },

  createConversation: async (message: string) => {
    if (!checkToken()) return;
    chatAPI
      .createConversation()
      .then(async (response) => {
        set((state) => ({
          conversations: [
            { ...response, isloading: false, update_time: Date.now() },
            ...state.conversations,
          ],
          currentConversationId: response.id,
          messages: [],
        }));
        localStorage.setItem("currentConversationId", response.id);
        await get().sendMessage(message);
      })
      .catch((e) => console.error(e));
  },

  getMessages: async (id: string) => {
    if (!checkToken() || !get().conversations.find((c) => c.id === id)) return;
    chatAPI.getMessages(id).then((response) => {
      set({ messages: response });
      get().messageCache.set(id, response);
    }).catch((e) => console.error(e));
  },

  selectConversation: async (id) => {
    if (!checkToken()) return;
    const conversation = get().conversations.find((c) => c.id === id);
    if (!conversation && id !== "")  return;
    const currentConversationId  = get().currentConversationId;
    get().messageCache.set(currentConversationId, get().messages);
    set({ currentConversationId: id });
    localStorage.setItem("currentConversationId", id);
    
    if (id === "") {
      set({ messages: [] });
      return;
    }
    set({ isloading: conversation?.isloading || false });
    if ( get().messageCache.get(id)?.length) {
      set({ messages: get().messageCache.get(id) });
    } else {
      get().getMessages(id);
    }
  },

  reNameConversation: async (id, title) => {
    if (!checkToken() || title.trim().length === 0) return;
    const conversation = get().conversations.find((c) => c.id === id);
    if (!conversation || conversation.title === title) return;
    chatAPI.updateTitle(id, title).catch(() => {
      console.error("Failed to rename conversation");
    });
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title, update_time: Date.now() } : c
      ),
    }));
  },

  deleteConversation: async (id) => {
    if (!checkToken()) return;
    const conversation = get().conversations.find((c) => c.id === id);
    if (!conversation) return;
    chatAPI.deleteConversation(id).catch((e) => {
      console.error(e);
    });
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    }));
    if (get().currentConversationId === id) {
      set({ currentConversationId: "" });
      localStorage.setItem("currentConversationId", "");
    }
    get().messageCache.delete(id);
  },

  deleteAllConversations: async () => {
    if (!checkToken()) return;
    chatAPI.deleteAllConversations().catch((e) => {
      console.error(e);
    });
    set({ conversations: [] });
    get().selectConversation("");
    get().messageCache.clear();
  },

  init: async () => {
    set({ isInit: true });
    get().fetchConversations().then(() => {
      const currentConversationId = get().currentConversationId;
      if (!(currentConversationId === "" || get().conversations.find((c) => c.id === currentConversationId))){
        localStorage.setItem("currentConversationId", "");
        set({ currentConversationId: "" });
        return;
      }
      get().selectConversation(currentConversationId);
    });
  },

  regenerateMessage: async (id) => {
    if (!checkToken()) return;
    const messageIndex = get().messages.findIndex((m) => m.id === id);
    if (messageIndex === -1) return;
    const currentConversationId = get().currentConversationId;

    set((state) => ({
      messages: [...state.messages.slice(0, messageIndex),{id: "ai", content: "", is_user: false}],
      conversations: state.conversations.map((c) =>
        c.id === get().currentConversationId ? { ...c, isloading: true, update_time: Date.now() } : c
      ),
      isloading: true,
    }));

    chatAPI.regenerateMessage(get().currentConversationId, id).then((response) => {
      if (!response.ok) throw new Error("Failed to regenerate message");
      if (!response.body) throw new Error("No response body");
      return response.body;
    }).then(async (stream) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function handleMessage(data: any) {
        if (data.type === "message") {
          if (currentConversationId === get().currentConversationId) {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === data.id
                ? { ...msg, content:msg.content + data.value }
                : msg
            ),
          }));
          }else{
            get()
              .messageCache.get(currentConversationId!)
              ?.map((msg) =>
                msg.id === data.id
                  ? { ...msg, content:msg.content + data.value }
                  : msg
              );
          }
        } else if (data.type === "init") {
          set((state) => ({
            messages: [
              ...state.messages.slice(0, -1),
               {
                 ...state.messages[state.messages.length - 1],
                 id: data.ai_message_id,
               },
            ],
          }));
        } else {
          throw new Error("Unknown message type" + data.type);
        }
      }

        await handleStream(stream, handleMessage);

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === get().currentConversationId ? { ...c, isloading: false } : c
          ),
          isloading: false,
        }));
      
    }).catch((error) => {
      console.error(error);
    });
  }
  ,

  sendMessage: async (content) => {
    if (!checkToken()) return;
    const { currentConversationId } = get();
    if (
      !currentConversationId ||
      !get().conversations.find((c) => c.id === currentConversationId) ||
      content.trim().length === 0
    )
      return;

    const userMessage = {
      id: "user",
      content,
      is_user: true,
    };

    const aiMessage = {
      id: "ai",
      content: "",
      is_user: false,
    };

    set((state) => ({
      messages: [...state.messages, userMessage, aiMessage],
      conversations: state.conversations.map((c) =>
        c.id === currentConversationId ? { ...c, isloading: true, update_time: Date.now() } : c
      ),
      isloading: true,
    }));

    chatAPI
      .sendMessage(currentConversationId, content)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to send message");
        if (!response.body) throw new Error("No response body");
        return response.body;
      })
      .then(async (stream) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function handleMessage(data: any) {
          if (data.type === "message") {
            if (currentConversationId === get().currentConversationId) {
              set((state) => ({
                messages: state.messages.map((msg) =>
                  msg.id === data.id
                    ? { ...msg, content: msg.content + data.value }
                    : msg
                ),
              }));
            } else {
              get()
                .messageCache.get(currentConversationId!)
                ?.map((msg) =>
                  msg.id === data.id
                    ? { ...msg, content: msg.content + data.value }
                    : msg
                );
            }
          } else if (data.type === "init") {
            set((state) => ({
              messages: [
                ...state.messages.slice(0, -2),
                {
                  ...state.messages[state.messages.length - 2],
                  id: data.user_message_id,
                },

                {
                  ...state.messages[state.messages.length - 1],
                  id: data.ai_message_id,
                },
              ],
            }));
          } else {
            throw new Error("Unknown message type" + data.type);
          }
        }

        await handleStream(stream, handleMessage)

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === currentConversationId ? { ...c, isloading: false } : c
          ),
          isloading: false,
        }));
      
      })
      .catch((error) => {
        console.error(error);
      });
  },
}));
