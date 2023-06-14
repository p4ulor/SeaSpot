import express from 'express'

import * as codes from '../../utils/errors-and-codes.mjs'
import service from '../../services/services.mjs'
import { extractUplinkInfo } from './bodies/extractUpLinkInfo.mjs'
import { base64ToHex, fetx } from '../../utils/utils.mjs'
import { defautLimit, defautSkip } from '../../services/services.mjs'
import { doesPathContain_Query_or_Path_Params, Param } from '../../utils/path-and-query-params.mjs'
import { Downlink, ScheduleDownlinkObj } from '../../data/ScheduleDownlinkObj.mjs'


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
        path: apiPath+"/messages",
        setQuery: (skip, limit) => { //todo put this in services not here?
            if(!isNaN(limit)) limit = defautLimit
            if(!isNaN(skip)) skip = defautSkip
            return `${apiPath}/messages?${queryParams.skip}=${skip}&${queryParams.limit}=${limit}` 
        }
    },

    getMessage: {
        path: apiPath+"/messages/:id",
        setPath: (id) => { return `${apiPath}/messages/${id}` }
    },

    deleteAllMessages: {
        path: apiPath+"/messages",
        setDevice: (device) => { return `${apiPath}/messages?${queryParams.device}=${device}` }
        //Put more set's 
    },

    deleteMessage: {
        path: apiPath+"/messages/:id",
        setPath: (id) => { return `${apiPath}/messages/${id}` }
    },

    getDevice: {
        path: apiPath+"/device/:id",
        setPath: (id) => { return `${apiPath}/device/${id}` }
    }
}

export default function webApi(config) {

    const services = service(config)
    
    /**
     * This method should be called only be called by TTN
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function upLinkWebHook(req, rsp) {
        console.log(`BODY = ${JSON.stringify(req.body)}\n`)
        console.log(`HEADERS = ${JSON.stringify(req.headers)}\n`)

        const upLinkMessage = extractUplinkInfo(req.body)
        console.log("upLinkWebHook message =", JSON.stringify(upLinkMessage))

        services.addMessage(upLinkMessage)

        //Schedule downlink
        const device_id = upLinkMessage.endDeviceId
        const url = `https://eu1.cloud.thethings.network/api/v3/as/applications/ttgo-test-g10/webhooks/seaspot-webhook/devices/${device_id}/down/replace`
        const body = new ScheduleDownlinkObj([new Downlink(upLinkMessage.payload, upLinkMessage.serviceCharacteristic)])
        console.log("Body =", JSON.stringify(body))
        fetx(url, "POST", body)
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function getAllMessages(req, rsp) {
        const messages = await services.getAllMessages(); // Await the promise to get the result
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
        return await services.deleteAllMessages(req.body.deviceId, req.body.appId)
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp
     */
    async function deleteMessage(req, rsp){
        console.log("deleteMessage()")
        return await services.deleteMessage()
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
        }
    }

    //Aux

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                let body = await handler(req, rsp)
                rsp.status(codes.statusCodes.OK).json(body ? body : {}) //By default all handlers will just return OK if not error occurred
            } catch (e) { //e.code is a property that's added to our list of Exceptions
                console.log("Warning, client got error: ", e)
                if (e.code) rsp.status(e.code).json({ error: e.message })
                else rsp.status(codes.statusCodes.INTERNAL_SERVER_ERROR).json({ error: e.message })
            }
        }
    }

}
