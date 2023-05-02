import time
import socket
import binascii
import payloadSender
import struct

from network import LoRa

class TTNJoiner:
    def __init__(self, lora_payload, dev_addr, nwk_swkey, app_swkey):
        self.lora_payload = lora_payload
        self.dev_addr = struct.unpack(">l", binascii.unhexlify(dev_addr))[0]
        self.nwk_swkey = binascii.unhexlify(nwk_swkey)
        self.app_swkey = binascii.unhexlify(app_swkey)
        self.lora = LoRa(mode=LoRa.LORAWAN, region=LoRa.EU868)
        self.create_socket()
        
    def join(self):
        if not self.lora.has_joined():
            self.lora.join(activation=LoRa.ABP, auth=(self.dev_addr, self.nwk_swkey, self.app_swkey))
            while not self.lora.has_joined():
                time.sleep(2.5)
                print('Not yet joined...')
            self.lora.nvram_save()
            if self.lora.has_joined():
                return True
            else:
                return False
        else:
            return True

    def create_socket(self):
        # create a LoRa socket
        s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

        # set the LoRaWAN data rate
        # lower data rates provide better range and more robust performance, but they come at the cost of reduced data throughput
        # set the LoRaWAN data rate to the lowest available (0)
        s.setsockopt(socket.SOL_LORA, socket.SO_DR, 0)

        # s.setblocking(True) sets the socket s to blocking mode, meaning any socket method that would block will not return until the operation is complete.
        # This is useful for ensuring reliable communication over a LoRaWAN network, where it is essential to receive acknowledgement messages from the network to ensure that the data has been successfully transmitted.
        s.setblocking(True)

        self.socket=s

    def send_data_bytes(self,data):
        # creating Payload Sender packet
        lpp = payloadSender.PayloadSender(sock=self.socket)

        lpp.set_payload(data)
        lpp.send(reset_payload=True)

    def send_data_string(self,data):
        # creating Payload Sender packet
        lpp = payloadSender.PayloadSender(sock=self.socket)

        lpp.set_payload_string(data)
        lpp.send(reset_payload=True)

    def receive_data_blocking(self):
        self.socket.setblocking(True)
        receive_data_blocking(self.socket)

    def receive_data_nonblocking(self):
        self.socket.setblocking(False)
        receive_data_nonblocking(self.socket)


def receive_data_nonblocking(sock):
    byte_size = 64
    # Create a buffer to hold incoming data
    buffer = bytearray(byte_size)
    # Check for incoming data
    size = sock.recv_into(byte_size)
    # Parse the received data
    if size > 0:
        data = buffer[:size]
        print("Received data:", data)
        # Do something with the received data here

def receive_data_blocking(sock):
    byte_size = 64
    # Create a buffer to hold incoming data
    buffer = bytearray(byte_size)
    # Receive data from the socket
    size = sock.recv(byte_size)
    # Parse the received data
    if size > 0:
        data = buffer[:size]
        print("Received data:", data)
        # Do something with the received data here
