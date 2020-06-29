export function parseDuration(value: string) {
  return {
    count: parseInt(value.replace(/(y|m|w|d)/, '')),
    units: value.replace(/\d+(\.\d*)?/, ''),
  };
}
