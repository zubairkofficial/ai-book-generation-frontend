/**
 * Utility functions for consistent markdown handling across the application
 */

import React from 'react';

// Convert markdown to HTML for WYSIWYG editing
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  // Fix problematic bold formatting patterns first
  let cleanedMarkdown = markdown
    // Fix patterns like **the **heart
    .replace(/\*\*(.*?)\s\*\*/g, '**$1** ')
    .replace(/\*\*\s(.*?)\*\*/g, ' **$1**')
    // Fix similar issues with italic
    .replace(/\*(.*?)\s\*/g, '*$1* ')
    .replace(/\*\s(.*?)\*/g, ' *$1*');
  
  // Process markdown to styled HTML
  return cleanedMarkdown
    // Process headings (order matters - H4 first)
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-bold mb-2 text-gray-700">$1</h4>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-3 text-gray-800">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4 text-gray-800">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-5 text-gray-900">$1</h1>')
    // Bold and italic formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
    // Lists - handle both bullet and numbered lists
    .replace(/^\- (.*$)/gm, '<ul class="list-disc pl-6 mb-1"><li class="mb-1">$1</li></ul>')
    .replace(/^\d+\. (.*$)/gm, '<ol class="list-decimal pl-6 mb-1"><li class="mb-1">$1</li></ol>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-300" />')
    // Paragraphs (must be last)
    .replace(/^(?!<[^>]+>)(.+)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>');
};

// Convert edited HTML back to markdown
export const htmlToMarkdown = (element: HTMLElement): string => {
  // Clone to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Process headings from h4 to h1 (order matters)
  const h4s = clone.querySelectorAll('h4');
  h4s.forEach(h4 => {
    h4.outerHTML = `#### ${h4.textContent?.trim()}\n\n`;
  });
  
  const h3s = clone.querySelectorAll('h3');
  h3s.forEach(h3 => {
    h3.outerHTML = `### ${h3.textContent?.trim()}\n\n`;
  });
  
  const h2s = clone.querySelectorAll('h2');
  h2s.forEach(h2 => {
    h2.outerHTML = `## ${h2.textContent?.trim()}\n\n`;
  });
  
  const h1s = clone.querySelectorAll('h1');
  h1s.forEach(h1 => {
    h1.outerHTML = `# ${h1.textContent?.trim()}\n\n`;
  });
  
  // Process formatting
  const strongs = clone.querySelectorAll('strong, b');
  strongs.forEach(strong => {
    strong.outerHTML = `**${strong.textContent?.trim()}**`;
  });
  
  const ems = clone.querySelectorAll('em, i');
  ems.forEach(em => {
    em.outerHTML = `*${em.textContent?.trim()}*`;
  });
  
  // Process lists
  const uls = clone.querySelectorAll('ul');
  uls.forEach(ul => {
    const items = ul.querySelectorAll('li');
    let listHtml = '\n';
    items.forEach(li => {
      listHtml += `- ${li.textContent?.trim()}\n`;
    });
    ul.outerHTML = listHtml + '\n';
  });
  
  const ols = clone.querySelectorAll('ol');
  ols.forEach(ol => {
    const items = ol.querySelectorAll('li');
    let listHtml = '\n';
    items.forEach((li, index) => {
      listHtml += `${index + 1}. ${li.textContent?.trim()}\n`;
    });
    ol.outerHTML = listHtml + '\n';
  });
  
  // Process horizontal rules
  const hrs = clone.querySelectorAll('hr');
  hrs.forEach(hr => {
    hr.outerHTML = '\n---\n\n';
  });
  
  // Clean paragraphs
  const paragraphs = clone.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (p.textContent?.trim()) {
      p.outerHTML = `${p.textContent.trim()}\n\n`;
    } else {
      p.outerHTML = '';
    }
  });
  
  // Get content and clean up
  let content = clone.textContent || '';
  
  // Clean up extra newlines and trim
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return content;
};

// Custom React Markdown components with consistent styling
export const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mb-5 text-gray-900" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mb-4 text-gray-800" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold mb-3 text-gray-700" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-bold mb-2 text-gray-700" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-gray-800" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mb-1" {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-6 border-t-2 border-gray-300" {...props} />
  ),
}; 