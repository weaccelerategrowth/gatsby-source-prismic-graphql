export const linkResolver = (doc: any) => {
  if (doc.type === 'blogpos') return `/foo/bar/${doc.uid}`;
  else if (doc.type === 'homepage') return `/`;
  else return '/';
};
