import React, { FC, ReactNode } from 'react';
// @ts-ignore
import { RichText } from 'prismic-reactjs';
import { graphql, Link, StaticQuery } from 'gatsby';
import { linkResolver } from '../prismic/linkResolver';
import Layout from '../components/layout';
import Image from '../components/image';
import { withPreview } from '@prismicio/gatsby-source-prismic-graphql';

export const query = graphql`
  query {
    prismic {
      allHomepages {
        edges {
          node {
            title
          }
        }
      }
      allBlogposs(sortBy: meta_firstPublicationDate_ASC) {
        edges {
          node {
            body
            title
            _meta {
              uid
              type
              id
            }
          }
        }
      }
    }
  }
`;

interface HomepageProps {
  prismic: {
    allHomepages: {
      edges: Array<{
        node: {
          title: string;
        };
      }>;
    };
    allBlogposs: {
      edges: Array<{
        node: {
          _meta: {
            id: string;
          };
          title: any;
        };
      }>;
    };
  };
}

const renderHomepage = (props: HomepageProps) => {
  const {
    prismic: {
      allBlogposs,
      allHomepages: {
        edges: [
          {
            node: { title },
          },
        ],
      },
    },
  } = props;

  return (
    <Layout>
      <div id="homepage">
        <h1>{RichText.asText(title)}</h1>
        <Image />
        <ul>
          {allBlogposs.edges.map(({ node }) => {
            const page = linkResolver(node._meta);
            const id = node._meta.id;
            const title = RichText.asText(node.title);
            return (
              <li key={id}>
                <Link to={page}>{title}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
};

const Homepage: FC = () => {
  const render = withPreview<HomepageProps>(renderHomepage, query);
  return <StaticQuery query={`${query}`} render={render} />;
};

export default Homepage;
