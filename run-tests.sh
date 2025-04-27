#!/bin/bash

# Run Jest tests
echo "Running tests..."
NODE_OPTIONS=--experimental-vm-modules npx jest

# If tests pass, show the coverage report
if [ $? -eq 0 ]; then
  echo "Tests passed! Generating coverage report..."
  NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
else
  echo "Tests failed."
fi