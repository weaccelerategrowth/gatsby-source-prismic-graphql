# Contributing
To get started clone this repo 
`git clone https://github.com/prismicio/gatsby-source-prismic-graphql`
This project uses yarn workspaces so that the `examples` directory use the package in `packages/gatsby-source-prismic-graphql`
`cd gatsby-source-prismic-graphql`
`yarn`
Running `yarn test` in the root directory to will run the test script for all the examples
While the examples can be run normally from the directory the example is in.

### Common problems
Occasionally problems come from the dependancy [@prismic/gatsby-source-graphql-universal](https://github.com/prismicio/gatsby-source-graphql-universal)
This package can also be added to the packages directory for a faster development cycle (remember to run yarn from the root directory and rebuild gatsby-source-graphql-universal after making changes).


## Creating an Issue
If posable recreate the issue in the examples directory, and make a PR. 

## Pull Request
For code related issues: please write a test or an example of that the PR addresses and commit that first.
Other PR's such as as fixing typos or adding tests are very welcome :)
