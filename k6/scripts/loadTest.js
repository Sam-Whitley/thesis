import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

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

export let options = {
  stages: [
    { duration: '5m', target: 100 }, // Ramp-up to 100 users over 5 minutes
    { duration: '10m', target: 100 }, // Stay at 100 users for 10 minutes
    { duration: '5m', target: 0 }, // Ramp-down to 0 users over 5 minutes
  ],

  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% of requests must complete below 1.5s
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
    [`reports/${fullEnvName}.html`]: htmlReport(data, {title: `[K6 Load Test 1 | ${fullEnvName}]`}),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}