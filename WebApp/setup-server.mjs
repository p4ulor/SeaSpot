import { Server, ServerConfiguration } from "./server.mjs"

export const application = Server(new ServerConfiguration(5000, false, "http://localhost:9200"))

console.log("Server setup finished")
