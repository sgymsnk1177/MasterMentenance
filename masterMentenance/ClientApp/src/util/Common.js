export const getGuid = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
};

export const sleep = async (timeout, callBack) => {
  return await new Promise((resolve) =>
    setTimeout(() => {
      resolve('end');
    }, timeout)
  );
};

export const checkInputData = (name, address) => {
  let result = true;

  if (!name || !address) {
    result = false;
  }
  if (
    !address.match(
      /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/
    )
  ) {
    result = false;
  }

  return result;
};
