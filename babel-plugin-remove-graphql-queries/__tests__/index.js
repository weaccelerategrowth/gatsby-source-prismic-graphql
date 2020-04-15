"use strict";

var babel = require("@babel/core");

var plugin = require("../");

function matchesSnapshot(query) {
  var _babel$transform = babel.transform(query, {
    presets: ["@babel/preset-react"],
    plugins: [plugin]
  }),
      code = _babel$transform.code;

  expect(code).toMatchSnapshot();
}

it.todo("Works correctly with the kitchen sink" // , () => {
//   matchesSnapshot(`
//   import * as React from 'react'
//   import { graphql, useStaticQuery, StaticQuery } from 'gatsby'
//   export default () => {
//     const query = graphql\`{site { siteMetadata { title }}}\`
//     const siteDescription = useStaticQuery(query)
//     return (
//       <StaticQuery
//         query={graphql\`{site { siteMetadata { title }}}\`}
//         render={data => (
//           <div>
//             <h1>{data.site.siteMetadata.title}</h1>
//             <p>{siteDescription.site.siteMetadata.description}</p>
//           </div>
//         )}
//       />
//     )
//   }
//   `)
// }
);
it("Transforms queries in useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, useStaticQuery } from 'gatsby'\n\n  export default () => {\n    const siteTitle = useStaticQuery(graphql`{site { siteMetadata { title }}}`)\n\n    return (\n      <h1>{siteTitle.site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Transforms exported queries in useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, useStaticQuery } from 'gatsby'\n\n  export default () => {\n    const data = useStaticQuery(query)\n\n    return (\n      <>\n        <h1>{data.site.siteMetadata.title}</h1>\n        <p>{data.site.siteMetadata.description}</p>\n      </>\n    )\n  }\n\n  export const query = graphql`{site { siteMetadata { title }}}`\n  ");
});
it("Transforms queries defined in own variable in useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, useStaticQuery } from 'gatsby'\n\n  export default () => {\n    const query = graphql`{site { siteMetadata { title }}}`\n    const siteTitle = useStaticQuery(query)\n\n    return (\n      <h1>{siteTitle.site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Transforms queries and preserves destructuring in useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, useStaticQuery } from 'gatsby'\n\n  export default () => {\n    const query = graphql`{site { siteMetadata { title }}}`\n    const { site } = useStaticQuery(query)\n\n    return (\n      <h1>{site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Transforms queries and preserves variable type in useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, useStaticQuery } from 'gatsby'\n\n  export default () => {\n    const query = graphql`{site { siteMetadata { title }}}`\n    let { site } = useStaticQuery(query)\n\n    return (\n      <h1>{site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Transformation does not break custom hooks", function () {
  matchesSnapshot("\n  import React from \"react\"\n  import { graphql, useStaticQuery } from \"gatsby\"\n\n  const useSiteMetadata = () => {\n    const data = useStaticQuery(graphql`{site { siteMetadata { title }}}`)\n    return data.site.siteMetadata\n  }\n\n  export default () => {\n    const siteMetadata = useSiteMetadata()\n\n    return <h1>{site.siteMetadata.title}</h1>\n  }\n\n  ");
});
it("Transforms only the call expression in useStaticQuery", function () {
  matchesSnapshot("\n  import React from \"react\"\n  import { graphql, useStaticQuery } from \"gatsby\"\n\n  const useSiteMetadata = () => {\n    return useStaticQuery(\n      graphql`{site { siteMetadata { title }}}`\n    ).site.siteMetadata\n  }\n\n  export default () => {\n    const siteMetadata = useSiteMetadata()\n\n    return <h1>{siteMetadata.title}</h1>\n  }\n  ");
});
it("Only runs transforms if useStaticQuery is imported from gatsby", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql } from 'gatsby'\n\n  export default () => {\n    const query = graphql`{site { siteMetadata { title }}}`\n    const siteTitle = useStaticQuery(query)\n\n    return (\n      <h1>{siteTitle.site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Allow alternative import of useStaticQuery", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import * as Gatsby from 'gatsby'\n\n  export default () => {\n    const query = Gatsby.graphql`{site { siteMetadata { title }}}`\n    const siteTitle = Gatsby.useStaticQuery(query)\n\n    return (\n      <h1>{siteTitle.site.siteMetadata.title}</h1>\n    )\n  }\n  ");
});
it("Transforms queries in <StaticQuery>", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, StaticQuery } from 'gatsby'\n\n  export default () => (\n    <StaticQuery\n      query={graphql`{site { siteMetadata { title }}}`}\n      render={data => <div>{data.site.siteMetadata.title}</div>}\n    />\n  )\n  ");
});
it("Transforms queries defined in own variable in <StaticQuery>", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, StaticQuery } from 'gatsby'\n\n  const query = graphql`{site { siteMetadata { title }}}`\n\n  export default () => (\n    <StaticQuery\n      query={query}\n      render={data => <div>{data.site.siteMetadata.title}</div>}\n    />\n  )\n  ");
});
it("transforms exported variable queries in <StaticQuery>", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, StaticQuery } from 'gatsby'\n\n  export const query = graphql`{site { siteMetadata { title }}}`\n\n  export default () => (\n    <StaticQuery\n      query={query}\n      render={data => <div>{data.site.siteMetadata.title}</div>}\n    />\n  )\n  ");
});
it("Transforms queries in page components", function () {
  matchesSnapshot("\n  import { graphql } from 'gatsby'\n\n  export const query = graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("allows the global tag", function () {
  matchesSnapshot("\n  export const query = graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("distinguishes between the right tags", function () {
  matchesSnapshot("\n  const foo = styled('div')`\n     {\n       ${foo}\n     }\n  `\n\n  const pulse = keyframes`\n    0% {\n      transform: scale(1);\n      animation-timing-function: ease-in;\n    }\n    25% {\n      animation-timing-function: ease-out;\n      transform: scale(1.05);\n    }\n    50% {\n      transform: scale(1.12);\n      animation-timing-function: ease-in;\n    }\n    to {\n      transform: scale(1);\n      animation-timing-function: ease-out;\n    }\n  `;\n\n  export const query = graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("handles import aliasing", function () {
  matchesSnapshot("\n  import { graphql as gql } from 'gatsby'\n\n  export const query = gql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("handles require", function () {
  matchesSnapshot("\n  const { graphql } = require('gatsby')\n\n  export const query = graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("handles require namespace", function () {
  matchesSnapshot("\n  const Gatsby = require('gatsby')\n\n  export const query = Gatsby.graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("handles require alias", function () {
  matchesSnapshot("\n  const { graphql: gql } = require('gatsby')\n\n  export const query = gql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("Leaves other graphql tags alone", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql } from 'relay'\n\n  export default () => (\n    <div>{data.site.siteMetadata.title}</div>\n  )\n\n  export const query = graphql`\n     {\n       site { siteMetadata { title }}\n     }\n  `\n  ");
});
it("Removes all gatsby queries", function () {
  matchesSnapshot("\n  import { graphql } from 'gatsby'\n\n  export default () => (\n    <div>{data.site.siteMetadata.title}</div>\n  )\n\n  export const siteMetaQuery = graphql`\n    fragment siteMetaQuery on RootQueryType {\n      site {\n        siteMetadata {\n          title\n        }\n      }\n    }\n  `\n\n  export const query = graphql`\n     {\n       ...siteMetaQuery\n     }\n  `\n  ");
});
it("Handles closing StaticQuery tag", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { graphql, StaticQuery } from 'gatsby'\n\n  export default () => (\n    <StaticQuery\n      query={graphql`{site { siteMetadata { title }}}`}\n    >\n      {data => <div>{data.site.siteMetadata.title}</div>}\n    </StaticQuery>\n  )\n  ");
});
it("Doesn't add data import for non static queries", function () {
  matchesSnapshot("\n  import * as React from 'react'\n  import { StaticQuery, graphql } from \"gatsby\"\n\n  const Test = () => (\n    <StaticQuery\n      query={graphql`\n      {\n        site {\n          siteMetadata {\n            title\n          }\n        }\n      }\n      `}\n      render={data => <div>{data.site.siteMetadata.title}</div>}\n    />\n  )\n\n  export default Test\n\n  export const fragment = graphql`\n    fragment MarkdownNodeFragment on MarkdownRemark {\n      html\n    }\n  `\n  ");
});