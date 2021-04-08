let cdn = '';

try {
  if (process.env.FOXY_CDN) cdn = process.env.FOXY_CDN;
} catch {
  // env vars are unavailable, use the default
}

export { cdn };
