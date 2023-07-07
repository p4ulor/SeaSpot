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
import webApi, { apiPaths, docsPath } from './web/api/web-api.mjs'
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
    //app.engine('hbs', hbs({defaultLayout:'layout', extname: 'hbs'})) //optional
    app.set('view engine', 'hbs') 
    hbs.registerPartials('./web/site/views/partials')
    hbs.registerHelper('function_deleteAllMessagesSetPath', function() { //https://handlebarsjs.com/guide/#custom-helpers Note: helpers need to be set here or it doesnt work. The helpers are useful to "import" function to allow us to reference functions in the .hbs files
        return apiPaths.deleteAllMessages.setDevice
    })
    app.set('views', './web/site/views/') 
    app.use(favicon('./web/site/public/favicon.ico'))
    app.use(express.static('./web/site/public'))
    app.use('/js', express.static(path.resolve("./web/site/scripts/").replace(/\\/g, '/'))) //Allows the successful use of <script src="/js/client-fetch.js"></script> inside .hbs files

    //API
    const api = webApi(config)
    app.post(api.upLinkWebHook.path, api.upLinkWebHook.handler) //api/uplink
    app.delete(api.deleteMessage.path, api.deleteMessage.handler) //api/messages/all/{deviceID}
    app.get(api.getMessage.path, api.getMessage.handler) //api/messages/{id}
    app.get(api.getAllMessages.path, api.getAllMessages.handler) //api/messages/
    app.delete(api.deleteAllMessages.path, api.deleteAllMessages.handler) //api/messages/{id}
    app.get(api.getDevice.path, api.getDevice.handler) //api/devices/{id}

    //DOCS
    const swaggerDocument = yaml.load('./docs/openapi.yaml')
    app.use(docsPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    // WEB
    const webSiteRouter = webSite(config)
    app.use('/', webSiteRouter)

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
