import { NextResponse } from "next/server";

const regulationSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    regulator: { type: "string", example: "FCA" },
    source: { type: "string", enum: ["fca", "pra", "hmt", "eu"] },
    priority: { type: "string", enum: ["high", "medium", "low"] },
    status: { type: "string", enum: ["new", "pending", "implemented"] },
    title: { type: "string" },
    date: { type: "string", example: "28 Apr 2025" },
    type: { type: "string", example: "Policy Statement" },
    summary: { type: "string" },
    impact: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    deadline: { type: "string", example: "31 Jul 2025" },
    readiness: { type: "integer", minimum: 0, maximum: 100 },
  },
  required: [
    "id",
    "regulator",
    "source",
    "priority",
    "status",
    "title",
    "date",
    "type",
    "summary",
    "impact",
    "tags",
    "deadline",
    "readiness",
  ],
};

const errorSchema = {
  type: "object",
  properties: { error: { type: "string" } },
  required: ["error"],
};

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Bravo Ai API",
    version: "0.1.0",
    description:
      "UK financial regulatory monitoring API. **Current status:** regulations/audit/impact/jurisdictions " +
      "are backed by MongoDB Atlas (Epic 02). `/api/preferences` and `/api/query` require a signed-in " +
      "session (Auth.js, Epic 03) — see the sessionCookie security scheme below; every other endpoint " +
      "here is intentionally public. `/api/scan` is simulated (Phase 5). `/api/query` calls Anthropic " +
      "Claude server-side, grounded in tracked regulations (Epic 04).",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Regulations" },
    { name: "Audit" },
    { name: "Impact" },
    { name: "Jurisdictions" },
    { name: "Preferences" },
    { name: "Scan" },
    { name: "Q&A" },
  ],
  paths: {
    "/api/regulations": {
      get: {
        tags: ["Regulations"],
        summary: "List regulations",
        parameters: [
          {
            name: "source",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["fca", "pra", "hmt", "eu"] },
            description: "Filter by regulator source.",
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "array", items: regulationSchema } } },
          },
          "400": {
            description: "Invalid source",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
    },
    "/api/regulations/{id}": {
      get: {
        tags: ["Regulations"],
        summary: "Get a single regulation",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: regulationSchema } },
          },
          "400": { description: "Invalid id", content: { "application/json": { schema: errorSchema } } },
          "404": { description: "Not found", content: { "application/json": { schema: errorSchema } } },
        },
      },
    },
    "/api/audit": {
      get: {
        tags: ["Audit"],
        summary: "List audit log entries",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      ts: { type: "string", example: "2025-04-29 09:42" },
                      label: { type: "string", example: "Scan completed" },
                      detail: { type: "string" },
                    },
                    required: ["ts", "label", "detail"],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/impact": {
      get: {
        tags: ["Impact"],
        summary: "List regulatory impact-by-business-area rows",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reg: { type: "string" },
                      banking: { type: "string", enum: ["High", "Medium", "Low", "None"] },
                      invest: { type: "string", enum: ["High", "Medium", "Low", "None"] },
                      insure: { type: "string", enum: ["High", "Medium", "Low", "None"] },
                      comp: { type: "string", enum: ["High", "Medium", "Low", "None"] },
                      ops: { type: "string", enum: ["High", "Medium", "Low", "None"] },
                    },
                    required: ["reg", "banking", "invest", "insure", "comp", "ops"],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/jurisdictions": {
      get: {
        tags: ["Jurisdictions"],
        summary: "List jurisdictions and their active state",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string", example: "UK" },
                      label: { type: "string", example: "United Kingdom" },
                      color: { type: "string", example: "#6384ff" },
                      active: { type: "boolean" },
                    },
                    required: ["code", "label", "color", "active"],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/preferences": {
      get: {
        tags: ["Preferences"],
        summary: "Get the signed-in user's saved preferences",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "OK — an empty object if the user has never saved preferences",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    activeJurisdictionCodes: { type: "array", items: { type: "string" } },
                    activeIndustryFocus: { type: "array", items: { type: "string" } },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": { description: "Not signed in", content: { "application/json": { schema: errorSchema } } },
        },
      },
      put: {
        tags: ["Preferences"],
        summary: "Save (partially update) the signed-in user's preferences",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  activeJurisdictionCodes: { type: "array", items: { type: "string" } },
                  activeIndustryFocus: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } },
          },
          "400": { description: "Invalid request body", content: { "application/json": { schema: errorSchema } } },
          "401": { description: "Not signed in", content: { "application/json": { schema: errorSchema } } },
        },
      },
    },
    "/api/scan": {
      post: {
        tags: ["Scan"],
        summary: "Trigger a regulatory source scan (simulated — see Phase 5)",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    simulated: { type: "boolean" },
                    scannedAt: { type: "string", format: "date-time" },
                    newRecords: { type: "integer" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/query": {
      post: {
        tags: ["Q&A"],
        summary: "Ask the regulation AI a question, grounded in tracked regulations (Anthropic Claude, server-side). Requires a signed-in session.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { question: { type: "string" } },
                required: ["question"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { answer: { type: "string" } }, required: ["answer"] },
              },
            },
          },
          "400": { description: "Missing question", content: { "application/json": { schema: errorSchema } } },
          "401": { description: "Not signed in", content: { "application/json": { schema: errorSchema } } },
          "429": { description: "AI provider rate-limited", content: { "application/json": { schema: errorSchema } } },
          "501": { description: "ANTHROPIC_API_KEY not configured on this deployment", content: { "application/json": { schema: errorSchema } } },
          "502": { description: "AI provider error (auth failure or other upstream error)", content: { "application/json": { schema: errorSchema } } },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
        description:
          "Auth.js JWT session cookie, set after signing in via /login. Swagger UI's \"Try it out\" runs " +
          "same-origin, so if you're signed in via this browser tab, the cookie is sent automatically.",
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
