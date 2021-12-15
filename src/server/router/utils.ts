export const increment = (() => {
  const labels = new Map<string, number>();
  return (label: string) => {
    const id = (labels.get(label) ?? 0) + 1;
    labels.set(label, id);
    return id;
  };
})();
