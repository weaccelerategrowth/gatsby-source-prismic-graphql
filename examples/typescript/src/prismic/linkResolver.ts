export const linkResolver = (doc: any) => {
  if (doc.type === 'blogpos') return `/blogpost/${doc.uid}`;
  else if (doc.type === 'homepage') return `/`;
  else return '/';
};
