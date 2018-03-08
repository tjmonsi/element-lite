interface Window {
  HTMLElement: typeof HTMLElement,
  CustomEvent: typeof CustomEvent,
  customElements: {
    define ()
  }
}

interface Function {
  createProperties (props)
  typeForProperty (property)
  is: String
  observers: Array
}

interface ElementLiteBase {
  __ownProperties: Object
  properties: Object
}

interface HTMLElement {
  attachShadow(mode)
  connectedCallback ()
  disconnectedCallback ()
  attributeChangedCallback (name, old, value)
  shadowRoot: typeof Element | Element | DocumentFragment
}
