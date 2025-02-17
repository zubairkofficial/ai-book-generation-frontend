declare module 'remark-gfm' {
  import { Plugin } from 'unified';
  const remarkGfm: Plugin;
  export default remarkGfm;
}

declare module 'rehype-stringify' {
  import { Plugin } from 'unified';
  const rehypeStringify: Plugin;
  export default rehypeStringify;
} 