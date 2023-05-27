// Application Entry Point. 
// Registers all HTTP API routes and starts the server

console.log("Start setting up server")

// Dependencies imports
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' //https://expressjs.com/en/resources/middleware/cookie-parser.html

//My files imports
import * as data from './data/data-mem.mjs'
import webServices from './services/services.mjs'
import webApi from './web/api/web-api.mjs'

/** 
 * @param {ServerConfiguration} config 
 * @returns {Promise<Express>}
 */
export function Server(config) { //in order be to be used in tests and be more flexible

    if (!config instanceof ServerConfiguration) throw new Error("A ServerConfig must be provided")

    const PORT = config.port
    const app = express() //(the package uses 'export')


    //Middleware setup
    app.use(cors()) //Allows requests to skip the Same-origin policy and access resources from remote hosts https://blog.knoldus.com/a-guide-to-cors-in-node-js-with-express/#:~:text=start%20to%20learn%3A-,What%20is%20CORS%3F,-CORS%20stands%20for
    app.use(express.json()) //Parses the HTTP request body and puts it in req.body
    app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded, in cases where a POST or GET is performed in the context of a HTML form
    app.use(cookieParser())

    const services = webServices(data)
    const api = webApi(config, services)

    app.post('/api', api.getWebHook)
    app.get('/api/messages', api.getAllMessages)
    app.delete('/api/messages/:id', api.deleteMessage)

    const promise = new Promise((resolve, reject) => {
        app.listen(PORT, () => {
            console.log(`Server listening in http://localhost:${PORT}. dataSource -> ${config.isDataSourceElastic ? "elasticSearch" : "memory"}`)
            resolve(app)
        })
    })

    console.log("End setting up server")

    return promise
}

export class ServerConfiguration {
    /**
     * @param {number} port 
     * @param {boolean} isDataSourceElastic 
     * @param {string} elasticSearchURL
     */
    constructor(port, isDataSourceElastic, elasticSearchURL) {
        if (typeof port != "number" && port > 0) throw new Error("A valid port number must be provided")
        if (isDataSourceElastic) {
            if (typeof elasticSearchURL != "string") throw new Error(`If data source is elastic, a valid elasticSearchURL must be provided. Obtained: ${elasticSearchURL}`)
        }

        this.port = port
        this.isDataSourceElastic = isDataSourceElastic
        this.elasticSearchURL = elasticSearchURL

        this.hostAndPort = `http://localhost:${port}`
    }
}
