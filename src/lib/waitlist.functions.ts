import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; societyName?: string }) => {
    const email = d?.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    return { email, societyName: d?.societyName?.trim().slice(0, 100) ?? "" };
  })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("waitlist")
      .insert({ email: data.email, society_name: data.societyName || null })
      .select("email")
      .single();

    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        return { ok: true, message: "You're already on the list. We'll be in touch!" };
      }
      throw new Error("Could not save your email. Please try again.");
    }

    return { ok: true, message: "You're on the list. We'll email you when we're ready." };
  });
