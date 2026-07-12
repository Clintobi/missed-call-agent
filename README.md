# missed-call-agent

When a home-services business misses a call, this texts the customer back in seconds, qualifies the job over SMS, and books it — before that customer calls the next plumber.

Trades miss a quarter to a third of their calls. They're on a roof, under a sink, hands full. Every missed call is usually a $200 to $600 job that walks straight to a competitor who happened to pick up. This closes that gap without the owner touching the phone.

## The flow

```
missed call ──► instant text-back ──► qualify over SMS ──► book the job
     │                                     │
 "on a job,          the assistant asks one question at a time:
  can't answer"      what's wrong, how urgent, address, name, when
                                           │
                              ──► structured job, booked + logged
```

The model handles the conversation (reads free-text replies, asks the right next question, decides urgency). When it has everything it needs, it confirms the booking and hands back a clean structured job record you can drop into a CRM.

## Run it

```bash
npm install
npm start        # runs the bundled missed-call scenario
```

Runs offline: with no `ANTHROPIC_API_KEY`, it plays a scripted conversation so you can see the whole flow. Add a key and `claude-opus-4-8` runs the qualification live against any customer's replies.

## Sample output

```
Missed call from +1 512 555 0199 at 2:14 PM — Rivera Plumbing was on a job.

  AI   Hi, this is Rivera Plumbing's assistant. Sorry we missed your call,
       we're out on a job right now. What do you need help with, and how
       urgent is it?
  ↩    +1 512 555 0199: My water heater is leaking all over the garage floor
  AI   Sounds like that needs attention today. What's the service address,
       and a name for the job?
  ↩    +1 512 555 0199: It's 4408 Oak Bend Dr, name's Marcus
  AI   Thanks Marcus. We can have a tech out today between 4 and 6 PM. Does
       that window work?
  ↩    +1 512 555 0199: yes please, sooner the better
  AI   You're booked, Marcus. A tech will be at 4408 Oak Bend Dr today
       between 4 and 6 PM...

── Job captured ───────────────
  Name      Marcus
  Phone     +1 512 555 0199
  Issue     Leaking water heater, flooding the garage floor
  Urgency   EMERGENCY
  Address   4408 Oak Bend Dr
  Window    Today 4-6 PM
  Status    BOOKED
  Est.      ~$450

Recovered in 8 texts, zero staff time. A missed call is usually a lost ~$450
job — this catches it while you're still on site.
```

(The dollar figure is an illustrative estimate; wire it to your real average ticket.)

## Make it yours

- **Live SMS:** swap the scripted scenario for a real inbound trigger. A missed call fires a webhook (Twilio, your phone system) and the customer's replies come in over SMS — the qualification logic in `src/agent.js` is unchanged.
- **What it collects:** edit the system prompt in `src/agent.js` to capture whatever your intake needs (job type, photos, insurance, etc.).
- **Where it lands:** `run()` returns a structured job — push it to your CRM, calendar, or a dispatcher, and fire the "tech on the way" text.

Built by Clinton, VNSIS. Qualification runs on `claude-opus-4-8`.
