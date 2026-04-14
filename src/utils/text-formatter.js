/**
 * Text Formatter - Removes AI formatting artifacts
 * Strips markdown, bullets, bold markers, etc. while keeping content clean
 */

export function formatAIResponse(text) {
  if (!text) return '';

  let formatted = text;

  // Remove markdown headings (# ## ###)
  formatted = formatted.replace(/^#+\s+/gm, '');

  // Remove bold markdown (**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Remove italic markdown (*)
  formatted = formatted.replace(/\*([^*]+)\*/g, '$1');

  // Remove code fences (```)
  formatted = formatted.replace(/```[\s\S]*?\n/g, '');
  formatted = formatted.replace(/```/g, '');

  // Remove inline code (`)
  formatted = formatted.replace(/`([^`]+)`/g, '$1');

  // Remove bullet points and numbering
  formatted = formatted.replace(/^[\s]*[-*+]\s+/gm, '');
  formatted = formatted.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquotes (>)
  formatted = formatted.replace(/^>\s+/gm, '');

  // Remove horizontal rules (---, ***)
  formatted = formatted.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove AI filler phrases
  const fillerPhrases = [
    'Certainly!',
    'Great question!',
    "I'd be happy to help",
    "Here's what you need:",
    "Let me think about this",
    "Sure thing!",
    "Here's the answer:",
  ];
  fillerPhrases.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    formatted = formatted.replace(regex, '');
  });

  // Clean up multiple consecutive spaces
  formatted = formatted.replace(/[ \t]+/g, ' ');

  // Clean up multiple consecutive newlines (but keep paragraph breaks)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Remove leading/trailing whitespace from each line
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');

  // Remove empty paragraphs
  formatted = formatted.replace(/\n\n\n\n+/g, '\n\n');

  return formatted.trim();
}

export function containsOpenUILang(text) {
  // Check if text contains OpenUI Lang patterns
  const openUIPatterns = [
    /=\s*(Card|Table|Chart|Button|Form|List|Stack|Text|Image|Badge|ProgressBar|Alert|Tabs|Accordion|Collapse)\(/,
    /\b(Card|Table|Chart|Button|Form|List|Stack|Text|Image|Badge|ProgressBar|Alert|Tabs|Accordion|Collapse)\(/,
    /\bcomponents\s*=\s*{/,
    /\bprops\s*=\s*{/,
  ];

  return openUIPatterns.some(pattern => pattern.test(text));
}

export function shouldDisplayAsMarkdown(text) {
  // If it contains code blocks, links, or tables - use markdown
  return (
    /```/.test(text) ||
    /\[.+\]\(.+\)/.test(text) ||
    /\|.*\|/.test(text) ||
    /https?:\/\/[^\s]+/.test(text)
  );
}
