import dotenv from 'dotenv';

export { getProductConfigurationFromEnv } from '@amplitude/util';

export function polyfillXHR() {
  // @ts-ignore
  const { XMLHttpRequest } = require('xmlhttprequest');
  // @ts-ignore
  global.XMLHttpRequest = XMLHttpRequest;
}

export function polyfillFetch() {
  const fetch = require('node-fetch');

  if (!global.fetch) {
    // @ts-ignore
    global.fetch = fetch
    // @ts-ignore
    global.Headers = fetch.Headers
    // @ts-ignore
    global.Request = fetch.Request
    // @ts-ignore
    global.Response = fetch.Response
  }
}

export function loadEnv() {
  dotenv.config();
}

export function prepareExampleEnv() {
  polyfillXHR();
  polyfillFetch();
  loadEnv();
}
