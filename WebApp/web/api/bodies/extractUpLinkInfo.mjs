import { Message } from "../../../data/Message.mjs"
import { Location } from "../../../data/Device.mjs"
import { base64ToHex, extractCharacteristicAndValue } from "../../../utils/utils.mjs"
/**
 * @returns {Message}
 */
export function extractUplinkInfo(body) {
    const application_id = body.end_device_ids.application_ids.application_id
    const endDeviceID = body.end_device_ids.device_id
    const deviceAdress = body.end_device_ids.dev_addr
    const loc = body.uplink_message.locations.user
    const location = new Location(loc.latitude, loc.longitude)

    const payload = body.uplink_message.frm_payload
    const decodedPayload = base64ToHex(payload)
    const characIDandValue = extractCharacteristicAndValue(decodedPayload)

    const received_at = body.received_at

    return new Message(application_id, endDeviceID, deviceAdress, location, 
                        characIDandValue.charac, characIDandValue.value, 
                        received_at)
}
