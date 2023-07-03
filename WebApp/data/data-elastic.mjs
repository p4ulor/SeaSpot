import { BadRequest, Conflict, Forbidden, NotFound, ServerError } from '../utils/errors-and-codes.mjs';
import { Message, MessageObj } from './Message.mjs';
import { Device, DeviceObj } from './Device.mjs';
import elasticFetch from '../utils/elastic-fetch.mjs'
import * as bodies from '../utils/resp-bodies.mjs'
import * as utils from '../utils/utils.mjs'
import errorMsgs from '../utils/error-messages.mjs'

/** @param {ServerConfig} config */
function elasticDB(config){

    const elasticFetx = elasticFetch(config)

    const ourIndexes = {
        devices: "devices",
        messages: "messages"
    }
    
    function createOurIndexes(){
        Object.values(ourIndexes).forEach(async indexName => {
            console.log("wtf")
            await elasticFetx.doesIndexExist(indexName).then(async doesExist =>{
                if(! doesExist){
                    await elasticFetx.createIndex(indexName)
                    console.log("created index:", indexName)
                }
                console.log("ab", indexName)
            })
        })
    }

    createOurIndexes()

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
     * @param {String} dev_id
     * @param {String} app_id
     * @param {Int} skip
     * @param {Int} limit
     * @returns {Array<Message>} 
     */
    async function getAllMessages(dev_id, app_id, skip, limit){ //TODO
        try {
            const groupsFound = user.userObj.groups.slice(skip, skip+limit).map(groupID => {
                return elasticFetx.getDoc(ourIndexes.groups, groupID).then(obj => {
                    console.log(JSON.stringify(obj))
                    if(obj.found==false) throw new NotFound(`The user w/ id=${userID} has the group w/ id=${groupID} but it wasn't found in the index 'groups'`)
                    return {id: obj._id, groupObj: obj._source}
                }).then (group => {
                    return new bodies.GroupsItemListResponse(group.id, group.groupObj.name)
                })
            })
            const resolvedGroupsFound = await (Promise.all(groupsFound))
            return resolvedGroupsFound
        } catch(e) { throw e }
    }

    /**
     * @param {String} id
     */
    async function getMessage(id){
        try {
            return elasticFetx.getDoc(ourIndexes.messages, id).then(obj => {
                console.log("Obtained message ->", JSON.stringify(obj))
                if(obj.found==false) throw new NotFound(errorMsgs.messageNotFound(id))
                return new Message(obj._id, obj._source)
            })
        } catch(e) { throw e }
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
     * @param {DeviceObj} deviceObj
     * @returns {String} id of the device created
     */
    async function addDevice(deviceObj){
        try {
            console.log("Adding device -> ", JSON.stringify(deviceObj))
            
            return elasticFetx.createDoc(ourIndexes.devices, deviceObj).then(obj => {
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

        addDevice,
        getDevice,
        deleteDevice
    }
}

export default elasticDB