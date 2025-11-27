import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

type Env = {
  AIRTABLE_PERSONAL_ACCESS_TOKEN: string;
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
};

const app = new Hono<{ Bindings: Env }>();

const verify = zValidator(
  "json",
  z.object({
    email: z.string().email(),
  })
);

app.post("/api/waitlist", verify, async (c) => {
  const { email } = c.req.valid("json");

  const { AIRTABLE_PERSONAL_ACCESS_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = c.env;

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Email Address": email,
              },
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("Airtable API error", res.status, body);
      return c.json({ error: "failed to create Airtable record" }, 500);
    }

    return c.json({ ok: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating record:", error, error?.message, error?.stack);
    return c.json({ error: "failed to create Airtable record" }, 500);
  }
});

export default app;
