import { create } from "zustand";
import { Conversation, StreamTitleResponse } from "../types";
import { chatAPI } from "../api/chat";
import { handleError } from "./errorStore";
import { checkToken, handleStream } from "../utils";
import { useMessageStore } from "./messageStore";


interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string;
  isInit: boolean;

  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  selectConversation: (id: string) => void;
  reNameConversation: (id: string, title: string) => Promise<void>;
  generateTitle: (cid: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
  init: () => Promise<void>;
}

export const useConversationStore = create<ConversationState>()(
    (set, get) => ({
      conversations: [],
      currentConversationId: "",
      isInit: false,

      fetchConversations: async () => {
        if (!checkToken()) return;
        try {
          const response = await chatAPI.getConversations();
          set({
            conversations: response.map((c) => ({ ...c, loading: false })),
          });
        } catch (e) {
          handleError(e);
        }
      },

      createConversation: async () => {
        if (!checkToken()) return null;
        try {
          const response = await chatAPI.createConversation();
          const conversation = { ...response, loading: false };
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            currentConversationId: response.id,
          }));
          return conversation;
        } catch (e) {
          handleError(e);
          return null;
        }
      },

      selectConversation: (id) => {
        if (!checkToken()) return;
        const conversation = get().conversations.find((c) => c.id === id);
        const cid = get().currentConversationId;
        if ((!conversation && id !== "") || cid === id) return;
        set({ currentConversationId: id });
        if (id === "") {
          useMessageStore.setState({ messages: [] });
          return;
        }
        useMessageStore
          .getState()
          .getMessages(id)
          .then((m) => {
            useMessageStore.setState({
              messages: m,
              loading: conversation?.loading,
              messageCache: {
                ...useMessageStore.getState().messageCache,
                [id]: m,
              },
            });
          });
      },

      reNameConversation: async (id, title) => {
        if (!checkToken() || !title.trim()) return;
        try {
          const r = await chatAPI.updateTitle(id, title);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, title, update_time: r.update_time } : c
            ),
          }));
        } catch {
          handleError(new Error("Failed to rename conversation"));
        }
      },

      generateTitle: async (id) => {
        if (!checkToken()) return;
        try {
          const r = await chatAPI.generateTitle(id);
          if (!r.ok || !r.body) throw new Error("Failed to generate title");

          let accumulated = "";
          const _update_title = (s: StreamTitleResponse) => {
            const v = s.update_time?"":s.value;
            accumulated += v; 
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      title: accumulated,
                      update_time: s.update_time || c.update_time,
                    }
                  : c
              ),
            }));
          };

          await handleStream(r.body, _update_title);
        } catch (e) {
          handleError(e);
        }
      },

      deleteConversation: async (id) => {
        if (!checkToken()) return;
        try {
          await chatAPI.deleteConversation(id);
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
          }));
          if (get().currentConversationId === id) {
            set({ currentConversationId: "" });
          }
        } catch (e) {
          handleError(e);
        }
      },

      deleteAllConversations: async () => {
        if (!checkToken()) return;
        try {
          await chatAPI.deleteAllConversations();
          set({ conversations: [], currentConversationId: "" });
        } catch (e) {
          handleError(e);
        }
      },

      init: async () => {
        await get().fetchConversations();
        const currentId = get().currentConversationId;
        set({ currentConversationId: "" });
        get().selectConversation(currentId);
        set({ isInit: true });
      },
    }),
);
