export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEATHERCLOUD_USERNAME: string;
      WEATHERCLOUD_PASSWORD: string;
      WEATHERCLOUD_STATION_ID: number;
      MQTT_BROKER_URL: string;
    }
  }
}
