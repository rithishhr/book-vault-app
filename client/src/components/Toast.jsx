import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (msg, type = "info") => {
  toast[type](msg);
};

export const ToastWrapper = () => <ToastContainer position="top-right" autoClose={3000} />;
