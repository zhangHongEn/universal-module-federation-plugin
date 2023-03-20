import getPromise from "./getPromise";

export default function loadScript(url) {
  const {
    promise,
    reject,
    resolve
  } = getPromise()
  const element = document.createElement('script');

  element.src = url;
  element.type = 'text/javascript';
  element.async = true;

  element.onload = () => {
    resolve(element)
  };

  element.onerror = () => {
    reject(element)
  };
  try {
    return promise
  } finally {
    document.head.appendChild(element);
  }
}
