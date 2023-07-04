// Module that implements all messages management logic
let dataMem = await import('../data/data-mem.mjs') //await before import was causing problems in linux
import { Message } from '../data/Message.mjs'
import errorMsgs from '../utils/error-messages.mjs'
import { NotFound } from '../utils/errors-and-codes.mjs'
import elasticDB from '../data/data-elastic.mjs'

export const defautSkip = 0
export const defautLimit = 10

/** @param {ServerConfig} config */
export default function service(config) {

    let data = dataMem //just to have intelissense during development
    if(config.isDataSourceElastic) data = elasticDB(config)

    /**
     * @param {Message} message 
     */
    async function addMessage(message) {
        return await data.addMessage(message)
    }

    async function getAllMessages(skip, limit) {
        let s = skip
        let l = limit
        if(! skip || skip < 0) s = defautSkip
        if(! limit || limit < 0) l = defautLimit
        return data.getAllMessages(null, null, s, l)
    }

    async function getMessage(id) {
        return await data.getMessage(id)
    }

    async function deleteAllMessages(dev_id, app_id) {
        return data.deleteAllMessages(dev_id, app_id)
    }

    async function deleteMessage(id) {
        return data.deleteMessage(id)
    }

    /**
     * Not in use
     * @param {DeviceObj} deviceObj
     * @returns {String} id of the device created
     */
    async function addDevice(deviceObj){
        return data.addDevice(deviceObj)
    }

    /**
     * @param {String} id
     * @returns {Device}
     */
    async function getDevice(id){
        return data.getDevice(id)
    }

    /**
     * Not in use
     * @param {String} id
     */
    async function deleteDevice(id){
        return data.deleteDevice(id)
    }

    return {
        addMessage,
        getAllMessages,
        getMessage,
        deleteAllMessages,
        deleteMessage,

        //addDevice
        getDevice
        //deleteDevice
    }
} 
