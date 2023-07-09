import { Message } from "../data/Message.mjs"
import { Characteristic, service_characteristics } from "../data/services-characteristics.mjs"
import fetch from "node-fetch"
import btoa from "btoa";
import atob from "atob";

/**
 * Converting payload received as base64 to hexadecimal
 * @param {express.Request.body}
 * @returns {String}
 */
export function base64ToHex(payload) {
    for (var i = 0, bin = atob(payload.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        let tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join(" ").toUpperCase();
}

/**
 * Convert value to base64
 * @param {String} value receives something like "616263" ("abc")
 * @returns {String}
 */
export function strTobase64(value){
    return btoa(String.fromCharCode.apply(null,
        value.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}
/**
 * Convert value to ASCII
 * @param {String} value 
 * @returns {String}
 */
export function hexToASCII(value){
    return Buffer.from(value, 'hex').toString();
}

/**
 * Convert value to base64
 * @param {Array<Number>} bytearray 
 * @returns {String}
 */
export function byteArrayTobase64(bytearray){
    return Base64.getEncoder().encode(bytearray);
    //return Buffer.from(value).toString('base64')
}

/**
 * @param {integer} f_port 
 * @return {Characteristic} characteristic
 */
export function getCharacteristicID(f_port){
    const characs = Object.values(service_characteristics)
    let service_charac = service_characteristics.ID_BROADCAST_STRING // publishing the message in BROADCAST_STRING by default if the f_port didn't identify any of our characteristics
    characs.forEach(value => {
        if(value.code==f_port)
            service_charac = value
    })
    return service_charac
}

/**
 * @param {Date} date 
 * @returns {string}
 */
export function dateToString(date){
    if(typeof date == 'string') date = new Date(date) //useful because when getting data from elastic search, it comes as a string, making it not possible to call the methods
    // British English uses day-month-year order
    return `${date.toLocaleDateString("en-GB")} - ${date.toLocaleTimeString()}` 
}

/**
 * @param {Int} skip 
 * @param {Int} limit 
 * @param {Int} defaultSkip 
 * @param {Int} defautLimit 
 * @param {Int} maxLimit 
 */
export function validatePaging(skip, limit, defaultSkip, defautLimit, maxLimit){
    if(isBadNumber(defaultSkip) || isBadNumber(defautLimit))
        throw new Error("Invalid usage of validatePaging()")
    if(isBadNumber(skip)) skip = defaultSkip
    if(isBadNumber(limit)) limit = defautLimit
    if(limit > maxLimit) limit = maxLimit
    return {
        skip,
        limit
    }
}

function isBadNumber(number){
    return isNaN(number) || number < 0
}

/**
 * @param {Array<Object>} values 
 * @returns {Boolean} true if all values are strings
 */
export function checkAllString(values){
    return values.every(value => {
        return typeof value == 'string'
    })
}

export const ourApplicationApiKey = "NNSXS.X5XMG64FN6MRORA3IO5S7BMB4KAEBQE5RMDHENI.QOLJRUL2L2NS7E3EQEVWFM5RZRUDNAO7CSTKCOGN73SEOJHTD6TQ" //used for requesting TTN to scheduele a downlink

/**
 * @param {string} path
 * @param {string} method Must be "POST", "GET", etc
 * @param {Object} body
 */
export async function fetx(path, method, body){
    return fetch(path, {
        method: method, 
        body : (body || method!="GET" || method!="DELETE") ? JSON.stringify(body) : null ,
        headers: { "Content-Type": "application/json" , "Accept" : "application/json", "Authorization" : `Bearer ${ourApplicationApiKey}`}
    }).then(rsp => {
        return rsp.text().then(obj => {
            console.log(`Fetch result -> ${JSON.stringify(obj)}`)
            console.log(`Status code -> ${rsp.status}`)
            return obj
        }).catch(e => {
            console.log("Error parsing to json -> "+e)
        })
    }).catch(e => {
        console.log("Request error -> "+e)
    })
}
