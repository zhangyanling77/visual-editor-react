import { VisualEditor} from './packages/VisualEditor';
import './App.scss';
import { visualConfig } from './visual.config';
import { useState } from 'react';
import { VisualEditorValue } from './packages/VisualEditor.utils';

function App() {
  const [editorValue, setEditorValue] = useState<VisualEditorValue>({
    container: {
      width: 1000,
      height: 700,
    },
    blocks: [],
  })
  return (
    <div className="app">
      <VisualEditor config={visualConfig} value={editorValue} onChange={setEditorValue} />
    </div> 
  )
}

export default App;
