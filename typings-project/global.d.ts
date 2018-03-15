interface Window {
  HTMLElement: typeof HTMLElement,
  CustomEvent: typeof CustomEvent
}

interface Function {
  createProperties (props)
  typeForProperty (property)
  is: String
  noShadow: Boolean
  observers: Array
}

interface HTMLElement {
  attachShadow(mode)
  connectedCallback ()
  disconnectedCallback ()
  attributeChangedCallback (name, old, value)
  shadowRoot: typeof Element | Element | DocumentFragment | document
}

interface shadowRoot {
  querySelector()
}
