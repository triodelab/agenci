"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, CalendarIcon, CheckIcon, ClockIcon, LoaderIcon } from "lucide-react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { WidgetFooter } from "@/modules/widget/ui/components/widget-footer";
import {
  agentIdAtom,
  bookingDraftAtom,
  contactSessionIdAtomFamily,
  organizationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { Id } from "@workspace/backend/_generated/dataModel";

type BookingStep = "service" | "date" | "time" | "confirm" | "success";

const WEEKDAYS = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function formatDateLabel(dateString: string): { day: string; weekday: string; month: string } {
  const d = new Date(dateString + "T12:00:00");
  return {
    weekday: WEEKDAYS[d.getDay()] ?? "",
    day: String(d.getDate()),
    month: MONTHS[d.getMonth()] ?? "",
  };
}

function formatDateLong(dateString: string): string {
  const d = new Date(dateString + "T12:00:00");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

export const WidgetBookingScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const agentId = useAtomValue(agentIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const setBookingDraft = useSetAtom(bookingDraftAtom);

  const [step, setStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<Id<"bookingServices"> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    serviceName: string;
    dateString: string;
    timeString: string;
    customerName: string;
  } | null>(null);

  const services = useQuery(
    api.public.bookings.getServices,
    organizationId
      ? { organizationId, agentId: agentId as Id<"agents"> | undefined }
      : "skip"
  );

  const availableDates = useQuery(
    api.public.bookings.getAvailableDates,
    organizationId
      ? { organizationId, agentId: agentId as Id<"agents"> | undefined }
      : "skip"
  );

  const availableSlots = useQuery(
    api.public.bookings.getAvailableSlots,
    organizationId && selectedDate && selectedServiceId
      ? {
          organizationId,
          agentId: agentId as Id<"agents"> | undefined,
          dateString: selectedDate,
          serviceId: selectedServiceId,
        }
      : "skip"
  );

  const createBooking = useMutation(api.public.bookings.create);

  // Auto-skip service step if only one service
  useEffect(() => {
    if (services && services.length === 1 && step === "service") {
      const svc = services[0]!;
      setSelectedServiceId(svc._id);
      setStep("date");
    }
  }, [services, step]);

  const selectedService = services?.find((s) => s._id === selectedServiceId);

  const handleBack = () => {
    if (step === "service") {
      setScreen("selection");
    } else if (step === "date") {
      if (services && services.length > 1) {
        setStep("service");
      } else {
        setScreen("selection");
      }
    } else if (step === "time") {
      setStep("date");
    } else if (step === "confirm") {
      setStep("time");
    } else if (step === "success") {
      setScreen("selection");
    }
  };

  const handleSubmit = async () => {
    if (!organizationId || !contactSessionId || !selectedServiceId || !selectedDate || !selectedTime) return;
    if (!gdprConsent) return;

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        organizationId,
        agentId: agentId as Id<"agents"> | undefined,
        contactSessionId,
        serviceId: selectedServiceId,
        dateString: selectedDate,
        timeString: selectedTime,
        notes: notes.trim() || undefined,
        gdprConsent: true,
      });

      setBookingResult({
        serviceName: result.serviceName,
        dateString: result.dateString,
        timeString: result.timeString,
        customerName: result.customerName,
      });
      setBookingDraft({});
      setStep("success");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Bestillingen feilet. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitle: Record<BookingStep, string> = {
    service: "Velg tjeneste",
    date: "Velg dato",
    time: "Velg tidspunkt",
    confirm: "Bekreft bestilling",
    success: "Bestilling sendt!",
  };

  return (
    <div className="flex h-full flex-col">
      <WidgetHeader>
        <div className="flex items-center gap-2 px-2 pb-4 pt-1">
          {step !== "success" && (
            <button
              type="button"
              onClick={handleBack}
              className="flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ color: "var(--widget-header-text)" }}
            >
              <ArrowLeftIcon className="size-4" />
            </button>
          )}
          <p
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: "var(--widget-header-text)" }}
          >
            {stepTitle[step]}
          </p>
        </div>
        {/* Progress indicator */}
        {step !== "success" && (
          <div className="flex gap-1.5 px-4 pb-3">
            {(["service", "date", "time", "confirm"] as BookingStep[]).map((s, i) => {
              const stepIndex = ["service", "date", "time", "confirm"].indexOf(step);
              const isActive = i <= stepIndex;
              return (
                <div
                  key={s}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{
                    backgroundColor: "var(--widget-header-text)",
                    opacity: isActive ? 1 : 0.3,
                  }}
                />
              );
            })}
          </div>
        )}
      </WidgetHeader>

      <div
        className="flex flex-1 flex-col overflow-y-auto"
        style={{ backgroundColor: "var(--widget-bg, #fff)" }}
      >
        {/* Step: Service */}
        {step === "service" && (
          <div className="flex flex-col gap-2 p-4">
            {!services ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <LoaderIcon
                  className="size-5 animate-spin"
                  style={{ color: "var(--widget-input-placeholder)" }}
                />
              </div>
            ) : services.length === 0 ? (
              <p
                className="py-8 text-center text-sm"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                Ingen tjenester tilgjengelig
              </p>
            ) : (
              services.map((svc) => (
                <button
                  key={svc._id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(svc._id);
                    setStep("date");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--widget-input-bg, #fff)",
                    borderColor: "var(--widget-input-border, #e4e4e7)",
                    color: "var(--widget-input-text, #18181b)",
                  }}
                >
                  <div>
                    <p className="font-medium text-[14px]">{svc.name}</p>
                    <p
                      className="mt-0.5 text-[12px]"
                      style={{ color: "var(--widget-input-placeholder)" }}
                    >
                      {svc.durationMinutes} min
                      {svc.priceNok != null ? ` · ${svc.priceNok} kr` : ""}
                      {svc.description ? ` · ${svc.description}` : ""}
                    </p>
                  </div>
                  <ArrowLeftIcon className="size-4 rotate-180 opacity-40" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div className="flex flex-col gap-3 p-4">
            {!availableDates ? (
              <div className="flex justify-center py-12">
                <LoaderIcon
                  className="size-5 animate-spin"
                  style={{ color: "var(--widget-input-placeholder)" }}
                />
              </div>
            ) : availableDates.length === 0 ? (
              <p
                className="py-8 text-center text-sm"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                Ingen ledige datoer
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableDates.map((dateStr) => {
                  const { weekday, day, month } = formatDateLabel(dateStr);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedTime(null);
                        setStep("time");
                      }}
                      className="flex flex-col items-center rounded-xl border py-3 text-center transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--widget-header-bg)"
                          : "var(--widget-input-bg, #fff)",
                        borderColor: isSelected
                          ? "var(--widget-header-bg)"
                          : "var(--widget-input-border, #e4e4e7)",
                        color: isSelected
                          ? "var(--widget-header-text)"
                          : "var(--widget-input-text, #18181b)",
                      }}
                    >
                      <span className="text-[10px] opacity-70">{weekday}</span>
                      <span className="text-lg font-bold leading-tight">{day}</span>
                      <span className="text-[10px] opacity-70">{month}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div className="flex flex-col gap-3 p-4">
            {selectedDate && (
              <p
                className="text-[13px] font-medium"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                <CalendarIcon className="mr-1 inline size-3.5" />
                {formatDateLong(selectedDate)}
              </p>
            )}
            {!availableSlots ? (
              <div className="flex justify-center py-12">
                <LoaderIcon
                  className="size-5 animate-spin"
                  style={{ color: "var(--widget-input-placeholder)" }}
                />
              </div>
            ) : availableSlots.filter((s) => s.available).length === 0 ? (
              <p
                className="py-8 text-center text-sm"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                Ingen ledige tider denne dagen
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = slot.time === selectedTime;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setStep("confirm");
                      }}
                      className="flex items-center justify-center rounded-xl border py-2.5 text-[14px] font-medium transition-all disabled:opacity-30"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--widget-header-bg)"
                          : "var(--widget-input-bg, #fff)",
                        borderColor: isSelected
                          ? "var(--widget-header-bg)"
                          : "var(--widget-input-border, #e4e4e7)",
                        color: isSelected
                          ? "var(--widget-header-text)"
                          : "var(--widget-input-text, #18181b)",
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedService && selectedDate && selectedTime && (
          <div className="flex flex-col gap-4 p-4">
            {/* Summary card */}
            <div
              className="rounded-xl border p-4 space-y-2"
              style={{
                backgroundColor: "var(--widget-input-bg, #f9f9f9)",
                borderColor: "var(--widget-input-border, #e4e4e7)",
              }}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon
                  className="size-4 shrink-0 opacity-50"
                  style={{ color: "var(--widget-input-text)" }}
                />
                <span className="text-[14px]" style={{ color: "var(--widget-input-text)" }}>
                  {formatDateLong(selectedDate)} kl. {selectedTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon
                  className="size-4 shrink-0 opacity-50"
                  style={{ color: "var(--widget-input-text)" }}
                />
                <span className="text-[14px]" style={{ color: "var(--widget-input-text)" }}>
                  {selectedService.name} · {selectedService.durationMinutes} min
                  {selectedService.priceNok != null ? ` · ${selectedService.priceNok} kr` : ""}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label
                className="text-[12px] font-medium"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                Notater (valgfritt)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Noe vi bør vite på forhånd?"
                className="w-full resize-none rounded-xl border px-3 py-2 text-[14px] outline-none"
                style={{
                  backgroundColor: "var(--widget-input-bg, #fff)",
                  borderColor: "var(--widget-input-border, #e4e4e7)",
                  color: "var(--widget-input-text, #18181b)",
                }}
              />
            </div>

            {/* GDPR consent */}
            <label className="flex cursor-pointer items-start gap-2.5">
              <div
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors"
                style={{
                  backgroundColor: gdprConsent
                    ? "var(--widget-header-bg)"
                    : "var(--widget-input-bg, #fff)",
                  borderColor: gdprConsent
                    ? "var(--widget-header-bg)"
                    : "var(--widget-input-border, #e4e4e7)",
                }}
                onClick={() => setGdprConsent((v) => !v)}
              >
                {gdprConsent && (
                  <CheckIcon
                    className="size-2.5"
                    style={{ color: "var(--widget-header-text)" }}
                  />
                )}
              </div>
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="sr-only"
              />
              <span
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--widget-input-placeholder)" }}
              >
                Jeg godtar at navn og e-post lagres for å behandle bestillingen, og slettes
                automatisk 30 dager etter avtalt tid.{" "}
                <a
                  href="https://agenci.no/personvern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Personvern
                </a>
              </span>
            </label>

            <button
              type="button"
              disabled={!gdprConsent || isSubmitting}
              onClick={handleSubmit}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                backgroundColor: "var(--widget-header-bg, #5e6ad2)",
                color: "var(--widget-header-text, #fff)",
              }}
            >
              {isSubmitting ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                "Bekreft bestilling"
              )}
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && bookingResult && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--widget-header-bg, #5e6ad2)" }}
            >
              <CheckIcon
                className="size-7"
                style={{ color: "var(--widget-header-text, #fff)" }}
              />
            </div>
            <div className="space-y-1.5">
              <p
                className="text-[16px] font-semibold"
                style={{ color: "var(--widget-input-text)" }}
              >
                Bestilling bekreftet!
              </p>
              <p className="text-[14px]" style={{ color: "var(--widget-input-placeholder)" }}>
                {bookingResult.serviceName}
              </p>
              <p className="text-[13px]" style={{ color: "var(--widget-input-placeholder)" }}>
                {formatDateLong(bookingResult.dateString)} kl. {bookingResult.timeString}
              </p>
            </div>
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "var(--widget-input-placeholder)" }}
            >
              En bekreftelse er sendt til {bookingResult.customerName}.
            </p>
            <button
              type="button"
              onClick={() => setScreen("selection")}
              className="mt-2 h-10 rounded-xl px-6 text-[14px] font-medium border transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--widget-input-border)",
                color: "var(--widget-input-text)",
                backgroundColor: "var(--widget-input-bg)",
              }}
            >
              Tilbake
            </button>
          </div>
        )}
      </div>

      <WidgetFooter />
    </div>
  );
};
