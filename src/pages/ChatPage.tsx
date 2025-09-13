import { useEffect } from "react";
import { ChatArea } from "../components/Chat/ChatArea";
import { ChatInput } from "../components/Chat/ChatInput";
import { Sidebar } from "../components/Chat/Sidebar";
import { useChatStore } from "../store/chatStore";

export const ChatPage = () => {
  const { currentConversationId, createConversation, init, isInit } = useChatStore();

    useEffect(() => {
      if (!isInit) init();
    }, [init, isInit]);

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex">
        {currentConversationId.trim()!== "" ? (
          <ChatArea />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <ChatInput onSubmit={createConversation} />
          </div>
        )}
      </div>
    </div>
  );
};
