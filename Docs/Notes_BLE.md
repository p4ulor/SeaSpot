# Bluetooth Low Energy
The Android App will use BLE in order to communicate with another device which will connect to LoRaWAN.

## About number assignment
- https://www.bluetooth.com/specifications/assigned-numbers/ 
- Checkout the [Assigned Numbers Document](https://btprodspecificationrefs.blob.core.windows.net/assigned-numbers/Assigned%20Number%20Types/Assigned_Numbers.pdf) to properly define the UUID's of the services, characteristics and descriptors

## Acronyms
- UUID - Universally Unique Identifier
- GATT - Generic Attribute Profile
- ATT - Attribute Protocol

## Server characteristics in a Bluetooth Low Energy
This code is an example of how to manage server characteristics in a Bluetooth Low Energy (BLE) device.
```python
from network import Bluetooth

def conn_cb (bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

def char1_cb_handler(chr, data):

    # The data is a tuple containing the triggering event and the value if the event is a WRITE event.
    # We recommend fetching the event and value from the input parameter, and not via characteristic.event() and characteristic.value()
    events, value = data
    if  events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(value))
    else:
        print('Read request on char 1')

def char2_cb_handler(chr, data):
    # The value is not used in this callback as the WRITE events are not processed.
    events, value = data
    if  events & Bluetooth.CHAR_READ_EVENT:
        print('Read request on char 2')

bluetooth = Bluetooth()
bluetooth.set_advertisement(name='SEASPOT', service_uuid=b'1234567890123456')
bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)
bluetooth.advertise(True)

srv1 = bluetooth.service(uuid=b'1234567890123456', isprimary=True)
chr1 = srv1.characteristic(uuid=b'ab34567890123456', value=5)
char1_cb = chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=char1_cb_handler)

srv2 = bluetooth.service(uuid=1234, isprimary=True)
chr2 = srv2.characteristic(uuid=4567, value=0x1234)
char2_cb = chr2.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char2_cb_handler)
```
A Bluetooth object is created, and the device is set to advertise its presence with the name ``'SEASPOT'`` and the service ``UUID '1234567890123456'``. The callback method is used to register a callback function conn_cb that will be executed when a client connects or disconnects from the device. A service is created using the service method of the Bluetooth object. Then, a characteristic ``chrx`` is created within the service with the ``UUID 'xxxxxxxxxxxxxxxx'`` and an initial value. A callback function ``charx_cb_handler`` is registered for this characteristic to handle write and read or read events. Summarily the example demonstrates how to set up Bluetooth services, characteristics, and callbacks to handle read and write events on those characteristics. 

### Sources
- [Bluetooth BLE](https://www.bluetooth.com/bluetooth-resources/intro-to-bluetooth-low-energy/)
- [BLE (Wikipedia)](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy)
- [What is Bluetooth Low Energy (BLE)](https://litum.com/what-is-ble-how-does-ble-work/)
- [Bluetooth Specification](https://www.bluetooth.com/specifications/specs/core-specification-5-3/)
- [Article about Services, Characteristics, Descriptors and Declarations](http://www.blesstags.eu/2018/08/services-characteristics-descriptors.html)
- [Article about GATT](https://microchipdeveloper.com/wireless:ble-gatt-overview)
- [Book - Getting Started with Bluetooth Low Energy by O’Reilly (very good)](https://www.oreilly.com/library/view/getting-started-with/9781491900550/)
