import { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDevice, sendDeviceCommand, type Device } from "../api/client";
import { t } from "../i18n";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import Icon, { type IconName } from "../components/Icon";
import Toggle from "../components/Toggle";
import Slider from "../components/Slider";
import Card from "../components/Card";

function deviceIcon(type: Device["type"]): IconName {
  switch (type) {
    case "light": return "Lightbulb";
    case "thermostat": return "Thermometer";
    case "sensor": return "Motion";
    default: return "Power";
  }
}

const DeviceDetailPage: FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    fetchDevice(deviceId)
      .then(setDevice)
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [deviceId, navigate]);

  async function handleToggle(checked: boolean) {
    if (!device) return;
    const action = checked ? "on" : "off";
    setDevice({ ...device, power: action });
    await sendDeviceCommand(device.id, { action });
    const updated = await fetchDevice(device.id);
    setDevice(updated);
  }

  async function handleBrightness(value: number) {
    if (!device) return;
    setDevice({ ...device, brightness: value });
    await sendDeviceCommand(device.id, { action: "set_brightness", value });
  }

  async function handleTargetTemp(value: number) {
    if (!device) return;
    setDevice({ ...device, target_temperature: value });
    await sendDeviceCommand(device.id, { action: "set_temperature", value });
  }

  if (loading || !device) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <p className="text-md-on-surface-variant">{t("common.loading")}</p>
        </div>
      </AppShell>
    );
  }

  const isOn = device.power === "on";

  return (
    <AppShell
      topBar={
        <TopAppBar
          title={device.name}
          navigationIcon={
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-md-on-surface/[0.08] min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Icon name="ArrowLeft" size={24} className="text-md-on-surface" />
            </button>
          }
        />
      }
    >
      <div className="max-w-lg mx-auto space-y-6 pt-4">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isOn ? "bg-md-primary-container" : "bg-md-surface-variant"
          }`}>
            <Icon name={deviceIcon(device.type)} size={48} className={isOn ? "text-md-on-primary-container" : "text-md-on-surface-variant"} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-medium text-md-on-surface">{device.name}</h2>
            {device.room_name && (
              <p className="text-sm text-md-on-surface-variant">{device.room_name}</p>
            )}
          </div>
        </div>

        {/* Power toggle */}
        {device.type !== "sensor" && (
          <Card variant="filled">
            <div className="flex items-center justify-between">
              <span className="text-md-on-surface font-medium">{t("device.switch")}</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isOn ? "text-md-primary" : "text-md-on-surface-variant"}`}>
                  {isOn ? t("device.on") : t("device.off")}
                </span>
                <Toggle checked={isOn} onChange={handleToggle} />
              </div>
            </div>
          </Card>
        )}

        {/* Brightness slider (lights) */}
        {device.type === "light" && (
          <Card variant="filled">
            <Slider
              value={device.brightness ?? 0}
              onChange={handleBrightness}
              min={0}
              max={100}
              step={1}
              label={t("device.brightness")}
              disabled={!isOn}
            />
          </Card>
        )}

        {/* Thermostat controls */}
        {device.type === "thermostat" && (
          <Card variant="filled">
            <div className="space-y-4">
              {device.temperature != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-md-on-surface-variant">{t("device.currentTemp")}</span>
                  <span className="text-3xl font-light text-md-on-surface tabular-nums">{device.temperature}°C</span>
                </div>
              )}
              {device.target_temperature != null && (
                <Slider
                  value={device.target_temperature}
                  onChange={handleTargetTemp}
                  min={15}
                  max={35}
                  step={1}
                  label={t("device.targetTemp")}
                  unit="°C"
                  disabled={!isOn}
                />
              )}
            </div>
          </Card>
        )}

        {/* Sensor info */}
        {device.type === "sensor" && (
          <Card variant="filled">
            <div className="flex flex-col items-center gap-3 py-4">
              <Icon
                name="Motion"
                size={40}
                className={isOn ? "text-md-primary" : "text-md-on-surface-variant"}
              />
              <p className={`text-lg font-medium ${isOn ? "text-md-primary" : "text-md-on-surface-variant"}`}>
                {isOn ? t("device.motionDetected") : t("device.noMotion")}
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export default DeviceDetailPage;
