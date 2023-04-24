# main.py -- put your code here!
import time
import ttnJoiner

from network import LoRa
# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)

joiner = ttnJoiner.TTNJoiner(lora_payload=lora, dev_addr='260B893E', nwk_swkey='AA1EC267112FA32D3226CEDA4E570621', app_swkey='397680F10D67E165FD9993BA91BF4468')
joiner.join()

while True:
    # Send some data
    joiner.send_data_bytes(1)
    # joiner.send_data_bytes(2)
    # joiner.send_data_bytes(3)
    # joiner.send_data_string("Hello, World!")
    # Receive any incoming data
    print("before")
    joiner.receive_data_blocking()
    print("after")
    # joiner.receive_data_nonblocking
    # Wait for some time before sending/receiving more data
    time.sleep(10)

