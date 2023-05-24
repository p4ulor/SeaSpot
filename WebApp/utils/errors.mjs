export default {
    INVALID_PARAMETER: (argName, description) => {
        return {
            code: 1,
            message: `Invalid argument ${argName}`,
            description: description
        }
    },
    MESSAGE_NOT_FOUND: (idMessage) => {
        return {
            code: 3,
            message: `Message with id ${idMessage} not found`
        }
    }

}