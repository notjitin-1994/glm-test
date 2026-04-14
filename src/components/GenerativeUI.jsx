import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';

export default function GenerativeUI({ content }) {
  // Parse OpenUI Lang and extract just the UI components
  // Hide the raw syntax

  const lines = content.split('\n');
  let uiOnlyContent = '';
  let skipNext = false;

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim() === '') continue;

    // Check if this is a component definition line
    if (line.includes('=') && !line.includes('//')) {
      uiOnlyContent += line + '\n';
      continue;
    }

    // Skip assignment lines that show component definitions
    if (line.includes('=') || line.includes('//')) {
      skipNext = true;
      continue;
    }

    // If we're in the middle of a component, skip the content lines
    if (skipNext) {
      continue;
    }

    // Add the actual content lines (not component definitions)
    uiOnlyContent += line + '\n';
    skipNext = false;
  }

  return (
      <Renderer
        response={uiOnlyContent}
        library={openuiChatLibrary}
        isStreaming={false}
      />
  );
}
