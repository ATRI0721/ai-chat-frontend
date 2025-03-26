import { useState } from "react";
import { SendCodeButton } from "./SendCodeButton";
import { useAuthStore } from "../../store/authStore";
import { LoginCodeRequest, LoginPasswordRequest, VerificationType } from "../../types";

type LoginType = "code" | "password";

export const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginType, setLoginType] = useState<LoginType>("password");
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const credentials =
      loginType === "password"
        ? ({ email, password } as LoginPasswordRequest)
        : ({ email, verification_code:code } as LoginCodeRequest);
    await login(credentials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setLoginType("password")}
          className={`flex-1 py-2 rounded-md ${
            loginType === "password"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          密码登录
        </button>
        <button
          type="button"
          onClick={() => setLoginType("code")}
          className={`flex-1 py-2 rounded-md ${
            loginType === "code"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          验证码登录
        </button>
      </div>

      <div>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      {loginType === "password" ? (
        <div>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      ) : (
        <div className="flex">
          <input
            type="text"
            placeholder="验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            required
          />
          <SendCodeButton email={email} type={VerificationType.Login} />
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        登录
      </button>

      <div className="text-center text-sm text-gray-600">
        没有账号？{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-600 hover:underline"
        >
          立即注册
        </button>
      </div>
    </form>
  );
};
