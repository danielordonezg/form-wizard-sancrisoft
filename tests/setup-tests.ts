import '@testing-library/jest-dom';

// @ts-ignore
global.crypto = global.crypto || { randomUUID: () => 'test-uuid' };
// @ts-ignore
window.scrollTo = window.scrollTo || (() => {});
class RO { observe(){} unobserve(){} disconnect(){} }
// @ts-ignore
window.ResizeObserver = window.ResizeObserver || RO;
