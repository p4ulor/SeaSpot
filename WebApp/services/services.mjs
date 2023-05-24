// Module that implements all messages management logic

import errors from '../utils/errors.mjs'

export default function (data) {
    // Validate arguments
    if (!data) {
        throw errors.INVALID_PARAMETER('Data')
    }

    return {
        getAllMessages: getAllMessages,
        getMessage: getMessage,
        deleteMessage: deleteMessage,
        createMessage: createMessage,
    }

    async function getAllMessages() {
        return data.getAllMessages()
    }


    async function getMessage(d_id, app_id) {
        const message = await data.getMessage(d_id, app_id)
        if (message) {
            return message
        }
        throw errors.MESSAGE_NOT_FOUND(app_id)
    }


    async function deleteMessage(d_id, app_id) {
        return data.deleteMessage(d_id, app_id)
    }

    async function createMessage(message, d_id, app_id, m_type) {
        return data.createMessage(message, d_id, app_id, m_type)
    }
} 
