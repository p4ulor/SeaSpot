import time
import binascii
from network import Bluetooth


class BLEScanner:
    def __init__(self):
        self.bluetooth = Bluetooth()
        self.connected = False

    def scan(self,timeout):
        self.bluetooth.start_scan(timeout)
        while self.bluetooth.isscanning():
            adv = self.bluetooth.get_adv()
            if adv:
                # try to get the complete name
                print(self.bluetooth.resolve_adv_data(adv.data, Bluetooth.ADV_NAME_CMPL))

                mfg_data = self.bluetooth.resolve_adv_data(adv.data, Bluetooth.ADV_MANUFACTURER_DATA)

                if mfg_data:
                    # try to get the manufacturer data (Apple's iBeacon data is sent here)
                    print(binascii.hexlify(mfg_data))
                try:
                    if self.connect(adv.mac):
                        return True
                except:
                    pass
        return False

    def connect(self, mac):
        try:
            self.bluetooth.connect(mac)
            self.connected = True
            return True
        except:
            self.connected = False
            return False
        
    def disconnect(self):
        self.bluetooth.disconnect()
        self.connected = False

    def read_data(self):
        if self.connected:
            services = self.bluetooth.services()
            for service in services:
                time.sleep(0.050)
                chars = service.characteristics()
                for char in chars:
                    if (char.properties() & Bluetooth.PROP_READ):
                        return char.read()
        return None
 