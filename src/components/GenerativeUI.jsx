import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';
import { containsOpenUILang } from '../utils/text-formatter';
import { isStructuredResponse, convertToOpenUILang } from '../utils/json-to-openui';
import { formatAIResponse, shouldDisplayAsMarkdown } from '../utils/text-formatter';
import './MessageContent.css';

/**
 * Handles rendering of AI responses — tries generative UI first, falls back to text.
 *
 * Priority:
 * 1. Native OpenUI Lang → Renderer
 * 2. GLM JSON/structured → convert to OpenUI Lang → Renderer
 * 3. Plain text with links/code → MarkdownDisplay
 * 4. Clean plain text → PlainTextDisplay
 */
export default function GenerativeUI({ content }) {
  if (!content) return null;

  // Case 1: Already valid OpenUI Lang
  if (containsOpenUILang(content)) {
    return (
      <Renderer
        response={content}
        library={openuiChatLibrary}
        isStreaming={false}
      />
    );
  }

  // Case 2: GLM generated JSON/structured data — convert to OpenUI Lang
  if (isStructuredResponse(content)) {
    const openuiCode = convertToOpenUILang(content);
    if (openuiCode) {
      console.log('[glm-test] Converted JSON to OpenUI Lang:', openuiCode);
      return (
        <Renderer
          response={openuiCode}
          library={openuiChatLibrary}
          isStreaming={false}
        />
      );
    }
  }

  // Case 3: Plain text fallback
  return <PlainTextDisplay content={content} />;
}

function PlainTextDisplay({ content }) {
  const formatted = formatAIResponse(content);

  if (shouldDisplayAsMarkdown(formatted)) {
    return (
      <div className="markdown-display">
        {formatted.split('\n').map((line, idx) => {
          if (line.startsWith('```')) return null;

          if (line.includes('http')) {
            const linkMatch = line.match(/(https?:\/\/[^\s]+)/);
            if (linkMatch) {
              const url = linkMatch[1];
              const text = line.replace(url, '').trim() || url;
              return (
                <p key={idx}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="link-text">
                    {text}
                  </a>
                </p>
              );
            }
          }

          if (line.trim()) {
            return <p key={idx}>{line}</p>;
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className="plain-text-display">
      {formatted.split('\n\n').map((paragraph, idx) => (
        paragraph.trim() && <p key={idx}>{paragraph}</p>
      ))}
    </div>
  );
}
