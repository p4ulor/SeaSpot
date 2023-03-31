# main.py -- put your code here!

import time
import socket
import binascii
import struct
from network import LoRa
# Initialise LoRa in LORAWAN mode.
# Please pick the region that matches where you are using the device:
# Europe = LoRa.EU868
lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
def join_lora(force_join = False):
    '''Joining The Things Network '''
    # restore previous state
    if not force_join:
        lora.nvram_restore()
    if not lora.has_joined() or force_join == True:
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
join_lora(True)
# wait until the module has joined the network
while not lora.has_joined():
    time.sleep(2.5)
    print('Not yet joined...')
# create a LoRa socket
s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
# set the LoRaWAN data rate
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)
# make the socket non-blocking
s.setblocking(False)
# send some data
s.send(bytes([0x06,0x08]))
