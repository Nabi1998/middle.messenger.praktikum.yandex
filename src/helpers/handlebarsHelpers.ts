import Handlebars from 'handlebars';

Handlebars.registerHelper('concat', function (...args: unknown[]) {
  const values = args.slice(0, -1) as Array<string | number>;
  return values.join('');
});


