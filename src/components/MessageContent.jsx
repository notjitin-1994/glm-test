import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';
import { containsOpenUILang, shouldDisplayAsMarkdown, formatAIResponse } from '../utils/text-formatter';

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

  // Check if it should be displayed as markdown (code blocks, links, tables)
  if (shouldDisplayAsMarkdown(content)) {
    return <MarkdownDisplay content={content} />;
  }

  // Otherwise, display as clean plain text
  return <PlainTextDisplay content={content} />;
}

function PlainTextDisplay({ content }) {
  const formatted = formatAIResponse(content);

  return (
    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
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
    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
      {formatted.split('\n').map((line, idx) => {
        // Code blocks
        if (line.startsWith('```')) {
          return null;
        }

        // Content inside code block (simplified)
        if (line.trim() && !line.startsWith('```')) {
          return (
            <p key={idx} className="mb-4 font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200">
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
              <p key={idx} className="mb-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
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
            <p key={idx} className="mb-4">
              {line}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
