export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    const stringUrl = url.toString();

    if (stringUrl.endsWith('/') && !value.endsWith('/')) {
      if (stringUrl.substring(0, stringUrl.length - 1) !== value) return false;
    } else {
      if (stringUrl !== value) return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
