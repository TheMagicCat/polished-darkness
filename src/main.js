import React, { Fragment, useEffect, useReducer, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import mitt from 'mitt';

const fibonacci = ({n, m}) => ({
  n: m,
  m: n + m,
});

function emitterAdapter(emitter){
  return (event, handler) => {
    emitter.on(event, handler);
    return () => {
      emitter.off(event, handler);
    }
  }
}

function useLazyFibonacci(emitter, token) {
  // const emitter = useRef(mitt());
  const [state, setState] = useState(() => ({ n: 1,  m: 1 }));
  
  // const genFib = useRef(() => { setState(fibonacci); }).current;
  const genFib = () => { setState(fibonacci); }

  useEffect(() => {
    // const unsubscribe = emitter.subscribe(token, genFib);
    // return unsubscribe;
    emitter.on(token, genFib);
    
    return () => {
      emitter.off(token, genFib);
    }
  }, [emitter, token]);

  // const next = () => {
  //   emitter.emit('calc');
  // }

  return state;//, next;
}

function useSubscription() {
  const [subscriptions, updateSubscribers] = useState([]);
  const activate = useRef(() => { console.log('Not ready yet!'); });

  useEffect(() => {
    activate.current = () => {
      for (let subscriber in subscriptions) {
        subscriber();
      }
    }
  }, [subscriptions]);

  const subscribe = (callback) => {
    updateSubscribers((state) => [ ...state, callback ]);
    return () => {

    }
  }
  return subscribe, activate.current;
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

