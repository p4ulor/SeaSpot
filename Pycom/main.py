# main.py -- put your code here!

import time
import socket
import binascii
import payloadSender
import struct

from network import LoRa
# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
def join_lora():
    '''Joining The Things Network '''
    if not lora.has_joined():
        # create an ABP authentication params
        # your application Device address
        dev_addr = struct.unpack(">l", binascii.unhexlify('260B893E'))[0]
        # your application NwkSKey
        nwk_swkey = binascii.unhexlify('AA1EC267112FA32D3226CEDA4E570621')
        # your application AppSKey
        app_swkey = binascii.unhexlify('397680F10D67E165FD9993BA91BF4468')
        # join a network using ABP (Activation By Personalisation)
        lora.join(activation=LoRa.ABP, auth=(dev_addr, nwk_swkey, app_swkey))
        # wait until the module has joined the network
        while not lora.has_joined():
            time.sleep(2.5)
            print('Not yet joined...')
        # saving the state
        lora.nvram_save()
        # returning whether the join was successful
        if lora.has_joined():
            return True
        else:
            return False
    else:
        return True
# joining TTN
join_lora()

# create a LoRa socket
s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

# set the LoRaWAN data rate
# lower data rates provide better range and more robust performance, but they come at the cost of reduced data throughput
# set the LoRaWAN data rate to the lowest available (0)
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 0)

# s.setblocking(True) sets the socket s to blocking mode, meaning any socket method that would block will not return until the operation is complete.
# This is useful for ensuring reliable communication over a LoRaWAN network, where it is essential to receive acknowledgement messages from the network to ensure that the data has been successfully transmitted.
s.setblocking(True)

# creating Payload Sender packet
lpp = payloadSender.PayloadSender(sock=s)

lpp.set_payload(1)
lpp.send(reset_payload=True)

lpp.set_payload(2)
lpp.send(reset_payload=True)

lpp.set_payload_string("Hello, world")
lpp.send(reset_payload=True)

