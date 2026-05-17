import { useState, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";
import { t } from "../i18n";
import { brand } from "../theme";
import Button from "../components/Button";
import Icon from "../components/Icon";

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      setError(t("login.error"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-md-surface p-4">
      <div
        className={`w-full max-w-sm bg-md-surface-container-high rounded-md-xl p-8 shadow-md-2 ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-md-primary-container mx-auto flex items-center justify-center mb-4">
            <Icon name="Home" size={32} className="text-md-on-primary-container" />
          </div>
          <h1 className="text-2xl font-medium text-md-on-surface">{brand.name}</h1>
          <p className="text-sm text-md-on-surface-variant mt-1">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder=" "
              autoComplete="username"
              className="peer w-full h-14 px-4 pt-5 pb-1 rounded-md-sm border border-md-outline bg-transparent text-md-on-surface text-base outline-none
                focus:border-md-primary focus:border-2 transition-colors duration-200"
            />
            <label
              htmlFor="username"
              className="absolute left-4 top-4 text-md-on-surface-variant text-base
                transition-all duration-200 ease-md-standard pointer-events-none
                peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-md-primary
                peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              <span className="flex items-center gap-2">
                <Icon name="User" size={16} />
                {t("login.username")}
              </span>
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              autoComplete="current-password"
              className="peer w-full h-14 px-4 pt-5 pb-1 rounded-md-sm border border-md-outline bg-transparent text-md-on-surface text-base outline-none
                focus:border-md-primary focus:border-2 transition-colors duration-200"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-4 text-md-on-surface-variant text-base
                transition-all duration-200 ease-md-standard pointer-events-none
                peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-md-primary
                peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              <span className="flex items-center gap-2">
                <Icon name="Lock" size={16} />
                {t("login.password")}
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-md-error text-center">{error}</p>
          )}

          <Button type="submit" variant="filled" fullWidth loading={loading}>
            {t("login.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
