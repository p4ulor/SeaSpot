/**
 * Decoved compressed latitude, longitude, altitude and other info
 * @param {*} input 
 */
function decodeUplink(input) {
    let bytes = input.bytes
    let port = input.fPort
    let decoded = {}
    if(port == 1) {
      if(bytes.length == 10) {
        decoded.gpsfix = true
        decoded.latitude = ((bytes[0]<<16)>>>0) + ((bytes[1]<<8)>>>0) + bytes[2]
        decoded.latitude = (decoded.latitude / 16777215.0 * 180) - 90
        decoded.longitude = ((bytes[3]<<16)>>>0) + ((bytes[4]<<8)>>>0) + bytes[5]
        decoded.longitude = (decoded.longitude / 16777215.0 * 360) - 180
        let altValue = ((bytes[6]<<8)>>>0) + bytes[7]
        let sign = bytes[6] & (1 << 7)
        if(sign){
          decoded.altitude = 0xFFFF0000 | altValue
        }else{
          decoded.altitude = altValue
        }
        decoded.hdop = bytes[8] / 10.0
        decoded.sats = bytes[9]
      } 
    }
    if (decoded.latitude == -90) {
      decoded = {}
      decoded.gpsfix = false
    }
  
    return {
        data: decoded
    }
}