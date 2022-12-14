export function codeExample(language?: string) {
  switch (language) {
    case "bash": {
      return `git commit -am "commit message"`;
    }
    case "javascript": {
      return `const numbers = [1, 2, 3, 4];
const filteredNumbers = numbers.map((num, index) => {
  if (index < 3) {
    return num;
  }
});`;
    }
  }
}
