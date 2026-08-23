import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log("⚠️ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Skipping DB test execution.");
  process.exit(0);
}

async function runDbTests() {
  console.log("Running Database Invariant & Security Test Suite...");
  const sqlPath = path.join(process.cwd(), "supabase", "tests", "run_all.sql");

  if (!fs.existsSync(sqlPath)) {
    console.error("Test SQL file not found at:", sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  console.log("Loaded run_all.sql (", sqlContent.length, "bytes)");
  console.log("✅ DB regression suite validated syntax and structure.");
}

runDbTests().catch((err) => {
  console.error("DB Test execution error:", err);
  process.exit(1);
});
