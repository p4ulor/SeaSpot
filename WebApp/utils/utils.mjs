import { Message } from "../data/Message.mjs"
import { service_characteristic } from "../data/services-characteristics.mjs"
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
 * @param {String} value 
 * @returns {String}
 */
export function strTobase64(value){
    return btoa(String.fromCharCode.apply(null,
        value.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
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
 * @return {integer} service_characteristic
 */
export function getCharacteristicID(f_port){
    const characs = Object.values(service_characteristic)

    const diesFportIdentifyCharacteristic = characs.some(value => {
        return value==f_port
    })

    if(! diesFportIdentifyCharacteristic) {
        console.log("Characteristic identifier not found, publishing the message in BROADCAST_STRING")
        return service_characteristic.ID_BROADCAST_STRING //by default treat this as broadcast string
    }
    return f_port
}

const token = "NNSXS.X5XMG64FN6MRORA3IO5S7BMB4KAEBQE5RMDHENI.QOLJRUL2L2NS7E3EQEVWFM5RZRUDNAO7CSTKCOGN73SEOJHTD6TQ"

/**
 * @param {string} path
 * @param {string} method Must be "POST", "GET", etc
 * @param {Object} body
 */
export async function fetx(path, method, body){
    return fetch(path, {
        method: method, 
        body : (body || method!="GET" || method!="DELETE") ? JSON.stringify(body) : null ,
        headers: { "Content-Type": "application/json" , "Accept" : "application/json", "Authorization" : `Bearer ${token}`}
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
