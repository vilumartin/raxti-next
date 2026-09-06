
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const removeAsterisks = (text: string) => {
  return text.replace(/\*/g, '');
};

export const addRaxtiAttribution = (content: string, format: 'txt' | 'md' | 'pdf' = 'txt') => {
  const attribution = '\n\nMade with Raxti.app';
  
  if (format === 'md') {
    return content + '\n\n---\n*Made with Raxti.app*';
  }
  
  return content + attribution;
};

export const generatePDF = (content: string, filename: string, title: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - (margin * 2);
  
  // Set font to support UTF-8 characters including Latvian
  // Use courier font which has better UTF-8 support than helvetica
  doc.setFont('courier', 'normal');
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('courier', 'bold');
  
  // Use text method with encoding options for UTF-8 support
  const titleLines = doc.splitTextToSize(title, maxLineWidth);
  doc.text(titleLines, margin, margin + 10, { 
    maxWidth: maxLineWidth,
    align: 'left'
  });
  
  // Add content with attribution
  doc.setFontSize(12);
  doc.setFont('courier', 'normal');
  
  // Clean content and add attribution
  const cleanContent = removeAsterisks(content);
  const contentWithAttribution = addRaxtiAttribution(cleanContent, 'pdf');
  const splitText = doc.splitTextToSize(contentWithAttribution, maxLineWidth);
  
  let yPosition = margin + 25;
  const lineHeight = 7;
  
  splitText.forEach((line: string) => {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Use text method with proper encoding for special characters
    doc.text(line, margin, yPosition, {
      maxWidth: maxLineWidth,
      align: 'left'
    });
    
    yPosition += lineHeight;
  });
  
  doc.save(filename);
  toast.success(`Downloaded as ${filename}`);
};

export const handleDownload = (content: string, filename: string, format: 'txt' | 'pdf' | 'md', title?: string) => {
  if (format === 'pdf') {
    generatePDF(content, filename.replace('.txt', '.pdf'), title || 'Document');
    return;
  }

  let fileContent = addRaxtiAttribution(content, format);
  let mimeType = 'text/plain';
  let fileExtension = 'txt';

  if (format === 'md') {
    fileExtension = 'md';
    mimeType = 'text/markdown';
  }

  // Create blob with UTF-8 encoding to handle special characters
  const element = document.createElement('a');
  const file = new Blob(['\ufeff' + fileContent], { type: `${mimeType};charset=utf-8` });
  element.href = URL.createObjectURL(file);
  element.download = filename.replace('.txt', `.${fileExtension}`);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
  toast.success(`Downloaded as ${filename.replace('.txt', `.${fileExtension}`)}`);
};

export const formatActionItemsForDownload = (items: string[], format: 'txt' | 'md' = 'txt') => {
  if (format === 'md') {
    return items.map((item, index) => `${index + 1}. ${removeAsterisks(item)}`).join('\n\n');
  }
  return items.map(item => removeAsterisks(item)).join('\n\n');
};

export const formatContentForMarkdown = (content: string, title: string) => {
  return `# ${title}\n\n${removeAsterisks(content)}`;
};

export const generateSRT = (segments: { id: number; start: number; end: number; text: string; }[]) => {
  if (!segments || segments.length === 0) {
    toast.error("No segments data available for SRT file");
    return null;
  }

  let srtContent = "";
  segments.forEach((segment, index) => {
    const formatTime = (timeInSeconds: number) => {
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    };
    
    const startTime = formatTime(segment.start);
    const endTime = formatTime(segment.end);
    
    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${segment.text}\n\n`;
  });
  
  // Add attribution to SRT files too
  srtContent += addRaxtiAttribution("", 'txt');
  
  return srtContent;
};
