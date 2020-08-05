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
          siteUrl
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
        style={ReactDOMRe.Style.make(~fontSize="24px", ~fontWeight="400", ())}>
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
let make = (~title as pageTitle, ~route=?, ~children) => {
  switch (query->Gatsby.useStaticQueryUnsafe->parse) {
  | {
      site:
        Some({
          siteMetadata: {siteTitle, description, copyrightYear, siteUrl},
        }),
    } =>
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
        {switch (route) {
         | Some(route) =>
           <link
             rel="canonical"
             content={Router.toStringWithBase(route, siteUrl)}
           />
         | None => React.null
         }}
        {switch (route) {
         | Some(route) =>
           <meta
             property="og:url"
             content={Router.toStringWithBase(route, siteUrl)}
           />
         | None => React.null
         }}
      </BsReactHelmet>
      <Externals.SkipNav.Link />
      <header className=Cn.("ui-font" <:> styles##headerWrapper)>
        <div className=Cn.("small-screen-padding" <:> styles##header)>
          <h1 className=Cn.(styles##title <:> "reading-font")>
            <Router.Link
              className=styles##titleLink
              to_=Index
              activeClassName=""
              tabIndex=(-1)>
              <Logo width="192" />
              <Externals.VisuallyHidden>
                "Bike Walk Life"->React.string
              </Externals.VisuallyHidden>
            </Router.Link>
          </h1>
          <p className=styles##description> description->React.string </p>
          <nav role="navigation" ariaLabel="main navigation">
            <ul className=styles##menuList>
              <li className=styles##menuItem>
                <Router.Link to_=Index className=styles##menuLink>
                  "Home"->React.string
                </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link to_=About className=styles##menuLink>
                  "About"->React.string
                </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link
                  to_={Archive(1)}
                  partiallyActive=true
                  className=styles##menuLink>
                  "Archive"->React.string
                </Router.Link>
              </li>
              <li className=styles##menuItem>
                <Router.Link to_=Search className=styles##menuLink>
                  "Search"->React.string
                </Router.Link>
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
