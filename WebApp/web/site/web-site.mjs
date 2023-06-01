import express from 'express'
import { apiPath, apiPaths, docsPath } from '../api/web-api.mjs'
import * as service from '../../services/services.mjs'

export const webPages = {
    home: {
        url: "/",
        view: "home.hbs"
    },
    allMessages: {
        url: "/messages",
        view: "messages.hbs",
    },
    messagePage: {
        url: "/messages/:id",
        view: "message.hbs",
        setUrl: (id) => { return `/messages/${id}` }
    },
    pageError: {
        url: "/error",
        view: "error.hbs",
        setUrl: (name) => { return `/error?type=${name}` }
    }
}

/** 
 * @param {server.ServerConfig} config 
 * @return {express.Router} router
 */
function webSite(config){
    const host = config.hostAndPort

    const services = service.default(config)

    const router = express.Router() //Let's us define a fragment of our express app that can be joined with other parts of our app https://expressjs.com/en/5x/api.html#router

    class HandleBarsView {
        /**
         * @param {String} file 
         * @param {Object} options
         */
        constructor(file, title, script) {
            this.file = file
            this.options = {
                title: !title ? "SeaSpot" : title,
                host: host,
                script: script,
                apiPath: apiPath,
                homePath: webPages.home.url,
                docsPath: docsPath,
                messagesPath: webPages.allMessages.url
                /* api: server.apiPath */
            }
        }
    }

    router.get(webPages.home.url, (req, rsp) => {
        tryCatch(() => {
            const view = new HandleBarsView(webPages.home.view, 'Home')

            //Fetch messages
            //const msgs = fetch

            //Populate the partial "messages"
            //view.options.messages = msgs.

            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.get(webPages.allMessages.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.allMessages.view, 'Messages')
            view.options.messages = []
            
            const messages = await services.getAllMessages()
            messages.forEach(message => {
                view.options.messages.push(
                    {
                        messageId : message.id, 
                        applicationId : message.messageObj.applicationId,
                        endDeviceId : message.messageObj.endDeviceId,
                        payload : message.messageObj.payload,
                        receivedAt : message.messageObj.receivedAt,
                        messagePage : webPages.messagePage.setUrl(message.id) //Here, we must pass que message Id that still needs to be created
                    }
                )
            })
            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.get(webPages.messagePage.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.messagePage.view)

            const message = await services.getMessage(req.params.dev_id, req.params.app_id)
            view.options.messagePage = webPages.messagePage.setUrl(message.id)
            view.options.allMessagesPage = webPages.allMessages.url
            view.options.messageId = message.id
            view.options.applicationId = message.messageObj.applicationId
            view.options.endDeviceId = message.messageObj.endDeviceId
            view.options.deviceAddress = message.messageObj.deviceAddress
            view.options.location = message.messageObj.location
            view.options.serviceCharacteristic = message.messageObj.serviceCharacteristic
            view.options.payload = message.messageObj.payload
            view.options.receivedAt = message.messageObj.receivedAt

            view.options.deleteMessageURI = apiPaths.deleteMessage.setPath(message.id)
            rsp.render(view.file, view.options)
        }, rsp)
    })

    //AUXILIARY FUNCTIONS
    /**
     * @param {Function} func 
     * @param {express.Response} rsp 
     */
    async function tryCatch(func, rsp){ //this cuts down 3 lines per api/controller method
        if(typeof func !== 'function') throw new Error("Can't use this function like this. param 'func' must be a function")
        try {
            await func()
        } catch(e) {
            console.log(e)
            redirect(rsp, webPages.pageError.setUrl(encodeURIComponent(`${e.name}: ${e.message}`))) //https://stackoverflow.com/a/19038048
        }
    }

    /**
     * @param {express.Response} resp 
     * @param {string} url 
     */
    function redirect(resp, url){
        resp.setHeader('Location', url) // OR -> resp.redirect(`/`)
            .status(302).end()
    }

    return router

}

export default webSite