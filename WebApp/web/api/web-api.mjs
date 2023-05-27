import express from 'express'
import * as codes from '../../utils/errors-and-codes.mjs'
import { UplinkResponseModel } from './UplinkResponseModel.mjs'
import { DownlinkQueuedResponseModel } from './DownlinkQueuedResponseModel.mjs'

export default function (config, services) {
    
    // Validate argument
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getWebHook: handleRequest(getWebHook),
        getAllMessages: handleRequest(getAllMessages),
        deleteMessage: handleRequest(deleteMessage)
    }

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function getWebHook(req, rsp) {
        const { body } = req;

        /* */
            const linkModel = (body.uplink_message ? UplinkResponseModel(body) : 
                                                 DownlinkQueuedResponseModel(body))
        
            services.createMessage((linkModel.uplink ? linkModel.uplink.frmPayload : linkModel.downlinkQueued.frmPayload),
                                    linkModel.deviceId,
                                    linkModel.applicationId,
                                    linkModel.correlationIds)
        
            console.log(base64ToHex(linkModel.uplink.frmPayload))
        
        /*  Same code, but better
        
            // Check if the request contains an uplink message
            if (body.uplink_message) {
                const uplinkModel = UplinkResponseModel(body);
                console.log('Received Uplink:');
                //console.log(uplinkModel);
                //console.log(`PAYLOAD = ${base64ToHex(JSON.stringify(uplinkModel.uplink.frmPayload))}`)
                services.createMessage(uplinkModel.uplink.frmPayload, uplinkModel.deviceId, uplinkModel.applicationId, uplinkModel.correlationIds)
            }
            // Check if the request contains a downlink message
            if (body.downlink_queued) {
                const downlinkModel = DownlinkQueuedResponseModel(body);
                console.log('Received Downlink:');
                //console.log(downlinkModel);
                //console.log(`PAYLOAD = ${base64ToHex(JSON.stringify(downlinkModel.downlinkQueued.frmPayload))}`)
                services.createMessage(downlinkModel.downlinkQueued.frmPayload, downlinkModel.deviceId, downlinkModel.applicationId, downlinkModel.correlationIds)
            }
        
        */

        return { success: true }
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
    async function deleteMessage(req, rsp) {
        const messageToDelete = {messageId: req.params.id, 
                                 messageApp: 'ttgo-test-g10'} //TODO: substitute to -> req.body.message_app
        return await services.deleteMessage(messageToDelete)
    }

    /**
     * Converting payload received as base64 to hexadecimal
     * @param {express.Request.body}
     */
    function base64ToHex(payload) {
        const buffer = Buffer.from(payload, 'base64')
        return buffer.toString('hex')
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                let body = await handler(req, rsp)
                rsp.status(codes.statusCodes.OK).json(body)
            } catch (e) {
                if (e.code) rsp.status(e.code).json({ error: e.message })
                else rsp.status(codes.statusCodes.INTERNAL_SERVER_ERROR).json({ error: e.message })
            }
        }
    }

}
