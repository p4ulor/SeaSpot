
import struct


class PayloadSender:

    def __init__(self, size=11, sock=None):
        if size < 3:
            size = 3
        self.size = size
        self.payload = bytes()
        self.socket = sock

    def reset_payload(self):
        self.payload = bytes()

    def change_size(self, a_size):
        self.size = a_size

    def get_size(self):
        return len(self.payload)

    def get_payload(self):
        return self.payload

    def set_socket(self, a_socket):
        self.socket = a_socket

    def send(self, reset_payload=False):
        if self.socket is None:
            return False
        else:
            self.socket.send(self.payload)
            if reset_payload:
                self.reset_payload()
            return True

    def set_payload(self, value):
        print("set payload with some data ",value)
        self.payload = (struct.pack('>h', value))
