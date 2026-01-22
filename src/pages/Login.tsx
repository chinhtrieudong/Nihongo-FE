import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/userSlice";
import { toggleDarkMode } from "../store/slices/uiSlice";
import { authAPI } from "../services/api";
import { Switch, Space } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    setError("");
    dispatch(loginStart());

    try {
      const response = await authAPI.login(formData);

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.tokens.accessToken);
      localStorage.setItem("refreshToken", response.data.tokens.refreshToken);

      // Update Redux store with proper typing
      dispatch(
        loginSuccess({
          ...response.data.user,
          currentLevel: response.data.user.currentLevel as
            | "N5"
            | "N4"
            | "N3"
            | "N2",
        })
      );

      // Redirect to dashboard
      navigate("/");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Đăng nhập thất bại";
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 relative">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4">
        <Space>
          <Switch
            checked={darkMode}
            onChange={() => dispatch(toggleDarkMode())}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </Space>
      </div>

      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Nihongo
          </h1>
          <p className="text-secondary-600 dark:text-secondary-800">
            Đăng nhập để tiếp tục học
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-800">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-800">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang đăng nhập...
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-secondary-600 dark:text-secondary-800">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
          <div className="text-xs text-secondary-700 dark:text-secondary-400 text-center">
            <p className="mb-2">Tài khoản demo:</p>
            <p>Email: demo@nihongo.com</p>
            <p>Mật khẩu: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
