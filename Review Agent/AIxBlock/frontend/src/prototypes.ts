if (!typeof Object.hasOwn) {
  Object.hasOwn = function (o: object, v: PropertyKey) {
    if (typeof o.hasOwnProperty === "function") {
      return o.hasOwnProperty(v);
    }

    return Object.keys(o).indexOf(v.toString()) > -1;
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.toUpperCaseFirst = function (this: string) {
  return this.length > 0 ? this.charAt(0).toUpperCase() + this.slice(1) : this;
}

export {};
