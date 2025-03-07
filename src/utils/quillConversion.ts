import { Delta } from 'quill';

/**
 * Convert Quill HTML content to Markdown format
 */
export const htmlToMarkdown = (html: string): string => {
  let markdown = html
    // Replace headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    // Replace formatting
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    // Replace lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let index = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
        return `${index++}. $1\n`;
      });
    })
    // Replace links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Replace paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Remove other HTML tags
    .replace(/<[^>]*>/g, '');
    
  return markdown.trim();
};

/**
 * Convert Markdown to HTML format for Quill
 */
export const markdownToHtml = (markdown: string): string => {
  let html = markdown
    // Replace headings
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Replace formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Replace lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n)+)/g, '<ul>$1</ul>')
    // Replace links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // Replace paragraphs
    .replace(/^(?!<[^>]+>)(.+)$/gm, '<p>$1</p>');
    
  return html;
}; 