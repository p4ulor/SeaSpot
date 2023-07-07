import express from 'express'

import * as codes from './bodies/errors-and-codes.mjs'
import service from '../../services/services.mjs'
import { extractUplinkInfo } from './bodies/extractUpLinkInfo.mjs'
import { base64ToHex, fetx, ourApplicationApiKey } from '../../utils/utils.mjs'
import { defautLimit, defaultSkip } from '../../services/services.mjs'
import { doesPathContain_Query_or_Path_Params, Param } from '../../utils/path-and-query-params.mjs'
import { Downlink, ScheduleDownlinkObj } from '../../data/ScheduleDownlinkObj.mjs'
import errorMessages from './bodies/error-messages.mjs'
import * as bodies from './bodies/req-resp-bodies.mjs'

export const apiPath = "/api"
export const docsPath = apiPath+'/docs'

export const queryParams = {
    skip: "skip",
    limit: "limit",
    device: "device",
    app: "app"
}

export const apiPaths = {

    upLinkWebHook: {
        path: apiPath+"/uplink"
    },

    getAllMessages: {
        path: apiPath+"/messages"
    },

    getMessage: {
        path: apiPath+"/messages/:id",
        setPath: (id) => { return `${apiPath}/messages/${id}` }
    },

    deleteAllMessages: {
        path: apiPath+"/messages/all/:id",
        setDevice: (deviceID) => { return `${apiPath}/messages/all/${deviceID}` }
        //Put more set's 
    },

    deleteMessage: {
        path: apiPath+"/messages/:id",
        setPath: (id) => { return `${apiPath}/messages/${id}` }
    },

    getDevice: {
        path: apiPath+"/devices/:id",
        setPath: (id) => { return `${apiPath}/devices/${id}` }
    }
}

export default function webApi(config) {

    const services = service(config)
    
    /**
     * This method should be called only be called by TTN. When an Uplink is made by a device, TTN will call this method,
     * which will store the message in our DB. After that, we schedule a downlink with the same info, so that other devices
     * can obtain the message
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function upLinkWebHook(req, rsp) {
        console.log(`BODY = ${JSON.stringify(req.body)}\n`)
        console.log(`HEADERS = ${JSON.stringify(req.headers)}\n`)
        if(req.headers["x-downlink-apikey"]!=ourApplicationApiKey)
            throw new codes.Unauthorized(errorMessages.noPermissions(req.headers['user-agent']))

        const upLinkMessage = extractUplinkInfo(req.body)
        console.log("upLinkWebHook message =", JSON.stringify(upLinkMessage))

        services.addMessage(upLinkMessage)

        console.log('Add the uplinked message, will schedule downlink')

        //Schedule downlink
        const device_id = upLinkMessage.endDeviceId
        const url = `https://eu1.cloud.thethings.network/api/v3/as/applications/ttgo-test-g10/webhooks/seaspot-webhook/devices/${device_id}/down/replace`
        //const body = new ScheduleDownlinkObj([new Downlink(upLinkMessage.payload, upLinkMessage.serviceCharacteristic)])
        //console.log("Body =", JSON.stringify(body))

        //fetx(url, "POST", body) //comment this line when testing ttgo while having the webapp running
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function getAllMessages(req, rsp) {
        const [skip, limit] = doesPathContain_Query_or_Path_Params(req, [new Param("skip", true), new Param("limit", true)])
        const messages = await services.getAllMessages(skip, limit); // Await the promise to get the result
        console.log(messages)
        return messages
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function getMessage(req, rsp) {
        console.log("getMessage()")
        const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
        const message = await services.getMessage(id)
        console.log(message)
        return message
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function deleteAllMessages(req, rsp) {
        const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
        return await services.deleteAllMessages(id)
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp
     */
    async function deleteMessage(req, rsp){
        const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
        return await services.deleteMessage(id)
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp
     */
    async function getDevice(req, rsp){
        const [id] = doesPathContain_Query_or_Path_Params(req, [new Param("id")], true)
        return await services.getDevice(id)
    }

    return {
        upLinkWebHook: {
            path: apiPaths.upLinkWebHook.path,
            handler: handleRequest(upLinkWebHook),
        },

        getAllMessages: {
            path: apiPaths.getAllMessages.path,
            handler: handleRequest(getAllMessages)
        },

        getMessage: {
            path: apiPaths.getMessage.path,
            handler: handleRequest(getMessage)
        },

        deleteAllMessages: {
            path: apiPaths.deleteAllMessages.path,
            handler: handleRequest(deleteAllMessages)
        },

        deleteMessage: {
            path: apiPaths.deleteMessage.path,
            handler: handleRequest(deleteMessage)
        },

        getDevice: {
            path: apiPaths.getDevice.path,
            handler: handleRequest(getDevice)
        }
    }

    //Aux

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                let body = await handler(req, rsp)
                rsp.status(codes.statusCodes.OK).json(body ? body : {}) //By default all handlers will just return OK if not error occurred
            } catch (e) { //e.code is a property that's added to our list of Exceptions
                console.log("web-api: Warning, client got error: ", e)
                if (e.code) rsp.status(e.code).json({ error: e.message })
                else rsp.status(codes.statusCodes.INTERNAL_SERVER_ERROR).json({ error: e.message })
            }
        }
    }

}
