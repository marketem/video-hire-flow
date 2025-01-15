import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const accountFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountSettingsForm({ onSuccess }: { onSuccess: () => void }) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      first_name: session?.user.user_metadata.first_name || "",
      last_name: session?.user.user_metadata.last_name || "",
      company_name: session?.user.user_metadata.company_name || "",
      email: session?.user.email || "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);
    try {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          company_name: data.company_name,
        },
      });

      if (metadataError) throw metadataError;

      if (data.email !== session?.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;

        toast({
          title: "Email update initiated",
          description: "Please check your new email for a confirmation link.",
        });
      }

      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update account information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}