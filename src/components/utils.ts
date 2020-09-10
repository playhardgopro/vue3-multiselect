export function isEqual(first: string, second: string) {
  return first === second;
}

export function isNotEqual(first: string, second: string) {
  return first !== second;
}

export function debounce(
  func: Function,
  wait: number,
  immediate: boolean = false
): Function {
  let timeout: number | undefined;

  return function executedFunction(this: any) {
    const context: any = this;
    const args = arguments;

    const later = function() {
      timeout = 0;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}
