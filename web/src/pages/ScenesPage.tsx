import { useEffect, useState, type FC } from "react";
import { fetchScenes, activateScene, type Scene } from "../api/client";
import { t } from "../i18n";
import AppShell from "../components/AppShell";
import TopAppBar from "../components/TopAppBar";
import Card from "../components/Card";
import Button from "../components/Button";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";

const ScenesPage: FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchScenes()
      .then(setScenes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleActivate(id: string) {
    setActivatingId(id);
    try {
      await activateScene(id);
    } catch {
      // silently handle
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <AppShell topBar={<TopAppBar title={t("scenes.title")} variant="medium" />}>
      <div className="max-w-4xl mx-auto">
        {loading && (
          <p className="text-md-on-surface-variant text-center py-16">{t("common.loading")}</p>
        )}

        {!loading && scenes.length === 0 && (
          <EmptyState
            icon="Scene"
            title={t("scenes.noScenes")}
            description="Scenes let you control multiple devices at once. Configure them in your Home Assistant dashboard."
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenes.map((scene) => (
            <Card key={scene.id} variant="filled">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-md-tertiary-container flex items-center justify-center">
                    <Icon name="Scene" size={20} className="text-md-on-tertiary-container" />
                  </div>
                  <span className="text-md-on-surface font-medium">{scene.name}</span>
                </div>
                <Button
                  variant="filled"
                  onClick={() => handleActivate(scene.id)}
                  loading={activatingId === scene.id}
                  className="text-xs px-4 min-h-[36px]"
                >
                  {t("scenes.activate")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default ScenesPage;
