declare module 'jsonfn' {
  namespace JSONfn {
    function parse(str: string): any;
    function stringify(fn: any): any;
  }
}

declare module 'gatsby-source-graphql/gatsby-node'
declare module 'gatsby-source-filesystem';

declare module 'gatsby/dist/utils/babel-parse-to-ast';
