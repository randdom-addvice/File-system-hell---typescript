import { List, Set, Map, fromJS, isKeyed } from "immutable";

// const originalList = List([{ state: { id: "mongoId", count: 0 } }]);
// const originalList = List(fromJS([{ state: { id: "mongoId", count: 0 } }]));
// console.log(originalList.get(0), "first");
// console.log(originalList);
// console.log(originalList.values().next().value, "before");
// originalList.update(0, (value) => ({ state: { id: "val", count: 1 } }));
// originalList.update(0, (value: any) => {
//   // console.log("second");

//   value.state.count = 14;
//   return value;
// });
// originalList.get(0)!.state.count! = 11;
// console.log(originalList.values().next().value, "after");
// console.log(originalList.get(0), "third");

// let val = fromJS(
//   { state: { count: 0, name: "first" } },
//   function (key, value, path) {
//     // console.log(key);
//     // console.log(value.toObject());
//     // console.log(path);
//     // console.log(value.toOrderedMap());
//     return value.toObject();
//     // return !isKeyed(value) ? value.toOrderedMap() : value.toList();
//   }
// );
// const originalList = List([val]);
// let derivedItem = originalList.get(0);

// // console.log(derivedItem);
// originalList.update(0, (i: any) => {
//   // console.log(i);
//   i.state.count = 22;
//   return i;
// });
// console.log(derivedItem);

// const newItems = val.update((v) => {
//   return v.toObject();
// });

// console.log(newItems);

// const x = List.of(Map({ name: "foo" }));
// console.log(x.get(0)?.get("name"));
// const y = x.update(0, (element: any) => {
//   return element?.set("name", "bar");
// });
// console.log(x.get(0)?.get("name"));
// console.log(x.get(0)?.get("name"));

// const l = Map({ state: { count: 0, name: "john" } });
// console.log(l.get("state"));
// l.get("state")!.count! = 12;
// console.log(l.get("state"));

// const items = Immutable.fromJS([{ state: { count: 0, name: "Fred" } }]);

// const index = 1;
// // const newItems = items.update(index, function (item) {
// //   return item.set("b", [{ a: 456789 }]);
// // });
// console.log(items.values().next().value);

// console.log(items === newItems); // false
// console.log("old: " + items.get(index));
// console.log("new: " + newItems.get(index));

interface State<T> {
  state: T;
}
interface Mutations<T> {
  [index: string]: (x: T, y?: any) => void;
}
type GProps<T> = { [x: number | string]: T };

interface Getters<T> {
  [index: string]: (x: T, y?: any) => keyof GProps<T> | T;
}
interface Properties<T> {
  readonly state: T;
  mutations?: Mutations<T>;
  getters?: Getters<T>;
  actions?: any;
}

class CreateStore<T> {
  private store: Properties<T>;
  private immutable: boolean;
  private state: unknown;

  constructor(store: Properties<T>) {
    this.store = store;
    this.immutable = false;

    const val = fromJS({ ...this.store.state }, function (key, value, path) {
      return value.toJSON();
    });
    const originalList = List([val]);
    this.state = originalList.get(0);
    // console.log(this.store.getters);
    // console.log(originalList.get(0));
    // this.state = convertedState as T;
    // const convertedState = originalList.get(0) as unknown;

    // if (!this.immutable) Object.freeze(this.store.state);
    // Object.freeze(this.store.state);
    // Object.defineProperty(this.store, "state", {
    //   value: store,
    //   writable: false,
    // });
  }

  public commit(method: string, payload: unknown) {
    this.immutable = true;
    const newState = this.state as T;
    const findIndexOfMutations = Object.keys(this.store?.mutations!).findIndex(
      (i) => i === method
    );
    if (findIndexOfMutations === -1)
      throw new Error(`Cannot find mutation with the name ${method}`);
    this.store.mutations![method](newState, payload); //call on the mutation function
  }

  public get getState(): T {
    const derivedState = this.state as T;
    return derivedState;
  }

  public getters(method: string, args?: unknown): any {
    const derivedState = this.state as T;
    if (this.store.getters) {
      return this.store.getters[method](derivedState, args);
    }
  }
}

const myState = new CreateStore<{
  count: number;
  name: string;
  todo: any[];
  words: string[];
}>({
  state: {
    count: 0,
    name: "John",
    words: ["state"],
    todo: [
      { id: 1, title: "wash clothes", completed: false },
      { id: 2, title: "watch movie", completed: true },
    ],
  },
  mutations: {
    increment(state, num: number) {
      state.count = num;
      console.log("increment called", state);
    },
    decrement(state) {
      state.count--;
      console.log("decrement called", state);
    },
  },
  getters: {
    getCount(state) {
      return state.count;
    },
    getCountsPlus(state) {
      console.log("wow");
      return state.count + 2;
    },
    getTodo(state, id) {
      return state.todo.find((i) => i.id === id);
    },
  },
});

export default CreateStore;
