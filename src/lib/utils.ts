import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import rehypeRaw from 'rehype-raw';
import {unified} from 'unified'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import TurndownService from 'turndown';
const turndown = new TurndownService();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export async function convertMDtoHTML(md: string) {
  const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeRaw)
        .use(rehypeStringify)
        .process(md);
        let processed = file.toString();
        // Format term definitions
      processed = processed.replace(/(\*\*[^*]+\*\*):\s*(.*?)(?=\*\*|$|##)/gs, 
        '<h3>$1</h3><p>$2</p>');
      
      // Clean up bold formatting for terms
      processed = processed.replace(/\*\*([^*]+)\*\*/g, '$1');
  return processed;
}

export function convertHTMLtoMD(html: string) {
  const markdownContent = turndown.turndown(html);
  return markdownContent;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}