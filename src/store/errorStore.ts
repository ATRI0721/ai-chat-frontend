import functionalToast from "../components/Commend/Toast";
import { getError } from "../utils";

export const handleError = (error: Error | unknown, message?: string) => {
  console.error(error);
  functionalToast(message || getError(error).message, "ERROR");
}
