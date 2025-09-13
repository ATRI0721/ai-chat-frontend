import { useChatStore } from "../../store/chatStore";
import { Message } from "../../types";
import functionalToast from "../Commend/Toast";
import { MarkdownRenderer } from "./MarkdownRender";

function Icons({ onCopy, onRegenerate, onLike, onDislike } : {onCopy: () => void, onRegenerate: () => void, onLike: () => void, onDislike: () => void}) {
  const iconStyle = "p-1 rounded-lg hover:bg-gray-200 cursor-pointer tooltip";
  return (
    <div className="flex items-center mt-2">
      <div className={iconStyle} data-tip="复制">
        <img
          src="/copy.svg"
          className="w-5 h-5"
          onClick={onCopy}
          draggable="false"
        ></img>
      </div>
      <div
        className={iconStyle}
        style={{ padding: "0.375rem" }}
        data-tip="重新生成"
        onClick={onRegenerate}
        draggable="false"
      >
        <img src="/cycle.svg" className="w-4 h-4" draggable="false"></img>
      </div>
      <div className={iconStyle} data-tip="喜欢" onClick={onLike} draggable="false">
        <img src="/like.svg" className="w-5 h-5" draggable="false"></img>
      </div>
      <div className={iconStyle} data-tip="不喜欢" onClick={onDislike} draggable="false">
        <img src="/unlike.svg" className="w-5 h-5" draggable="false"></img>
      </div>
    </div>
  );
}

export const MessageList = ({ messages, isloading }: {messages: Message[], isloading: boolean}) => {
  const regenerateMessage = useChatStore((state) => state.regenerateMessage);
  return (
    <div className="flex flex-col space-y-2 pt-9">
      {messages.map((message, index) => (
        <div key={index}>
          {message.is_user ? (
            <div className="flex justify-end my-6">
              <div className="px-4 py-2 w-fit bg-info/40 text-center text-base rounded-2xl">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="flex">
              <div className="w-8 h-8 rounded-full border-1 border-gray-200 mr-2 p-0.5">
                <img src="/logo.svg"></img>
              </div>
              <div className="w-full">
                {isloading && message.content === "" ? <div>正在生成中...</div> :<MarkdownRenderer content={message.content} />}
                {(isloading && index === messages.length - 1) ? null : (
                  <Icons
                    onCopy={() =>
                      {
                        navigator.clipboard.writeText(message.content);
                        functionalToast("复制成功", "SUCCESS");
                      }
                    }
                    onRegenerate={() => regenerateMessage(message.id)}
                    onLike={() => {}}
                    onDislike={() => {}}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
