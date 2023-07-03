export default {
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
}