import { readFileSync, existsSync } from "node:fs";
import { run } from "./pipeline.js";

// Minimal .env loader (no dependency).
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY;
const scenario = JSON.parse(readFileSync("data/scenario.json", "utf8"));

console.log(`\nMissed call from ${scenario.caller} at ${scenario.missed_at} — ${scenario.business} was on a job.\n`);

const { transcript, job } = await run(scenario, { apiKey });

for (const t of transcript) {
  if (t.who === "AI") console.log(`  AI   ${t.text}`);
  else console.log(`  ↩    ${scenario.caller}: ${t.text}`);
}

if (job) {
  const row = (k, v) => console.log(`  ${k.padEnd(9)} ${v}`);
  console.log("\n── Job captured ───────────────");
  row("Name", job.name);
  row("Phone", job.phone);
  row("Issue", job.issue);
  row("Urgency", String(job.urgency).toUpperCase());
  row("Address", job.address);
  row("Window", job.window);
  row("Status", job.status);
  row("Est.", `~$${job.est_value_usd}`);
  console.log(
    `\nRecovered in ${transcript.length} texts, zero staff time. ` +
    `A missed call is usually a lost ~$${job.est_value_usd} job — this catches it while you're still on site.`
  );
} else {
  console.log("\n(No job captured — needed more info.)");
}
