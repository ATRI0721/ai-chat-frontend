import { useChatStore } from "../../store/chatStore";

export const NewConversationButton = ({size}:{size:"small" | "large"}) => {
  const selectConversation = useChatStore(state => state.selectConversation);
  const baseClasses =
    "bg-info/30 rounded-xl hover:bg-info/60 flex items-center justify-evenly";
  const sizeClasses =
    size === "small" ? "text-base w-32 px-1 py-1" : "text-lg w-36 p-2";
  return (
    <button onClick={() => {}} className={`${baseClasses} ${sizeClasses}`}>
      <img
        src="/talk.png"
        className={`${size === "small" ? "h-4 w-4" : "h-6 w-6"}`}
        draggable="false"
      />
      <div className="text-center" onClick={() => selectConversation("")}>开启新对话</div>
    </button>
  );
};
