// @ts-expect-error: jsdom-global types are missing
import jsdom from 'jsdom-global';

jsdom(undefined, {
  url: 'http://localhost/'
});
