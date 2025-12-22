import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { forwardRef, useImperativeHandle } from 'react';
import renderer, { act } from 'react-test-renderer';
import useTodos from '../useTodos';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const HookTester = forwardRef<{ hook: ReturnType<typeof useTodos> }, { email: string }>(
  ({ email }, ref) => {
    const hook = useTodos(email);
    useImperativeHandle(ref, () => ({ hook }), [hook]);
    return null;
  },
);

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const coords = {
  latitude: 10,
  longitude: 20,
  altitude: 0,
  accuracy: 1,
  altitudeAccuracy: 1,
  heading: 0,
  speed: 0,
};

describe('useTodos', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists and reloads todos per user', async () => {
    const hookRef: any = React.createRef();
    const tree = renderer.create(<HookTester email="uno@eva.com" ref={hookRef} />);
    await flush();

    await act(async () => {
      await hookRef.current.hook.createTodo('Primera tarea', 'uri://photo', coords as any);
    });
    await flush();
    expect(hookRef.current.hook.todos).toHaveLength(1);

    tree.unmount();

    const newHookRef: any = React.createRef();
    renderer.create(<HookTester email="uno@eva.com" ref={newHookRef} />);
    await flush();
    expect(newHookRef.current.hook.todos).toHaveLength(1);
  });

  it('no comparte tareas entre usuarios diferentes', async () => {
    const hookRef: any = React.createRef();
    const firstTree = renderer.create(<HookTester email="dos@eva.com" ref={hookRef} />);
    await flush();

    await act(async () => {
      await hookRef.current.hook.createTodo('Privada', 'uri://photo', coords as any);
    });
    await flush();
    firstTree.unmount();

    const anotherRef: any = React.createRef();
    renderer.create(<HookTester email="tres@eva.com" ref={anotherRef} />);
    await flush();
    expect(anotherRef.current.hook.todos).toHaveLength(0);
  });
});
