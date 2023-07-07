export default {
    noPermissions: (client) => {
        return `Client ${client} doesn't have permission to perform this request`
    },

    messageNotFound: (idMessage) => {
        return `Message with id ${idMessage} not found`
    },

    messageDeletionFail: (idMessage) => {
        return `Deletion of message with id ${idMessage} failed`
    },

    deviceNotFound: (idDevice) => {
        return `Device with id ${idDevice} not found`
    },

    deviceDeletionFail: (idDevice) => {
        return `Deletion of device with id ${idDevice} failed`
    },

    idNotProvided: (path) => {
        return `id at ${path} not provided`
    }
}