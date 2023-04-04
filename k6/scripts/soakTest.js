import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2h', target: 1 }, // ramp up to 1 VU and hold for 2 hours

    { duration: '2m', target: 400 }, // ramp up to 400 users
    { duration: '1h56m', target: 400 }, // stay at 400 for ~2 hours
    { duration: '2m', target: 0 }, // scale down. (optional)
  ],
};

export default function () {
  http.get(`http://${__ENV.IP_ADDRESS}/`);
  sleep(5); // wait for 5 seconds before sending the next request
}