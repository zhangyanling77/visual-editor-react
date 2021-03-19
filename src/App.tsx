import { VisualEditor} from './packages/VisualEditor';
import './App.scss';
import { visualConfig } from './visual.config';
import { useState } from 'react';
import { VisualEditorValue } from './packages/VisualEditor.utils';

function App() {
  const [editorValue, setEditorValue] = useState<VisualEditorValue>({
    container: {
      width: 1000,
      height: 600,
    },
    blocks: [
      {
        componentKey: 'text',
        top: 100,
        left: 100,
        adjustPosition: false,
      },
      {
        componentKey: 'button',
        top: 200,
        left: 200,
        adjustPosition: false,
      },
      {
        componentKey: 'input',
        top: 300,
        left: 300,
        adjustPosition: false,
      },
    ],
  })
  return (
    <div className="app">
      <VisualEditor config={visualConfig} value={editorValue} onChange={setEditorValue} />
    </div> 
  )
}

export default App;
