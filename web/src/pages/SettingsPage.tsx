import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/client";
import { t } from "../i18n";
import { useTheme } from "../contexts/ThemeContext";
import { brand } from "../theme";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import Card from "../components/Card";
import Button from "../components/Button";
import Icon from "../components/Icon";

type ThemeMode = "light" | "dark" | "system";

const modes: { value: ThemeMode; icon: "Sun" | "Moon" | "Settings"; label: string }[] = [
  { value: "light", icon: "Sun", label: "Light" },
  { value: "dark", icon: "Moon", label: "Dark" },
  { value: "system", icon: "Settings", label: "System" },
];

const SettingsPage: FC = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useTheme();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <AppShell topBar={<TopAppBar title={t("settings.title")} variant="medium" />}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Appearance */}
        <section>
          <h3 className="text-sm font-medium text-md-on-surface-variant mb-3">{t("settings.appearance")}</h3>
          <Card variant="filled">
            <div className="flex rounded-md-xl bg-md-surface-container p-1 gap-1">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md-lg text-sm font-medium transition-all duration-200 ease-md-standard min-h-[44px] ${
                    mode === m.value
                      ? "bg-md-secondary-container text-md-on-secondary-container"
                      : "text-md-on-surface-variant hover:bg-md-on-surface/[0.08]"
                  }`}
                >
                  <Icon name={m.icon} size={18} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-medium text-md-on-surface-variant mb-3">{t("settings.about")}</h3>
          <Card variant="filled">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-md-on-surface">{brand.name}</span>
                <span className="text-sm text-md-on-surface-variant">{t("settings.version")} 0.1.0</span>
              </div>
              <p className="text-sm text-md-on-surface-variant">{brand.tagline}</p>
            </div>
          </Card>
        </section>

        {/* Sign out */}
        <section>
          <Button variant="outlined" fullWidth onClick={handleLogout} className="text-md-error border-md-error">
            <Icon name="Logout" size={18} />
            {t("settings.logout")}
          </Button>
        </section>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
