module Spread = {
  [@react.component]
  let make = (~props, ~children) => React.cloneElement(children, props);
};

module Form = {
  [@react.component]
  let make = (~name, ~honeypot, ~className=?, ~onSubmit=?, ~children) =>
    <Spread props={"data-netlify": true, "data-netlify-honeypot": honeypot}>
      <form ?className ?onSubmit name>
        <input type_="hidden" name="form-name" value=name />
        <div ariaHidden=true>
          <Externals.VisuallyHidden>
            <label>
              "Don't fill this out"->React.string
              <input name=honeypot />
            </label>
          </Externals.VisuallyHidden>
        </div>
        children
      </form>
    </Spread>;
};
