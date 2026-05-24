#!/bin/sh
set -eu

# Default schedule: every minute
: "${CRON_SCHEDULE:=*/1 * * * *}"

# Save environment for crond jobs
printenv > /etc/environment

# Create a crontab file for the job
echo "$CRON_SCHEDULE /usr/local/bin/node /app/dist/index.js >> /var/log/weathercloud_to_mqtt.log 2>&1" > /etc/cron.d/weathercloud_to_mqtt
chmod 0644 /etc/cron.d/weathercloud_to_mqtt
crontab /etc/cron.d/weathercloud_to_mqtt

touch /var/log/weathercloud_to_mqtt.log

# Optionally run once on container start
if [ "${RUN_ON_START:-false}" = "true" ]; then
    echo "Running job once at container start"
   node /app/dist/index.js || true
fi

echo "Starting crond (schedule: ${CRON_SCHEDULE})"
# Start crond (Debian/Ubuntu crond)
crond && tail -F /var/log/weathercloud_to_mqtt.log
