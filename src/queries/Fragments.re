%raw
"import { graphql } from 'gatsby'";

/**
 * https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/fragments.js
 */

[%graphql
  {|
fragment ImageFixed on ImageSharpFixed {
  base64
  width
  height
  src
  srcSet
}
|}
];

/* Export the query in a way Gatsby can read it. */
let imageFixed = ImageFixed.query;

[%graphql
  {|
fragment ImageFluid on ImageSharpFluid {
  base64
  aspectRatio
  src
  srcSet
  sizes
}
|}
];

/* Export the query in a way Gatsby can read it. */
let imageFluid = ImageFluid.query;

[%graphql
  {|
fragment ImageFluid_tracedSVG on ImageSharpFluid {
  tracedSVG
  aspectRatio
  src
  srcSet
  sizes
}
|}
];

/* Export the query in a way Gatsby can read it. */
let imageFluidSVG = ImageFluid_tracedSVG.query;

[%graphql
  {|
  fragment HeroImage on ImageSharp {
    mobileSmall: fluid ( maxWidth: 414, maxHeight: 207, fit: COVER) {
      ...ImageFluid_tracedSVG
    }
    mobile: fluid ( maxWidth: 600, maxHeight: 300, fit: COVER) {
      ...ImageFluid_tracedSVG
    }
    full: fluid ( maxWidth: 900, maxHeight: 450, fit: COVER) {
      ...ImageFluid_tracedSVG
    }
  }
|}
];

/* Export the query in a way Gatsby can read it. */
let heroImage = HeroImage.query;
