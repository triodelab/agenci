"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

function TimePicker24h({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr ?? "9", 10);
  const m = Math.round(parseInt(mStr ?? "0", 10) / 15) * 15 % 60;
  const selectClass = "rounded border border-border bg-background px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="flex items-center gap-0.5">
      <select
        value={h}
        onChange={(e) =>
          onChange(`${String(e.target.value).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
        }
        className={selectClass}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
        ))}
      </select>
      <span className="px-0.5 text-sm text-muted-foreground font-medium">:</span>
      <select
        value={m}
        onChange={(e) =>
          onChange(`${String(h).padStart(2, "0")}:${String(e.target.value).padStart(2, "0")}`)
        }
        className={selectClass}
      >
        {[0, 15, 30, 45].map((min) => (
          <option key={min} value={min}>{String(min).padStart(2, "0")}</option>
        ))}
      </select>
    </div>
  );
}

interface BookingSettingsViewProps {
  agentId: Id<"agents">;
}

const WEEKDAYS = [
  { index: 1, label: "Mandag" },
  { index: 2, label: "Tirsdag" },
  { index: 3, label: "Onsdag" },
  { index: 4, label: "Torsdag" },
  { index: 5, label: "Fredag" },
  { index: 6, label: "Lørdag" },
  { index: 0, label: "Søndag" },
];

function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function slotCount(startMinutes: number, endMinutes: number, durationMinutes: number): number {
  let count = 0;
  for (let s = startMinutes; s + durationMinutes <= endMinutes; s += 30) count++;
  return count;
}

export const BookingSettingsView = ({ agentId }: BookingSettingsViewProps) => {
  const widgetSettings = useQuery(api.private.widgetSettings.getOne, { agentId });
  const services = useQuery(api.private.bookings.listServices, { agentId });
  const availability = useQuery(api.private.bookings.getAvailability, { agentId });

  const updateBookingSettings = useMutation(api.private.bookings.updateBookingSettings);
  const createService = useMutation(api.private.bookings.createService);
  const deleteService = useMutation(api.private.bookings.deleteService);
  const updateService = useMutation(api.private.bookings.updateService);
  const setAvailabilityDay = useMutation(api.private.bookings.setAvailabilityDay);

  const [notifEmail, setNotifEmail] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    durationMinutes: "30",
    priceNok: "",
    description: "",
  });
  const [addingService, setAddingService] = useState(false);

  const isBookingEnabled = widgetSettings?.bookingEnabled ?? false;
  const minServiceDuration = services && services.length > 0
    ? Math.min(...services.filter((s) => s.isActive).map((s) => s.durationMinutes))
    : 30;

  const handleToggleBooking = async (enabled: boolean) => {
    setSavingSettings(true);
    try {
      await updateBookingSettings({
        agentId,
        bookingEnabled: enabled,
        bookingNotificationEmail: widgetSettings?.bookingNotificationEmail || undefined,
      });
      toast.success(enabled ? "Timebestilling aktivert" : "Timebestilling deaktivert");
    } catch (err) {
      const msg =
        err && typeof err === "object"
          ? ((err as { data?: { message?: string }; message?: string }).data?.message ??
            (err as { message?: string }).message ??
            "Kunne ikke oppdatere innstillingene")
          : "Kunne ikke oppdatere innstillingene";
      toast.error(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveNotifEmail = async () => {
    setSavingSettings(true);
    try {
      await updateBookingSettings({
        agentId,
        bookingEnabled: isBookingEnabled,
        bookingNotificationEmail: notifEmail || undefined,
      });
      toast.success("E-postvarsel oppdatert");
    } catch {
      toast.error("Kunne ikke lagre");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) return;
    setAddingService(true);
    try {
      await createService({
        agentId,
        name: newService.name.trim(),
        durationMinutes: parseInt(newService.durationMinutes) || 30,
        priceNok: newService.priceNok ? parseInt(newService.priceNok) : undefined,
        description: newService.description.trim() || undefined,
      });
      setNewService({ name: "", durationMinutes: "30", priceNok: "", description: "" });
      toast.success("Tjeneste lagt til");
    } catch {
      toast.error("Kunne ikke legge til tjeneste");
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceId: Id<"bookingServices">) => {
    try {
      await deleteService({ serviceId });
      toast.success("Tjeneste slettet");
    } catch {
      toast.error("Kunne ikke slette tjeneste");
    }
  };

  const handleToggleServiceActive = async (serviceId: Id<"bookingServices">, isActive: boolean) => {
    try {
      await updateService({ serviceId, isActive });
    } catch {
      toast.error("Kunne ikke oppdatere tjeneste");
    }
  };

  const handleAvailabilityChange = async (
    weekday: number,
    isActive: boolean,
    startMinutes: number,
    endMinutes: number,
  ) => {
    try {
      await setAvailabilityDay({ agentId, weekday, isActive, startMinutes, endMinutes });
    } catch {
      toast.error("Kunne ikke oppdatere tilgjengelighet");
    }
  };

  const getAvailabilityForDay = (weekday: number) =>
    availability?.find((a) => a.weekday === weekday);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timebestilling-innstillinger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Konfigurer tjenester, åpningstider og e-postvarsler for agenten
        </p>
      </div>

      {/* Top bar: toggle + email */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={savingSettings}
              onClick={() => handleToggleBooking(!isBookingEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                isBookingEnabled ? "bg-foreground" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
                  isBookingEnabled ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <div>
              <p className="text-sm font-medium">Aktiver timebestilling</p>
              <p className="text-[12px] text-muted-foreground">
                Kundene kan bestille time direkte i chat-widgeten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:w-80">
            <Input
              type="email"
              placeholder={widgetSettings?.bookingNotificationEmail || "varselepost@bedrift.no"}
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              className="h-9 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNotifEmail}
              disabled={savingSettings || !notifEmail}
              className="h-9 shrink-0"
            >
              Lagre
            </Button>
          </div>
        </div>
        {widgetSettings?.bookingNotificationEmail && (
          <p className="mt-3 text-[12px] text-muted-foreground border-t border-border pt-3">
            Varsler sendes til:{" "}
            <strong>{widgetSettings.bookingNotificationEmail}</strong>
          </p>
        )}
      </div>

      {/* Main grid: services left, availability right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Services */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base">Tjenester</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Tjenestene som er tilgjengelige for bestilling
            </p>
          </div>

          {/* Add service form */}
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Ny tjeneste</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px]">Navn</Label>
                <Input
                  placeholder="f.eks. Konsultasjon, Behandling"
                  value={newService.name}
                  onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Varighet (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  placeholder="30"
                  value={newService.durationMinutes}
                  onChange={(e) => setNewService((p) => ({ ...p, durationMinutes: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Pris (kr, valgfritt)</Label>
                <Input
                  type="number"
                  placeholder="499"
                  value={newService.priceNok}
                  onChange={(e) => setNewService((p) => ({ ...p, priceNok: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px]">Beskrivelse (valgfritt)</Label>
                <Input
                  placeholder="Kort beskrivelse"
                  value={newService.description}
                  onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleAddService}
              disabled={addingService || !newService.name.trim()}
              className="gap-1.5"
            >
              <PlusIcon className="size-3.5" />
              Legg til tjeneste
            </Button>
          </div>

          {/* Service list */}
          {services && services.length > 0 ? (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {services.map((svc) => (
                <div key={svc._id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleServiceActive(svc._id, !svc.isActive)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                        svc.isActive ? "bg-foreground" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                          svc.isActive ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </button>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", !svc.isActive && "text-muted-foreground line-through")}>
                        {svc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {svc.durationMinutes} min
                        {svc.priceNok != null ? ` · ${svc.priceNok} kr` : ""}
                        {svc.description ? ` · ${svc.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc._id)}
                    className="ml-3 shrink-0 p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Ingen tjenester ennå. Legg til den første ovenfor.
            </p>
          )}
        </div>

        {/* Availability */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base">Ukentlige åpningstider</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Angi hvilke dager og tider du tar imot bestillinger
            </p>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {WEEKDAYS.map(({ index, label }) => {
              const avail = getAvailabilityForDay(index);
              const isActive = avail?.isActive ?? false;
              const startMin = avail?.startMinutes ?? 540;
              const endMin = avail?.endMinutes ?? 1020;
              const startTime = minutesToTime(startMin);
              const endTime = minutesToTime(endMin);
              const windowMinutes = endMin - startMin;
              const slots = isActive ? slotCount(startMin, endMin, minServiceDuration) : 0;
              const tooNarrow = isActive && slots === 0;
              const fewSlots = isActive && slots === 1;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    !isActive && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleAvailabilityChange(index, !isActive, startMin, endMin)
                    }
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      isActive ? "bg-foreground" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                        isActive ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>

                  <span className="w-18 shrink-0 text-sm font-medium">{label}</span>

                  {isActive ? (
                    <div className="flex flex-1 items-center gap-2">
                      <TimePicker24h
                        value={startTime}
                        onChange={(v) =>
                          handleAvailabilityChange(index, true, timeToMinutes(v), endMin)
                        }
                      />
                      <span className="text-muted-foreground text-xs">–</span>
                      <TimePicker24h
                        value={endTime}
                        onChange={(v) =>
                          handleAvailabilityChange(index, true, startMin, timeToMinutes(v))
                        }
                      />
                      <span
                        className={cn(
                          "ml-auto text-[11px] shrink-0",
                          tooNarrow
                            ? "text-red-500 font-medium"
                            : fewSlots
                            ? "text-amber-500"
                            : "text-muted-foreground",
                        )}
                      >
                        {tooNarrow
                          ? "For kort"
                          : `${slots} time${slots !== 1 ? "r" : ""} · ${windowMinutes} min`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Stengt</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Ledige tider beregnes automatisk basert på tjenestens varighet, med 30 min mellomrom.
          </p>
        </div>
      </div>
    </div>
  );
};
