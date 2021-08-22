import React, { useState } from 'react';
import { VisualEditor } from './packages/VisualEditor';
import { visualConfig } from './visual.config';
import { VisualEditorValue } from './packages/VisualEditor.utils';

const App: React.FC = () => {
  const [editorValue, setEditorValue] = useState<VisualEditorValue>({
    container: {
      width: 1200,
      height: 800,
    },
    blocks: [
      // {
      //   componentKey: 'text',
      //   top: 100,
      //   left: 100,
      //   adjustPosition: false,
      //   focus: false,
      //   zIndex: 0,
      // },
      // {
      //   componentKey: 'button',
      //   top: 200,
      //   left: 200,
      //   adjustPosition: false,
      //   focus: false,
      //   zIndex: 0,
      // },
      // {
      //   componentKey: 'input',
      //   top: 300,
      //   left: 300,
      //   adjustPosition: false,
      //   focus: false,
      //   zIndex: 0,
      // },
    ],
  });
  return (
    <div className="app">
      <VisualEditor
        config={visualConfig}
        value={editorValue}
        onChange={setEditorValue}
      />
    </div>
  );
};

export default App;
