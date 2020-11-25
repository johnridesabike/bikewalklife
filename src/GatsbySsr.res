type onRenderBody = {setPostBodyComponents: (. array<React.element>) => unit}

let onRenderBody = ({setPostBodyComponents}) =>
  setPostBodyComponents(.[
    <script
      key="test" type_="text/javascript" dangerouslySetInnerHTML={"__html": "console.log('hi');"}
    />,
  ])
