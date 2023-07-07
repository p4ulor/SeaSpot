import time
import ttnJoiner
import _thread
import binascii

from network import LoRa
from network import Bluetooth
from machine import Timer
from machine import ADC

import gps_data



def uuid2bytes(uuid):
    uuid = uuid.encode().replace(b'-',b'')
    tmp = binascii.unhexlify(uuid)
    return bytes(reversed(tmp))

# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)

joiner = ttnJoiner.TTNJoiner(lora_payload=lora, dev_addr='260B893E',
                             nwk_swkey='AA1EC267112FA32D3226CEDA4E570621', app_swkey='397680F10D67E165FD9993BA91BF4468')
didJoin = joiner.join()
if didJoin:
    print('TTN joined')

def send_data(data, characteristicPort):
    # joiner.send_data_bytes(bytes([1, 2, 3]))
    joiner.send_data_bytes(bytearray(data), characteristicPort) # downlink "ab" will show payload: 61 62. In livedata in TTN

# Downlink is an operation that asks TTN to dispatch the latest uplinks so they can be ready to be consumed. They can be done manually in the "messaging tab" or with HTTP requests
def receive_data(characteristicPort):
    print('receive_data()')
    data = ""
    joiner.send_data_bytes(bytes([1]), characteristicPort) # makes uplink, necessary to make an downlink after. Fport will be 2 by default
    # time.sleep(2.5)
    data, fport = joiner.receive_data_blocking(characteristicPort) # receive the latest downlink that put in our applciation
    print('receive_data: ', data)
    print("received fport: {}".format(fport))
    # Write the fport value to the ObjectTranfer (service) -> Refresh (charac)
    chr7.value(fport)
    if fport==ID_USERDATA_STRING:
        chr1.value(data) # https://docs.pycom.io/firmwareapi/pycom/network/bluetooth/gattscharacteristic/
        print('ID_USERDATA_STRING: ', chr1.value())
    elif fport==ID_BATTERY_LEVEL:
        chr2.value(data)
        print('ID_BATTERY_LEVEL: ', chr2.value())

    elif fport==ID_LOCATION_LATITUDE:
        chr3.value(data)
        print('ID_LOCATION_LATITUDE: ', chr3.value())
    elif fport==ID_LOCATION_LONGITUDE:
        chr4.value(data)
        print('ID_LOCATION_LONGITUDE: ', chr4.value())

    elif fport==ID_PHONE_ID:
        chr5.value(data)
        print('ID_PHONE_ID: ', chr5.value())
    elif fport==ID_BROADCAST_STRING:
        chr6.value(data)
        print('ID_BROADCAST_STRING: ', chr6.value())

    else:
        print('Unregistered port was set upon the scheduled downlink, ignoring')
    

def encodePayloadWithCharacIdentifier(value, id): # no longer in use, it was used to add the characteristic identifier in the payload, but now we use Fport. The identifiers were previously byte arrays like: ID_USERDATA_STRING = [0x1]
    finalValue = bytearray(id)
    print("finalValue: {}".format(finalValue))
    finalValue.extend(value) # appends (but .appends() only receives 1 byte so we're using extend)
    print("finalValue extended: {}".format(finalValue))
    return finalValue.decode()


################## BLE SERVER ##################

SERVICE_UUID = '8c222682-d005-4c04-8556-0fc5a6568c3a'
SERVICE_USER_DATA = 0x181C
SERVICE_BATTERY = 0x180F
SERVICE_LOCATION = 0x1819 # LocationAndNavigation
SERVICE_PHONE = 0x180E # PhoneAlertStatus
SERVICE_PUBLIC_BROADCAST = 0x1856 # Public Broadcast Announcement
SERVICE_OBJECT_TRANSFER = 0x1825 # Will be used as what represents "updating the characteristics" from the TTN

CHARACTERISTIC_NAME = 0x2ABE # ObjectName
CHARACTERISTIC_LEVEL = 0x2a19 # BatteryLevel
CHARACTERISTIC_LATITUDE = 0x2aae
CHARACTERISTIC_LONGITUDE = 0x2aaf
CHARACTERISTIC_PHONE_ID = 0x2AC3 # Object ID
CHARACTERISTIC_STRING = 0x2BDE # Fixed String 64
CHARACTERISTIC_REFRESH_DOWNLINK = 0x2A31 # ScanRefresh, only relevant between Android and TTGO
CHARACTERISTIC_REFRESH_LOCATION = 0x2AB5

