import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n";
import { useDevices, useRooms } from "../hooks/useDevices";
import { fetchScenes, activateScene, type Scene } from "../api/client";
import type { Device } from "../types";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import StatusHeader from "../components/StatusHeader";
import GlanceBar from "../components/GlanceBar";
import GaugeCard from "../components/GaugeCard";
import ThermostatDial from "../components/ThermostatDial";
import DeviceTile from "../components/DeviceTile";
import SensorCard from "../components/SensorCard";
import EntitiesList from "../components/EntitiesList";
import BottomSheet from "../components/BottomSheet";
import LightControlSheet from "../components/LightControlSheet";
import SectionsLayout, { Section } from "../components/SectionsLayout";
import Icon from "../components/Icon";
import { DeviceCardSkeleton } from "../components/Skeleton";

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { devices, loading, toggle, sendCommand } = useDevices();
  const { rooms } = useRooms();
  const [scenes, setScenes] = useState<Scene[]>([]);

  // BottomSheet state for light control
  const [sheetDevice, setSheetDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetchScenes().then(setScenes).catch(() => {});
  }, []);

  function handleBrightness(id: string, value: number) {
    sendCommand(id, { action: "set_brightness", value });
  }

  function handleTargetTemp(id: string, value: number) {
    sendCommand(id, { action: "set_temperature", value });
  }

  // Categorize devices
  const thermostats = devices.filter((d) => d.type === "thermostat");
  const lights = devices.filter((d) => d.type === "light");
  const sensors = devices.filter((d) => d.type === "sensor");
  const switches = devices.filter((d) => d.type === "switch");

  const primaryThermostat = thermostats[0] ?? null;

  return (
    <AppShell topBar={<TopAppBar title={t("nav.home")} />}>
      <div className="max-w-5xl mx-auto space-y-6 pt-2 pb-4">
        {/* ─── Status Header ─── */}
        <StatusHeader devices={devices} />

        {/* ─── Glance Bar — all devices at a glance ─── */}
        {devices.length > 0 && <GlanceBar devices={devices} />}

        {/* ─── Loading ─── */}
        {loading && devices.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DeviceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ─── Quick Scenes ─── */}
        {scenes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => activateScene(scene.id)}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                  active:scale-95 min-h-[36px]"
              >
                <Icon name="Scene" size={14} />
                {scene.name}
              </button>
            ))}
          </div>
        )}

        {/* ─── Mixed Widget Sections ─── */}
        <SectionsLayout>
          {/* ═══ Climate Section ═══ */}
          {primaryThermostat && (
            <Section title="Climate" span={2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thermostat dial — large, interactive */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                  <ThermostatDial
                    currentTemp={primaryThermostat.temperature ?? 22}
                    targetTemp={primaryThermostat.target_temperature ?? 22}
                    mode={primaryThermostat.power === "on" ? "heat" : "off"}
                    onTargetChange={(v) => handleTargetTemp(primaryThermostat.id, v)}
                    onModeChange={(mode) => {
                      if (mode === "off") toggle(primaryThermostat.id, "off");
                      else if (primaryThermostat.power !== "on") toggle(primaryThermostat.id, "on");
                    }}
                  />
                </div>

                {/* Gauge + additional thermostats */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                    <GaugeCard
                      value={primaryThermostat.temperature ?? 22}
                      min={10}
                      max={40}
                      unit="°C"
                      name={primaryThermostat.name}
                    />
                  </div>
                  {thermostats.length > 1 && (
                    <div className="space-y-2">
                      {thermostats.slice(1).map((th) => (
                        <button
                          key={th.id}
                          onClick={() => navigate(`/devices/${th.id}`)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl
                            bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                            hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name="Thermometer" size={18} className="text-sky-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{th.name}</span>
                          </div>
                          <span className="text-sm font-medium text-sky-500 tabular-nums">
                            {th.temperature ?? "—"}°C
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* ═══ Lights Section ═══ */}
          {lights.length > 0 && (
            <Section title="Lights" span={2}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {lights.map((d) => (
                  <DeviceTile
                    key={d.id}
                    device={d}
                    onToggle={toggle}
                    onBrightness={handleBrightness}
                    onClick={(id) => {
                      const dev = devices.find((x) => x.id === id);
                      if (dev?.type === "light") setSheetDevice(dev);
                      else navigate(`/devices/${id}`);
                    }}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ═══ Sensors Section ═══ */}
          {sensors.length > 0 && (
            <Section title="Sensors" span={2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sensors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/devices/${d.id}`)}
                    className="text-left rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4
                      hover:shadow-md transition-shadow"
                  >
                    <SensorCard
                      name={d.name}
                      value={d.power === "on" ? "Detected" : "Clear"}
                      icon={<Icon name="Motion" size={18} className={d.power === "on" ? "text-emerald-500" : "text-gray-400"} />}
                      isActive={d.power === "on"}
                    />
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ═══ Switches Section ═══ */}
          {switches.length > 0 && (
            <Section title="Switches" span={2}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {switches.map((d) => (
                  <DeviceTile
                    key={d.id}
                    device={d}
                    onToggle={toggle}
                    onClick={(id) => navigate(`/devices/${id}`)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ═══ All Devices Entities List ═══ */}
          {devices.length > 0 && (
            <Section title="All Devices" span="full">
              <EntitiesList
                devices={devices}
                onToggle={toggle}
                onBrightness={handleBrightness}
                onTargetTemp={handleTargetTemp}
              />
            </Section>
          )}
        </SectionsLayout>
      </div>

      {/* ─── Light Control BottomSheet ─── */}
      <BottomSheet
        open={!!sheetDevice}
        onClose={() => setSheetDevice(null)}
        title={sheetDevice?.name}
      >
        {sheetDevice && (
          <LightControlSheet
            name={sheetDevice.name}
            brightness={sheetDevice.brightness ?? 0}
            isOn={sheetDevice.power === "on"}
            onBrightnessChange={(v) => handleBrightness(sheetDevice.id, v)}
            onToggle={() => toggle(sheetDevice.id, sheetDevice.power === "on" ? "off" : "on")}
          />
        )}
      </BottomSheet>
    </AppShell>
  );
};

export default DashboardPage;
