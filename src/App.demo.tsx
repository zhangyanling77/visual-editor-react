import { useRef, useState } from 'react';
import { useCallbackRef } from './packages/hook/useCallbackRef';

function App() {
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
  });
  // 存放变量
  const posRef = useRef(pos);
  posRef.current = pos;

  const moveDagger = (() => {
    // 拖拽过程中，block的top、left，鼠标的x、y
    const dragData = useRef({
      startTop: 0,
      startLeft: 0,
      startX: 0,
      startY: 0,
    });

    const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      dragData.current = {
        startTop: pos.top,
        startLeft: pos.left,
        startX: e.clientX,
        startY: e.clientY,
      }
    })

    const mousemove = useCallbackRef((e: MouseEvent) => {
      /** 在move的过程中获取hook变量 */
      console.log({
        pos: `${pos.top}_${pos.left}`,
        ref: `${posRef.current.top}_${posRef.current.left}`,
      })

      const { startX, startY, startTop, startLeft } = dragData.current;
      const durX = e.clientX - startX;
      const durY = e.clientY - startY;
      setPos({
        top: startTop + durY,
        left: startLeft + durX,
      });
    })

    const mouseup = useCallbackRef((e: MouseEvent) => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    })

    return {
      mousedown,
    }

  })();

  return (
    <div style={{
      width: 50,
      height: 50,
      backgroundColor: 'black',
      position: 'relative',
      top: `${pos.top}px`,
      left: `${pos.left}px`,
      display: 'inline-block',
    }}
    onMouseDown={moveDagger.mousedown}
    />
  )
}

export default App;
