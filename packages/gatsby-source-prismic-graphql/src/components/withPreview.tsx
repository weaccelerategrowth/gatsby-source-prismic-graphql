import React from 'react';
import { WrapPage } from './WrapPage';

export const withPreview = <Data extends any = any>(
  render: (data: Data) => JSX.Element,
  query: any,
  fragments: any = []
): ((data: Data) => JSX.Element) | null => {
  if (typeof window === 'undefined') {
    return render;
  }

  if (!render) {
    return null;
  }

  const RenderComponent = ({ data }: any) => render(data);
  const rootQuery = `${query.source}${fragments
    .map((fragment: any) => (fragment && fragment.source ? fragment.source : ''))
    .join(' ')}`;

  return (data: any) => (
    <WrapPage
      data={data}
      pageContext={{ rootQuery }}
      options={(window as any).prismicGatsbyOptions || {}}
    >
      <RenderComponent />
    </WrapPage>
  );
};
