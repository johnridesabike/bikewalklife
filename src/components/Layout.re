%raw
"import { graphql } from 'gatsby'";

[%graphql
  {|
    query getMetadata {
      site {
        siteMetadata {
          siteTitle: title
          description
          copyrightYear
        }
      }
    }
|};
  {inline: true}
];

type metadata =
  | Site
  | String(string);

let styles = Gatsby.importCss("./Layout.module.css");

module Logo = {
  [@react.component]
  let make = (~height=?, ~width=?) =>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 48"
      ariaHidden=true
      ?height
      ?width>
      <title id="logo-title"> "Bike Walk Life"->React.string </title>
      <desc> "Bike Walk Life site logo."->React.string </desc>
      <g
        className="sans-serif"
        style={ReactDOMRe.Style.make(
          ~fontSize="24px",
          ~fontWeight="400",
          ~textShadow="-1px 1px 1px var(--color-primary)",
          (),
        )}>
        <text x="6" y="24" fill="var(--color-primary-dark)">
          "Bike"->React.string
        </text>
        <text x="26" y="45" fill="var(--color-primary)">
          "Walk"->React.string
        </text>
        <text
          x="78"
          y="45"
          fill="var(--color-secondary)"
          style={ReactDOMRe.Style.make(~fontStyle="italic", ())}>
          "Life"->React.string
        </text>
      </g>
    </svg>;
};

[@react.component]
let make = (~title as pageTitle, ~children) => {
  switch (query->Gatsby.useStaticQueryUnsafe->parse) {
  | {site: Some({siteMetadata: {siteTitle, description, copyrightYear}})} =>
    <div className=styles##page>
      <BsReactHelmet>
        <html lang="en" />
        <title>
          {switch (pageTitle) {
           | Site => siteTitle->React.string
           | String(pageTitle) =>
             pageTitle ++ " | " ++ siteTitle |> React.string
           }}
        </title>
        {switch (pageTitle) {
         | Site => <meta property="og:title" content=siteTitle />
         | String(pageTitle) => <meta property="og:title" content=pageTitle />
         }}
        <meta name="description" content=description />
        <meta property="og:description" content=description />
        <meta property="og:site_name" content=siteTitle />
      </BsReactHelmet>
      <Externals.SkipNav.Link />
      <header className=Cn.("ui-font" <:> styles##headerWrapper)>
        <div className=Cn.("small-screen-padding" <:> styles##header)>
          <h1 className=Cn.(styles##title <:> "reading-font")>
            <Router.Link to_=Index activeClassName="">
              <Logo width="192" />
              <Externals.VisuallyHidden>
                "Bike Walk Life"->React.string
              </Externals.VisuallyHidden>
            </Router.Link>
          </h1>
          <p className=styles##description> description->React.string </p>
          <nav
            role="navigation"
            ariaLabel="main navigation"
            className=styles##menu>
            <ul className=styles##menuList>
              <li className=styles##menuItem>
                <Router.Link to_=Index> "Home"->React.string </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link to_=About> "About"->React.string </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link to_={Archive(1)} partiallyActive=true>
                  "Archive"->React.string
                </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link to_=Search> "Search"->React.string </Router.Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <Externals.SkipNav.Content />
      <main className=Cn.("small-screen-padding" <:> styles##content)>
        children
      </main>
      <footer className=styles##footerWrapper>
        <div className=Cn.("small-screen-padding" <:> styles##footer)>
          <p> {j|Copyright © |j}->React.string copyrightYear->React.int </p>
          <p>
            <Router.Link to_=Index activeClassName="">
              "Home"->React.string
            </Router.Link>
          </p>
          <p>
            <Router.Link to_=About activeClassName="">
              "About / Contact"->React.string
            </Router.Link>
          </p>
        </div>
      </footer>
    </div>
  | {site: None} => React.null
  };
};
