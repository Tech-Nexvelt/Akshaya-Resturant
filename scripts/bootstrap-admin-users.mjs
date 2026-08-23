import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_STAFF_ACCOUNTS = [
  { email: "super_admin@akshaya.com", password: "Password123!", role: "super_admin", full_name: "Super Admin User" },
  { email: "owner@akshaya.com", password: "Password123!", role: "owner", full_name: "Restaurant Owner" },
  { email: "admin@akshaya.com", password: "Password123!", role: "admin", full_name: "Branch Manager" },
  { email: "staff@akshaya.com", password: "Password123!", role: "staff", full_name: "Kitchen Staff" },
];

async function bootstrapAdminUsers() {
  console.log("Starting Staff User Provisioning...");

  for (const account of TEST_STAFF_ACCOUNTS) {
    // 1. Create or fetch auth user
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.full_name },
    });

    let userId = userData?.user?.id;

    if (createErr && createErr.message.includes("already")) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users.users.find((u) => u.email === account.email);
      userId = existing?.id;
    } else if (createErr) {
      console.error(`Error creating auth user ${account.email}:`, createErr.message);
      continue;
    }

    if (!userId) {
      console.error(`Could not resolve user ID for ${account.email}`);
      continue;
    }

    // 2. Upsert profile with assigned role
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: userId,
      email: account.email,
      full_name: account.full_name,
      role: account.role,
      status: "active",
      updated_at: new Date().toISOString(),
    });

    if (profileErr) {
      console.error(`Failed to update profile for ${account.email}:`, profileErr.message);
    } else {
      console.log(`✅ Provisioned ${account.email} as [${account.role}] (ID: ${userId})`);
    }
  }

  console.log("Staff User Provisioning Complete.");
}

bootstrapAdminUsers().catch(console.error);
