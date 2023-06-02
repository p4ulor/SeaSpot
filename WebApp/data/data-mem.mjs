// Module manages application data.
// In this specific module, data is stored in memory
import crypto from 'crypto'
import { Message, MessageObj } from './Message.mjs'
import { Location } from './Device.mjs'

const NUM_MESSAGES = 20

const messages = [
    new Message(crypto.randomUUID(), new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                     new Location(38.7565362672383, -9.11603538108787), 
                                                     6, 61, new Date("2023-05-28T19:27:27.931957874Z"))),

    new Message(crypto.randomUUID(), new MessageObj("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                                                     new Location(38.7565362672383, -9.11603538108787), 
                                                     6, 616263, new Date("2023-05-28T19:27:27.931957874Z"))),
    
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

export async function getMessage(dev_id, app_id) {
    return findMessageAndDoSomething(dev_id, app_id, app => app)
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

