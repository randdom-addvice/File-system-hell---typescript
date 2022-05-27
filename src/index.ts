import "./styles/styles.scss";
console.log("hello world");
function myCoolFunction(f: (x: number) => void, nums: number[]): void;
function myCoolFunction(f: (x: number) => void, ...nums: number[]): void;
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}
