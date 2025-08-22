export type FormDataObject = Record<string, string | string[]>;

export function serializeForm(form: HTMLFormElement): FormDataObject {
  const fd = new FormData(form);
  const result: FormDataObject = {};

  for (const [key, value] of fd.entries()) {
    const stringValue = typeof value === 'string' ? value : '';
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(stringValue);
      } else {
        result[key] = [existing as string, stringValue];
      }
    } else {
      result[key] = stringValue;
    }
  }

  return result;
}


