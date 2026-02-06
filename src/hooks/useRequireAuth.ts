import { Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type RequireAuthOptions = {
  title?: string;
  message?: string;
  okText?: string;
  cancelText?: string;
  silent?: boolean;
};

export const useRequireAuth = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (
    action?: () => void,
    options: RequireAuthOptions = {},
  ) => {
    if (isAuthenticated) {
      action?.();
      return true;
    }

    if (!options.silent) {
      Modal.confirm({
        title: options.title || "Cần đăng nhập",
        content:
          options.message ||
          "Vui lòng đăng nhập để sử dụng tính năng này.",
        okText: options.okText || "Đăng nhập",
        cancelText: options.cancelText || "Để sau",
        onOk: () =>
          navigate("/login", {
            state: { from: location.pathname },
          }),
      });
    }

    return false;
  };

  return requireAuth;
};
