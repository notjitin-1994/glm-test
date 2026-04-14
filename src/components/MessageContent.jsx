import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';
import { containsOpenUILang, shouldDisplayAsMarkdown, formatAIResponse } from '../utils/text-formatter';
import './MessageContent.css';

export default function MessageContent({ content, role }) {
  // Check if content contains OpenUI Lang
  if (containsOpenUILang(content)) {
    return (
      <Renderer
        response={content}
        library={openuiChatLibrary}
        isStreaming={false}
      />
    );
  }

  // Check if it should be displayed as markdown (code blocks, links)
  if (shouldDisplayAsMarkdown(content)) {
    return <MarkdownDisplay content={content} />;
  }

  // Otherwise, display as clean plain text
  return <PlainTextDisplay content={content} />;
}

function PlainTextDisplay({ content }) {
  const formatted = formatAIResponse(content);

  return (
    <div className="plain-text-display">
      {formatted.split('\n\n').map((paragraph, idx) => (
        paragraph.trim() && (
          <p key={idx} className="mb-4">
            {paragraph}
          </p>
        )
      ))}
    </div>
  );
}

function MarkdownDisplay({ content }) {
  const formatted = formatAIResponse(content);

  // Simple markdown-like rendering for code blocks and links
  return (
    <div className="markdown-display">
      {formatted.split('\n').map((line, idx) => {
        // Code blocks
        if (line.startsWith('```')) {
          return null;
        }

        // Content inside code block (simplified)
        if (line.trim() && !line.startsWith('```')) {
          return (
            <p key={idx} className="code-block">
              {line}
            </p>
          );
        }

        // Links
        if (line.includes('http')) {
          const linkMatch = line.match(/(https?:\/\/[^\s]+)/);
          if (linkMatch) {
            const url = linkMatch[1];
            const text = line.replace(url, '').trim() || url;
            return (
              <p key={idx}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-text"
                >
                  {text}
                </a>
              </p>
            );
          }
        }

        // Regular text
        if (line.trim()) {
          return (
            <p key={idx}>
              {line}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
