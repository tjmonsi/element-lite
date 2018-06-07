export const prepareShadyCSS = (element) => {
  const styles = element.shadowRoot.querySelectorAll('style');
  if (styles.length) {
    const template = document.createElement('template');
    for (let index = 0; index < styles.length; index++) {
      template.content.appendChild(document.importNode(styles[index]), true);
    }
    if (window.ShadyCSS) window.ShadyCSS.prepareTemplate(template, element.constructor.is || element.tagName.toLowerCase());
  }
};
