// Module manages application data.
// In this specific module, data is stored in memory
import crypto from 'crypto'
import { Message, MessageObj } from './Message.mjs'
import { Device, DeviceObj, Location } from './Device.mjs'
import { service_characteristic } from './services-characteristics.mjs'

const messages = [
    new Message("5c659dbc-81d8-4759-a41b-6d6276bae1b9", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.7565362672383, -9.11603538108787), 
                                                        service_characteristic.ID_BROADCAST_STRING, 
                                                        61, new Date("2023-05-28T19:27:27.931957874Z"))),

    new Message("33e9fbbd-5fa4-42ab-abd6-6fb5ffa415a9", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.7565362672383, -9.11603538108787), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        616263, new Date("2023-05-28T19:27:27.931957874Z"))),

    new Message("ed19bc3a-19e0-4683-82b2-a162d8d1c5ed", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.7565362672383, -9.11603538108787), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        646566, new Date("2023-06-01T19:27:27.931957874Z"))),

    new Message("47c87c28-31fe-4a97-8a18-62a8d312a41b", new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                        new Location(38.7565362672383, -9.11603538108787), 
                                                        service_characteristic.ID_BROADCAST_STRING,
                                                        676869, new Date("2023-06-02T19:27:27.931957874Z"))),
]

const devices = [
    new Device("eui-70b3d57ed005bfb0", 
        new DeviceObj("ttgo-test-g10", "260B893E", new Location(38.7565362672383, -9.11603538108787),
        "SeaSpot", 51, "+361 968", "CDE", new Date("2023-06-02T19:27:27.931957874Z")
        )
    )
]

/**
 * @param {Message} message 
 */
export async function addMessage(message) {
    const newMessage = new Message(crypto.randomUUID(), message)
    messages.push(newMessage)
}

export async function getAllMessages() {
    return messages
}

/**
 * @returns {Message} 
 */
export async function getMessage(id) {
    return messages.find(message => {
        return message.id==id
    })
}

export async function deleteAllMessages(dev_id, app_id) {
    messages = messages.filter(message => message.endDeviceId !==dev_id && message.applicationId !== app_id)
    return messages
}

export async function deleteMessage(id, dev_id, app_id) {
    const messageIdx = messages.findIndex(m => id == m.id && dev_id == m.endDeviceId && app_id == m.applicationId)
    if (messageIdx != null) {
        messages.splice(messageIdx, 1)
        return true
    }
    return false
    
    /*
    return findMessageAndDoSomething(
        dev_id,
        app_id,
        (m, mIdx) => {
            messages.splice(mIdx, 1)
            return m
        })
    */
}

// Auxiliary functions
function findMessageAndDoSomething(dev_id, app_id, action) {
    const messageIdx = messages.findIndex(m => m.applicationId == app_id && m.deviceId == dev_id)
    const message = messages[messageIdx]
    if (messageIdx != -1) {
        return action(message, messageIdx)
    }
}

