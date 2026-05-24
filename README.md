This grabs the weather station data from Weathercloud and sends it to MQTT topics.

It supports logging in to get the indoor temperature and humidity.

It is very much a scratch-your-own-itch type of thing, so take it more as an inspiration than a ready-made solution.

## Build
Since the package I'm using to interact with Weathercloud's API apparently wasn't built properly, I had to build it manually. After installing the dependencies, run `npm run builddev`.

## Configuration
Environment variables are set. Within VScode, it's easiest to put them in `.env` like so

    WEATHERCLOUD_USERNAME=my_username
    WEATHERCLOUD_PASSWORD=my_password
    WEATHERCLOUD_STATION_ID=my_station_id_12345
    MQTT_BROKER_URL=mqtt://127.0.0.1:1883
#    MQTT_USERNAME=username
#    MQTT_PASSWORD=password
