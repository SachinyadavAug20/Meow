export const Questions = [
  "How does unordered_set in C++ achieve O(1) average time complexity for lookups?",
  "What is the difference between a hash collision bucket chain and open addressing in unordered_set?",
  "When should I use an adjacency list vs an adjacency matrix for a graph problem?",
  "Why is my custom comparator for priority_queue sorting things in reverse?",
  "Can you explain the intuition behind the choice of states in this DP transition relation?",
  "How do I optimize a naive O(N^2) sliding window solution down to O(N) linear time?",
  "Why am I getting a 'double free or corruption' runtime error here?",
  "Can you look at my code and help me find where the logic is bugged?",
  "Where exactly did I mess up this error handling block?",
  "Why is my loop out of bounds? Check my array index math here.",
  "Can you trace this recursion stack and tell me why I am getting a stack overflow?",
  "Why is my variable returning a garbage value? Did I forget to initialize it or pass by reference?",
  "Why does appending to a vector in a loop cause a segmentation fault if I use iterators?",
  "What is the difference between `__init__` and `__new__` in Python when designing custom classes?",
  "Why is my async function in Next.js returning a Promise pending object instead of the actual data?",
  "What is the difference between struct and class in C++ regarding memory layout and defaults?",
  "How does the Javascript event loop handle microtasks vs macrotasks?"
];
export function getRandomQuestion() {
  const random = Math.floor(Math.random() * Questions.length);
  return Questions[random];
}