# List of unique identifiers for each variable that's displayed by the TTGO
# _Service _ Characteristic
ID_USERDATA_STRING = 0x3
ID_BATTERY_LEVEL = 0x4
ID_LOCATION_LATITUDE = 0x5
ID_LOCATION_LONGITUDE = 0x6
ID_PHONE_ID = 0x7
ID_BROADCAST_STRING = 0x8
ID_LOCATION_REFRESH = 0X9

def connectionCallback (bt_o): 
    events = bt_o.events()
    if events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

def char1_cb_handler(chr, data): # USER_DATA -> ObjectName
    events, value = data # data is like = (16, b'1011')
    print('char1_cb_handler')
    if  events & Bluetooth.CHAR_WRITE_EVENT: ## write = 16, read = 8
        # finalValue = encodePayloadWithCharacIdentifier(value, ID_USERDATA_STRING) # no longer in use

        print("On char 1 Write request with value = {}".format(value))
        _thread.start_new_thread(send_data, (value, ID_USERDATA_STRING,)) # must have ','... https://stackoverflow.com/a/37116824
    else:
        print('Read request on char 1 ', chr.value()) # 'value' sometimes/seems to be 'None' in read operations, so I'm using chr.value()

def char2_cb_handler(chr, data): # BATTERY -> LEVEL
    events, value = data
    chr2.value(str(updateBatteryVoltage()))
    print('Read request on char 2 ', chr.value())
        
def char3_cb_handler(chr, data): # LOCATION -> LATITUDE
    events, value = data
    gps_coordinates = getGPSCoordinates()
    if gps_coordinates['valid']:
        decoded_gps = decode_gps_array(gps_coordinates['gps_array'])
        gps_raw_data = decoded_gps['data']
        gps_latitude = gps_raw_data['latitude']
        gps_longitude = gps_raw_data['longitude']
        chr3.value(str(gps_latitude))
        chr4.value(str(gps_longitude))
    else:
        print("Failed to get GPS location. Valid? ", gps_coordinates['valid'])
        chr3.value(str(-1))
        chr4.value(str(-2))
    print('Read request on char 3 ', chr.value())

def char5_cb_handler(chr, data): # PHONE -> OBJECT ID
    events, value = data
    print('char5_cb_handler')
    if  events & Bluetooth.CHAR_WRITE_EVENT:
        # finalValue = encodePayloadWithCharacIdentifier(value, ID_PHONE_ID) # no longer in use
        print("On char 5 Write request with value = {}".format(value))
        _thread.start_new_thread(send_data, (value, ID_PHONE_ID,))
    else:
        print('Read request on char 5 ', chr.value()) 

def char6_cb_handler(chr, data): # PUBLIC_BROADCAST -> STRING
    events, value = data # value type is 'bytes'
    print('char6_cb_handler. Event = {}'.format(events))
    if  events & Bluetooth.CHAR_WRITE_EVENT:
        # finalValue = encodePayloadWithCharacIdentifier(value, ID_BROADCAST_STRING) # no longer in use
        print("On char 6 Write request with value = {}".format(value))
        _thread.start_new_thread(send_data, (value, ID_BROADCAST_STRING))
    else:
        print('Read request on char 6 ', chr.value())

def char7_cb_handler(chr, data): # OBJECT_TRANSFER -> REFRESH
    events, value = data
    print('char7_cb_handler')
    if events & Bluetooth.CHAR_WRITE_EVENT:
        print("On char 7 Write request with value = {}".format(value))
        _thread.start_new_thread(receive_data, (ID_PHONE_ID,))

def char8_cb_handler(chr, data):
    events, value = data
    print('char8_cb_handler. Event = {}'.format(events))
    if  events & Bluetooth.CHAR_WRITE_EVENT:
        print("On char 8 Write request with value = {}".format(value))
        gps_coordinates = getGPSCoordinates()
        if gps_coordinates['valid']:
            # Get the GPS Location Latitude and longitude and send throw uplink
            print('latitude and longitude ', gps_coordinates)
            _thread.start_new_thread(send_data, (gps_coordinates["gps_array"], ID_LOCATION_REFRESH))
        else:
            print("Failed to send gps location. Valid? ", gps_coordinates['valid'])


bluetooth = Bluetooth()
bluetooth.set_advertisement(name='SEASPOT', service_uuid=uuid2bytes(SERVICE_UUID))
bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=connectionCallback)
bluetooth.advertise(True)

