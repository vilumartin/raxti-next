"use client";


import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, FileText } from 'lucide-react';
import { handleDownload, formatActionItemsForDownload, formatContentForMarkdown } from './downloadUtils';

interface ActionItemsDownloadDropdownProps {
  items: string[];
  baseFilename: string;
}

const ActionItemsDownloadDropdown = ({ items, baseFilename }: ActionItemsDownloadDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download
        <ChevronDown className="h-4 w-4 ml-1" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => handleDownload(formatActionItemsForDownload(items, 'txt'), `${baseFilename}.txt`, 'txt')}>
        <FileText className="h-4 w-4 mr-2" />
        Download TXT
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownload(formatContentForMarkdown(formatActionItemsForDownload(items, 'md'), 'Action Items'), `${baseFilename}.md`, 'md')}>
        <FileText className="h-4 w-4 mr-2" />
        Download MD
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDownload(formatActionItemsForDownload(items, 'txt'), `${baseFilename}.pdf`, 'pdf', 'Action Items')}>
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default ActionItemsDownloadDropdown;
