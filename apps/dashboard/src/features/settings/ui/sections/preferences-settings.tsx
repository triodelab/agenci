import { useState } from "react";
import { toast } from "sonner";
import {
  getSidebarStart,
  getStartPage,
  type SidebarStart,
  setSidebarStart,
  setStartPage,
  type StartPage,
} from "@/lib/preferences";
import { useTheme } from "@/lib/theme";
import { Choice, Section, SettingsHeader } from "../settings-ui";

export function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const [start, setStart] = useState<StartPage>(getStartPage);
  const [sidebar, setSidebar] = useState<SidebarStart>(getSidebarStart);

  return (
    <div className="grid gap-5">
      <SettingsHeader
        title="Preferanser"
        description="Hvordan Agenci åpner og ser ut for deg. Lagres i denne nettleseren."
      />

      <Section
        title="Utseende"
        description="Lys eller mørk modus. «Som systemet» følger innstillingen på maskinen din."
      >
        <Choice
          label="Utseende"
          cols={3}
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Lys" },
            { value: "dark", label: "Mørk" },
            { value: "system", label: "Som systemet" },
          ]}
        />
      </Section>

      <Section
        title="Startside"
        description="Hvor du havner når du åpner dashbordet eller logger inn."
      >
        <Choice
          label="Startside"
          value={start}
          onChange={(v) => {
            setStart(v);
            setStartPage(v);
            toast.success("Startsiden er lagret");
          }}
          options={[
            { value: "agents", label: "Alle agenter", description: "Oversikten over alle agentene dine." },
            { value: "last-agent", label: "Sist brukte agent", description: "Rett inn i agenten du jobbet med sist." },
          ]}
        />
      </Section>

      <Section
        title="Sidemeny"
        description="Om menyen til venstre skal være åpen eller smal når du åpner dashbordet. Du kan alltid endre den med knappen øverst i menyen."
      >
        <Choice
          label="Sidemeny"
          value={sidebar}
          onChange={(v) => {
            setSidebar(v);
            setSidebarStart(v);
            toast.success("Gjelder neste gang du åpner dashbordet");
          }}
          options={[
            { value: "open", label: "Åpen", description: "Viser navn på alle sidene." },
            { value: "closed", label: "Smal", description: "Bare ikoner, mer plass til innholdet." },
          ]}
        />
      </Section>

    </div>
  );
}
