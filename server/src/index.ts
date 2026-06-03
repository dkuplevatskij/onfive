import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoutes } from "./routes/chat.js";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: CLIENT_ORIGIN });

  app.get("/api/health", async () => ({ status: "ok" }));

  await app.register(chatRoutes);

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
