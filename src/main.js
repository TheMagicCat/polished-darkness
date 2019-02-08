import React, { Fragment, useEffect, useReducer, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

const Store = createContext(null);
const Dispatch = createContext(null);

const initialState = {};
function rootReducer(state, action) {
  return state;
}

function apiEffect(dispatch, param) {
  const controller = new AbortController();
  const signal = controller.signal;

  const cancellation = () => { signal.abort(); }

  fetch(`https://some.api.com/${param}`, { signal })
    .then(res => dispatch(handleResponse(res)))
    .catch(error => dispatch(handleError(error)));

  return cancellation;
}

/*
  Upon further research...

  DevTools is a "higher-order" reducer. That is,
   it intercepts actions and controls operation of another 
   reducer, and controls the output state with its
   own state and actions.
  
  Reducers aren't limited to the usual action-mapping used
   in almost all redux examples. You could in theory, use any
   accumulated state, and any function, as long as it produces
   that state.
  
  With Effects, we can do super cool things like sync external
   states in a safe, obvious, and deterministic way. It's wild!
*/
/*
  Some more thoughts here. I have options:
    1. Just merge a DevTools reducer with a regular reducer?
      - Bad! Because of conflicts, and shoving state where it doesn't belong.
    2. Use a separate reducer, proxying calls to another
      - Not sure yet.
      - This way it's easy to proxy calls.
    3. Use the React Hooks initializers to mess with state.
      - Not sure yet.
      - Using the init driver to reset state is interesting, but I think
         I'd need to keep track of action -> state mapping manually...
*/
function devToolsReducer (state, action) {
  return state;
}

const proxyReducer = (reducer, dispatchToDevTools) => {
  const result = reducer(state, action);

  dispatchToDevTools({
    type: 'Commit',
    state,
    action,
  });

  return result;
};

function App(props) {
  const [devToolsState, dispatchToDevTools] = useReducer(devToolsReducer, {});
  const reducer = proxyReducer(rootReducer, dispatchToDevTools);
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

