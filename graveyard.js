
/*
  ----- Code Graveyard -----
  This is where all my bad or deprecated code lives.
*/

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
