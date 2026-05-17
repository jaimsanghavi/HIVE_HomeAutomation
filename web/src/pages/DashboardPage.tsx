import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n";
import { useDevices, useRooms } from "../hooks/useDevices";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import DeviceTile from "../components/DeviceTile";
import TileGrid from "../components/TileGrid";
import RoomSection from "../components/RoomSection";
import { DeviceCardSkeleton } from "../components/Skeleton";

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { devices, loading, toggle, sendCommand } = useDevices();
  const { rooms } = useRooms();

  const activeCount = devices.filter((d) => d.power === "on").length;
  const greeting = t("dashboard.greeting", { timeOfDay: getTimeOfDay() });

  function handleBrightness(id: string, value: number) {
    sendCommand(id, { action: "set_brightness", value });
  }

  return (
    <AppShell topBar={<TopAppBar title={t("nav.home")} />}>
      <div className="max-w-5xl mx-auto space-y-6 pt-2">
        {/* Greeting + Status */}
        <div>
          <h2 className="text-2xl font-semibold text-md-on-surface">{greeting}</h2>
          <p className="text-md-on-surface-variant text-sm mt-1">
            {activeCount > 0
              ? `${activeCount} ${activeCount === 1 ? "device" : "devices"} active`
              : "All devices off"}
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && devices.length === 0 && (
          <TileGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <DeviceCardSkeleton key={i} />
            ))}
          </TileGrid>
        )}

        {/* Favorites — first 4 toggleable devices */}
        {devices.filter((d) => d.type !== "sensor").length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-md-on-surface-variant mb-3 uppercase tracking-wider">
              Favorites
            </h3>
            <TileGrid>
              {devices
                .filter((d) => d.type !== "sensor")
                .slice(0, 4)
                .map((d) => (
                  <DeviceTile
                    key={d.id}
                    device={d}
                    onToggle={toggle}
                    onBrightness={handleBrightness}
                    onClick={(id) => navigate(`/devices/${id}`)}
                  />
                ))}
            </TileGrid>
          </section>
        )}

        {/* Room sections */}
        {rooms.map((room) => {
          const roomDevices = devices.filter((d) => d.room_id === room.id);
          if (roomDevices.length === 0) return null;
          const roomActive = roomDevices.filter((d) => d.power === "on").length;
          return (
            <RoomSection
              key={room.id}
              name={room.name}
              deviceCount={roomDevices.length}
              activeCount={roomActive}
            >
              <TileGrid>
                {roomDevices.map((device) => (
                  <DeviceTile
                    key={device.id}
                    device={device}
                    onToggle={toggle}
                    onBrightness={handleBrightness}
                    onClick={(id) => navigate(`/devices/${id}`)}
                  />
                ))}
              </TileGrid>
            </RoomSection>
          );
        })}

        {/* Unassigned devices */}
        {devices.filter((d) => !d.room_id).length > 0 && (
          <RoomSection
            name="Unassigned"
            deviceCount={devices.filter((d) => !d.room_id).length}
            activeCount={devices.filter((d) => !d.room_id && d.power === "on").length}
          >
            <TileGrid>
              {devices
                .filter((d) => !d.room_id)
                .map((device) => (
                  <DeviceTile
                    key={device.id}
                    device={device}
                    onToggle={toggle}
                    onBrightness={handleBrightness}
                    onClick={(id) => navigate(`/devices/${id}`)}
                  />
                ))}
            </TileGrid>
          </RoomSection>
        )}
      </div>
    </AppShell>
  );
};

export default DashboardPage;
