module Spread = {
  @react.component
  let make = (~props, ~children) => React.cloneElement(children, props)
}

module VisuallyHidden = {
  @module("@reach/visually-hidden") @react.component
  external make: (~children: React.element) => React.element = "default"
}

module Form = {
  @react.component
  let make = (~name, ~honeypot, ~className="", ~onSubmit, ~children) =>
    <Spread props={"data-netlify": true, "data-netlify-honeypot": honeypot}>
      <form className onSubmit name>
        <input type_="hidden" name="form-name" value=name />
        <div ariaHidden=true>
          <VisuallyHidden>
            <label>
              {"Don't fill this out"->React.string} <input name=honeypot tabIndex={-1} />
            </label>
          </VisuallyHidden>
        </div>
        children
      </form>
    </Spread>
}
