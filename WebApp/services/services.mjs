// Module that implements all messages management logic
let dataMem = await import('../data/data-mem.mjs')
import { Message } from '../data/Message.mjs'
import errorMsgs from '../utils/error-messages.mjs'
import { NotFound } from '../utils/errors-and-codes.mjs'
import elasticDB from '../data/data-elastic.mjs'

export const defautSkip = 10
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

    async function getAllMessages() {
        return data.getAllMessages()
    }

    async function getMessage(dev_id, app_id) {
        try {
            return await data.getMessage(dev_id, app_id)
        } catch(e) { throw e }
    }

    async function deleteAllMessages(dev_id, app_id) {
        return data.deleteAllMessages(dev_id, app_id)
    }

    async function deleteMessage(id) {
        return data.deleteMessage(id)
    }

    /**
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
    }
} 
