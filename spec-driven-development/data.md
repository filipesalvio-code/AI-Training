What is the ideal task size for execution?
Should I clear the context window between task runs?
How often?

Running each task in isolation in a context window:

task 1: 107k 1M
task 2: 126k 3M
task 3: 105k 1.5M
task 4: 158k 5M
task 5: 153k 6M

total: 650k
cache: 16M

running all at once, in sequence:

total: 240k
cache: 10M

pros and cons of not clearing the context window between tasks:

+ pros:
* cache reuse
* avoid repeated reading

- cons
* larger context
* compaction
* inference time
* skill mixing
