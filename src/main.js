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

function logMiddleware ([state, next]) {
  const logger = (action) => {
    console.log(state, action);
    next(action);
  }

  return [state, logger];
}

middleware = composeMiddleware(logMiddleware, thunkMiddleware);

function App(props) {
  const [store, dispatch] = middleware(useReducer(rootReducer, initialState));

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


/*
// ----- Code Graveyard -----

// As far as I can tell, it's a BAD IDEA to try and implement any kind of async
function thunkMiddleware ([state, next]) {
  const thunkDispatch = (action) => {
    if(typeof action === 'function') {
      action(state, next);
    } else {
      next(action);
    }
  }

  return [state, thunkDispatch];
}

function reduxApi(dispatch, param) {
  const controller = new AbortController();
  const signal = controller.signal;

  fetch(`https://some.api.com/${param}`, { signal })
    .then(res => dispatch(handleResponse(res)))
    .catch(error => dispatch(handleError(error)));

  dispatch({
    type: 'Api Request',
    relevantData: param,
    cancellation: () => { signal.abort(); },
  });
}

async function reduxApiAwait(dispatch, param) {
  const controller = new AbortController();
  const signal = controller.signal;
  try {
    const req = fetch(`https://some.api.com/${param}`, { signal });

    dispatch({
      type: 'Api Request',
      relevantData: param,
      cancellation: () => { signal.abort(); },
    });

    const res = await req;
    dispatch(handleResponse(res));
  } catch (error) {
    dispatch(handleError(error));
  }
}
*/