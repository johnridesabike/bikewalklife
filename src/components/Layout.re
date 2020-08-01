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
      <filter id="logo-text-shadow">
        {ReactDOMRe.createElement(
           "feDropShadow",
           [||],
           ~props=
             ReactDOMRe.objToDOMProps({
               "dx": "-0.5",
               "dy": "0.5",
               "stdDeviation": "0.5",
               "floodColor": "currentColor",
               "floodOpacity": "0.5",
             }),
         )}
      </filter>
      <g
        className="sans-serif color-primary-dark"
        style={ReactDOMRe.Style.make(
          ~fontSize="24px",
          ~filter="url(#logo-text-shadow)",
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
  let SiteMetadata.{site} = SiteMetadata.useQuery();
  <div className=styles##page>
    {switch (site) {
     | Some({siteMetadata: {title, description, copyright, _}}) =>
       <>
         <BsReactHelmet>
           <html lang="en" />
           <title>
             {switch (pageTitle) {
              | Site => title->React.string
              | String(pageTitle) =>
                pageTitle ++ " | " ++ title |> React.string
              }}
           </title>
           {switch (pageTitle) {
            | Site => <meta property="og:title" content=title />
            | String(pageTitle) =>
              <meta property="og:title" content=pageTitle />
            }}
           <meta name="description" content=description />
           <meta property="og:description" content=description />
           <meta property="og:site_name" content=title />
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
             <nav role="navigation" ariaLabel="main navigation">
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
                   <Router.Link to_=Search>
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
             <p> {j|Copyright © |j}->React.string copyright->React.int </p>
             <p>
               <Router.Link to_=Index activeClassName="">
                 "Home"->React.string
               </Router.Link>
             </p>
             <p>
               <Router.Link to_=About activeClassName="">
                 "About"->React.string
               </Router.Link>
             </p>
           </div>
         </footer>
       </>
     | None => React.null
     }}
  </div>;
};
