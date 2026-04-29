"use client";

import {
  GlobeIcon,
  PhoneCallIcon,
  PhoneIcon,
  PlugIcon,
  WorkflowIcon,
} from "lucide-react";
import { type Feature, PluginCard } from "../components/plugin-card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  DashboardAccentButton,
} from "@/modules/dashboard/ui/components/dashboard-accent";
import {
  DashboardPageHeader,
  DashboardPageShell,
} from "@/modules/dashboard/ui/components/dashboard-page-shell";
import { VapiConnectedView } from "../components/vapi-connected-view";

const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Stemme i nettleser",
    description: "Talesamtale direkte i widget og app",
  },
  {
    icon: PhoneIcon,
    label: "Telefonnumre",
    description: "Egne bedriftslinjer for innkommende anrop",
  },
  {
    icon: PhoneCallIcon,
    label: "Utgående anrop",
    description: "Automatisert kundekontakt via telefon",
  },
  {
    icon: WorkflowIcon,
    label: "Samtaleflyter",
    description: "Egendefinerte samtaleløp og handlinger",
  },
];

const formSchema = z.object({
  publicApiKey: z.string().min(1, { message: "Offentlig API-nøkkel er påkrevd" }),
  privateApiKey: z.string().min(1, { message: "Privat API-nøkkel er påkrevd" }),
});

const vapiKeyInputClassName =
  "h-10 rounded-lg border-border/70 bg-background text-[13px] shadow-sm [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--background)]";

const VapiPluginForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const upsertSecret = useMutation(api.private.secrets.upsert);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicApiKey: "",
      privateApiKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await upsertSecret({
        service: "vapi",
        value: {
          publicApiKey: values.publicApiKey,
          privateApiKey: values.privateApiKey,
        },
      });
      setOpen(false);
      toast.success("Vapi er koblet til");
    } catch (error) {
      console.error(error);
      toast.error("Noe gikk galt");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="dashboard-app-shell gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 text-card-foreground shadow-2xl sm:max-w-lg">
        <DialogHeader className="border-border/60 border-b bg-muted/25 px-6 py-5 text-left">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Koble til Vapi
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            API-nøkler krypteres og lagres trygt (AWS Secrets Manager).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            className="flex flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-4 px-6 py-6">
              <FormField
                control={form.control}
                name="publicApiKey"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-medium">
                      Offentlig API-nøkkel
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        className={vapiKeyInputClassName}
                        placeholder="Lim inn fra Vapi-dashboardet"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privateApiKey"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[13px] font-medium">
                      Privat API-nøkkel
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="new-password"
                        className={vapiKeyInputClassName}
                        placeholder="Lim inn privat nøkkel"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="border-border/60 border-t bg-muted/10 px-6 py-4 sm:justify-end sm:gap-2">
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Avbryt
              </Button>
              <DashboardAccentButton
                className="h-11 min-w-[8.5rem] rounded-xl font-semibold"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? "Kobler…" : "Koble til"}
                <PlugIcon className="size-4" />
              </DashboardAccentButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
};

const VapiPluginRemoveForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);

  const onSubmit = async () => {
    try {
      await removePlugin({
        service: "vapi",
      });
      setOpen(false);
      toast.success("Vapi er frakoblet");
    } catch (error) {
      console.error(error);
      toast.error("Noe gikk galt");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="dashboard-app-shell gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 text-card-foreground shadow-2xl sm:max-w-md">
        <DialogHeader className="border-border/60 border-b bg-muted/25 px-6 py-5 text-left">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            Frakoble Vapi
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Stemme i widget og dashbord slutter å bruke Vapi. Du kan koble til
            igjen senere med nye nøkler. Vil du fortsette?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-border/60 border-t bg-muted/10 px-6 py-4 sm:justify-end sm:gap-2">
          <Button onClick={() => setOpen(false)} type="button" variant="outline">
            Avbryt
          </Button>
          <Button onClick={onSubmit} type="button" variant="destructive">
            Frakoble
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const VapiView = () => {
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const [connectOpen, setConnectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const toggleConnection = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };

  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
      <DashboardPageShell contentClassName="max-w-5xl">
        <DashboardPageHeader
          description="Koble Vapi for stemme i nettleser og telefon — ett sted for nøkler og status."
          kicker="Stemme"
          title="Vapi Plugin"
        />

        <div className="mt-2">
          {vapiPlugin ? (
            <VapiConnectedView onDisconnect={toggleConnection} />
          ) : (
            <PluginCard
              serviceImage="/vapi.jpg"
              serviceName="Vapi"
              features={vapiFeatures}
              isDisabled={vapiPlugin === undefined}
              onSubmit={toggleConnection}
            />
          )}
        </div>
      </DashboardPageShell>
    </>
  );
};
