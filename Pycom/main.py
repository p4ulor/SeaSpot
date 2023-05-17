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


def send_data_thread():
    # while True:
    # Send some data
    # joiner.send_data_bytes(bytes([11]))
    joiner.send_data_bytes(bytes([1, 2, 3]))


def receive_data_thread():
    # Receive any incoming data
    print('inicia espera')
    time.sleep(15)
    print('fim de espera')
    data = ""
    while data == "":
        joiner.send_data_bytes(bytes([1]))
        data = joiner.receive_data_blocking()
        print('data: ', data == "")


################## BLE SERVER ##################

# See the following for generating UUIDs:
# https://www.uuidgenerator.net/
SERVICE_UUID = '8c222682-d005-4c04-8556-0fc5a6568c3a'
SERVICE_USER_DATA = 0x181C
SERVICE_UUID_BATTERY = 0x180F
SERVICE_UUID_LOCATION = 0x1819 # LocationAndNavigation

CHARACTERISTIC_UUID_NAME = 0x2ABE # ObjectName
CHARACTERISTIC_UUID_BATTERY = 0x2a19 # BatteryLevel
CHARACTERISTIC_UUID_LATITUDE = 0x2aae
CHARACTERISTIC_UUID_LONGITUDE = 0x2aaf

def ble_thread():
    def conn_cb (bt_o):
        events = bt_o.events()
        if  events & Bluetooth.CLIENT_CONNECTED:
            print("Client connected")
        elif events & Bluetooth.CLIENT_DISCONNECTED:
            print("Client disconnected")

    def char1_cb_handler(chr, data):
        events, value = data
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 1 Write request with value = {}".format(value))
        else:
            print('Read request on char 1 ',data)

    def char2_cb_handler(chr, data):
        events, value = data
        if  Bluetooth.CHAR_READ_EVENT:
            print('Read request on char 2 ',data)
            

    def char3_cb_handler(chr, data):
        events, value = data
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 3 Write request with value = {}".format(value))
        else:
            print('Read request on char 3 ',data)

    def char4_cb_handler(chr, data):
        events, value = data
        if  events & Bluetooth.CHAR_WRITE_EVENT:
            print("On char 4 Write request with value = {}".format(value))
        else:
            print('Read request on char 4 ',data)

    bluetooth = Bluetooth()
    bluetooth.set_advertisement(name='SEASPOT', service_uuid=uuid2bytes(SERVICE_UUID))
    bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)
    bluetooth.advertise(True)

    srv1 = bluetooth.service(uuid=SERVICE_USER_DATA, isprimary=True)
    chr1 = srv1.characteristic(uuid=CHARACTERISTIC_UUID_NAME, value='LilyGo')
    char1_cb = chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=char1_cb_handler)

    srv2 = bluetooth.service(uuid=SERVICE_UUID_BATTERY, isprimary=True)
    chr2 = srv2.characteristic(uuid=CHARACTERISTIC_UUID_BATTERY, value='50%')
    char2_cb = chr2.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char2_cb_handler)

    srv3 = bluetooth.service(uuid=SERVICE_UUID_LOCATION, isprimary=True, nbr_chars=2)
    chr3 = srv3.characteristic(uuid=CHARACTERISTIC_UUID_LATITUDE, value='100')
    char3_cb = chr3.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=char3_cb_handler)
    
    chr4 = srv3.characteristic(uuid=CHARACTERISTIC_UUID_LONGITUDE, value='200')
    char4_cb = chr4.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=char4_cb_handler)

    print('Start BLE Service')

# _thread.start_new_thread(send_data_thread, ()) # enviar para o TTN
# _thread.start_new_thread(receive_data_thread, ()) # receber to TTN
_thread.start_new_thread(ble_thread, ()) # ble server