srv1 = bluetooth.service(uuid=SERVICE_USER_DATA, isprimary=True) # By default, nbr_chars=2
chr1 = srv1.characteristic(uuid=CHARACTERISTIC_NAME, value='LilyGo') # By default, the charac has:  properties=Bluetooth.PROP_WRITE | Bluetooth.PROP_WRITE_NR
chr1_cb = chr1.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char1_cb_handler)

srv2 = bluetooth.service(uuid=SERVICE_BATTERY, isprimary=True, nbr_chars=1)
chr2 = srv2.characteristic(uuid=CHARACTERISTIC_LEVEL, properties=Bluetooth.PROP_READ, value='0') # Default value
chr2_cb = chr2.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char2_cb_handler)

srv3 = bluetooth.service(uuid=SERVICE_LOCATION, isprimary=True, nbr_chars=3)
chr3 = srv3.characteristic(uuid=CHARACTERISTIC_LATITUDE, properties=Bluetooth.PROP_READ, value='100')
chr3_cb = chr3.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char3_cb_handler)

chr4 = srv3.characteristic(uuid=CHARACTERISTIC_LONGITUDE, properties=Bluetooth.PROP_READ, value='200')
chr4_cb = chr4.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char3_cb_handler)

srv4 = bluetooth.service(uuid=SERVICE_PHONE, isprimary=True)
chr5 = srv4.characteristic(uuid=CHARACTERISTIC_PHONE_ID, value='+351')
chr5_cb = chr5.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char5_cb_handler)

srv5 = bluetooth.service(uuid=SERVICE_PUBLIC_BROADCAST, isprimary=True)
chr6 = srv5.characteristic(uuid=CHARACTERISTIC_STRING, value='Write Any Message') #it seems that lengthy values will not work well, and it will trigger the callback in an infinite looo on the read operation, At if the value has a lenght of 'Write Any Message1234' it will no longer write
chr6_cb = chr6.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char6_cb_handler)

srv6 = bluetooth.service(uuid=SERVICE_OBJECT_TRANSFER, isprimary=True)
chr7 = srv6.characteristic(uuid=CHARACTERISTIC_REFRESH_DOWNLINK, value=0x1)
chr6_cb = chr7.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char7_cb_handler)

chr8 = srv3.characteristic(uuid=CHARACTERISTIC_REFRESH_LOCATION, value=0x1)
chr7_cb = chr8.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char8_cb_handler)

print('Start BLE Service')



def updateBatteryVoltage(): # https://docs.pycom.io/tutorials/expansionboards/vbat/#:~:text=Expansionboard%203.0%20/%203.1
    adc = ADC()
    bat_voltage = adc.channel(attn=ADC.ATTN_11DB, pin='P16')
    vbat = bat_voltage.voltage()
    # note that the expansionboard 3 has a voltage divider of 1M / 1M to account for
    # 1M / 1M, ratio = 1:2
    level = vbat*2
    return level

def getGPSCoordinates():
    gps = gps_data.GPS_data(['G12', 'G34'])
    gps_array, timestamp, valid = gps.get_loc()

    # decoded_gps = decode_gps_array(gps_array)

    # print("decoded gps ", decoded_gps["data"])
    return {'gps_array': gps_array, 'timestamp':timestamp, 'valid':valid}

def decode_gps_array(input):
    bytes = input
    decoded = {}

    if len(bytes) == 10:
        decoded['gpsfix'] = True
        decoded['latitude'] = ((bytes[0] << 16) & 0xFFFFFF) + ((bytes[1] << 8) & 0xFFFF) + bytes[2]
        decoded['latitude'] = (decoded['latitude'] / 16777215.0 * 180) - 90
        decoded['longitude'] = ((bytes[3] << 16) & 0xFFFFFF) + ((bytes[4] << 8) & 0xFFFF) + bytes[5]
        decoded['longitude'] = (decoded['longitude'] / 16777215.0 * 360) - 180
        altValue = ((bytes[6] << 8) & 0xFFFF) + bytes[7]
        sign = bytes[6] & (1 << 7)
        if sign:
            decoded['altitude'] = 0xFFFF0000 | altValue
        else:
            decoded['altitude'] = altValue
        decoded['hdop'] = bytes[8] / 10.0
        decoded['sats'] = bytes[9]

    if decoded.get('latitude') == -90:
        decoded = {'gpsfix': False}

    return {'data': decoded}
