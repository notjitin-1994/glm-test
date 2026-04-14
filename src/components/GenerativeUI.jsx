import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';

export default function GenerativeUI({ content }) {
  // Parse OpenUI Lang and extract ONLY the component usage (not definitions)
  // Hide the raw syntax

  const lines = content.split('\n');
  let cleanContent = '';

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('//')) {
      continue;
    }

    // Component definition pattern: component = Component({...})
    // We want to SKIP these (they're syntax, not UI usage)
    if (/^[a-z-]+\s*=\s*[A-Z][a-z][a-z]*\(/.test(line)) {
      continue;
    }

    // Also skip lines that look like Stack([...]) or Text(...)
    // These are also syntax, not UI usage
    if (/(?:Stack|Text|List|Array)\s*\(/.test(line)) {
      continue;
    }

    // Keep lines that look like actual UI calls: Component({...}), props={...}), etc.
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
