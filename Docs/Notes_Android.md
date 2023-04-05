## Testing the application
Since the Android emulator (simulator) can't connect to real physical devices or [support bluetooth](https://stackoverflow.com/a/22604347/9375488). A real device is needed to debug and test the application. Also there's greater speed when using an external device.

## Android and BLE
- [Bluetooth setup needed before using BLE](https://developer.android.com/guide/topics/connectivity/bluetooth/setup)
- [About Bluetooth Low Energy and how to start using it](https://developer.android.com/guide/topics/connectivity/bluetooth/ble-overview)
- [About BLE article](https://source.android.com/docs/core/connect/bluetooth/ble?hl=en)
- [Good Medium article about BLE](https://medium.com/@martijn.van.welie/making-android-ble-work-part-1-a736dcd53b02)
- [Old repo about using BLE w/ Android](https://github.com/androidthings/sample-bluetooth-le-gattserver)

## About the map display
Near the end of the project, we intend to use the [Android SDK](https://docs.mapbox.com/android/maps/guides/) of [MapBox](https://www.mapbox.com/). It's used by several other companies, it's easy to start using, no credit card is needed (contrary to Google Map's Platform) and it seems to have a good documentation. Several other 100% free alternatives don't seem to be as atractive. While Mapbox isn't entirely free, it has a generous free tier in its pricing packages that makes the service attractive for apps with a low volume of users. [Free for up to 25,000 mobile users](https://www.mapbox.com/pricing#maps). Another advantage of mapbox which is useful in the context of our project is the ability to use [maps offline](https://docs.mapbox.com/android/maps/guides/offline/).

## For testing
It's recommended to use another Android device which acts as a client or server to trade messages. Example app's to use:
- [BLE Tool by CozyOZ](https://play.google.com/store/apps/details?id=com.cozyoz.bletool&hl=en_US)
- [BLE Scanner (Connect & Notify) by Bluepixel Technologies](https://play.google.com/store/apps/details?id=com.macdom.ble.blescanner&hl=en_US)
- [BLE Tool by LAPIS Semiconductor](https://play.google.com/store/apps/details?id=com.lapis_semi.bleapp&hl=en_US)

The alternative would be to use an Arduino and setup a GATT server.

## List of phones tested on
- Samsung Galaxy A12. Android version: 13
