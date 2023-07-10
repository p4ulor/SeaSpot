// Module that implements all messages management logic
let dataMem = await import('../data/data-mem.mjs') //await before import was causing problems in linux
import { Message, MessageObj } from '../data/Message.mjs'
import errorMsgs from '../web/api/bodies/error-messages.mjs'
import elasticDB from '../data/data-elastic.mjs'
import * as utils from '../utils/utils.mjs'
import { DeviceObj } from '../data/Device.mjs'
import { Characteristic, service_characteristics } from '../data/services-characteristics.mjs'
import { Location } from '../data/Location.mjs'
import { UpLinkInfo } from '../web/api/bodies/extractUpLinkInfo.mjs'
import { messages } from '../data/data-mem.mjs'

export const defaultSkip = 0
export const defautLimit = 10
const maxLimit = 100

/** @param {ServerConfig} config */
export default function service(config) {

    let data = dataMem //just to have intelissense during development. The await keyword is still necessary in most cases (because when using elasticsearch), even though the IDE says its not
    if(config.isDataSourceElastic) data = elasticDB(config)

    /**
     * Adds the message to our DB and also updates the field of the Device that corresponds to this message value
     * @param {UpLinkInfo} upLinkInfo 
     */
    async function addMessage(upLinkInfo) {
        let dev
        const devID = upLinkInfo.msg.endDeviceId
        try {
            dev = await getDevice(devID)
        } catch(e){ //if device doesn't exist, create it
            const devObj = new DeviceObj(upLinkInfo.msg.applicationId, upLinkInfo.msg.deviceAddress)
            await addDevice(devID, devObj)
        }
        //Ignore the commented code because it will always update the location everytime a location is sent
        /* if(upLinkInfo.ttnDecodedPayload!=undefined){
            if(upLinkInfo.msg.characteristic==service_characteristic.ID_LOCATION){
                const loc = upLinkInfo.ttnDecodedPayload
                const location = new Location(loc.latitude, loc.longitude)
                await updateDeviceRaw(devID, service_characteristic.ID_LOCATION, location)
            }
        } 
        else 
        */
        const char_loc = service_characteristics.ID_LOCATION
        await updateDeviceRaw(devID, char_loc, upLinkInfo.msg.location) //Update location everytime a msg is recieved
        if(char_loc!=upLinkInfo.msg.characteristic) //if the message itself, was the location, no need to update the device details again
            await updateDevice(devID, upLinkInfo.msg.characteristic, upLinkInfo.msg.payload)
        return await data.addMessage(upLinkInfo.msg)
    }

    /**
     * @param {Int} skip 
     * @param {Int} limit
     * @param {Int | undefined} characteristic dont forget to validate this param
     * @returns 
     */
    async function getAllMessages(skip, limit, characteristic) {
        console.log("Services getAllMessages() skip", skip, "limit", limit)
        const paging = utils.validatePaging(skip, limit, defaultSkip, defautLimit, maxLimit)
        const charac = utils.getCharacteristicID(characteristic, true)
        return await data.getAllMessages(null, null, paging.skip, paging.limit, charac)
    }

    async function getMessage(id) {
        console.log("Services getMessage()")
        return await data.getMessage(id)
    }

    /**
     * @param {String} dev_id 
     */
    async function deleteAllMessages(dev_id) {
        const deletedAll = await data.deleteAllMessages(dev_id)
        console.log("deleteAllMessages() ->", deletedAll)
        return deletedAll
    }

    async function deleteMessage(id) {
        return data.deleteMessage(id)
    }

    ///////////////////// DEVICES /////////////////////

    /**
     * Not in use
     * @param {String} id
     * @param {DeviceObj} deviceObj
     * @returns {String} id of the device created
     */
    async function addDevice(id, deviceObj){
        return data.addDevice(id, deviceObj)
    }

    /**
     * @param {String} id
     * @returns {Device}
     */
    async function getDevice(id){
        return data.getDevice(id)
    }

    /**
     * Given the payload, converts it to ascii
     * @param {String} endDeviceID 
     * @param {Characteristic} characteristic 
     * @param {String} payload 
     */
    async function updateDevice(endDeviceID, characteristic, payload){
        payload = payload.replaceAll(' ','')
        const value = utils.hexToASCII(payload)
        const newData = {endDeviceID, characteristic, value}
        console.log("Updating device info ->", JSON.stringify(newData))
        return data.updateDevice(endDeviceID, characteristic, value)
    }

    /**
     * Exceptional to set device characteristics. Converts the payload to ASCII. This method does not
     * @param {String} endDeviceID 
     * @param {Characteristic} characteristic
     * @param {Object} value 
     */
    async function updateDeviceRaw(endDeviceID, characteristic, value){
        console.log("Updating device info ->", JSON.stringify(value))
        await data.updateDevice(endDeviceID, characteristic, value)
    }

    /**
     * Not in use
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

        addDevice,
        getDevice,
        updateDevice,
        updateDeviceLocation: updateDeviceRaw,
        //deleteDevice
    }
} 
