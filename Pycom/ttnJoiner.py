import time
import socket
import binascii
import payloadSender
import struct

from network import LoRa

class TTNJoiner: #note: "self" is similar to "this" keyword in java
    def __init__(self, lora_payload, dev_addr, nwk_swkey, app_swkey):
        self.lora_payload = lora_payload
        self.dev_addr = struct.unpack(">l", binascii.unhexlify(dev_addr))[0]
        self.nwk_swkey = binascii.unhexlify(nwk_swkey)
        self.app_swkey = binascii.unhexlify(app_swkey)
        self.lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
        self.create_socket()
        
    def join(self):
        self.lora.join(activation=LoRa.ABP, auth=(self.dev_addr, self.nwk_swkey, self.app_swkey))
        while not self.lora.has_joined():
            time.sleep(2.5)
            print('Not yet joined...')
        
    def create_socket(self):
        # create a LoRa socket
        s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
        s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)
        s.setblocking(False)
        self.socket=s

    def send_data_bytes(self, data, characteristicPort): # in use uplink
        # creating Payload Sender packet
        socket = self.socket
        if characteristicPort != None:
            print("Set Fport: {}".format(characteristicPort))
            # socket.bind(characteristicPort) # https://forum.pycom.io/topic/2735/changing-port-for-sending-data-via-lora/2
        lpp = payloadSender.PayloadSender(sock=socket)
        lpp.set_payload(data)
        lpp.send(reset_payload=True)

    def send_data_string(self,data): # not in use
        # creating Payload Sender packet
        lpp = payloadSender.PayloadSender(sock=self.socket)
        lpp.set_payload_string(data)
        lpp.send(reset_payload=True)

    def receive_data_blocking(self, characteristicPort):
        socket = self.socket
        byte_size = 64
        # Create a buffer to hold incoming data, must be power of 8?
        # Receive data from the socket
        
        if characteristicPort != None:
            # socket.bind(characteristicPort)
            print("Set Fport: {}".format(characteristicPort)) ## Note: indicating the port doesnt really indicate to only get a downlink whose port is equal to this, it's just to register what characteritic update request was associated to this downlink
        else:
            print("characteristicPort is null?: {}".format(characteristicPort))
        data, fport = socket.recvfrom(byte_size)
        # Parse the received data
        print("receive_data_blocking string: {}".format(data))
        print("receive_data_blocking Fport: {}".format(fport))
        decode_data = binascii.hexlify(data).decode()
        print("receive_data_blocking raw:", decode_data)

        return (data, fport,)
