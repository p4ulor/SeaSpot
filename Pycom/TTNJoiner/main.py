# main.py -- put your code here!
import time
import ttnJoiner
import _thread

from network import LoRa
# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)

joiner = ttnJoiner.TTNJoiner(lora_payload=lora, dev_addr='260B893E',nwk_swkey='AA1EC267112FA32D3226CEDA4E570621', app_swkey='397680F10D67E165FD9993BA91BF4468')
joiner.join()
print('TTN joined')


def send_data_thread():
    while True:
        # Send some data
        joiner.send_data_bytes(1)
        # joiner.send_data_bytes(2)
        # joiner.send_data_bytes(3)
        # joiner.send_data_string("Hello, World!")


def receive_data_thread():
    # Receive any incoming data
    print("Wait to receive message")
    joiner.receive_data_blocking()
    print("Received message")
    # joiner.receive_data_nonblocking


_thread.start_new_thread(send_data_thread, ())
_thread.start_new_thread(receive_data_thread, ())

# Run Bluetooth code here
