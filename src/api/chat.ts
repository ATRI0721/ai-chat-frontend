import {  ConversationReceived, Message } from "../types";
import api from "./setting";





// src/api/chat.ts
export const chatAPI = {
  getConversations: () => api.get<ConversationReceived[]>("/chat/conversations"),

  createConversation: (title?: string) =>
    api.post<ConversationReceived>("/chat/conversation", { title }),

  updateTitle: (conversationId: string, title: string) =>
    api.patch<ConversationReceived>(`/chat/conversation/${conversationId}`, { title }),

  getMessages: (conversationId: string) =>
    api.get<Message[]>(`/chat/conversation/${conversationId}/messages`),

  deleteConversation: (conversationId: string) =>
    api.delete<ConversationReceived>(`/chat/conversation/${conversationId}`),

  deleteAllConversations: () => api.delete<ConversationReceived[]>(`/chat/conversations`),

  sendMessage: (conversationId: string, message: string) =>
    fetch(`${api.baseURL}/chat/completions/${conversationId}`,  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api.getToken()}`
      },
      body: JSON.stringify({ message })
    }),

  regenerateMessage: (conversationId: string, messageId: string) =>
    fetch(`${api.baseURL}/chat/completions/${conversationId}/regenerate/${messageId}`,  {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api.getToken()}`
      },
    }),
};
