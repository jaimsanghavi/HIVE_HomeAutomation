import { type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "../i18n";
import { useRoomDevices, useRooms } from "../hooks/useDevices";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import DeviceTile from "../components/DeviceTile";
import TileGrid from "../components/TileGrid";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";

const RoomDetailPage: FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { devices: roomDevices, toggle, sendCommand } = useRoomDevices(roomId);
  const { rooms } = useRooms();

  const room = rooms.find((r) => r.id === roomId);
  const activeCount = roomDevices.filter((d) => d.power === "on").length;

  function handleBrightness(id: string, value: number) {
    sendCommand(id, { action: "set_brightness", value });
  }

  return (
    <AppShell
      topBar={
        <TopAppBar
          title={room?.name ?? t("common.loading")}
          navigationIcon={
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-md-on-surface/[0.08] min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Icon name="ArrowLeft" size={24} className="text-md-on-surface" />
            </button>
          }
        />
      }
    >
      <div className="max-w-5xl mx-auto pt-2">
        {/* Room summary */}
        {roomDevices.length > 0 && (
          <p className="text-sm text-md-on-surface-variant mb-4">
            {roomDevices.length} {roomDevices.length === 1 ? "device" : "devices"}
            {activeCount > 0 && <span className="text-md-primary"> · {activeCount} active</span>}
          </p>
        )}

        {roomDevices.length === 0 ? (
          <EmptyState icon="Home" title={t("room.noDevices")} description="Add devices to this room from your Home Assistant dashboard." />
        ) : (
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
        )}
      </div>
    </AppShell>
  );
};

export default RoomDetailPage;
