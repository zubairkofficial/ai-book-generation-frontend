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
  
  // Extract styling information before converting to markdown
  const styleInfo: Record<string, any> = {};
  
  // Collect styling information from all styled elements
  const styledElements = clone.querySelectorAll('[style]');
  styledElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    const elementId = `style-element-${index}`;
    
    // Store style information
    styleInfo[elementId] = {
      selector: createUniqueSelector(htmlEl),
      fontFamily: htmlEl.style.fontFamily,
      fontSize: htmlEl.style.fontSize,
      color: htmlEl.style.color,
      textAlign: htmlEl.style.textAlign,
      fontWeight: htmlEl.style.fontWeight,
      fontStyle: htmlEl.style.fontStyle,
      lineHeight: htmlEl.style.lineHeight,
      letterSpacing: htmlEl.style.letterSpacing,
      tagName: htmlEl.tagName.toLowerCase()
    };
    
    // Add a data attribute to identify this element later
    htmlEl.setAttribute('data-style-id', elementId);
  });
  
  // Process headings from h4 to h1 (order matters)
  const h4s = clone.querySelectorAll('h4');
  h4s.forEach(h4 => {
    // Preserve styling with custom HTML comment
    const styleId = h4.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    h4.outerHTML = `${styleTag}#### ${h4.textContent?.trim()}\n\n`;
  });
  
  // Continue with other heading levels
  const h3s = clone.querySelectorAll('h3');
  h3s.forEach(h3 => {
    const styleId = h3.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    h3.outerHTML = `${styleTag}### ${h3.textContent?.trim()}\n\n`;
  });
  
  const h2s = clone.querySelectorAll('h2');
  h2s.forEach(h2 => {
    const styleId = h2.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    h2.outerHTML = `${styleTag}## ${h2.textContent?.trim()}\n\n`;
  });
  
  const h1s = clone.querySelectorAll('h1');
  h1s.forEach(h1 => {
    const styleId = h1.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    h1.outerHTML = `${styleTag}# ${h1.textContent?.trim()}\n\n`;
  });
  
  // Process formatting
  const strongs = clone.querySelectorAll('strong, b');
  strongs.forEach(strong => {
    const styleId = strong.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    strong.outerHTML = `${styleTag}**${strong.textContent?.trim()}**`;
  });
  
  const ems = clone.querySelectorAll('em, i');
  ems.forEach(em => {
    const styleId = em.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    em.outerHTML = `${styleTag}*${em.textContent?.trim()}*`;
  });
  
  // Process lists
  const uls = clone.querySelectorAll('ul');
  uls.forEach(ul => {
    const styleId = ul.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    const items = ul.querySelectorAll('li');
    let listHtml = '\n';
    items.forEach(li => {
      listHtml += `${styleTag}- ${li.textContent?.trim()}\n`;
    });
    ul.outerHTML = listHtml + '\n';
  });
  
  const ols = clone.querySelectorAll('ol');
  ols.forEach(ol => {
    const styleId = ol.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    const items = ol.querySelectorAll('li');
    let listHtml = '\n';
    items.forEach((li, index) => {
      listHtml += `${styleTag}${index + 1}. ${li.textContent?.trim()}\n`;
    });
    ol.outerHTML = listHtml + '\n';
  });
  
  // Process horizontal rules
  const hrs = clone.querySelectorAll('hr');
  hrs.forEach(hr => {
    const styleId = hr.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    hr.outerHTML = '\n---\n\n';
  });
  
  // Clean paragraphs
  const paragraphs = clone.querySelectorAll('p');
  paragraphs.forEach(p => {
    const styleId = p.getAttribute('data-style-id');
    const styleTag = styleId ? `<!-- STYLE_ID:${styleId} -->` : '';
    if (p.textContent?.trim()) {
      p.outerHTML = `${styleTag}${p.textContent.trim()}\n\n`;
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
  
  if (Object.keys(styleInfo).length > 0) {
    return `<!-- STYLES:${JSON.stringify(styleInfo)} -->\n\n${content}`;
  }
  
  return content;
};

// Helper function to create a unique selector for an element
function createUniqueSelector(element: HTMLElement): string {
  // Create a simple selector using tag name and classes
  let selector = element.tagName.toLowerCase();
  if (element.id) {
    selector += `#${element.id}`;
  } else if (element.className) {
    const classes = element.className.split(' ').filter(c => c).join('.');
    if (classes) {
      selector += `.${classes}`;
    }
  }
  return selector;
}

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

/**
 * Utility to clean up content formatting issues
 */
export const cleanupHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  try {
    // Use DOM parsing for reliable HTML handling
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 1. Remove nested font-family spans but preserve their content
    const fontSpans = doc.querySelectorAll('span[style*="font-family"]');
    fontSpans.forEach(span => {
      // Keep track of the deepest spans to process first
      if (!span.querySelector('span[style*="font-family"]')) {
        const parent = span.parentNode;
        if (parent) {
          // Move the content outside the span
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      }
    });
    
    // 2. Clean up any remaining empty elements
    ['h1', 'h2', 'h3', 'p', 'span', 'div'].forEach(tag => {
      const emptyElements = doc.querySelectorAll(`${tag}:empty`);
      emptyElements.forEach(el => el.parentNode?.removeChild(el));
    });
    
    // 3. Handle duplicate headings (keep first non-empty)
    const headings = doc.querySelectorAll('h1');
    let foundHeading = false;
    headings.forEach(heading => {
      if (!heading.textContent?.trim()) {
        heading.parentNode?.removeChild(heading);
      } else if (!foundHeading) {
        foundHeading = true;
      } else {
        heading.parentNode?.removeChild(heading);
      }
    });
    
    // Return the cleaned HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error cleaning HTML content:', error);
    return htmlContent; // Return original if cleanup fails
  }
};

// Higher-order component for content sections that need cleanup
export const withContentCleanup = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const content = props.bookData?.additionalData?.[props.contentField] || '';
    const cleanContent = cleanupHtmlContent(content);
    
    const handleUpdate = (updatedContent: string) => {
      // Clean content before sending to server
      const cleanedUpdatedContent = cleanupHtmlContent(updatedContent);
      props.onUpdate(cleanedUpdatedContent, props.contentField);
      if (props.setHasChanges) {
        props.setHasChanges(true);
      }
    };
    
    return (
      <Component
        {...props}
        content={cleanContent}
        onContentUpdate={handleUpdate}
      />
    );
  };
}; 