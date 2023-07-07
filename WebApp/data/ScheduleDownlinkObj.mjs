import { strTobase64 } from "../utils/utils.mjs"

export class ScheduleDownlinkObj {
    /**
     * @param {Array<Downlink>} downlinks 
     */
    constructor(downlinks){
        this.downlinks = downlinks
    }
}

export class Downlink {
    /**
     * @param {Array<Number>} frm_payload 
     * @param {Number} f_port 1-255
     * @param {String} priority Example: "NORMAL"
     */
    constructor(frm_payload, f_port, priority){
        this.frm_payload = strTobase64(frm_payload) 
        this.f_port = f_port
        this.priority = priority ? priority : "NORMAL"
    }
}