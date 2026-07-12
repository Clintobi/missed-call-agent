import { assistant } from "./agent.js";

// Run the missed-call recovery: the business missed the call, so the assistant
// texts back, then qualifies the job over SMS until it has enough to book it.
// Returns the full transcript and the structured job that got captured.
export async function run(scenario, { apiKey }) {
  const ctx = { business: scenario.business, caller: scenario.caller };
  const history = [];
  const transcript = [];

  const push = (role, who, text) => {
    history.push({ role, text });
    transcript.push({ who, text });
  };

  // Opening text-back, before the customer has replied to anything.
  let a = await assistant(history, ctx, { apiKey });
  push("assistant", "AI", a.reply);

  for (const custText of scenario.customer_turns) {
    push("customer", "Customer", custText);
    a = await assistant(history, ctx, { apiKey });
    push("assistant", "AI", a.reply);
    if (a.done && a.job) return { transcript, job: a.job };
  }

  return { transcript, job: a.job || null };
}
