module Option = Belt.Option
module Array = Belt.Array
module Json = Js.Json

@val
external encodeURIComponent: string => string = "encodeURIComponent"

module Mention = {
  @react.component
  let make = (~data) => {
    let url = Js.Dict.get(data, "url")->Option.flatMap(Json.decodeString)
    let author = Js.Dict.get(data, "author")->Option.flatMap(Json.decodeObject)
    let name =
      author
      ->Option.flatMap(x => Js.Dict.get(x, "name"))
      ->Option.flatMap(Json.decodeString)
      ->Option.getWithDefault("Anonymous")
    let photo =
      author->Option.flatMap(x => Js.Dict.get(x, "photo"))->Option.flatMap(Json.decodeString)
    switch (url, photo) {
    | (Some(url), Some(photo)) =>
      <div className="entry-page__webmentions-photo">
        <a href={url} className="h-card u-url">
          <img src={photo} alt={name} height="48" width="48" />
        </a>
      </div>
    | _ => React.null
    }
  }
}

@react.component
let make = (~url) => {
  let (reposts, setReposts) = React.useState(() => [])
  let (likes, setLikes) = React.useState(() => [])
  React.useEffect0(() => {
    Fetch.fetch("https://webmention.io/api/mentions.jf2?target=" ++ encodeURIComponent(url))
    |> Js.Promise.then_(Fetch.Response.json)
    |> Js.Promise.then_(json => {
      let mentions =
        json
        ->Json.decodeObject
        ->Option.flatMap(x => Js.Dict.get(x, "children"))
        ->Option.flatMap(Json.decodeArray)
        ->Option.map(x => Array.keepMap(x, Json.decodeObject))
        ->Option.getWithDefault([])
        ->Belt.SortArray.stableSortBy((a, b) => {
          // "published" time can be null
          let a =
            a
            ->Js.Dict.get("wm-received")
            ->Option.flatMap(Json.decodeString)
            ->Option.map(Js.Date.parseAsFloat)
          let b =
            b
            ->Js.Dict.get("wm-received")
            ->Option.flatMap(Json.decodeString)
            ->Option.map(Js.Date.parseAsFloat)
          switch (a, b) {
          | (Some(a), Some(b)) => compare(b, a)
          | _ => 0
          }
        })
      let reposts = Array.keepMap(mentions, dict =>
        Js.Dict.get(dict, "wm-property")
        ->Option.flatMap(Json.decodeString)
        ->Option.flatMap(x =>
          switch x {
          | "repost-of" => Some(dict)
          | _ => None
          }
        )
      )->Array.slice(~offset=0, ~len=24)
      setReposts(_ => reposts)
      let likes = Array.keepMap(mentions, dict =>
        Js.Dict.get(dict, "wm-property")
        ->Option.flatMap(Json.decodeString)
        ->Option.flatMap(x =>
          switch x {
          | "like-of" => Some(dict)
          | _ => None
          }
        )
      )->Array.slice(~offset=0, ~len=24)
      setLikes(_ => likes)
      Js.Promise.resolve()
    })
    |> ignore
    None
  })
  <div className="entry-page__webmentions">
    {switch reposts {
    | [] => React.null
    | reposts => <>
        <h2 className="entry-page__webmentions-header"> {"Retweeted by"->React.string} </h2>
        <ul className="entry-page__webmentions-reposts">
          {Array.map(reposts, data => {
            let id =
              Js.Dict.get(data, "wm-id")
              ->Option.flatMap(Json.decodeNumber)
              ->Option.map(Belt.Float.toString)
              ->Option.getWithDefault("BADBADFAIL")
            <li key={id} className="entry-page__webmentions-item"> <Mention data /> </li>
          })->React.array}
        </ul>
      </>
    }}
    {switch likes {
    | [] => React.null
    | likes => <>
        <h2 className="entry-page__webmentions-header"> {"Liked by"->React.string} </h2>
        <ul className="entry-page__webmentions-likes">
          {Array.map(likes, data => {
            let id =
              Js.Dict.get(data, "wm-id")
              ->Option.flatMap(Json.decodeNumber)
              ->Option.map(Belt.Float.toString)
              ->Option.getWithDefault("BADBADFAIL")
            <li key={id} className="entry-page__webmentions-item"> <Mention data /> </li>
          })->React.array}
        </ul>
      </>
    }}
  </div>
}
