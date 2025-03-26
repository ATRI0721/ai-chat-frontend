
const userdata = {
  conversations: [
    {
      id: '1',
      title: 'Conversation 1',
      created_at: new Date().getTime(),
    },
    {
      id: '2',
      title: 'Conversation 2',
      created_at: new Date().setDate(new Date().getDate() - 1),
    },
    {
      id: '3',
      title: 'Conversation 3',
      created_at: new Date().setDate(new Date().getDate() - 2),
    },
    {
      id: '4',
      title: 'Long long long longConversation 4',
      created_at: new Date().setDate(new Date().getDate() - 20),
    }
  ],
  messages: [
    {isUser:true,content:"你好"}
  ],
  currentConversationId: '',
  isLoading : false,
  init : true,
  fetchConversations: () => {},
  createNewConversation: () => {},
  selectConversation: () => {},
  sendMessage: () => {},
  user: {
    email: 'email@email.com',
  }
};

const authModuleMarkdown = `
## 认证模块

### 1. 发送验证码

- **URL**: \`/auth/send-verification/{type}\`
- **type**: \`register\`,\`login\`,\`reset\`
- **Method**: POST
- **Request**:

\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

- **Response**: \`APIResponse<null>\`

### 2. 验证验证码

- **URL**: \`/auth/verify-verification\`
- **Method**: POST
- **Request**:

\`\`\`json
{
  "email": "user@example.com",
  "verification_code": "123456"
}
\`\`\`

- **Response**: \`APIResponse<null>\`

### 3. Token验证
`;

userdata.messages.push({isUser:false,content:authModuleMarkdown});
userdata.messages.push({isUser:true,content:"你好，我是机器人，很高兴为你服务。"});
userdata.messages.push({isUser:false,content:authModuleMarkdown});

for (let i = 5; i < 15; i++) {
  userdata.conversations.push({
    id: `${i}`,
    title: `Conversation ${i}`,
    created_at: new Date().setDate(new Date().getDate() - 40),
  })
}

for (let i = 15; i < 30; i++) {
    userdata.conversations.push({
      id: `${i}`,
      title: `Conversation ${i}`,
      created_at: new Date().setDate(new Date().getDate() - 140),
    });
}


export {userdata};