import { UseFormReturn } from "react-hook-form";
import { useVapiAssistants, useVapiPhoneNumbers } from "@/modules/plugins/hooks/use-vapi-data";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FormSchema } from "../../types";

interface VapiFormFieldsProps {
  form: UseFormReturn<FormSchema>;
  labelClassName?: string;
  selectTriggerClassName?: string;
}

export const VapiFormFields = ({
  form,
  labelClassName,
  selectTriggerClassName,
}: VapiFormFieldsProps) => {
  const { data: assistants, isLoading: assistantsLoading } = useVapiAssistants();
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useVapiPhoneNumbers();

  const disabled = form.formState.isSubmitting;

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="vapiSettings.assistantId"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className={labelClassName}>Stemmeassistent</FormLabel>
            <Select
              disabled={assistantsLoading || disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue
                    placeholder={
                      assistantsLoading
                        ? "Laster assistenter…"
                        : "Velg en assistent"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Ingen</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name || "Uten navn"} —{" "}
                    {assistant.model?.model || "Ukjent modell"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Vapi-assistenten som brukes til taleanrop i widgeten.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vapiSettings.phoneNumber"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className={labelClassName}>Visningstlfnummer</FormLabel>
            <Select
              disabled={phoneNumbersLoading || disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue
                    placeholder={
                      phoneNumbersLoading
                        ? "Laster telefonnumre…"
                        : "Velg et telefonnummer"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Ingen</SelectItem>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.number || phone.id}>
                    {phone.number || "Ukjent"} —{" "}
                    {phone.name || "Uten navn"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Telefonnummeret som vises i widgeten.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
