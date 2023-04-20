# main.py -- put your code here!
import loraPayload

from network import LoRa
# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)

lpl = loraPayload.LoraPayload(lora_payload=lora)

lpl.join_lora()
lpl.create_socket()
lpl.send_data_bytes(1)
lpl.send_data_bytes(2)
lpl.send_data_bytes(3)
lpl.send_data_bytes(4)
lpl.send_data_string("Ola Raul")
