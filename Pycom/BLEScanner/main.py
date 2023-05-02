# main.py -- put your code here!
import time
import binascii

from bleScanner import BLEScanner

ble = BLEScanner()

print("--Start--")
if ble.scan(5000):
    print("Connected to device with addr = {}".format(binascii.hexlify(ble.bluetooth.getpeername())))
    while True:
        data = ble.read_data()
        if data:
            print(data)
        time.sleep(0.050)
else:
    print("No BLE devices found.")
print("--Finish--")
