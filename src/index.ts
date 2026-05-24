import { getWeather, login } from "weathercloud-js";
import { connect } from "mqtt";

(async () => {
  // Weathercloud credentials and station ID from environment variables
  const username = process.env.WEATHERCLOUD_USERNAME;
  const password = process.env.WEATHERCLOUD_PASSWORD
  const weather_station_id = process.env.WEATHERCLOUD_STATION_ID;

  if (!username || !password || !weather_station_id) {
    console.error("Missing WEATHERCLOUD_USERNAME, WEATHERCLOUD_PASSWORD, or WEATHERCLOUD_STATION_ID environment variables.");
    return;
  }

  // MQTT broker credentials from environment variables
  const mqtt_broker_url = process.env.MQTT_BROKER_URL;
  if (!mqtt_broker_url) {
    console.error("Missing MQTT_BROKER_URL environment variables.");
    return;
  }

  // Log in to Weathercloud (to make sure we get indoor readings) and fetch weather data
  const access = await login(username, password, true);
  const weather = await getWeather(weather_station_id);

  if ('error' in weather) {
    console.error("Error fetching weather data:", weather.error);
    return;
  }

  // Connect to the MQTT broker
  let client = await connect(mqtt_broker_url);

  client.on("error", (error) => {
    console.error("MQTT error:", error);
  });

  client.on("connect", async () => {
    console.log("Connected to MQTT broker.");
    // This ensures we only publish properties that make sense as sensors
    // We take all properties of weather and explicitly exclude 'epoch', 'computed', and 'error'
    type WeatherProperty = keyof Omit<typeof weather, 'epoch' | 'computed' | 'error'>;

    const weatherMappings: Array<[WeatherProperty, string]> = [
      ['tempin', 'weathercloud/indoor/temperature'],
      ['humin', 'weathercloud/indoor/humidity'],
      ['dewin', 'weathercloud/indoor/dewpoint'],
      ['heatin', 'weathercloud/indoor/heatindex'],
      ['heat',   'weathercloud/outdoor/heatindex'],
      ['temp',  'weathercloud/outdoor/temperature'],
      ['hum',   'weathercloud/outdoor/humidity'],
      ['dew',   'weathercloud/outdoor/dewpoint'],
      ['bar',   'weathercloud/outdoor/pressure'],
      ['wspd',  'weathercloud/outdoor/windspeed'],
      ['wspdhi','weathercloud/outdoor/windgust'],
      ['wdir',  'weathercloud/outdoor/winddirection'],
      ['rain',  'weathercloud/outdoor/rain'],
      ['rainrate', 'weathercloud/outdoor/rainrate'],
      ['uvi',   'weathercloud/outdoor/uvi'],
      ['solarrad', 'weathercloud/outdoor/solarradiation'],
    ];
    
    // Publish each weather property to its corresponding MQTT topic
    await weatherMappings.forEach(async ([property, topic]) => {
      const value = weather[property];
      if (value !== undefined) {
        await client.publishAsync(topic, value.toString());
        console.log(`Published ${value.toString()} to topic ${topic}`);
      }
    });
    client.end(true);
  });
  

  // Close the MQTT connection and exit when closed (otherwise the script would hang)
  client.on('close', () => {
    console.log('MQTT client closed, exiting.');
    process.exit(0);
  });
})();
