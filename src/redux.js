export function keyedObjectReducer(key, reducer) {
  return (state, action) => ({ ...state, [key]: reducer(state, action) });
}

export function keyedMapReducer(key, reducer) {
  return (state, action) =>  new Map(state).set(key, reducer(state, action));
}

// Just a compose, but impedance matches reducers.
export function combineReducers(...reducers) {
  return reducers.reduce((accumulation, reducer) => (state, action) => accumulation(reducer(state, action), action));
}

// These are basically equivalent, as long as no reducer modifies the action!
function compose(...fns) {
  return fns.reduce((f, g) => (...args) => f(g(...args)));
} 
