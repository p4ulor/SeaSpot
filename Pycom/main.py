# main.py -- put your code here!
import time
import ttnJoiner
import _thread
from network import Bluetooth
from machine import Timer
import binascii

from network import LoRa

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
joiner.join()
print('TTN joined')


def send_data_thread(data):
    # while True:
    # Send some data
    # joiner.send_data_bytes(bytes([11]))
    # joiner.send_data_bytes(bytes([1, 2, 3]))
    joiner.send_data_bytes(bytearray(data))


def receive_data_thread():
    # Receive any incoming data
    print('inicia espera')
    time.sleep(15)
    print('fim de espera, will get data')
    data = ""
    #while data == "":
    joiner.send_data_bytes(bytes([1]))
    data = joiner.receive_data_blocking()
    print('data: ', data)



################## BLE SERVER ##################

# See the following for generating UUIDs:
# https://www.uuidgenerator.net/
SERVICE_UUID = '8c222682-d005-4c04-8556-0fc5a6568c3a'
SERVICE_USER_DATA = 0x181C
SERVICE_BATTERY = 0x180F
SERVICE_LOCATION = 0x1819 # LocationAndNavigation
SERVICE_PHONE = 0x180E # PhoneAlertStatus
SERVICE_PUBLIC_BROADCAST = 0x1856 # Public Broadcast Announcement

CHARACTERISTIC_NAME = 0x2ABE # ObjectName
CHARACTERISTIC_BATTERY = 0x2a19 # BatteryLevel
CHARACTERISTIC_LATITUDE = 0x2aae
CHARACTERISTIC_LONGITUDE = 0x2aaf
CHARACTERISTIC_OBJECT_ID = 0x2AC3
CHARACTERISTIC_STRING = 0x2BDE # Fixed String 64

def ble_thread():
    def connectionCallback (bt_o): 
        events = bt_o.events()
        if  events & Bluetooth.CLIENT_CONNECTED:
            print("Client connected")
        elif events & Bluetooth.CLIENT_DISCONNECTED:
            print("Client disconnected")

    def char1_cb_handler(chr, data): # USER_DATA -> ObjectName
        events, value = data # data is like = (16, b'1011')
        print('char1_cb_handler')
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 1 Write request with value = {}".format(value))
            #_thread.start_new_thread(send_data_thread, (value,)) # must have ','... https://stackoverflow.com/a/37116824
        else:
            print('Read request on char 1 ', chr.value()) # 'value' sometimes/seems to be 'None' in read operations, so I'm using chr.value()

    def char2_cb_handler(chr, data):
        events, value = data
        print('Read request on char 2 ', chr.value())
            
    def char3_cb_handler(chr, data):
        events, value = data
        print('Read request on char 3 ', chr.value())
            
    def char4_cb_handler(chr, data):
        events, value = data
        print('Read request on char 4 ', chr.value())

    def char5_cb_handler(chr, data): # PHONE -> OBJECT ID
        events, value = data
        print('char5_cb_handler')
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 5 Write request with value = {}".format(value))
            #_thread.start_new_thread(send_data_thread, (value,))
        else:
            print('Read request on char 5 ', chr.value()) 


    def char6_cb_handler(chr, data): # PUBLIC_BROADCAST -> STRING
        events, value = data
        print('char6_cb_handler')
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 6 Write request with value = {}".format(value))
            #_thread.start_new_thread(send_data_thread, (value,))
        else:
            print('Read request on char 6 ', chr.value())


    bluetooth = Bluetooth()
    bluetooth.set_advertisement(name='SEASPOT', service_uuid=uuid2bytes(SERVICE_UUID))
    bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=connectionCallback)
    bluetooth.advertise(True)

    srv1 = bluetooth.service(uuid=SERVICE_USER_DATA, isprimary=True) # By default, nbr_chars=2
    chr1 = srv1.characteristic(uuid=CHARACTERISTIC_NAME, value='LilyGo') # By default, the charac has:  properties=Bluetooth.PROP_WRITE | Bluetooth.PROP_WRITE_NR
    char1_cb = chr1.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char1_cb_handler)

    srv2 = bluetooth.service(uuid=SERVICE_BATTERY, isprimary=True)
    chr2 = srv2.characteristic(uuid=CHARACTERISTIC_BATTERY, properties=Bluetooth.PROP_READ, value='51%')
    char2_cb = chr2.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char2_cb_handler)

    srv3 = bluetooth.service(uuid=SERVICE_LOCATION, isprimary=True, nbr_chars=2)
    chr3 = srv3.characteristic(uuid=CHARACTERISTIC_LATITUDE, properties=Bluetooth.PROP_READ, value='100')
    char3_cb = chr3.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char3_cb_handler)
    
    chr4 = srv3.characteristic(uuid=CHARACTERISTIC_LONGITUDE, properties=Bluetooth.PROP_READ, value='200')
    char4_cb = chr4.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char4_cb_handler)

    srv4 = bluetooth.service(uuid=SERVICE_PHONE, isprimary=True)
    chr5 = srv4.characteristic(uuid=CHARACTERISTIC_OBJECT_ID, value='+351')
    char5_cb = chr5.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char5_cb_handler)

    srv5 = bluetooth.service(uuid=SERVICE_PUBLIC_BROADCAST, isprimary=True)
    chr6 = srv5.characteristic(uuid=CHARACTERISTIC_STRING, value='Write Any Message') #it seems that lengthy values will not work well, and it will trigger the callback in an infinite looo on the read operation, At if the value has a lenght of 'Write Any Message1234' it will no longer write
    char6_cb = chr6.callback(trigger=Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_WRITE_EVENT, handler=char6_cb_handler)


    print('Start BLE Service')

# _thread.start_new_thread(send_data_thread, ()) # enviar para o TTN
#_thread.start_new_thread(receive_data_thread, ()) # receber to TTN
_thread.start_new_thread(ble_thread, ()) # ble server
