export function ready(): Promise<void> {
  return new Promise((resolve) => {
    if (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
    ) {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve());
    }
  });
}

const parser = new DOMParser();

export function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): HTMLCollection {
  return parser.parseFromString(
    String.raw({ raw: strings }, ...values),
    'text/html',
  ).body.children;
}
