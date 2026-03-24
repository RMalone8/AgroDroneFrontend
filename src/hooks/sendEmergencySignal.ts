import mqtt from 'mqtt';

const client = mqtt.connect('ws://localhost:9001', { clean: true });

client.on('error', (err) => {
  console.error('Emergency MQTT connection error:', err);
});

export function sendEmergencySignal(message: string) {
  const publish = () => {
    console.log('Sending emergency signal:', message);
    client.publish('emergency', message);
  };

  if (client.connected) {
    publish();
  } else {
    client.once('connect', publish);
  }
}
