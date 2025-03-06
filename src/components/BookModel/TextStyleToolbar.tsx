import React from 'react';
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

export const TextStyleToolbar: React.FC<TextStyleToolbarProps> = ({
  textStyle,
  onStyleChange,
  onApplyStyle
}) => {
  const handleStyleChange = (key: keyof TextStyle, value: any) => {
    onStyleChange({ ...textStyle, [key]: value });
    
    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If no selection, still update global style for new text
      return;
    }
    
    // Store the current selection
    const range = selection.getRangeAt(0);
    
    // Apply the style to the selected text
    switch (key) {
      case 'bold':
        onApplyStyle('bold');
        break;
      case 'italic':
        onApplyStyle('italic');
        break;
      case 'align':
        onApplyStyle('justify', value);
        break;
      case 'fontSize':
        onApplyStyle('fontSize', value);
        break;
      case 'fontFamily':
        onApplyStyle('fontName', value);
        break;
      case 'color':
        onApplyStyle('foreColor', value);
        break;
      case 'lineHeight':
      case 'letterSpacing':
        // These are handled through container styles
        break;
    }
    
    // Restore focus to the editor
    requestAnimationFrame(() => {
      // Delay to allow the DOM to update
      const editor = document.querySelector('[contenteditable=true]');
      if (editor) {
        (editor as HTMLElement).focus();
        
        // Try to restore selection
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          console.log('Could not restore selection', e);
        }
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 mb-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Text Formatting */}
      <Button
        variant={textStyle.bold ? "default" : "outline"}
        size="sm"
        className="h-8 px-2"
        onClick={() => handleStyleChange('bold', !textStyle.bold)}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant={textStyle.italic ? "default" : "outline"}
        size="sm"
        className="h-8 px-2"
        onClick={() => handleStyleChange('italic', !textStyle.italic)}
      >
        <Italic className="w-4 h-4" />
      </Button>

      {/* Text Alignment */}
      <div className="flex gap-1 border-l border-gray-300 pl-2">
        <Button
          variant={textStyle.align === 'left' ? "default" : "outline"}
          size="sm"
          className="h-8 px-2"
          onClick={() => handleStyleChange('align', 'left')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={textStyle.align === 'center' ? "default" : "outline"}
          size="sm"
          className="h-8 px-2"
          onClick={() => handleStyleChange('align', 'center')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={textStyle.align === 'right' ? "default" : "outline"}
          size="sm"
          className="h-8 px-2"
          onClick={() => handleStyleChange('align', 'right')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Font Size */}
      <Select
        value={textStyle.fontSize}
        onValueChange={(value) => handleStyleChange('fontSize', value)}
      >
        <SelectTrigger className="h-8 w-20">
          <Type className="w-4 h-4 mr-2" />
          <SelectValue placeholder="16px" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map(size => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      {/* Line Height */}
      <Select
        value={textStyle.lineHeight}
        onValueChange={(value) => handleStyleChange('lineHeight', value)}
      >
        <SelectTrigger className="h-8 w-20">
          <Baseline className="w-4 h-4 mr-2" />
          <SelectValue placeholder="1.6" />
        </SelectTrigger>
        <SelectContent>
          {lineHeights.map(height => (
            <SelectItem key={height} value={height}>
              {height}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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