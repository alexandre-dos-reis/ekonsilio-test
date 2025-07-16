import { dependencies, devDependencies } from "./package.json";

export default {
  noExternal: Object.keys(dependencies).concat(Object.keys(devDependencies)),
};
