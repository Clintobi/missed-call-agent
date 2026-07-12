import Anthropic from "@anthropic-ai/sdk";

const SYSTEM =
  "You are the SMS intake assistant for a home-services business (plumbing, HVAC, electrical). " +
  "A customer just called and the business missed it because they're on a job. You're texting the " +
  "customer back to catch the work before they call a competitor. Be warm and brief, like a real " +
  "text (one or two sentences), and ask ONE question at a time. You need: the problem, how urgent it " +
  "is, the service address, the customer's name, and a time window. The moment you have all of those, " +
  "confirm the booking in a single message and stop asking questions. " +
  'Return ONLY JSON each turn, no prose, no code fences: ' +
  '{"reply": "<the text to send the customer>", "done": <true only once the job is fully booked>, ' +
  '"job": <when done, {"name","phone","issue","urgency":"emergency"|"routine","address","window","est_value_usd","status":"BOOKED"}; otherwise null>}';

// Produce the assistant's next SMS given the conversation so far. With a key,
// Claude drives the qualification; without one, a scripted fallback runs the
// bundled scenario so the demo works offline.
export async function assistant(history, ctx, { apiKey }) {
  if (!apiKey) return mock(history, ctx);

  const client = new Anthropic({ apiKey });
  const convo = history.map((h) => `${h.role === "assistant" ? "You" : "Customer"}: ${h.text}`).join("\n");
  const msg = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 700,
    system: SYSTEM,
    messages: [{
      role: "user",
      content: `Business: ${ctx.business}. Caller number: ${ctx.caller}.\n\n` +
        (convo ? `Conversation so far (most recent last):\n${convo}\n\n` : "No messages yet — send the opening text-back.\n\n") +
        "Reply as JSON.",
    }],
  });
  const t = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const cleaned = t.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

// Offline scripted assistant for the bundled scenario, keyed by how many
// customer messages have arrived.
function mock(history, ctx) {
  const c = history.filter((h) => h.role === "customer").length;
  const steps = [
    {
      reply: `Hi, this is ${ctx.business}'s assistant. Sorry we missed your call, we're out on a job right now. What do you need help with, and how urgent is it?`,
      done: false, job: null,
    },
    {
      reply: "Sounds like that needs attention today. What's the service address, and a name for the job?",
      done: false, job: null,
    },
    {
      reply: "Thanks Marcus. We can have a tech out to you today between 4 and 6 PM. Does that window work?",
      done: false, job: null,
    },
    {
      reply: "You're booked, Marcus. A tech will be at 4408 Oak Bend Dr today between 4 and 6 PM, and you'll get a text when they're on the way.",
      done: true,
      job: {
        name: "Marcus",
        phone: ctx.caller,
        issue: "Leaking water heater, flooding the garage floor",
        urgency: "emergency",
        address: "4408 Oak Bend Dr",
        window: "Today 4-6 PM",
        est_value_usd: 450,
        status: "BOOKED",
      },
    },
  ];
  return steps[Math.min(c, steps.length - 1)];
}
