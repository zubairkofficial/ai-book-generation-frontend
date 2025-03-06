import React, { useCallback } from 'react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Type, TextCursor, Palette, Baseline, ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface TextStyle {
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  fontSize: string;
  fontFamily: string;
  color: string;
  lineHeight: string;
  letterSpacing: string;
}

interface TextStyleToolbarProps {
  textStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  onApplyStyle: (command: string, value?: string) => void;
}

const fontFamilies = [
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Arial',
  'Helvetica',
  'Verdana',
  'Palatino',
  'Baskerville',
  'Bookman',
  'Cambria'
];

const fontSizes = [
  '12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '42px', '48px'
];

const lineHeights = [
  '1', '1.2', '1.4', '1.6', '1.8', '2', '2.2', '2.4'
];

const colors = [
  '#000000', '#333333', '#555555', '#777777', '#999999',
  '#0000FF', '#800080', '#008000', '#FF0000', '#FFA500'
];

// Modern alternative to execCommand
const applyInlineStyle = (element: HTMLElement, style: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, style);
};

// Enhanced text styling function
export const applyTextStyle = (command: string, value?: string) => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  
  // Apply styles based on command
  switch (command) {
    case 'bold':
      span.style.fontWeight = 'bold';
      break;
    case 'italic':
      span.style.fontStyle = 'italic';
      break;
    case 'fontSize':
      span.style.fontSize = value || '16px';
      break;
    case 'fontFamily':
      span.style.fontFamily = value || 'Times New Roman';
      break;
    case 'color':
      span.style.color = value || '#000000';
      break;
    case 'lineHeight':
      span.style.lineHeight = value || '1.6';
      break;
    case 'letterSpacing':
      span.style.letterSpacing = value || 'normal';
      break;
    case 'align':
      // Find the closest block element
      const block = range.commonAncestorContainer.parentElement;
      if (block) {
        block.style.textAlign = value || 'left';
      }
      return; // Don't wrap alignment in span
  }

  try {
    // Wrap selected content in styled span
    range.surroundContents(span);
  } catch (e) {
    console.warn('Could not wrap selection, falling back to insertNode', e);
    // Alternative approach for complex selections
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }
};

// Enhanced line height presets
const lineHeightPresets = [
  { value: '1', label: 'Single' },
  { value: '1.15', label: 'Tight' },
  { value: '1.5', label: 'Normal' },
  { value: '1.75', label: 'Relaxed' },
  { value: '2', label: 'Double' },
  { value: '2.5', label: 'Spacious' }
];

// Professional font presets with fallbacks
const fontPresets = [
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: '"Palatino Linotype", "Book Antiqua", Palatino, serif', label: 'Palatino' }
];

export const TextStyleToolbar: React.FC<TextStyleToolbarProps> = ({
  textStyle,
  onStyleChange,
  onApplyStyle
}) => {
  const handleStyleChange = useCallback((key: keyof TextStyle, value: any) => {
    onStyleChange({ ...textStyle, [key]: value });
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0).cloneRange();
    
    // Apply the style using modern approach
    applyTextStyle(key, value);
    
    // Restore selection
    requestAnimationFrame(() => {
      const editor = document.querySelector('[contenteditable=true]');
      if (editor) {
        (editor as HTMLElement).focus();
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          console.warn('Could not restore selection', e);
        }
      }
    });
  }, [textStyle, onStyleChange]);

  return (
    <div className="flex flex-wrap gap-2 p-3 mb-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      {/* Format Groups */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Button
            variant={textStyle.bold ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => handleStyleChange('bold', !textStyle.bold)}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            variant={textStyle.italic ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => handleStyleChange('italic', !textStyle.italic)}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* Alignment Group */}
        <div className="flex gap-1">
          <Button
            variant={textStyle.align === 'left' ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => handleStyleChange('align', 'left')}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={textStyle.align === 'center' ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => handleStyleChange('align', 'center')}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant={textStyle.align === 'right' ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 hover:bg-gray-100"
            onClick={() => handleStyleChange('align', 'right')}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Typography Controls */}
      <div className="flex items-center gap-2">
        <Select
          value={textStyle.fontSize}
          onValueChange={(value) => handleStyleChange('fontSize', value)}
        >
          <SelectTrigger className="h-8 w-24">
            <Type className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map(size => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={textStyle.lineHeight}
          onValueChange={(value) => handleStyleChange('lineHeight', value)}
        >
          <SelectTrigger className="h-8 w-32">
            <Baseline className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Line Height" />
          </SelectTrigger>
          <SelectContent>
            {lineHeightPresets.map(preset => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Family */}
      <Select
        value={textStyle.fontFamily}
        onValueChange={(value) => handleStyleChange('fontFamily', value)}
      >
        <SelectTrigger className="h-8 w-40">
          <TextCursor className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map(font => (
            <SelectItem key={font} value={font}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <Palette className="w-4 h-4 mr-2" />
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: textStyle.color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {colors.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => handleStyleChange('color', color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Letter Spacing */}
      <Select
        value={textStyle.letterSpacing}
        onValueChange={(value) => handleStyleChange('letterSpacing', value)}
      >
        <SelectTrigger className="h-8 w-32">
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          <SelectValue placeholder="normal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="wider">Wider</SelectItem>
          <SelectItem value="widest">Widest</SelectItem>
          <SelectItem value="tight">Tight</SelectItem>
          <SelectItem value="tighter">Tighter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};