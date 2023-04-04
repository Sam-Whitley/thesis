import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'
//import { envNameMap } from './getFullEnvName.js'; // Not importing for some reason

const envNameMap = {
  L1: 'L1 - WordPress (LAMP VM)',
  L2: 'L2 - WordPress (LAMP WSL2)',
  L4: 'L4 - Jamstack (LAMP WSL2)',
  L5: 'L5 - Jamstack (LAMP VM)',
  L6: 'L6 - WordPress (LEMP VM)',
  L7: 'L7 - Jamstack (LEMP VM)',
  L8: 'L8 - WordPress (LEMP WSL2)',
  L9: 'L9 - Jamstack (LEMP WSL2)',
};

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 500,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 10 }, // below normal load
        { duration: '5m', target: 10 },
        { duration: '2m', target: 20 }, // normal load
        { duration: '5m', target: 20 },
        { duration: '2m', target: 30 }, // around the breaking point
        { duration: '5m', target: 30 },
        { duration: '2m', target: 40 }, // beyond the breaking point
        { duration: '5m', target: 40 },
        { duration: '10m', target: 0 }, // scale down. Recovery stage.
      ],
      gracefulStop: '2m',
    },
  },
};

export default function() {
  const res = http.get(`http://${__ENV.IP_ADDRESS}/`);
  check(res, {
    'status is 200': r => r.status === 200,
    'content type is text/html': r => r.headers['Content-Type'] === 'text/html',
  });
  sleep(1); // wait for 1 second before sending the next request
}

function getFullEnvName(envAlias) {
  return envNameMap[envAlias] || envAlias;
}

export function handleSummary(data) {
  const fullEnvName = getFullEnvName(__ENV.ENVNAME);
  return {
    [`reports/${fullEnvName}.html`]: htmlReport(data, {title: `[K6 Stress Test 1 | ${fullEnvName}]`}),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}