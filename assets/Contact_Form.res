module VisuallyHidden = {
  @module("@reach/visually-hidden") @react.component
  external make: (~children: React.element) => React.element = "default"
}

module Spread = {
  @react.component
  let make = (~props, ~children) => React.cloneElement(children, props)
}

module Netlify = {
  @react.component
  let make = (~formName, ~honeypot, ~className, ~onSubmit, ~children) =>
    <Spread props={"data-netlify": true, "data-netlify-honeypot": honeypot}>
      <form className onSubmit name=formName>
        <input type_="hidden" name="form-name" value=formName />
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

module Form = %form(
  type input = {
    name: string,
    email: string,
    message: string,
  }

  type output = input

  let validators = {
    name: {
      strategy: OnFirstBlur,
      validate: x =>
        switch x.name {
        | "" => Error("Name is required.")
        | name => Ok(name)
        },
    },
    email: {
      strategy: OnFirstBlur,
      validate: x =>
        switch x.email {
        | "" => Error("Email is required.")
        | email => Ok(email)
        },
    },
    message: {
      strategy: OnFirstBlur,
      validate: x =>
        switch x.message {
        | "" => Error("Message is required.")
        | message => Ok(message)
        },
    },
  }
)

/**
 https://www.netlify.com/blog/2017/07/20/how-to-integrate-netlifys-form-handling-in-a-react-app/
 */
@val
external encodeURIComponent: string => string = "encodeURIComponent"

let encode = ({name, email, message}: Form.output, ~formName) =>
  [("name", name), ("email", email), ("message", message), ("form-name", formName)]
  ->Belt.Array.mapU((. (key, value)) => encodeURIComponent(key) ++ "=" ++ encodeURIComponent(value))
  ->Js.Array2.joinWith("&")

let initialInput: Form.input = {
  name: "",
  email: "",
  message: "",
}

let formName = "contact"

@react.component
let make = () => {
  let form = Form.useForm(~initialInput, ~onSubmit=(output, callback) =>
    Fetch.fetchWithInit(
      "/",
      Fetch.RequestInit.make(
        ~method_=Fetch.Post,
        ~headers=Fetch.HeadersInit.make({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        ~body=Fetch.BodyInit.make(encode(output, ~formName)),
        (),
      ),
    )
    |> Js.Promise.then_(x => {
      callback.notifyOnSuccess(Some(initialInput))
      Js.Promise.resolve(x)
    })
    |> Js.Promise.catch(x => {
      callback.notifyOnFailure()
      Js.Console.error(x)
      Js.Promise.reject(Failure(Js.String.make(x)))
    })
    |> ignore
  )
  <Netlify
    formName
    honeypot="honeypot"
    className="contact-form"
    onSubmit={event => {
      event->ReactEvent.Form.preventDefault
      form.submit()
    }}>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-name">
          {"Name"->React.string}
        </label>
        <div className="contact-form__error" id="contact-form-name-error">
          {switch form.nameResult {
          | Some(Error(message)) => message->React.string
          | Some(Ok(_)) | None => React.null
          }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid": switch form.nameResult {
          | Some(Error(_)) => "true"
          | Some(Ok(_)) | None => "false"
          },
        }>
        <input
          type_="text"
          id="contact-form-name"
          name="name"
          className="contact-form__input"
          disabled=form.submitting
          onBlur={_ => form.blurName()}
          value=form.input.name
          ariaDescribedby="contact-form-name-error"
          onChange={event =>
            form.updateName(
              (input, name) => {...input, name: name},
              ReactEvent.Form.target(event)["value"],
            )}
        />
      </Spread>
    </div>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-email">
          {"Email"->React.string}
        </label>
        <div className="contact-form__error" id="contact-form-email-error">
          {switch form.emailResult {
          | Some(Error(message)) => message->React.string
          | Some(Ok(_)) | None => React.null
          }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid": switch form.emailResult {
          | Some(Error(_)) => "true"
          | Some(Ok(_)) | None => "false"
          },
        }>
        <input
          type_="email"
          id="contact-form-email"
          name="email"
          className="contact-form__input"
          ariaDescribedby="contact-form-email-error"
          disabled=form.submitting
          onBlur={_ => form.blurEmail()}
          value=form.input.email
          onChange={event =>
            form.updateEmail(
              (input, email) => {...input, email: email},
              ReactEvent.Form.target(event)["value"],
            )}
        />
      </Spread>
    </div>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-message">
          {"Message"->React.string}
        </label>
        <div className="contact-form__error" id="contact-form-message-error">
          {switch form.messageResult {
          | Some(Error(message)) => message->React.string
          | Some(Ok(_)) | None => React.null
          }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid": switch form.messageResult {
          | Some(Error(_)) => "true"
          | Some(Ok(_)) | None => "false"
          },
        }>
        <textarea
          id="contact-form-message"
          name="message"
          ariaDescribedby="contact-form-message-error"
          className="contact-form__message"
          disabled=form.submitting
          onBlur={_ => form.blurMessage()}
          value=form.input.message
          cols=34
          rows=10
          style={ReactDOMRe.Style.make(~width="100%", ())}
          onChange={event =>
            form.updateMessage(
              (input, message) => {...input, message: message},
              ReactEvent.Form.target(event)["value"],
            )}
        />
      </Spread>
    </div>
    <button disabled={form.submitting} className="ui-font font-size-medium">
      {"Submit"->React.string}
    </button>
    {switch form.status {
    | Editing => React.null
    | Submitting(_) => <p> {"Submitting..."->React.string} </p>
    | Submitted => <p> <strong> {"Message submitted!"->React.string} </strong> </p>
    | SubmissionFailed(_) =>
      <p className="contact-form__error">
        {"Something went wrong. Try again later."->React.string}
      </p>
    }}
  </Netlify>
}
