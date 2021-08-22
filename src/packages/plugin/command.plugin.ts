import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardCode } from './keyboard-code';

export interface CommandExecute {
  undo?: () => void; // 撤销
  redo: () => void; // 重做
}

export interface Command {
  name: string; // 命令的唯一标识
  keyboard?: string | string[]; // 命令监听的快捷键
  execute: (...args: any[]) => CommandExecute; // 命令被执行的时候所做的事情
  followQueue?: boolean; // 命令执行完之后，是否需要将命令执行得到的undo，redo存入命令队列（如全选、撤销、重做这样的命令就不需要）
  init?: () => (() => void) | undefined; // 命令初始化函数
  data?: any; // 命令缓存所需的数据
}

export function useCommander() {
  const [state] = useState(() => ({
    current: -1, // 当前命令队列中，最后执行的命令返回的CommandExecute对象
    queue: [] as CommandExecute[], // 命令队列
    commandArray: [] as { current: Command }[], // 预定义命令的数组
    commands: {} as Record<string, (...args: any[]) => void>, // 通过command name 执行命令动作的一个包装
    destroyList: [] as ((() => void) | undefined)[], // 所有命令在组件销毁之前，需要执行的消除副作用的函数
  }));
  /**
   * 注册一个命令
   */
  const useRegistry = useCallback((command: Command) => {
    const commandRef = useRef<Command>(command);
    commandRef.current = command;

    useState(() => {
      // 如果要注册的命令已经存在就从原来的命令数组中删除，重新添加
      if (state.commands[command.name]) {
        const existIndex = state.commandArray.findIndex(
          (item) => item.current.name === command.name,
        );
        state.commandArray.splice(existIndex, 1);
      }
      state.commandArray.push(commandRef);
      state.commands[command.name] = (...args: any[]) => {
        const { redo, undo } = commandRef.current.execute(...args);
        redo();
        // 如果命令执行后，不需要进入命令队列，则直接结束；
        if (commandRef.current.followQueue === false) return;
        // 否则，将命令队列中剩余的命令去除，保留current及其之前的命令
        let { queue } = state;
        if (queue.length > 0) {
          queue = queue.slice(0, state.current + 1);
          state.queue = queue;
        }
        // 设置命令队列中最后一个命令为当前执行的命令
        queue.push({ undo, redo });
        // 索引+1，指向队列中的最后一个命令
        state.current = state.current + 1;
      };
    });
  }, []);

  const [keyboardEvents] = useState(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) return;

      const { keyCode, shiftKey, altKey, ctrlKey, metaKey } = e;
      const keyString: string[] = [];
      if (ctrlKey || metaKey) keyString.push('ctrl');
      if (shiftKey) keyString.push('shift');
      if (altKey) keyString.push('alt');
      keyString.push(KeyboardCode[keyCode]);

      const keyNames = keyString.join('+');
      state.commandArray.forEach(({ current: { keyboard, name } }) => {
        if (!keyboard) return;
        const keys = Array.isArray(keyboard) ? keyboard : [keyboard];
        if (keys.indexOf(keyNames) > -1) {
          state.commands[name]();
          e.stopPropagation();
          e.preventDefault();
        }
      });
    };

    const init = () => {
      window.addEventListener('keydown', onKeydown, true);
      return () => window.removeEventListener('keydown', onKeydown, true);
    };
    return { init };
  });
  /**
   * 初始化函数，负责初始化键盘监听事件，调用命令的初始化逻辑
   */
  const useInit = useCallback(() => {
    useState(() => {
      state.commandArray.forEach(
        (command) =>
          !!command.current.init &&
          state.destroyList.push(command.current.init()),
      );
      state.destroyList.push(keyboardEvents.init());
    });
    /**
     * 注册撤销命令（执行结果不需要进入命令队列）
     */
    useRegistry({
      name: 'undo',
      keyboard: 'ctrl+z',
      followQueue: false,
      execute: () => {
        return {
          redo: () => {
            if (state.current === -1) return;
            const queueItem = state.queue[state.current];
            if (queueItem) {
              !!queueItem.undo && queueItem.undo();
              state.current--;
            }
          },
        };
      },
    });
    /**
     * 注册重做命令（执行结果不需要进入命令队列）
     */
    useRegistry({
      name: 'redo',
      keyboard: ['ctrl+y', 'ctrl+shift+z'],
      followQueue: false,
      execute: () => {
        return {
          redo: () => {
            const queueItem = state.queue[state.current + 1];
            if (queueItem) {
              queueItem.redo();
              state.current++;
            }
          },
        };
      },
    });
  }, []);

  useEffect(() => {
    return () => state.destroyList.forEach((fn) => !!fn && fn());
  }, []);

  return {
    state,
    useRegistry,
    useInit,
  };
}
