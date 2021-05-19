import { check, sleep } from 'k6';
import http from "k6/http";

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 800 },
    { duration: '3m', target: 1200 },
    { duration: '3m', target: 50 },
  ],
};

export default function () {
  let r = http.get(`http://localhost:8081/`);
  check(r, {
    'status is 200': r => r.status === 200,
  });
  sleep(3);
}