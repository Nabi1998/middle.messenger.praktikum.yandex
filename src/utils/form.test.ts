import { describe, it, expect } from 'vitest';
import { serializeForm } from './form';

describe('serializeForm', () => {
  it('serializes simple fields', () => {
    const form = document.createElement('form');
    const i1 = document.createElement('input');
    i1.name = 'email';
    i1.value = 'user@mail.com';
    form.appendChild(i1);

    const i2 = document.createElement('input');
    i2.name = 'login';
    i2.value = 'user';
    form.appendChild(i2);

    const obj = serializeForm(form);
    expect(obj).toEqual({ email: 'user@mail.com', login: 'user' });
  });
});


