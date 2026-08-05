import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "Random Number MCP",
    version: "1.0.0"
});

server.registerTool("get_random_number", {
    description: "Generate a random number"
}, async () => {
    const output = Math.floor(Math.random() * 100000);
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
    return {
        content: [
            {
                type: "text",
                text: `Random number: ${output}`
            }
        ]
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
