import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';

export default function GenerativeUI({ content }) {
  // Parse OpenUI Lang and extract ONLY the component usage
  // Hide ALL syntax including component definitions like "card = Card({...})"

  const lines = content.split('\n');
  let cleanContent = '';

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('//')) {
      continue;
    }

    // Skip ALL lines that look like component definitions or assignments
    // This includes: "card =", "chart =", "prop =", "item =", etc.
    if (line.includes('=') || line.includes('Stack(') || line.includes('Text(')) {
      continue;
    }

    // Only keep lines that look like actual UI calls
    // Examples: Card({title: "..."}), Stack([...]), Text("...")
    if (!line.includes('=') && line.trim()) {
      cleanContent += line + '\n';
    }
  }

  return (
      <Renderer
        response={cleanContent}
        library={openuiChatLibrary}
        isStreaming={false}
      />
  );
}
