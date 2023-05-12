# main.py -- put your code here!
import time
import ttnJoiner
import _thread
from network import Bluetooth
from machine import Timer

from network import LoRa
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
    joiner.send_data_bytes(1)
    # joiner.send_data_bytes(2)
    # joiner.send_data_bytes(3)
    # joiner.send_data_string("Hello, World!")


def receive_data_thread():
    # Receive any incoming data
    print('inicia espera')
    time.sleep(5)
    print('fim de espera')
    joiner.send_data_bytes(bytes([0]))
    joiner.receive_data_blocking()
    time.sleep(10)


def ble_thread():
    print('Start BLE')
    battery = 100
    update = False

    def conn_cb(chr):
        nonlocal update
        events = chr.events()
        if events & Bluetooth.CLIENT_CONNECTED:
            print('client connected')
        elif events & Bluetooth.CLIENT_DISCONNECTED:
            print('client disconnected')
            update = False

    def chr1_handler(chr, data):
        nonlocal battery, update
        events = chr.events()
        print("events: ", events)
        if events & (Bluetooth.CHAR_READ_EVENT | Bluetooth.CHAR_SUBSCRIBE_EVENT):
            chr.value(battery)
            print("transmitted :", battery)
            if (events & Bluetooth.CHAR_SUBSCRIBE_EVENT):
                update = True
    bluetooth = Bluetooth()
    bluetooth.set_advertisement(
        name='SeaSpot', manufacturer_data="Pycom", service_uuid=0xec00)

    bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED |
                       Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)
    bluetooth.advertise(True)

    srv1 = bluetooth.service(uuid=0xec00, isprimary=True, nbr_chars=1)

    # client reads from here
    chr1 = srv1.characteristic(uuid=0xec0e, value='read_from_here')

    chr1.callback(trigger=(Bluetooth.CHAR_READ_EVENT |
                  Bluetooth.CHAR_SUBSCRIBE_EVENT), handler=chr1_handler)
    print('Start BLE service')

    def update_handler(update_alarm):
        nonlocal battery, update
        battery -= 1
        if battery == 1:
            battery = 100
        if update:
            chr1.value(str(battery))

    update_alarm = Timer.Alarm(update_handler, 1, periodic=True)


_thread.start_new_thread(send_data_thread, ())
_thread.start_new_thread(receive_data_thread, ())
_thread.start_new_thread(ble_thread, ())
