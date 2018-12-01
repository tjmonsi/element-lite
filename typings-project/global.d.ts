interface Window {
  HTMLElement: typeof HTMLElement,
  CustomEvent: typeof CustomEvent,
  ShadyCSS: typeof any
}

interface Function {
  createProperties (props)
  typeForProperty (property)
  is: String
  noShadow: Boolean
  observers: Array
}

interface HTMLElement {
  constructor ()
  attachShadow(mode)
  connectedCallback ()
  disconnectedCallback ()
  attributeChangedCallback (name, old, value)
  shadowRoot: typeof Element | Element | DocumentFragment | document
}

interface PropertiesLite extends HTMLElement {
  requestRender (name?, oldValue?)
}

interface shadowRoot {
  querySelector()
}
