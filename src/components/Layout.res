module Logo = {
  /* Use CSS classnames for colors so variables are processed by postcss. */
  @react.component
  let make = (~width) =>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 48" ariaHidden=true width>
      <title id="logo-title"> {"Bike Walk Life"->React.string} </title>
      <desc> {"Bike Walk Life site logo."->React.string} </desc>
      <g
        className="sans-serif"
        style={ReactDOMRe.Style.make(~fontSize="24px", ~fontWeight="400", ())}>
        <text x="6" y="24" className="color-primary-dark" fill="currentColor">
          {"Bike"->React.string}
        </text>
        <text x="26" y="45" className="color-primary" fill="currentColor">
          {"Walk"->React.string}
        </text>
        <text
          x="78"
          y="45"
          className="color-secondary"
          fill="currentColor"
          style={ReactDOMRe.Style.make(~fontStyle="italic", ())}>
          {"Life"->React.string}
        </text>
      </g>
    </svg>
}

@react.component
let make = (~metadata, ~children) => {
  let {title, description, _} = QuerySiteMetadata.use()
  let strings = QueryStrings.use()
  <div className="page">
    <Metadata> metadata </Metadata>
    <Externals.SkipNav.Link />
    <header className="ui-font header__wrapper">
      <div className="small-screen-padding header">
        <h1 className="header__title reading-font">
          <Router.Link className="header__title-link" route=Index activeClassName="" tabIndex={-1}>
            <Logo width="192" />
            <Externals.VisuallyHidden> {title->React.string} </Externals.VisuallyHidden>
          </Router.Link>
        </h1>
        <p className="header__description"> {description->React.string} </p>
        <nav role="navigation" ariaLabel="main navigation">
          <ul className="menu__list">
            <li className="menu__item">
              <Router.Link route=Index className="menu__link"> {"Home"->React.string} </Router.Link>
            </li>
            <li className="menu__item">
              <Router.Link route=About className="menu__link">
                {"About"->React.string}
              </Router.Link>
            </li>
            <li className="menu__item">
              <Router.Link route=Contact className="menu__link">
                {"Contact"->React.string}
              </Router.Link>
            </li>
            <li className="menu__item">
              <Router.Link route=Archive(1) partiallyActive=true className="menu__link">
                {"Archive"->React.string}
              </Router.Link>
            </li>
            <li className="menu__item">
              <Router.Link route=Search className="menu__link">
                {"Search"->React.string}
              </Router.Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <Externals.SkipNav.Content />
    <div className="small-screen-padding content"> children </div>
    <footer className="footer__wrapper">
      <div className="small-screen-padding footer">
        {switch strings.footer {
        | Some(text) => <div dangerouslySetInnerHTML={"__html": text} />
        | None => React.null
        }}
        <p> <Router.Link route=Index activeClassName=""> {"Home"->React.string} </Router.Link> </p>
        <p> <Router.Link route=About activeClassName=""> {"About"->React.string} </Router.Link> </p>
        <p>
          <Router.Link route=Contact activeClassName=""> {"Contact"->React.string} </Router.Link>
        </p>
      </div>
    </footer>
  </div>
}
