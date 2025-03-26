import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { NewConversationButton } from "./NewConversationButton";
import { useChatStore } from "../../store/chatStore";


export const ChatArea = () => {
    const messageListRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, conversations, currentConversationId, isloading } = useChatStore();
    const conversation = conversations.find(c => c.id === currentConversationId);
  
    function handleScroll() {
      if (messageListRef.current) {
        messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight);
      }
    }
  
    useEffect(() => {
      handleScroll();
    },[messages]);


  return (
    <div className="flex-1 flex flex-col max-w-full">
      <div className="flex flex-col items-center justify-center relative">
        <div className="box-border pt-3 h-14 flex items-center justify-center">
          <div className="text-xl font-bold whitespace-nowrap text-ellipsis overflow-hidden h-10 flex-1 pt-2 rounded-xl max-w-3xl">
            {conversation?.title}
          </div>
          <div
            className="absolute top-full w-full h-8 z-10 pointer-events-none bg-gradient-to-b from-base-100/80 to-transparent"
          ></div>
        </div>
      </div>
      <div className="flex-1 relative">
        <div
          className="px-8 overflow-auto absolute top-0 bottom-0 left-0 right-0 min-h-full"
          ref={messageListRef}
        >
          <div className="flex flex-col h-full relative">
            <div className="max-w-3xl mx-auto w-full">
              <MessageList messages={messages} isloading = {isloading} />
              {isloading ||
              (<div className="flex items-center justify-center my-6">
                 <NewConversationButton size="small" />
              </div>)}
            </div>
            <div className="sticky bottom-0 mt-auto w-full flex items-center z-10 flex-col bg-base-100">
              <div className="relative w-full flex-1 max-w-3xl">
                <div className="absolute bottom-full right-3 h-8 w-8 p-1 border border-base-300 rounded-full mb-5 cursor-pointer bg-base-100 z-10">
                  <img src="/arrow-down.svg" onClick={handleScroll} />
                </div>
                <ChatInput onSubmit={sendMessage}/>
              </div>
              <div className="my-1 text-xs text-gray-400">
                内容由AI生成，请仔细甄别{" "}
              </div>
            </div>
          </div>
        </div>                   
      </div>
    </div>
  );
};
