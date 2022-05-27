export const deleteDomElement = (element: string) => {
  const el = document.querySelector(element);
  el?.remove();
};

export const selectDomElement = (element: string) =>
  document.querySelector(element);
