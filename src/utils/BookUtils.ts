// utils/BookUtils.ts

export const isDiagramOrFlowchart = (text: string): boolean => {
    const diagramKeywords = [
      'diagram', 'flowchart', 'chart', 'graph', 'architecture', 
      'flow', 'process', 'sequence', 'workflow', 'system', 'structure'
    ];
    return diagramKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };
  
  export const getImageSize = (imageUrl: string, altText: string) => {
    const IMAGE_SIZES = {
      STANDARD: { width: 300, height: 225 },
      PORTRAIT: { width: 225, height: 300 },
      LANDSCAPE: { width: 400, height: 225 },
      DIAGRAM: { width: 500, height: 350 },
      FLOWCHART: { width: 550, height: 400 },
      ARCHITECTURE: { width: 600, height: 450 },
      SEQUENCE: { width: 500, height: 400 },
    };
  
    if (isDiagramOrFlowchart(altText)) {
      if (altText.toLowerCase().includes('flowchart')) return IMAGE_SIZES.FLOWCHART;
      if (altText.toLowerCase().includes('architecture')) return IMAGE_SIZES.ARCHITECTURE;
      if (altText.toLowerCase().includes('sequence')) return IMAGE_SIZES.SEQUENCE;
      return IMAGE_SIZES.DIAGRAM;
    }
  
    // Regular images: Random size from standard options
    const sizes = [IMAGE_SIZES.STANDARD, IMAGE_SIZES.PORTRAIT, IMAGE_SIZES.LANDSCAPE];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };
  
  export const formatChapterContent = (content: string) => {
    if (!content) return '';
    content = content.replace(/\{"lc":\d+,"type":"constructor","id":\["langchain_core"[^}]+\}/g, '');
    const parts = content.split(/!\[(.*?)\]\((.*?)\)/);
    let formattedContent = '';
  
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        formattedContent += parts[i].split('\n\n').filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('\n');
      } else if (i % 3 === 1) {
        const altText = parts[i];
        const imageUrl = parts[i + 1];
        if (imageUrl && !imageUrl.includes('undefined')) {
          formattedContent += `
            <figure class="image-figure">
              <div class="image-container">
                <img src="${imageUrl}" alt="${altText}" loading="lazy" />
              </div>
              <figcaption>${altText}</figcaption>
            </figure>
          `;
        }
      }
    }
    return formattedContent;
  };
  