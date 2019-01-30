import React, { useState } from 'react';

const thunkMiddleware = (getState) => (dispatch) => (action) => {
  if(typeof action === 'function') {
    dispatch(action(dispatch, getState));
  } else {
    dispatch(action);
  };
}

function useRedux(reducer, preloadedState, middlewares = []) {
  const [store, setState] = useState(preloadedState);
  const [subscriptions, addSubscription] = useState([]);

  const dispatch = (action) => {
    setState(reducer(state, action));
  }

  const getState = () => store;

  const enhancerApi = () => ({
    dispatch,
    subscribe: (fn) => addSubscription((prev) => [...prev, fn]),
    getState,
  });

  const chain = middlewares.map(middleware => middleware(getState));
  const enhancedDispatch = compose(...chain)(dispatch);

  return [store, enhancedDispatch];
}

// combineReducers is a non-hook problem! Just decide how to slice everything up.
function combineReducers(reducers) {
  return reducers.entries.reduce((finalReducer, [key, reducer]) => (state, action) => ({
    ...finalReducer(state, action),
    [key]: reducer(state.key, action),
  }), (state, action) => {});
}

function rootReducer (state, action) {
  return {
    oranges: orangesReducer(state, action),
    apples: applesReducer(state, action),
  };
}