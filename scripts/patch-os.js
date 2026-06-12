import os from 'os';

const original = os.networkInterfaces;
os.networkInterfaces = () => {
  try {
    return original();
  } catch (e) {
    return {};
  }
};
