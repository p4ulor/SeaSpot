import { BadRequest, Conflict, Forbidden, NotFound, ServerError } from '../web/api/bodies/errors-and-codes.mjs'
import { Message, MessageObj } from './Message.mjs';
import { Device, DeviceObj } from './Device.mjs';
import elasticFetch, { searchObjToObjArray } from '../utils/elastic-fetch.mjs'
import * as bodies from '../web/api/bodies/req-resp-bodies.mjs'
import * as utils from '../utils/utils.mjs'
import errorMsgs from '../web/api/bodies/error-messages.mjs'
import { Characteristic } from './services-characteristics.mjs';
let dataMem = await import('../data/data-mem.mjs') //to insert sample data

var indexedCreated = false
const insertSampleData = true

/** 
 * Note: It's not recommended to throw exceptions inside .then() statements because they wont be catched, use await instead
 * @param {ServerConfig} config 
 * */
function elasticDB(config){

    const elasticFetx = elasticFetch(config)

    const ourIndexes = {
        devices: "devices",
        messages: "messages"
    }

    function addSampleDataMessages(){
        dataMem.messages.forEach(msg => {
            elasticFetx.createDocWithID(ourIndexes.messages, msg.messageObj, msg.id)
        })
    }

    function addSampleDataDevices(){
        dataMem.devices.forEach(dev => {
            elasticFetx.createDocWithID(ourIndexes.devices, dev.deviceObj, dev.id)
        })
    }
    
    function createOurIndexes(){
        Object.values(ourIndexes).forEach(async indexName => {
            console.log("Will create index", indexName, "if it doesn't exist")
            await elasticFetx.doesIndexExist(indexName).then(async doesExist =>{
                if(! doesExist){
                    await elasticFetx.createIndex(indexName)
                    console.log("created index:", indexName)
                     if(insertSampleData){
                        try {
                            if(indexName==ourIndexes.messages) addSampleDataMessages()
                            if(indexName==ourIndexes.devices) addSampleDataDevices()
                        } catch(e){}
                    }
                }
            })
        })
        indexedCreated = true
    }

    if(! indexedCreated) createOurIndexes()

    ///////////////////// MESSAGES /////////////////////

    /**
     * @param {MessageObj} messageObj
     * @returns {String} id of the message created
     */
    async function addMessage(messageObj){
        console.log("Adding message -> ", JSON.stringify(messageObj))
        
        return elasticFetx.createDoc(ourIndexes.messages, messageObj).then(obj => {
            console.log("Msg source:", obj._source)
            return {id: obj._id}
        })
    }

    /**
     * @param {String} dev_id (endDeviceID)
     * @param {String} app_id (applicationId)
     * @param {Int} skip
     * @param {Int} limit
     * @param {Characteristic | undefined} characteristic
     * @returns {Array<Message>} 
     */
    async function getAllMessages(dev_id, app_id, skip, limit, characteristic){
        let messagesFound
        if(! dev_id && ! app_id && ! characteristic){
            messagesFound = await elasticFetx.searchDocPaged(ourIndexes.messages, skip, limit).then(obj => {
                return searchObjToObjArray(obj).map(msgObj => {
                    return new Message(msgObj.id, msgObj.obj)
                })
            })

        } else {
            const fields = []
            const values = []
            if(dev_id) { fields.push("endDeviceID"); values.push(dev_id) }
            if(app_id) { fields.push("applicationId"); values.push(app_id) }
            if(characteristic) { fields.push("characteristic"); values.push(characteristic) }
            messagesFound = await elasticFetx.searchDocWithValuesPaged(
                ourIndexes.messages,
                fields, values, skip, limit
            ).then(obj => {
                return searchObjToObjArray(obj).map(msgObj => {
                    return new Message(msgObj.id, msgObj.obj)
                })
            })
        }

        return messagesFound
    }

    /**
     * @param {String} id unique elastic-search generated UUID
     * @returns {Message}
     * @throws {NotFound}
     */
    async function getMessage(id){
        const obj = await elasticFetx.getDoc(ourIndexes.messages, id)
        //console.log("Obtained message ->", JSON.stringify(obj))
        if(obj.found==false) throw new NotFound(errorMsgs.messageNotFound(id))
        return new Message(obj._id, obj._source)
    }

    /**
     * @param {String} dev_id 
     * @returns {Boolean} true on success
     */
    async function deleteAllMessages(dev_id){ //TODO
        const obj = await elasticFetx.deleteByQuery(ourIndexes.messages, 
            ["endDeviceID"], [dev_id]
        )
        if (obj.result == "deleted") return true
        else return false
    }
    
    /**
     * @param {String} id
     * @returns {Boolean} true on success
     */
    async function deleteMessage(id){
        const obj = await elasticFetx.deleteDoc(ourIndexes.messages, id)
        if (obj.result == "deleted") return true
        else throw new NotFound(errorMsgs.messageDeletionFail(id))
    }

    ///////////////////// DEVICES /////////////////////

    /**
     * @param {String} id
     * @param {DeviceObj} deviceObj
     * @returns {String} id of the device created
     */
    async function addDevice(id, deviceObj){
        console.log("Adding device -> ", JSON.stringify(deviceObj))
        return elasticFetx.createDocWithID(ourIndexes.devices, deviceObj, id).then(obj => {
            console.log("Device source:", obj._source)
            return {id: obj._id}
        })
    }
    
    /**
     * @param {String} id
     * @returns {Device}
     */
    async function getDevice(id){
        const obj = await elasticFetx.getDoc(ourIndexes.devices, id)
        //console.log("Obtained device ->", JSON.stringify(obj))
        
        if(obj.found==false) throw new NotFound(errorMsgs.deviceNotFound(id))
        return new Device(obj._id, obj._source)
    }

    /**
     * @param {String} endDeviceID 
     * @param {Characteristic} characteristic 
     * @param {String} value 
     */
    async function updateDevice(endDeviceID, characteristic, value){
        const obj = await elasticFetx.getDoc(ourIndexes.devices, endDeviceID)
        if(obj.found==false) throw new NotFound(errorMsgs.deviceNotFound(id))

        const device = new Device(obj._id, obj._source)
        const wasSet = device.deviceObj.setCharacteristic(characteristic, value)
        if(wasSet) await elasticFetx.updateDoc(ourIndexes.devices, device.id, device.deviceObj)
    }
    
    /**
     * @param {String} id
     * @returns {Boolean} true on success
     */
    async function deleteDevice(id){
        const obj = await elasticFetx.deleteDoc(ourIndexes.devices, id)
        if (obj.result == "deleted") return true
        else throw new NotFound(errorMsgs.deviceDeletionFail(id))
    }
    
    return {
        ourIndexes,
        createOurIndexes,

        addMessage,
        getAllMessages,
        getMessage,
        deleteAllMessages,
        deleteMessage,

        addDevice,
        getDevice,
        updateDevice,
        //deleteDevice
    }
}

export default elasticDB
