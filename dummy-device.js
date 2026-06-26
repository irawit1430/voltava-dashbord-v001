

const API_URL = 'https://voltava-dashboard.onrender.com/api/devices/ingest';
const DEVICE_ID = 'TEST-DUMMY-01';

// Base initial state for the dummy device
let telemetry = {
  voltage: 50.0,
  current: -10.0,
  soc: 80,
  temp: 35.0,
  faults: [],
};

// Function to generate random variations
function fluctuate(value, maxDelta) {
  return value + (Math.random() - 0.5) * maxDelta;
}

// Function to simulate telemetry data changing over time
function simulateTelemetry() {
  // Battery discharging slowly
  telemetry.soc = Math.max(0, telemetry.soc - 0.1);
  telemetry.voltage = fluctuate(50.0 + (telemetry.soc - 50) * 0.05, 0.5);
  telemetry.current = fluctuate(-15.0, 2.0); // Discharging
  telemetry.temp = fluctuate(35.0 + (100 - telemetry.soc) * 0.1, 1.0);

  // Add random faults occasionally
  if (Math.random() < 0.01) {
    telemetry.faults = ['Over-temperature Warning'];
    telemetry.temp += 10; 
  } else if (Math.random() < 0.02 && telemetry.faults.length > 0) {
    telemetry.faults = []; // Clear faults
  }
}

// Function to send data to the dashboard
async function sendTelemetry() {
  simulateTelemetry();

  const payload = {
    id: DEVICE_ID,
    payload: {
      name: 'Testing Dummy Device',
      type: 'bms',
      model: 'Dummy-Li-Ion-50V',
      firmware: 'v1.0.0-test',
      location: { lat: 28.5355, lng: 77.3910, city: 'Testing Lab' },
      owner: 'Test Engineer',
      gatewayId: 'GW-DEL-TLM-01',
      voltage: Number(telemetry.voltage.toFixed(2)),
      current: Number(telemetry.current.toFixed(2)),
      soc: Math.round(telemetry.soc),
      soh: 98,
      temp: Number(telemetry.temp.toFixed(1)),
      faults: telemetry.faults,
      cellVoltages: Array(16).fill(0).map(() => Number((telemetry.voltage / 16 + (Math.random() - 0.5) * 0.05).toFixed(2))),
      cellTemps: Array(16).fill(0).map(() => Math.round(telemetry.temp + (Math.random() - 0.5) * 2)),
      mosfetStatus: telemetry.faults.includes('Over-temperature Warning') ? 'off' : 'on',
      power: Number((Math.abs(telemetry.voltage * telemetry.current) / 1000).toFixed(2)) // kW
    }
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer default-dev-key'
      },
      body: JSON.stringify(payload)
    });
    const responseData = await res.text();
    console.log(`[${new Date().toISOString()}] Data sent. Status: ${res.status}, Response: ${responseData}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending telemetry:`, error.message);
  }
}

console.log(`Starting Dummy Device (${DEVICE_ID})...`);
console.log(`Sending telemetry to ${API_URL} every 3 seconds.`);

// Send immediately, then every 3 seconds
sendTelemetry();
setInterval(sendTelemetry, 3000);
