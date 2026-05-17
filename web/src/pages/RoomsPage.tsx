import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n";
import { useDevices, useRooms } from "../hooks/useDevices";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import AreaCard from "../components/AreaCard";
import { RoomCardSkeleton } from "../components/Skeleton";

const RoomsPage: FC = () => {
  const navigate = useNavigate();
  const { rooms, loading } = useRooms();
  const { devices } = useDevices();

  return (
    <AppShell topBar={<TopAppBar title={t("room.allRooms")} variant="medium" />}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <AreaCard
              key={room.id}
              room={room}
              devices={devices.filter((d) => d.room_id === room.id)}
              onClick={(id) => navigate(`/rooms/${id}`)}
            />
          ))}
        </div>
        {rooms.length === 0 && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default RoomsPage;
