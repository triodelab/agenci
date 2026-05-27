"use client";

import { useState } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { CalendarIcon, CheckIcon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface BookingsViewProps {
  agentId: Id<"agents">;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Venter",
  confirmed: "Bekreftet",
  completed: "Fullført",
  cancelled: "Avbestilt",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(dateString: string): string {
  const d = new Date(dateString + "T12:00:00");
  const days = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
  const months = [
    "jan", "feb", "mar", "apr", "mai", "jun",
    "jul", "aug", "sep", "okt", "nov", "des",
  ];
  return `${days[d.getDay()]} ${d.getDate()}. ${months[d.getMonth()]}`;
}

export const BookingsView = ({ agentId }: BookingsViewProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const updateStatus = useMutation(api.private.bookings.updateStatus);
  const stats = useQuery(api.private.bookings.getStats, { agentId });

  const { results: bookings, status, loadMore } = usePaginatedQuery(
    api.private.bookings.list,
    { agentId },
    { initialNumItems: 20 },
  );

  const filtered =
    bookings?.filter((b) => {
      if (activeTab === "all") return true;
      return b.status === activeTab;
    }) ?? [];

  const tabs = [
    { key: "all", label: "Alle", count: stats?.total },
    { key: "pending", label: "Venter", count: stats?.pending },
    { key: "confirmed", label: "Bekreftet", count: stats?.confirmed },
    { key: "completed", label: "Fullført", count: stats?.completed },
    { key: "cancelled", label: "Avbestilt", count: stats?.cancelled },
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bestillinger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrer alle timebestillinger for denne agenten
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Venter", value: stats.pending, color: "text-amber-600" },
            { label: "Bekreftet", value: stats.confirmed, color: "text-green-600" },
            { label: "Fullført", value: stats.completed, color: "text-blue-600" },
            { label: "Avbestilt", value: stats.cancelled, color: "text-muted-foreground" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  activeTab === tab.key
                    ? "bg-muted text-foreground"
                    : "bg-muted/60",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <CalendarIcon className="size-8 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Ingen bestillinger</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kunde</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tjeneste</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dato</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tid</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((booking) => (
                  <tr key={booking._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-[12px] text-muted-foreground">{booking.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{booking.serviceName}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {booking.serviceDurationMinutes} min
                      </p>
                    </td>
                    <td className="px-4 py-3">{formatDate(booking.dateString)}</td>
                    <td className="px-4 py-3 font-medium">kl. {booking.timeString}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          STATUS_COLORS[booking.status] ?? "",
                        )}
                      >
                        {STATUS_LABELS[booking.status] ?? booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {booking.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-[12px] text-green-700 border-green-200 hover:bg-green-50"
                            onClick={() =>
                              updateStatus({ bookingId: booking._id, status: "confirmed" })
                            }
                          >
                            <CheckIcon className="size-3" />
                            Bekreft
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-[12px] text-blue-700 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              updateStatus({ bookingId: booking._id, status: "completed" })
                            }
                          >
                            <CheckIcon className="size-3" />
                            Fullfør
                          </Button>
                        )}
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-[12px] text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              updateStatus({ bookingId: booking._id, status: "cancelled" })
                            }
                          >
                            <XIcon className="size-3" />
                            Avbestill
                          </Button>
                        )}
                        {(booking.status === "completed" || booking.status === "cancelled") && (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {status === "CanLoadMore" && (
          <div className="border-t border-border p-4 text-center">
            <Button variant="outline" size="sm" onClick={() => loadMore(20)}>
              Last flere
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
