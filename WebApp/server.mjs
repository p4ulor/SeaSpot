// Application Entry Point. 
// Registers all HTTP API routes and starts the server

console.log("Start setting up server")

// Dependencies imports
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import hbs from 'hbs'
import favicon from 'serve-favicon'

//My files imports
import * as data from './data/data-mem.mjs'
import webServices from './services/services.mjs'

//Web
import webApi, { apiPaths } from './web/api/web-api.mjs'
import webSite from './web/site/web-site.mjs'

//Docs
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'

//Node
import * as path from 'node:path'

/** 
 * @param {ServerConfiguration} config 
 * @returns {Promise<Express>}
 */
export function Server(config) { //in order be to be used in tests and be more flexible

    if (!config instanceof ServerConfiguration) throw new Error("A ServerConfig must be provided")

    const PORT = config.port
    const app = express()

    //Middleware setup
    app.use(cors()) //Allows requests to skip the Same-origin policy and access resources from remote hosts
    app.use(express.json()) //Parses the HTTP request body and puts it in req.body
    app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded, in cases where a POST or GET is performed in the context of a HTML form
    app.use(cookieParser())

    //View's setup
    app.set('view engine', 'hbs')
    hbs.registerPartials('./web/site/views/partials')
    app.set('views', './web/site/views/') 
    app.use(favicon('./web/site/public/favicon.ico'))
    app.use(express.static('./web/site/public'))
    app.use('/js', express.static(path.resolve("./web/site/scripts/").replace(/\\/g, '/'))) //Allows the successful use of <script src="/js/client-fetch.js"></script> inside .hbs files

    //API
    const api = webApi(config)
    app.post(api.upLinkWebHook.path, api.upLinkWebHook.handler)
    app.get(api.getMessage.path, api.getMessage.handler)
    app.get(api.getAllMessages.path, api.getAllMessages.handler)
    app.delete(api.deleteAllMessages.path, api.deleteAllMessages.handler)
    app.delete(api.deleteMessage.path, api.deleteMessage.handler)

    // WEB
    const webSiteRouter = webSite(config)
    app.use('/', webSiteRouter)

    //DOCS
    const swaggerDocument = yaml.load('./Docs/openapi.yaml')
    //app.use(api.docsPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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
