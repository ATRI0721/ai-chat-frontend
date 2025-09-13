import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { VerificationRequest } from "../../types";
import { handleError } from "../../store/errorStore";

export const SendCodeButton = ({ email, type }: VerificationRequest) => {
  const [countdown, setCountdown] = useState(parseInt(localStorage.getItem("countdown") || "0"));
  const sendVerification = useAuthStore(s => s.sendVerification);

  const handleSendCode = async () => {
    if (!email || countdown > 0) return;

    try {
      await sendVerification({email, type});
      setCountdown(60);
      localStorage.setItem("countdown", "60");
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 0) {
            clearInterval(timer);
            localStorage.removeItem("countdown");
            return 0;
          }
          localStorage.setItem("countdown", (prev - 1).toString());
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => clearInterval(timer), 60000);
    } catch (error) {
      handleError(error, "验证码发送失败，请稍后重试");
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
