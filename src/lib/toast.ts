export const toast = (message: string): void => {
  window.dispatchEvent(new CustomEvent("karkas:toast", { detail: message }));
};
