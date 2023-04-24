import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

const envNameMap = {
  L1: 'L1 - WordPress with LAMP Stack (VM)',
  L2: 'L2 - WordPress with LAMP Stack (WSL2)',
  L4: 'L4 - Jamstack with LAMP Stack (WSL2)',
  L5: 'L5 - Jamstack with LAMP Stack (VM)',
  L6: 'L6 - WordPress with LEMP Stack (VM)',
  L7: 'L7 - Jamstack with LEMP Stack (VM)',
  L8: 'L8 - WordPress with LEMP Stack (WSL2)',
  L9: 'L9 - Jamstack with LEMP Stack (WSL2)',
};

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 1000,
      timeUnit: '1s',
      stages: [
        { duration: '10s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '10s', target: 140 },
        { duration: '3m', target: 140 },
        { duration: '10s', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '10s', target: 0 },
        // 7m40s
      ],
      gracefulStop: '2m',
    },
  },
};

export default function () {
  const res = http.get(`http://${__ENV.IP_ADDRESS}`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'content type is text/html': (r) => r.headers['Content-Type'].includes('text/html'),
    'verify homepage text': (r) => r.body.includes('Lorem ipsum dolor'),
  });
}

function getFullEnvName(envAlias) {
  return envNameMap[envAlias] || envAlias;
}

export function handleSummary(data) {
  const fullEnvName = getFullEnvName(__ENV.ENVNAME);
  return {
    [`reports/${fullEnvName}.html`]: htmlReport(data, {title: `[Spike Test | ${fullEnvName}]`}),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}