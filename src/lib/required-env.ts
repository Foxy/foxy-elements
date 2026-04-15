export function getRequiredEnvVar(
  name: keyof Pick<ImportMetaEnv, "VITE_EMBED_ORIGIN">,
): string {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
