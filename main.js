import React, { useEffect, useReducer, createContext } from 'react';

const Store = createContext(null);
const Dispatch = createContext(null);

const initialState = {};
function rootReducer (state, action) {
  return state;
}

function App(props) {
  const [store, dispatch] = useReducer(rootReducer, initialState);

  return (
    // This is how you connect() a component!
    <Dispatch.Provider value={dispatch} >
      <Store.Provider value={store}>
        <main>

        </main>
      </Store.Provider>
    </Dispatch.Provider>

  )
}


// ------------
// This probably won't work as expected...
// const thunkMiddleware = (getState) => (dispatch) => (action) => {
//   if (typeof action === 'function') {
//     action(dispatch, getState);
//   } else {
//     dispatch(action);
//   };
// }

// function useRedux(reducer, preloadedState, middlewares) {
//   const [store, dispatch] = useReducer(reducer, preloadedState);

//   const getState = () => store;

//   const chain = middlewares.map(middleware => middleware(getState));
//   const enhancedDispatch = compose(...chain)(dispatch);

//   return [store, enhancedDispatch];
// }