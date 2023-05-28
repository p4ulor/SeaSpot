// Module manages application data.
// In this specific module, data is stored in memory
import crypto from 'crypto'
import { Message } from './Message.mjs'

const NUM_MESSAGES = 20

const messages = [
    new Message("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
                new Location(38.7565362672383, -9.11603538108787), 
                6, 61, new Date("2023-05-28T19:27:27.931957874Z")),

    new Message("ttgo-test-g10", "eui-70b3d57ed005bfb0", "260B893E", 
    new Location(38.7565362672383, -9.11603538108787), 
    6, 616263, new Date("2023-05-28T19:27:27.931957874Z")),
    
]

let nextId = 0

/**
 * @param {Message} message 
 */
export async function addMessage(message) {
    messages.push(message)
}

export async function getAllMessages() {
    return messages
}

export async function getMessage(dev_id, app_id) {
    return findMessageAndDoSomething(dev_id, app_id, app => app)
}

export async function deleteAllMessages(dev_id, app_id) {
    messages = messages.filter(message => message.device_id !==dev_id && message.application_id !== app_id)
    return messages
}

export async function deleteMessage(dev_id, app_id) {
    return findMessageAndDoSomething(
        dev_id,
        app_id,
        (m, mIdx) => {
            messages.splice(mIdx, 1)
            return m
        })
}

// Auxiliary functions
function findMessageAndDoSomething(dev_id, app_id, action) {
    const messageIdx = messages.findIndex(m => m.application_id == app_id && m.device_id == dev_id)
    const message = messages[messageIdx]
    if (messageIdx != -1) {
        return action(message, messageIdx)
    }
}

function getNewId() {
    return nextId++
}
