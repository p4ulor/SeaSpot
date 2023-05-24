// Module manages application data.
// In this specific module, data is stored in memory

const NUM_MESSAGES = 20

let messages = new Array(NUM_MESSAGES)

let nextId = 0

export async function createMessage(message, d_id, app_id, m_type) {
    let newMessage = {
        id: getNewId(),
        payload: message,
        device_id: d_id,
        application_id: app_id,
        message_type: m_type
    }
    messages.push(newMessage)
    return newMessage
}

export async function getAllMessages() {
    return messages
}

export async function getMessage(d_id, app_id) {
    return findMessageAndDoSomething(d_id, app_id, app => app)
}

export async function deleteMessage(d_id, app_id) {
    return findMessageAndDoSomething(
        d_id,
        app_id,
        (m, mIdx) => {
            messages.splice(mIdx, 1)
            return m
        })
}

// Auxiliary functions
function findMessageAndDoSomething(d_id, app_id, action) {
    const messageIdx = messages.findIndex(m => m.application_id == app_id && m.device_id == d_id)
    const message = messages[messageIdx]
    if (messageIdx != -1) {
        return action(message, messageIdx)
    }
}

function getNewId() {
    return nextId++
}
