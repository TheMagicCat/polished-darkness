
/*
  ----- Code Graveyard -----
  This is where all my bad or deprecated code lives.
*/


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
  DevTools needs to completely replace the reducer.
   I guess this means we can't easily chain them as an enhancer...
   Would need a special useRedux to manage all that.
*/
function useTimeTravel(reducer, init, initializer = (state) => state) {
  const [state, setState] = useState(() => initializer(init));
  const [log, appendLog] = useState([]);

  const timeTravelToken = Symbol('TimeTravel');

  const dispatch = (action) => {
    // const next = (action.type === timeTravelToken) ? action.state : reducer(state, action);
    let next = state;
    if(action.type === timeTravelToken){
      next = action.state;
    } else {
      next = reducer(state, action);
    }
    appendLog({timestamp: new Date(), state: next, action});
    setState(next);
  }

  const doTimeTravel = (state) => {
    dispatch({
      type: timeTravelToken,
      state,
    });
  }

  return [state, dispatch, log, doTimeTravel];
}

function useTimeTravelReducer(reducer, init, initializer = (state) => state) {
  const [log, appendLog] = useState([]);
  const timeTravelToken = Symbol('TimeTravel');

  const proxyReducer = (state, action) => {
    // const next = (action.type === timeTravelToken) ? action.state : reducer(state, action);
    if(action.type === timeTravelToken){
      next = action.state;
    } else {
      next = reducer(state, action);
    }
    appendLog({timestamp: new Date(), state: next, action});
    return next;
  }

  const [state, dispatch] = useReducer(proxyReducer, init, initializer);

  const doTimeTravel = (state) => {
    dispatch({
      type: timeTravelToken,
      state,
    });
  }

  return [state, dispatch, log, doTimeTravel];
}

function useObservable(initializer) {
  const [state, next] = useState(initializer);
  const [subscriptions, addSubscription] = useState([]);

  const end = () => {};

  const subscribe = () => {};

  useEffect(() => {
    for (let subscriber in subscriptions) {
      subscriber.next(state);
    }
    return () => {
      // unsubscribe all?
    }
  }, [state]);

  return [addSubscription, next, end];
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


/*
  As far as I can tell, it's a HORRIBLE IDEA to try and implement any kind of async
   wrapping of the `dispatch` from useReducer, a'la Thunk middleware.

  Hooks really, really want you to put async things in useEffect, and declaratively
   pull data when a component re-renders. Even though you can, in theory, use async
   middlewares to dispatch, you need some way to cancel these calls, and ensure the original
   `dispatch` is called (which redux does), instead of just the `next` middleware in the chain.

*/
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

/*
  These are two examples (.then and await style) of how you might use cancellable
   fetch requests in a normal Redux store.
*/
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
