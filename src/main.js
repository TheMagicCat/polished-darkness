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


function useMiddleware(middleware, cancellation) {
  const [action, dispatchToMiddleware] = useState();
  
  useEffect(() => {
    middleware(action);
    return cancellation;
  }, action);

  return dispatchToMiddleware;
}

function App(props) {
  /*
    I got it! This is crazy. Middleware is now a side effect.
     This way, your initial dispatch always happens without being
     messed with. I suppose, if you only had non-mutatey, synchronous
     things to do, it wouldn't much matter to compose the dispatch.

    But, since we're updating state, we can actually just DO THE THING
     DEVTOOLS DOES. We can keep a log of the state changes and actions
     via the useMiddleware Hook and any async stuff in a side-effect.

    Pretty neat!
  */

  const [store, dispatch] = useReducer(rootReducer, initialState);

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

