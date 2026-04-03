import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginStart, loginSuccess, loginFailure } from "../store/slices/userSlice";
import { authAPI } from "../services/api";
import { useTheme } from "../hooks/useTheme";
import { Switch, Checkbox, Divider } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { Sun, Moon, Mail, Lock, Eye, EyeOff, Globe, Share2 } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { toggleTheme } = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | CheckboxChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`Login with ${provider}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
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
          currentLevel: "N5", // Default level for new users
          totalXp: 0,
          streakDays: 0,
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
    <div className={`academic-canvas app-surface min-h-screen transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>🎌</span>
            <h1
              className="text-base sm:text-lg font-bold text-text-main font-japanese"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
            >
              Nihongo
            </h1>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <Switch
              checked={darkMode}
              onChange={() => toggleTheme()}
              checkedChildren={<Moon className="w-4 h-4 text-indigo-500" />}
              unCheckedChildren={<Sun className="w-4 h-4 text-orange-500" />}
              className="bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-container min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 pt-12 sm:pt-14 md:pt-16">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center">
          {/* Left Panel - Illustration */}
          <div className="hidden md:block relative illustration h-full">
            <div className="relative z-10 h-full flex items-center justify-center">
              <div
                className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 backdrop-blur-sm w-full h-full min-h-[500px] flex items-center justify-center"
              >
                <div className="text-center space-y-4 md:space-y-6 lg:space-y-8 w-full">
                  <div
                    className="text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6"
                    style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}
                  >
                    🏯🌸🗻
                  </div>
                  <div
                    className="text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6"
                    style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
                  >
                    👘🗾🍱
                  </div>
                  <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-japanese mb-4 md:mb-6"
                    style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
                  >
                    こんにちは！
                  </h2>
                  <p
                    className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8"
                    style={{ fontSize: 'clamp(18px, 3vw, 28px)' }}
                  >
                    Chào mừng đến với hành trình chinh phục tiếng Nhật
                  </p>
                  <div className="flex justify-center space-x-6 md:space-x-8 lg:space-x-12 text-3xl md:text-4xl lg:text-5xl">
                    <span className="animate-bounce delay-100">🎯</span>
                    <span className="animate-bounce delay-200">📖</span>
                    <span className="animate-bounce delay-300">🎌</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 -z-10">
              <div className="absolute top-4 md:top-6 left-4 md:left-6 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-pink-300/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 w-24 h-24 md:w-28 md:h-28 lg:w-40 lg:h-40 bg-indigo-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Right Panel - Login Card */}
          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto md:mx-0">
            <div className="login-card bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:scale-[1.02]">

              <div className="space-y-3">
                <div className="text-center">
                  <h2
                    className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2"
                    style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}
                  >
                    Đăng nhập vào Nihongo
                  </h2>
                  <p
                    className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400"
                    style={{ fontSize: 'clamp(12px, 1.5vw, 16px)' }}
                  >
                    Luyện tiếng Nhật mỗi ngày – Nghe, Nói, Đọc, Viết
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm"
                      style={{ animation: 'shake 0.5s ease-in-out' }}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                        aria-label="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>🔐 Đang đăng nhập...</span>
                      </div>
                    ) : (
                      <span>🔐 Đăng nhập</span>
                    )}
                  </button>
                </form>

                <Divider>HOẶC</Divider>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="py-3 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                  >
                    <Globe className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('facebook')}
                    className="py-3 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Facebook</span>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản?{" "}
                    <Link
                      to="/register"
                      className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
