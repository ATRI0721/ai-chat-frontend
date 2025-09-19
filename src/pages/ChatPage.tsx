import { useEffect } from "react";
import { ChatArea } from "../components/Chat/ChatArea";
import { ChatInput } from "../components/Chat/ChatInput";
import { Sidebar } from "../components/Chat/Sidebar";
import { useConversationStore } from "../store/conversationStore";
import { useMessageStore } from "../store/messageStore";


export const ChatPage = () => {
  const init = useConversationStore((state) => state.init);
  const isInit = useConversationStore((state) => state.isInit);
  const currentConversationId = useConversationStore((state) => state.currentConversationId);
  const createConversation = useConversationStore((state) => state.createConversation);
  const generateTitle = useConversationStore((state) => state.generateTitle);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const handleSubmit = async (content: string) => {
    await createConversation();
    const cid = useConversationStore.getState().currentConversationId;
    await sendMessage(content, cid);
    await generateTitle(cid);
  };

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
            <ChatInput onSubmit={handleSubmit} />
          </div>
        )}
      </div>
    </div>
  );
};
