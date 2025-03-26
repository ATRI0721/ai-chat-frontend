import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { VerificationRequest } from "../../types";

export const SendCodeButton = ({ email, type }: VerificationRequest) => {
  const [countdown, setCountdown] = useState(0);
  const { sendVerification } = useAuthStore();

  const handleSendCode = async () => {
    if (!email || countdown > 0) return;

    try {
      await sendVerification({email, type});
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      setTimeout(() => clearInterval(timer), 60000);
    } catch (error) {
      console.error("发送验证码失败:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSendCode}
      disabled={countdown > 0}
      className="w-32 ml-2 px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md 
                 disabled:bg-gray-100 disabled:text-gray-400"
    >
      {countdown > 0 ? `${countdown}s` : "发送验证码"}
    </button>
  );
};
