# About the TTGO T-Beam V1.0 ESP32 by LILYGO®
This is the device that will be used to test our comunications. It's configured using Python.
- [Images and documentation of the device (official)](http://www.lilygo.cn/claprod_view.aspx?TypeId=62&Id=1281&FId=t28:62:28)

## Guide to setup the T-Beam properly to make it work w/ Python
- Start from slide 10 in `02 - Sensors and Actuators_completo`. The installation link is broken, go [here](https://docs.pycom.io/updatefirmware/device/) to install Pycom firmware tool
- Install the [driver needed to fix the comunication between the T-Beam and the PC w/ USB](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers?tab=downloads). Select Install "CP210x Universal Windows Driver, v11.2.0, 10/21/2022" from the list. Extract the contents of the .rar to a folder. Then when having the T-Beam connected to your PC, go to "Device Manager". Right click the device, go to properties. Go to tab "Driver". Update driver. Browse my conputer for drivers. Then select the folder w/ the contents of the .rar.
- In slide 15: Make sure the selection of the Port works now given the previous step (marked as 3 in the image) 
- For the File location step (marked as 5 in the image), select [this rar](https://github.com/nunomcruz/pycom-micropython-sigfox/releases/tag/v1.20.2.r4-tbeamv1) by teacher Nuno Cruz
- Continue the guide
- In VSC install the [PyMakr extension](https://marketplace.visualstudio.com/items?itemName=pycom.Pymakr)

## Resources
- [Video - MicroPython using VSCode PyMakr on ESP32/ESP8266](https://www.youtube.com/watch?v=YOeV14SESls)
- [Connecting the T-Beam to TTN (official)](https://www.thethingsnetwork.org/forum/t/ttgo-t-beam-howto-connect/36757/5)
- [Connecting the T-Beam to TTN (article)](https://www.css-techhelp.com/post/lorawan-connecting-your-device-to-the-things-network)
- [Medium Article - How I sent my first LoRaWAN message to The Things Network using a TTGO ESP32 & Micropython](https://medium.com/@JoooostB/how-i-send-my-first-lorawan-message-to-the-things-network-using-a-ttgo-esp32-micropython-a3fe447fff82)
