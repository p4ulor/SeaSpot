import { server, ServerConfig } from "./server.mjs"

export const application = server(new ServerConfig(5000, false, "http://localhost:9200"))

console.log("Server setup finished")
