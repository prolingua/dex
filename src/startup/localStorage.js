// https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
export const loadState = () => {
  try {    
    const serialisedState = localStorage.getItem("state");
    if (serialisedState === null) {
      return undefined;
    }

    var stateObj = JSON.parse(serialisedState);

    return stateObj;
    //return (stateObj.general.user.isLoggedIn) ? stateObj : undefined;
  }
  catch (err) {
    console.log(err);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serialisedState = JSON.stringify(state);
    localStorage.setItem("state", serialisedState);
  }
  catch (err) {
    console.log(err);
    return undefined;
  }
};
