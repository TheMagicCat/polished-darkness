import React, { Fragment, useEffect, useReducer, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

const fibonacci = (state) => ({
  loading: false,
  n: state.m,
  m: state.n + state.m,
});

const loadState = (state) => ({
  ...state,
  loading: true,
});

function useLazyFib() {
  const [state, update] = setState(() => ({
    loading: false,
    n: 1,
    m: 1,
   }));
  
  useEffect(() => {
    let timeoutId = null;
    if(exec) {
      timeoutId = setTimeout(setState(fibonacci), 3000);
    }
    return () => {
      clearTimeout(timeoutId);
    }
  }, [state.loading]);

  const next = () => { update(loadState); }

  return [state.m, next];
}

function useCancellableUpdate() {
  const [state, dispatch] = useState();
  // const [cancelSignal, cancel] = useState(false);
  const [actionQueue, update] = useState([]);

  const thunkProxy = (action) => {
    if (typeof action === 'function') {
      update(action);
    } else {
      dispatch(action);
    }
  }

  useEffect(() => {
    
  }, [actionQueue]);

  return [state, thunkProxy];
}

function useThunk(fn) {



  return []
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

