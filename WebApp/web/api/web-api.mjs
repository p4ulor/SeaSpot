import express from 'express'
import * as codes from '../../utils/errors-and-codes.mjs'
import { UplinkResponseModel } from './UplinkResponseModel.mjs'
import { DownlinkQueuedResponseModel } from './DownlinkQueuedResponseModel.mjs'
export const apiPath = "/api"

export const apiPaths = {
    mainWebHook: apiPath + '/'
}

function api(config) {

    /**
     * @param {express.Request} req 
     * @param {express.Response} rsp 
     */
    async function mainWebHook(req, rsp) {
        tryCatch(async () => {
            const { body } = req;

            // Check if the request contains an uplink message
            if (body.uplink_message) {
                const uplinkModel = UplinkResponseModel(body);
                console.log('Received Uplink:');
                console.log(uplinkModel);
                console.log(`PAYLOAD = ${base64ToHex(JSON.stringify(uplinkModel.uplink.frmPayload))}`)
            }

            // Check if the request contains a downlink message
            if (body.downlink_queued) {
                const downlinkModel = DownlinkQueuedResponseModel(body);
                console.log('Received Downlink:');
                console.log(downlinkModel);
                console.log(`PAYLOAD = ${base64ToHex(JSON.stringify(downlinkModel.downlinkQueued.frmPayload))}`)
            }

            rsp.status(codes.statusCodes.OK).json({ ok: "okay" })
        }, rsp)
    }

    /**
     * Converting payload received as base64 to hexadecimal
     * @param {express.Request.body}
     */
    function base64ToHex(payload) {
        const buffer = Buffer.from(payload, 'base64')
        return buffer.toString('hex')
    }

    return {
        mainWebHook: {
            path: apiPaths.mainWebHook,
            func: mainWebHook
        }
    }

}

async function tryCatch(func, rsp) { //this cuts down 3 lines per api/controller method
    if (typeof func !== 'function') throw new Error("Can't use this function like this. param 'func' must be a function")
    try {
        await func()
    } catch (e) { //e.code is a property that's added to our list of Exceptions
        if (e.code) rsp.status(e.code).json({ error: e.message })
        else rsp.status(codes.statusCodes.INTERNAL_SERVER_ERROR).json({ error: e.message })
    }
}



export default api