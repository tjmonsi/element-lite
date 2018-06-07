import { html, render } from './lit-html/lib/lit-extended.js';

export const prepareShadyCSS = (style, name) => {
  if (window.ShadyCSS && style) {
    const t = document.createElement('template');
    render(html`<style>${style}</style>`, t.content);
    window.ShadyCSS.prepareTemplate(t, name);
  }
};
