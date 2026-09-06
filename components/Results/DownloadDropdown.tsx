"use client";


import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, FileText } from 'lucide-react';
import { handleDownload, formatContentForMarkdown } from './downloadUtils';

interface DownloadDropdownProps {
  content: string;
  baseFilename: string;
  title: string;
}

const DownloadDropdown = ({ content, baseFilename, title }: DownloadDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => handleDownload(content, `${baseFilename}.txt`, 'txt')}>
        <FileText className="h-4 w-4 mr-2" />
        Download TXT
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownload(formatContentForMarkdown(content, title), `${baseFilename}.md`, 'md')}>
        <FileText className="h-4 w-4 mr-2" />
        Download MD
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownload(content, `${baseFilename}.pdf`, 'pdf', title)}>
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default DownloadDropdown;
