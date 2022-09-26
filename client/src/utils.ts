import { IFile, Storage } from "./interfaces/interface";

export const deleteDomElement = (element: string) => {
  const el = document.getElementById(element);
  console.log(el);
  el?.remove();
};

export const selectDomElement = (element: string): HTMLElement | null => {
  return document.querySelector(element) as HTMLElement;
};
export const selectDomElements = (
  element: string
): NodeListOf<HTMLElement> | null => {
  return document.querySelectorAll(element);
};

export const attachEvent = (
  element: Element,
  eventName: string,
  callback: () => void
) => {
  if (element && eventName && element.getAttribute("listener") !== "true") {
    element.setAttribute("listener", "true");
    element.addEventListener(eventName, () => {
      callback();
    });
  }
};

export const detachEvent = (
  element: Element,
  eventName: string,
  callback: () => void
) => {
  if (eventName && element) {
    element.removeEventListener(eventName, callback);
  }
};
