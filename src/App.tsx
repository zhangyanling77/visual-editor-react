import { useState } from 'react';

function App() {
  const [number, setNumber] = useState(0);
  return (
    <div className="App">
      <p>{number}</p>
      <button onClick={() => setNumber(number + 1)}>+</button>
      <button onClick={() => setNumber(number - 1)}>-</button>
    </div>
  )
}

export default App;
