import express from 'express'
import { apiPath, apiPaths, docsPath } from '../api/web-api.mjs'
import * as service from '../../services/services.mjs'
import { doesPathContain_Query_or_Path_Params, Param } from '../../utils/path-and-query-params.mjs'
import { strTobase64 } from '../../utils/utils.mjs'

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
    messageDelete: {
        url: "/messages/:id/delete"
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
function webSite(config) {
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
                script: script,

                host: host,
                apiPath: apiPath,
                homePath: webPages.home.url,
                docsPath: docsPath,
                messagesPath: webPages.allMessages.url,
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
            view.options.allMessagesPage = webPages.allMessages.url

            const messages = await services.getAllMessages()

            messages.forEach(message => {
                view.options.messages.push(
                    {
                        messageId: message.id,
                        applicationId: message.messageObj.applicationId,
                        endDeviceId: message.messageObj.endDeviceId,
                        payload: message.messageObj.payload,
                        payloadStr: strTobase64(message.messageObj.payload.replace(" ", "")),
                        receivedAt: message.messageObj.receivedAt,
                        messagePage: webPages.messagePage.setUrl(message.id), //Here, we must pass que message Id that still needs to be created
                        deleteMessageURI: apiPaths.deleteMessage.setPath(message.id)
                    }
                )
            })

            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.get(webPages.messagePage.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.messagePage.view)

            const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
            const m = await services.getMessage(id)
            view.options.messagePage = webPages.messagePage.setUrl(m.id)
            view.options.allMessagesPage = webPages.allMessages.url
            view.options.messageId = m.id
            view.options.applicationId = m.messageObj.applicationId
            view.options.endDeviceId = m.messageObj.endDeviceId
            view.options.deviceAddress = m.messageObj.deviceAddress
            view.options.location = m.messageObj.location
            view.options.serviceCharacteristic = m.messageObj.serviceCharacteristic
            view.options.payload = m.messageObj.payload
            view.options.receivedAt = m.messageObj.receivedAt

            view.options.deleteMessageURI = apiPaths.deleteMessage.setPath(m.id)
            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.post(webPages.messageDelete.url, (req, rsp) => {
        tryCatch(async () => {
            const m = await services.deleteMessage(req.params.id)
            rsp.redirect(webPages.allMessages.url)
        }, rsp)
    })

    //AUXILIARY FUNCTIONS

    /**
     * @param {Function} func 
     * @param {express.Response} rsp 
     */
    async function tryCatch(func, rsp) { //this cuts down 3 lines per api/controller method
        if (typeof func !== 'function') throw new Error("Can't use this function like this. param 'func' must be a function")
        try {
            await func()
        } catch (e) {
            console.log(e)
            redirect(rsp, webPages.pageError.setUrl(encodeURIComponent(`${e.name}: ${e.message}`))) //https://stackoverflow.com/a/19038048
        }
    }

    /**
     * @param {express.Response} resp 
     * @param {string} url 
     */
    function redirect(resp, url) {
        resp.setHeader('Location', url) // OR -> resp.redirect(`/`)
            .status(302).end()
    }

    return router

}

export default webSite