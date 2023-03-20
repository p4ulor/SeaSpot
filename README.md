# SeaSpot
## Sistema de Comunicação Móvel em Embarcações de Pesca 
As redes `IoT`(Internet of Things) têm, atualmente, um importante papel no transporte de dados provenientes de sensores ou de outros dispositivos. Uma das tecnologias mais popular atualmente é a [LoRa](https://www.semtech.com/lora/what-is-lora), com aplicações transversais nas mais diferentes áreas. Além de diversas vantagens, a tecnologia `LoRa` apresenta distâncias de cobertura muito superiores às conseguidas pelas redes tradicionais, sendo possível efetuar coberta de regiões sem qualquer tipo de cobertura de rede móvel celular. Uma das aplicações deste tipo de tecnologia é a cobertura marítima, em distâncias muito superiores. No entanto, a comunicação através de dispositivos móveis nestes casos é vedada, pela não existência de cobertura de rede celular terrestre. Pretende-se desenvolver um sistema, composto por sistema central e aplicação cliente móvel, que disponibilize num dispositivo móvel convencional uma aplicação de comunicação através de rede `LoRa`, para usar a bordo de embarcações de pesca, em regiões afastadas da costa. Para isso, existirá um dispositivo a bordo da embarcação que assegurará a comunicação através de uma rede [LoRaWAN](https://lora-alliance.org/about-lorawan/) e efetuará a conversão para [BLE](https://www.bluetooth.com/bluetooth-resources/intro-to-bluetooth-low-energy/), permitindo que a aplicação móvel envie e receba mensagens de estado e disponibilize um serviço de localização num mapa ao utilizador.

O sistema será assim composto por três componentes: 
- Sistema central de gestão de comunicação; 
- Dispositivo para conversão `LoRa` / `BLE`;
- Aplicação Móvel para Android.

Autores:
- Paulo Rosa a44873@alunos.isel.pt
- Raul Santos a44806@alunos.isel.pt
- Tiago Pilaro a46147@alunos.isel.pt

Orientadores: 
- José Simão jose.simao@isel.pt, Sala F.0.15; 
- Nuno Cota nuno.cota@isel.pt, Sala E.0.3.