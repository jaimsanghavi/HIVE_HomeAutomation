import { useEffect, useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDevice, sendDeviceCommand, type Device } from "../api/client";
import { t } from "../i18n";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import Icon from "../components/Icon";
import Toggle from "../components/Toggle";
import ThermostatDial from "../components/ThermostatDial";
import LightControlSheet from "../components/LightControlSheet";
import SensorCard from "../components/SensorCard";
import GaugeCard from "../components/GaugeCard";

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
          <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
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
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Icon name="ArrowLeft" size={24} className="text-gray-900 dark:text-gray-50" />
            </button>
          }
        />
      }
    >
      <div className="max-w-lg mx-auto pt-4 pb-8 px-4">
        {/* === THERMOSTAT === */}
        {device.type === "thermostat" && (
          <div className="space-y-6">
            <ThermostatDial
              currentTemp={device.temperature ?? 22}
              targetTemp={device.target_temperature ?? 22}
              mode={isOn ? "heat" : "off"}
              onTargetChange={handleTargetTemp}
              onModeChange={(mode) => {
                if (mode === "off") handleToggle(false);
                else if (!isOn) handleToggle(true);
              }}
            />

            {/* Gauge */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4">
              <GaugeCard
                value={device.temperature ?? 22}
                min={10}
                max={40}
                unit="°C"
                name="Current Temperature"
              />
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Room</span>
                <span className="text-gray-900 dark:text-gray-50 font-medium">{device.room_name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className={`font-medium ${isOn ? "text-orange-500" : "text-gray-400"}`}>
                  {isOn ? "Heating" : "Off"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === LIGHT === */}
        {device.type === "light" && (
          <div className="flex flex-col items-center gap-6">
            <LightControlSheet
              name={device.name}
              brightness={device.brightness ?? 0}
              isOn={isOn}
              onBrightnessChange={handleBrightness}
              onToggle={() => handleToggle(!isOn)}
            />

            {/* Info */}
            <div className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Room</span>
                <span className="text-gray-900 dark:text-gray-50 font-medium">{device.room_name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Brightness</span>
                <span className="text-gray-900 dark:text-gray-50 font-medium tabular-nums">
                  {isOn ? `${device.brightness ?? 0}%` : "Off"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === SENSOR === */}
        {device.type === "sensor" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-5">
              <SensorCard
                name={device.name}
                value={isOn ? "Detected" : "Clear"}
                icon={
                  <Icon
                    name="Motion"
                    size={20}
                    className={isOn ? "text-emerald-500" : "text-gray-400"}
                  />
                }
                isActive={isOn}
              />
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Room</span>
                <span className="text-gray-900 dark:text-gray-50 font-medium">{device.room_name ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className={`font-medium ${isOn ? "text-emerald-500" : "text-gray-400"}`}>
                  {isOn ? "Motion detected" : "No motion"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === SWITCH (generic) === */}
        {device.type === "switch" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-6 py-8">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOn
                  ? "bg-amber-100 dark:bg-amber-900/30 shadow-lg shadow-amber-500/10"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}>
                <Icon
                  name="Power"
                  size={48}
                  className={`transition-colors ${isOn ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-600"}`}
                />
              </div>
              <Toggle checked={isOn} onChange={handleToggle} />
              <p className={`text-sm font-medium ${isOn ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`}>
                {isOn ? "On" : "Off"}
              </p>
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Room</span>
                <span className="text-gray-900 dark:text-gray-50 font-medium">{device.room_name ?? "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default DeviceDetailPage;
