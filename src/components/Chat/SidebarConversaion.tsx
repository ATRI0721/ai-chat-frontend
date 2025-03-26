import { useState } from "react";
import { Dropdown } from "../Dropdown";
import ClickOutsideWrapper from "../ClickOutsideWrapper";

const commonHoverStyle = {
  padding: "0.5rem",
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "0.5rem",
  gap: "0.75rem",
};

export const SidebarConversaion = ({
  title,
  isSelected,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [tmpTitle, setTmpTitle] = useState<string>(title);
    function handleRenameTitle(){
        setIsRenaming(false);
        if (tmpTitle.trim().length === 0 || tmpTitle === title){
            setTmpTitle(title);
        }else{
            onRenameConversation(tmpTitle);
        }
    }
  return (
    <li>
      {isRenaming ? (
        <ClickOutsideWrapper
          onClickOutside={handleRenameTitle}
          onKeyDowns={["Escape", "Enter"]}
        >
          <input
            type="text"
            value={tmpTitle}
            onChange={(e) => {
              setTmpTitle(e.target.value);
            }}
            className="input input-bordered w-full max-w-xs"
          />
        </ClickOutsideWrapper>
      ) : (
        <div
          className={
            "button-like p-2 flex items-center justify-between group " +
            (isSelected ? "bg-info/30 hover:bg-info/30" : "hover:bg-info/10")
          }
          onClick={onSelectConversation}
        >
          <div
            className="whitespace-nowrap overflow-hidden"
            style={{ width: "100%" }}
          >
            {tmpTitle}
          </div>
          <Dropdown
            menuitems={[
              <li
                key="rename"
                className="hover:bg-gray-100"
                style={commonHoverStyle}
                onClick={() => setIsRenaming(true)}
              >
                <img src="/pen.svg" className="w-6 h-6" draggable="false"></img>
                <div className="w-14">重命名</div>
              </li>,
              <li
                key="delete"
                className="hover:bg-red-100"
                style={commonHoverStyle}
                onClick={onDeleteConversation}
              >
                <img
                  src="/delete.svg"
                  className="w-6 h-6"
                  draggable="false"
                ></img>
                <div className="w-14 text-red-500">删除</div>
              </li>,
            ]}
          >
            <img
              src="/dot.svg"
              className={
                "w-8 h-8 p-1 rounded-lg hover:bg-white group-hover:opacity-100 " +
                ` ${isSelected ? "opacity-100" : "opacity-0"}`
              }
            ></img>
          </Dropdown>
        </div>
      )}
    </li>
  );
};
