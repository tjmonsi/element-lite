interface Window {
  HTMLElement: typeof HTMLElement,
  CustomEvent: typeof CustomEvent
}

interface Function {
  createProperties (props)
  typeForProperty (property)
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
