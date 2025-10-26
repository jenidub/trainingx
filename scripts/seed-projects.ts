/**
 * Seed script to populate Convex database with practice projects
 *
 * Usage:
 * 1. Make sure Convex dev is running: npm run convex dev
 * 2. Run this script: npx tsx scripts/seed-projects.ts
 */

import { ConvexHttpClient } from "convex/browser";
import projectsData from "../src/data/projects";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";

// Get Convex URL from environment or .env.local file
let CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

// If not in environment, try reading from .env.local
if (!CONVEX_URL) {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/VITE_CONVEX_URL=(.+)/);
    if (match) {
      CONVEX_URL = match[1].trim();
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
}

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.log("Make sure you have a .env.local file with VITE_CONVEX_URL");
  process.exit(1);
}

async function seedProjects() {
  console.log("🌱 Starting project seeding...");
  console.log(`📡 Connecting to Convex: ${CONVEX_URL}`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log(`📦 Found ${projectsData.length} projects in seed file`);

    // Call the seedProjects mutation
    const result = await client.mutation(api.practiceProjects.seedProjects, {
      projects: projectsData as any,
    });

    console.log("✅ Seeding complete!");
    console.log(`   - Inserted: ${result.inserted} new projects`);
    console.log(
      `   - Skipped: ${result.total - result.inserted} existing projects`,
    );
    console.log(`   - Total: ${result.total} projects`);
    console.log("\n" + result.message);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seed function
seedProjects();
