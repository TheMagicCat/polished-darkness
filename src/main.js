import React, { Fragment, useEffect, useReducer, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';

const fibonacci = ({n, m}) => ({
  n: m,
  m: n + m,
});

function emitterAdapter(emitter){
  // Subscribe
  return (event, handler) => {
    emitter.on(event, handler);
    // Return Unsubscribe
    return () => {
      emitter.off(event, handler);
    }
  }
}

function useLazyFibonacci(emitter, token) {
  const [state, setState] = useState(() => ({ n: 1,  m: 1 }));
  
  const genFib = () => { setState(fibonacci); }

  useEffect(() => emitter.subscribe(token, genFib), [emitter, token]);

  return state;
}

function App(props) {
  const [store, dispatch] = useReducer(reducer, initialState);

  return (
    // This is how you Provide to connect()'ed components!
    <Dispatch.Provider value={dispatch}>
      <Store.Provider value={store}>
        <main>
          <ConnectedComponent param={store.param} />
        </main>
      </Store.Provider>
    </Dispatch.Provider>
  )
}

function ConnectedComponent(props) {
  // This is how you connect() a component!
  const dispatch = useContext(Dispatch);
  const store = useContext(Store);

  useEffect(() => fakeApiEffect(dispatch, param), [props.param]);

  return (
    <Fragment>
      <p>{store.some.message}</p>
      <button onClick={() => dispatch(randomizeParam())}>Click me to randomize the parameter.</button>
    </Fragment>
  )
}

ReactDOM.render(
  <App />,
  document.querySelector('body')
);

