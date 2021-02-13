module Option = Belt.Option
module Array = Belt.Array
module Json = Js.Json

@val
external encodeURIComponent: string => string = "encodeURIComponent"

module Data = {
  module Author = {
    type t = {
      name: string,
      photo: string,
    }

    let fromJson = json =>
      switch Json.decodeObject(json) {
      | Some(dict) =>
        let name =
          dict
          ->Js.Dict.get("name")
          ->Option.flatMap(Json.decodeString)
          ->Option.getWithDefault("Anonymous")
        let photo = dict->Js.Dict.get("photo")->Option.flatMap(Json.decodeString)
        switch photo {
        | Some(photo) => Some({name: name, photo: photo})
        | None => None
        }
      | None => None
      }
  }

  type t = {
    wmId: string,
    wmProperty: [#like | #repost],
    wmReceived: Js.Date.t,
    published: option<Js.Date.t>,
    url: string,
    author: Author.t,
  }

  let fromJson = json =>
    switch Json.decodeObject(json) {
    | Some(dict) =>
      let url = dict->Js.Dict.get("url")->Option.flatMap(Json.decodeString)
      let author = dict->Js.Dict.get("author")->Option.flatMap(Author.fromJson)
      let published =
        dict
        ->Js.Dict.get("published")
        ->Option.flatMap(Json.decodeString)
        ->Option.map(Js.Date.fromString)
      let wmReceived =
        dict
        ->Js.Dict.get("wm-received")
        ->Option.flatMap(Json.decodeString)
        ->Option.map(Js.Date.fromString)
      let wmProperty =
        dict
        ->Js.Dict.get("wm-property")
        ->Option.flatMap(Json.decodeString)
        ->Option.flatMap(x =>
          switch x {
          | "like-of" => Some(#like)
          | "repost-of" => Some(#repost)
          | _ => None
          }
        )
      let wmId =
        dict
        ->Js.Dict.get("wm-id")
        ->Option.flatMap(Json.decodeNumber)
        ->Option.map(Belt.Float.toString)
      switch (url, author, wmReceived, wmProperty, wmId) {
      | (Some(url), Some(author), Some(wmReceived), Some(wmProperty), Some(wmId)) =>
        Some({
          url: url,
          author: author,
          published: published,
          wmReceived: wmReceived,
          wmProperty: wmProperty,
          wmId: wmId,
        })
      | _ => None
      }
    | None => None
    }
}

module Response = {
  type t = {children: array<Data.t>}
  let fromJson = json => {
    let dict = Json.decodeObject(json)
    let children =
      dict
      ->Option.flatMap(x => Js.Dict.get(x, "children"))
      ->Option.flatMap(Json.decodeArray)
      ->Option.getWithDefault([])
      ->Array.keepMap(Data.fromJson)
    {children: children}
  }
}

module Mention = {
  @react.component
  let make = (~data: Data.t) => {
    <div className="entry-page__webmentions-photo">
      <a href={data.url} className="h-card u-url">
        <img src={data.author.photo} alt={data.author.name} height="48" width="48" />
      </a>
    </div>
  }
}

@react.component
let make = (~url) => {
  let (reposts, setReposts) = React.useState(() => [])
  let (likes, setLikes) = React.useState(() => [])
  React.useEffect0(() => {
    Fetch.fetch("https://webmention.io/api/mentions.jf2?target=" ++ encodeURIComponent(url))
    ->Promise.then(Fetch.Response.json)
    ->Promise.then(json => {
      let {children} = Response.fromJson(json)
      let mentions = children->Belt.SortArray.stableSortBy((a, b) => {
        // "published" time can be null
        let a = Option.getWithDefault(a.published, a.wmReceived)->Js.Date.getTime
        let b = Option.getWithDefault(b.published, b.wmReceived)->Js.Date.getTime
        compare(b, a)
      })
      let reposts =
        mentions->Array.keep(x => x.wmProperty == #repost)->Array.slice(~offset=0, ~len=24)
      setReposts(_ => reposts)
      let likes = mentions->Array.keep(x => x.wmProperty == #like)->Array.slice(~offset=0, ~len=24)
      setLikes(_ => likes)->Promise.resolve
    })
    ->ignore
    None
  })
  <div className="entry-page__webmentions">
    {switch reposts {
    | [] => React.null
    | reposts => <>
        <h2 className="entry-page__webmentions-header"> {"Retweeted by"->React.string} </h2>
        <ul className="entry-page__webmentions-reposts">
          {Array.map(reposts, data =>
            <li key={data.wmId} className="entry-page__webmentions-item"> <Mention data /> </li>
          )->React.array}
        </ul>
      </>
    }}
    {switch likes {
    | [] => React.null
    | likes => <>
        <h2 className="entry-page__webmentions-header"> {"Liked by"->React.string} </h2>
        <ul className="entry-page__webmentions-likes">
          {Array.map(likes, data =>
            <li key={data.wmId} className="entry-page__webmentions-item"> <Mention data /> </li>
          )->React.array}
        </ul>
      </>
    }}
  </div>
}
