import { BadRequest, Conflict, Forbidden, NotFound, ServerError } from '../utils/errors-and-codes.mjs';
import { Message, MessageObj } from './Message.mjs';
import { Device, DeviceObj } from './Device.mjs';
import elasticFetch, { searchObjToObjArray } from '../utils/elastic-fetch.mjs'
import * as bodies from '../utils/resp-bodies.mjs'
import * as utils from '../utils/utils.mjs'
import errorMsgs from '../utils/error-messages.mjs'
let dataMem = await import('../data/data-mem.mjs') //to insert sample data

var indexedCreated = false
const insertSampleData = true

/** @param {ServerConfig} config */
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

    /**
     * @param {MessageObj} messageObj
     * @returns {String} id of the message created
     */
    async function addMessage(messageObj){
        try {
            console.log("Adding message -> ", JSON.stringify(messageObj))
            
            return elasticFetx.createDoc(ourIndexes.messages, messageObj).then(obj => {
                console.log("Msg source:", obj._source)
                return {id: obj._id}
            })
        } catch(e) { throw e }
    }

    /**
     * @param {String} dev_id (endDeviceID)
     * @param {String} app_id (applicationId)
     * @param {Int} skip
     * @param {Int} limit
     * @returns {Array<Message>} 
     */
    async function getAllMessages(dev_id, app_id, skip, limit){
        try {
            let messagesFound
            if(! dev_id || ! app_id){
                messagesFound = await elasticFetx.searchDocPaged(ourIndexes.messages, skip, limit).then(obj => {
                    return searchObjToObjArray(obj).map(msgObj => {
                        return new Message(msgObj.id, msgObj.obj)
                    })
                })

            } else {
                messagesFound = await elasticFetx.searchDocWithValuesPaged(ourIndexes.messages,
                    ["endDeviceID", "applicationId"], [dev_id, app_id], skip, limit
                ).then(obj => {
                    return searchObjToObjArray(obj).map(msgObj => {
                        return new Message(msgObj.id, msgObj.obj)
                    })
                })
            }

            return messagesFound
        } catch(e) { throw e }
    }

    /**
     * @param {String} id
     */
    async function getMessage(id){
        const obj = await elasticFetx.getDoc(ourIndexes.messages, id)
        console.log("Obtained message ->", JSON.stringify(obj))
        if(obj.found==false) throw new NotFound(errorMsgs.messageNotFound(id))
        return new Message(obj._id, obj._source)
    }

    /**
     * @param {String} dev_id 
     * @param {String} app_id 
     */
    async function deleteAllMessages(dev_id, app_id, skip, limit){ //TODO
        
    }
    
    /**
     * @param {String} id
     * @returns {Boolean} true on success
     */
    async function deleteMessage(id){
        try {
            return await elasticFetx.deleteDoc(ourIndexes.messages, id).then(async obj =>{
                if (obj.result == "deleted") return true
                else throw new NotFound(errorMsgs.messageDeletionFail(id))
            })   
        } catch(e) { throw e }
    }

    ///////////////////// DEVICES /////////////////////

    /**
     * @param {String} id
     * @param {DeviceObj} deviceObj
     * @returns {String} id of the device created
     */
    async function addDevice(id, deviceObj){
        try {
            console.log("Adding device -> ", JSON.stringify(deviceObj))
            return elasticFetx.createDocWithID(ourIndexes.devices, deviceObj, id).then(obj => {
                console.log("Device source:", obj._source)
                return {id: obj._id}
            })
        } catch(e) { throw e }
    }
    
    /**
     * @param {String} id
     * @returns {Device}
     */
    async function getDevice(id){
        try {
            return elasticFetx.getDoc(ourIndexes.devices, id).then(obj => {
                console.log("Obtained device ->", JSON.stringify(obj))
                
                if(obj.found==false) throw new NotFound(errorMsgs.deviceNotFound(id))
                return new Message(obj._id, obj._source)
            })
        } catch(e) { throw e }
    }
    
    /**
     * @param {String} id
     * @returns {Boolean} true on success
     */
    async function deleteDevice(id){
        try {
            return await elasticFetx.deleteDoc(ourIndexes.devices, id).then(async obj =>{
                if (obj.result == "deleted") return true
                else throw new NotFound(errorMsgs.deviceDeletionFail(id))
            })   
        } catch(e) { throw e }
    }
    
    return {
        ourIndexes,
        createOurIndexes,

        addMessage,
        getAllMessages,
        getMessage,
        deleteAllMessages,
        deleteMessage,

        //addDevice,
        getDevice,
        //deleteDevice
    }
}

export default elasticDB
