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
      "endpoints are backed by in-memory seed data, not a database — see STRATEGY.md Phase 2. " +
      "`/api/scan` is simulated (Phase 5). `/api/query` is not yet implemented (Phase 4) and returns 501.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Regulations" },
    { name: "Audit" },
    { name: "Impact" },
    { name: "Jurisdictions" },
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
        summary: "Ask the regulation AI a question (not yet implemented — see Phase 4)",
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
          "400": { description: "Missing question", content: { "application/json": { schema: errorSchema } } },
          "501": { description: "Not implemented yet", content: { "application/json": { schema: errorSchema } } },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
