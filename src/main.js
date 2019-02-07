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

function compose(...middlewares) {
  return middlewares.reduce((f, g) => (...args) => f(g(...args)));
} 

// Basically a wrapped dispatch call. CANNOT BE ASYNC!
function logMiddleware ([state, next]) {
  const logger = (action) => {
    console.log(state, action);
    next(action);
  }

  return [state, logger];
}

middleware = composeMiddleware(logMiddleware);

function App(props) {
  /*
    This is a sort-of-similar way to how Redux sets up its ehancers/middleware...
     It seems like any state logging ought to happen as a wrapper in the reducer?
     That way, it'd be easier to compose the dispatch call...
  */
  const [store, storeDispatch] = useReducer(rootReducer, initialState);
  let dispatch = () => { throw new Error('Cannot dispatch while creating middlewares!'); };

  const [enhancedStore, enhancedDispatch] = middleware([store, dispatch]);

  dispatch = compose(storeDispatch, enhancedDispatch);

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

