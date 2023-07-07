// Module manages application data.
// In this specific module, data is stored in memory
import crypto from 'crypto'
import { Message, MessageObj } from './Message.mjs'
import { Device, DeviceObj } from './Device.mjs'
import { Location } from "./Location.mjs"
import { service_characteristic } from './services-characteristics.mjs'
import { NotFound } from '../web/api/bodies/errors-and-codes.mjs'
import * as utils from '../utils/utils.mjs'
import errorMsgs from '../web/api/bodies/error-messages.mjs'

export let messages = [
    new Message("5c659dbc-81d8-4759-a41b-6d6276bae1b9", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.75625860392359, -9.115897715091707), 
                                                        service_characteristic.ID_BROADCAST_STRING, 
                                                        "61", new Date("2023-05-28T19:27:27.931957874Z"))),

    new Message("33e9fbbd-5fa4-42ab-abd6-6fb5ffa415a9", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.75625860392359, -9.115897715091707), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        "61 62 63", new Date("2023-05-28T19:27:27.931957874Z"))),

    new Message("ed19bc3a-19e0-4683-82b2-a162d8d1c5ed", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.75625860392359, -9.115897715091707), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        "64 65 66", new Date("2023-06-01T19:27:27.931957874Z"))),

    new Message("47c87c28-31fe-4a97-8a18-62a8d312a41b", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.75625860392359, -9.115897715091707), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        "67 68 69", new Date("2023-06-02T19:27:27.931957874Z"))),
]

export const devices = [
    new Device("eui-70b3d57ed005bfb0", 
        new DeviceObj("ttgo-test-g10", "260B893E", new Location(38.75588946079549, -9.117440528717083), 
        "SeaSpot", 51, "+351 960 000 000", "Olá, SOS", new Date("2023-06-02T19:27:27.931957874Z")
        )
    )
]

///////////////////// MESSAGES /////////////////////

/**
 * @param {MessageObj} messageObj 
 */
export async function addMessage(messageObj) {
    const id = crypto.randomUUID()
    const newMessage = new Message(id, messageObj)
    messages.push(newMessage)
    return id
}

/**
 * @param {String} dev_id
 * @param {String} app_id
 * @param {Int} skip
 * @param {Int} limit
 * @returns {Array<Message>} 
 */
export async function getAllMessages(dev_id, app_id, skip, limit) {
    const msgs = messages.slice(skip, skip+limit) 
    if(dev_id || app_id){
        return msgs.filter((m) => {
            return m.messageObj.deviceAddress==dev_id && m.messageObj.applicationId==app_id
        })
    }
    else return msgs
}

/**
 * @param {String} id unique crypto.uuid()
 * @returns {Message}
 * @throws {NotFound}
 */
export async function getMessage(id) {
    const message = messages.find(message => {
        return message.id==id
    })
    if(! message) throw new NotFound(errorMsgs.messageNotFound(id))
    return message
}

/**
 * @param {String} dev_id
 * @returns {Boolean} true if elements were deleted
 */
export async function deleteAllMessages(dev_id) {
    const beforeDeletionLength = messages.length
    messages = messages.filter(message => message.messageObj.endDeviceId !== dev_id)
    return messages.length!=beforeDeletionLength
}

/**
 * @param {String} id
 * @returns {Boolean} true on success
 */
export async function deleteMessage(id) {
    const messageIdx = messages.findIndex(m => id == m.id)
    if (messageIdx != -1) {
        messages.splice(messageIdx, 1)
        return
    }
    throw new NotFound(errorMsgs.messageDeletionFail(id))
}

///////////////////// DEVICES /////////////////////

/**
 * @param {String} id
 * @param {DeviceObj} deviceObj
 * @returns {String} id of the device created
 */
export async function addDevice(id, deviceObj) {
    const newDevice = new Device(id, deviceObj)
    devices.push(newDevice)
    return id
}

/**
 * @param {String} id
 * @returns {Device}
 * @throws {NotFound}
 */
export async function getDevice(id){
    return getDeviceThrowable(id)
}

/**
 * @param {String} endDeviceID 
 * @param {service_characteristic} service_characteristic 
 * @param {String} value 
 */
export async function updateDevice(endDeviceID, service_characteristic, value){
    const device = getDeviceThrowable(endDeviceID)
    device.deviceObj.setCharacteristic(service_characteristic, value)
}

/**
 * @param {String} id
 * @throws {NotFound}
 */
export async function deleteDevice(id){
    const messageIdx = messages.findIndex(m => id == m.id)
    if (messageIdx != -1) {
        messages.splice(messageIdx, 1)
        return
    }
    throw new NotFound(errorMsgs.deviceDeletionFail(id))
}

/**
 * @param {String} id 
 * @returns {Device}
 * @throws {NotFound}
 */
function getDeviceThrowable(id){
    const device = devices.find(dev => {
        return dev.id==id
    })
    if(! device) throw new NotFound(errorMsgs.deviceNotFound(id))
    return device
}

