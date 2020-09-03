module Form = [%form
  type input = {
    name: string,
    email: string,
    message: string,
    [@bs.as "form-name"]
    formName: string,
  };
  type output = input;
  let validators = {
    name: {
      strategy: OnFirstBlur,
      validate: ({name, _}) =>
        switch (name) {
        | "" => Error("Name is required.")
        | name => Ok(name)
        },
    },
    email: {
      strategy: OnFirstBlur,
      validate: ({email, _}) =>
        switch (email) {
        | "" => Error("Email is required.")
        | email => Ok(email)
        },
    },
    message: {
      strategy: OnFirstBlur,
      validate: ({message, _}) =>
        switch (message) {
        | "" => Error("Message is required.")
        | message => Ok(message)
        },
    },
    formName: {
      strategy: OnSubmit,
      validate: ({formName, _}) => Ok(formName),
    },
  }
];

/**
 https://www.netlify.com/blog/2017/07/20/how-to-integrate-netlifys-form-handling-in-a-react-app/
 */
[@bs.val]
external encodeURIComponent: string => string = "encodeURIComponent";

let encode = ({name, email, message, formName}: Form.output) => {
  let e = encodeURIComponent;
  [|
    ("name", name),
    ("email", email),
    ("message", message),
    ("form-name", formName),
  |]
  ->Array.map(((key, value)) => e(key) ++ "=" ++ e(value))
  ->Js.Array2.joinWith("&");
};

module Spread = {
  [@react.component]
  let make = (~props, ~children) => React.cloneElement(children, props);
};

let initialInput: Form.input = {
  name: "",
  email: "",
  message: "",
  formName: "contact",
};

[@react.component]
let make = () => {
  let form =
    Form.useForm(~initialInput, ~onSubmit=(output, callback) => {
      Fetch.fetchWithInit(
        "/",
        Fetch.RequestInit.make(
          ~method_=Fetch.Post,
          ~headers=
            Fetch.HeadersInit.make({
              "Content-Type": "application/x-www-form-urlencoded",
            }),
          ~body=Fetch.BodyInit.make(encode(output)),
          (),
        ),
      )
      ->Promise.Js.fromBsPromise
      ->Promise.Js.toResult
      ->Promise.tapOk(_ => {callback.notifyOnSuccess(Some(initialInput))})
      ->Promise.tapError(x => {
          callback.notifyOnFailure();
          Js.Console.error(x);
        })
      ->ignore
    });
  <Netlify.Form
    name="contact"
    honeypot="honeypot"
    className="contact-form"
    onSubmit={event => {
      event->ReactEvent.Form.preventDefault;
      form.submit();
    }}>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-name">
          "Name"->React.string
        </label>
        <div className="contact-form__error" id="contact-form-name-error">
          {switch (form.nameResult) {
           | Some(Error(message)) => message->React.string
           | Some(Ok(_))
           | None => React.null
           }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid":
            switch (form.nameResult) {
            | Some(Error(_)) => "true"
            | Some(Ok(_))
            | None => "false"
            },
        }>
        <input
          type_="text"
          id="contact-form-name"
          name="name"
          className="contact-form__input"
          disabled={form.submitting}
          onBlur={_ => form.blurName()}
          value={form.input.name}
          ariaDescribedby="contact-form-name-error"
          onChange={event =>
            form.updateName(
              (input, name) => {...input, name},
              event->ReactEvent.Form.target##value,
            )
          }
        />
      </Spread>
    </div>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-email">
          "Email"->React.string
        </label>
        <div className="contact-form__error" id="contact-form-email-error">
          {switch (form.emailResult) {
           | Some(Error(message)) => message->React.string
           | Some(Ok(_))
           | None => React.null
           }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid":
            switch (form.emailResult) {
            | Some(Error(_)) => "true"
            | Some(Ok(_))
            | None => "false"
            },
        }>
        <input
          type_="email"
          id="contact-form-email"
          name="email"
          className="contact-form__input"
          ariaDescribedby="contact-form-email-error"
          disabled={form.submitting}
          onBlur={_ => form.blurEmail()}
          value={form.input.email}
          onChange={event =>
            form.updateEmail(
              (input, email) => {...input, email},
              event->ReactEvent.Form.target##value,
            )
          }
        />
      </Spread>
    </div>
    <div className="contact-form__input-wrapper">
      <div className="contact-form__label-wrapper">
        <label className="contact-form__label" htmlFor="contact-form-message">
          "Message"->React.string
        </label>
        <div className="contact-form__error" id="contact-form-message-error">
          {switch (form.messageResult) {
           | Some(Error(message)) => message->React.string
           | Some(Ok(_))
           | None => React.null
           }}
        </div>
      </div>
      <Spread
        props={
          "aria-invalid":
            switch (form.messageResult) {
            | Some(Error(_)) => "true"
            | Some(Ok(_))
            | None => "false"
            },
        }>
        <textarea
          id="contact-form-message"
          name="message"
          ariaDescribedby="contact-form-message-error"
          className="contact-form__message"
          disabled={form.submitting}
          onBlur={_ => form.blurMessage()}
          value={form.input.message}
          cols=34
          rows=10
          style={ReactDOMRe.Style.make(~width="100%", ())}
          onChange={event =>
            form.updateMessage(
              (input, message) => {...input, message},
              event->ReactEvent.Form.target##value,
            )
          }
        />
      </Spread>
    </div>
    <button disabled={form.submitting || !form.valid()} className="ui-font">
      "Submit"->React.string
    </button>
    {switch (form.status) {
     | Editing => React.null
     | Submitting(_) => <p> "Submitting..."->React.string </p>
     | Submitted =>
       <p>
         <strong> "Message submitted. "->React.string </strong>
         <span ariaHidden=true> {j|🎉|j}->React.string </span>
       </p>
     | SubmissionFailed(_) =>
       <p className="contact-form__error">
         "Something went wrong. Try again later."->React.string
       </p>
     }}
  </Netlify.Form>;
};
