import express from 'express'
import { apiPath, apiPaths, docsPath } from '../api/web-api.mjs'
import * as service from '../../services/services.mjs'
import { doesPathContain_Query_or_Path_Params, Param } from '../../utils/path-and-query-params.mjs'
import { dateToString, hexToASCII, strTobase64 } from '../../utils/utils.mjs'
import { service_characteristics } from '../../data/services-characteristics.mjs'

const DEFAULT_ITEMS_PAGE_LIMIT = 2

export const webPages = {
    home: {
        url: "/",
        view: "home.hbs"
    },
    allMessages: {
        url: "/messages",
        view: "messages.hbs",
        queryParams: {
            page: "page",
            characteristic: "characteristic"
        }
    },
    messagePage: {
        url: "/messages/:id",
        view: "message.hbs",
        setUrl: (id) => { return `/messages/${id}` }
    },
    messageDelete: {
        url: "/messages/:id/delete"
    },
    devicePage: {
        url: "/devices/:id",
        view: "device.hbs",
        setUrl: (id) => { return `/devices/${id}` }
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
         * @param {Object} script
         * @param {Object} queries
         */
        constructor(file, title, script, queries) {
            this.file = file
            this.options = {
                title: !title ? "SeaSpot" : title,
                script: script,

                host: host,
                apiPath: apiPath,
                homePath: webPages.home.url,
                docsPath: docsPath,
                messagesPath: webPages.allMessages.url,
                queries: queries
            }
        }
    }

    router.get(webPages.home.url, (req, rsp) => {
        tryCatch(() => {
            const view = new HandleBarsView(webPages.home.view, 'Home')
            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.get(webPages.allMessages.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.allMessages.view, 'Messages', null, {
                characteristic: webPages.allMessages.queryParams.characteristic,
                page: webPages.allMessages.queryParams.page
            })
            view.options.messages = []

            view.options.pageNumber = req.query.page==undefined ? 1 : new Number(req.query.page)+1
            const skip = new Number(view.options.pageNumber) * DEFAULT_ITEMS_PAGE_LIMIT - DEFAULT_ITEMS_PAGE_LIMIT
            
            const characteristic = req.query[webPages.allMessages.queryParams.characteristic] //TODO
            console.log("Characteristic query param:", characteristic)
            
            const messages = await services.getAllMessages(skip, DEFAULT_ITEMS_PAGE_LIMIT, characteristic)

            //view.options.submitUrl = webPages.allMessages.url

            view.options.characteristics = [undefined]
            Object.values(service_characteristics).forEach(v => {
                view.options.characteristics.push(v)
            })

            messages.forEach(message => {
                const trimMessage = message.messageObj.payload.replaceAll(' ','')

                view.options.messages.push(
                    {
                        messageId: message.id,
                        messagePage: webPages.messagePage.setUrl(message.id),
                        endDeviceId: message.messageObj.endDeviceId,
                        endDevicePage: webPages.devicePage.setUrl(message.messageObj.endDeviceId),

                        characteristic: message.messageObj.characteristic.inString,

                        payload: message.messageObj.payload.replaceAll(' ',', '),
                        payloadASCII: hexToASCII(trimMessage),
                        payloadStr: strTobase64(trimMessage),

                        receivedAt: dateToString(message.messageObj.receivedAt),
                        deleteMessageURI: apiPaths.deleteMessage.setPath(message.id)
                    }
                )
            })

            view.options.refreshPath = webPages.allMessages.url

            rsp.render(view.file, view.options)

        }, rsp)
    })

    router.get(webPages.messagePage.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.messagePage.view)

            const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
            const m = await services.getMessage(id)

            view.options.messageId = m.id
            view.options.messagePage = webPages.messagePage.setUrl(m.id)
            view.options.endDeviceId = m.messageObj.endDeviceId,
            view.options.endDevicePage = webPages.devicePage.setUrl(m.messageObj.endDeviceId)
            
            view.options.applicationId = m.messageObj.applicationId
            view.options.endDeviceId = m.messageObj.endDeviceId
            view.options.deviceAddress = m.messageObj.deviceAddress

            const loc = m.messageObj.location
            view.options.location = {
                latitude: loc.latitude.value ? loc.latitude.value : "Not obtained",
                longitude: loc.longitude.value ? loc.longitude.value : "Not obtained"
            }    

            view.options.characteristic = m.messageObj.characteristic.inString

            const trimMessage = m.messageObj.payload.replaceAll(' ','')
            view.options.payload = m.messageObj.payload
            view.options.payloadASCII = hexToASCII(trimMessage),
            view.options.payloadStr = strTobase64(trimMessage),

            view.options.receivedAt = dateToString(m.messageObj.receivedAt)

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

    router.get(webPages.devicePage.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.devicePage.view)

            const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
            const dev = await services.getDevice(id)

            view.options.endDeviceID = dev.id

            view.options.applicationId = dev.deviceObj.applicationId
            view.options.deviceAdress = dev.deviceObj.deviceAdress
            
            const loc = dev.deviceObj.location.value
            view.options.location = {
                latitude: loc.latitude.value ? loc.latitude.value : "Not obtained",
                longitude: loc.longitude.value ? loc.longitude.value : "Not obtained"
            }  
            
            view.options.name = dev.deviceObj.name.value
            view.options.batteryLevel = dev.deviceObj.batteryLevel.value
            view.options.phone = dev.deviceObj.phone.value
            view.options.string = dev.deviceObj.string.value

            view.options.latestUpdate = dateToString(dev.deviceObj.latestUpdate)

            rsp.render(view.file, view.options)
        }, rsp)
    })

    router.get(webPages.pageError.url, (req, rsp) => {
        tryCatch(async () => {
            const view = new HandleBarsView(webPages.pageError.view, null)
            console.log(`Encoded query.type error = ${req.query.type}`)
            if(req.query) view.options.msg = decodeURIComponent(req.query.type)
            else view.options.msg = "Internal Server Error"
            rsp.render(view.file, view.options)
        })
    })

    router.get('*', function(req, rsp){
        tryCatch(() => {
            redirect(rsp, webPages.pageError.setUrl(encodeURIComponent(`Page not found`)))
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
            console.log("web-site: Warning, client got error: ", e)
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