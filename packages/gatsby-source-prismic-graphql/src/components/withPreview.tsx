import React from 'react';
import { WrapPage } from './WrapPage';
import { StaticQueryProps } from 'gatsby';

export type StaticQueryRender<T> = Required<StaticQueryProps<T>>['render'];

export const withPreview = <T extends any = any>(
  render: StaticQueryRender<T>,
  query: any,
  fragments: any = []
): StaticQueryRender<T> => {
  if (typeof window === 'undefined') {
    return render;
  }

  // shouldn't the type of the render argument be `render?: ...` if we are going to handle it not being defined?
  // this is the case that someone would call `withPreview()` with no arguments...why not just throw an error?
  if (!render) {
    return (null as unknown) as StaticQueryRender<T>;
  }

  // this is interesting (a.k.a. concerning) - has to be case to JSX.Element for some reason
  const RenderComponent = ({ data }: any) => render(data) as JSX.Element;
  // it would be nice to narrow down the `any` for the query argument, but `typeof graphql` doesn't work...also interesting
  const rootQuery = `${query.source}${fragments
    .map((fragment: any) => (fragment && fragment.source ? fragment.source : ''))
    .join(' ')}`;

  return (data: T) => (
    <WrapPage
      data={data}
      pageContext={{ rootQuery }}
      options={(window as any).prismicGatsbyOptions || {}}
    >
      <RenderComponent />
    </WrapPage>
  );
};
