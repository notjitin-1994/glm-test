import React from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';

export default function GenerativeUI({ content }) {
  return (
    <Renderer
      response={content}
      library={openuiChatLibrary}
      isStreaming={false}
    />
  );
}
