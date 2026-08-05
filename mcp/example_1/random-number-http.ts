import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import { z } from "zod";

const server = new McpServer({
    name: "Random Number MCP",
    version: "1.0.0"
});

server.registerTool("get_random_number", {
    description: "Generate a random number"
}, async () => {
    const output = Math.floor(Math.random() * 100000);
    console.log("get_random_number", output, new Date());
    return {
        content: [
            {
                type: "text",
                text: `Random number: ${output}`
            }
        ]
    }
});

server.registerTool("get_random_number_limit", {
    description: "Generate a limited random number",
    inputSchema: {
        limit: z.number().optional().describe("limit")
    }
}, async ({ limit }) => {
    const output = Math.floor(Math.random() * (limit ?? 100));
    console.log("get_random_number_limit", output, new Date());
    return {
        content: [
            {
                type: "text",
                text: `Random number: ${output}`
            }
        ]
    }
});

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
    console.log("/mcp", new Date());
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.listen(3000);
