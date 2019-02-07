export function keyedObjectReducer(key, reducer) {
  return (state, action) => ({ ...state, [key]: reducer(state, action) });
}

export function keyedMapReducer(key, reducer) {
  return (state, action) =>  new Map(state).set(key, reducer(state, action));
}

function runReducer (action) {
  return (state, reducer) => reducer(state, action);
}

export function combineReducers(...reducers) {
  return (state, action) => reducers.reduce(runReducer(action), state);
}