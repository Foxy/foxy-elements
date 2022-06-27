export const increment = (() => {
  const labels = new Map<string, number>();
  return (label: string, start = 0) => {
    const id = (labels.get(label) ?? start) + 1;
    labels.set(label, id);
    return id;
  };
})();
