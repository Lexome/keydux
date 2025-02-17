# keydux

keydux is a lightweight shared state management library for React that offers a streamlined alternative to Redux. It provides hooks for a minimalistic API for reading, updating, and watching state changes across your application. With built-in support for debouncing updates and persisting state to storage, keydux reduces boilerplate while still delivering type safety and flexibility.

## Features

- **Simple Shared State:** Easily create and use shared state without the complexities of Redux.
- **Hook-Based API:** Use simple React hooks (`useSharedState`) to access and modify your state.
- **Debounced Updates:** Prevent excessive re-renders by debouncing state updates.
- **Avoids Context API pitfalls** Unlike Context API, developers don't need to constantly search for context providers in their true or worry about global rerenders
- **Persistent Storage:** Optionally save state changes to localStorage (or a fallback) with minimal configuration.
- **Type Safety:** Fully typed with TypeScript to ensure reliable state management.

## Installation

You can install keydux via npm or yarn:
```bash
npm install keydux
# or
yarn add keydux
```

## Usage

### 1. Setting Up the Provider

Wrap your entire application with the `SharedStateProvider` to enable shared state management:

```jsx:src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { SharedStateProvider } from "keydux/src/SharedStateProvider";

ReactDOM.render(
  <SharedStateProvider>
    <App />
  </SharedStateProvider>,
  document.getElementById("root")
);
```

### 2. Creating a Shared State

Use the `useSharedState` hook to manage a shared piece of state. The hook provides:
- `value`: the current value.
- `debouncedValue`: the value after applying a debounce delay.
- `setValue`: a function to update the state.
- `clear`: a helper function to reset the state to its initial value.

#### Example: A Counter with Storage and Debouncing

```tsx:src/App.tsx
import React from "react";
import { useSharedState } from "keydux/src/useSharedState";

const useCounter = () => {
  const { value: count, debouncedValue, setValue, clear } = useSharedState({
    key: "counter",
    initialValue: 0,
    debounceTime: 1000,
  });
}

function Counter() {
  const { setValue } = useCounter()

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setValue(count + 1)}>Increment</button>
      <button onClick={clear}>Reset</button>
      <CounterDisplay />
    </div>
  );
}

function CounterDisplay() {
  const { value: count, debouncedValue } = useCounter()

  return (
    <>
      <div>Counter: {count}</div>
      <div>Debounced Counter: {debouncedValue}</div>
    </>
  );
}

export default Counter;
```

### 3. Adding Type Safety

keydux is written in TypeScript, so you can easily enforce type safety by providing an explicit type for your state values. This helps catch errors at compile time and provides better autocompletion. You can also use the `createUseSharedState` function to provide type safety 
for your state key values.

```tsx:src/TypedExample.tsx
import React from "react";
import { createUseSharedState } from "keydux/src/useSharedState";

enum STATE_KEY {
  USER_PROFILE = "userProfile",
}

type UserProfile = {
  name: string;
  age: number;
};

const useSharedState = createUseSharedState<STATE_KEY>()

function UserProfile() {
  const { value: userProfile, setValue } = useSharedState<UserProfile>({
    key: STATE_KEY.USER_PROFILE,
    initialValue: { name: "John Doe", age: 30 },
  });

  const updateName = () => {
    setValue({ ...userProfile, name: "Jane Doe" });
  };

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
      <button onClick={updateName}>Change Name</button>
    </div>
  );
}

export default UserProfile;
```

### 4. Debouncing State Updates

Avoid performance issues through debouncing, which delays the propagation of state changes until the specified time has elapsed. This is especially useful when reacting to fast-changing input, such as text inputs:

```tsx:src/DebounceExample.tsx
import React from "react";
import { useSharedState } from "keydux;



function SearchInput() {
  const {
    value: searchTerm,
    debouncedValue: debouncedSearchTerm,
    setValue: setSearchTerm
  } = useSharedState<string>({
    key: "searchTerm",
    initialValue: "",
    debounceTime: 500, // wait 500ms after the last change to update debouncedValue
  });

  useEffect(() => {
    // Fire my API call with the debounced value
  }, [debouncedSearchTerm])

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
      />
    </div>
  );
}

export default SearchInput;
```

### 5. Saving State to Storage

To persist state changes (for example, between page reloads), enable storage support by setting `shouldSaveToStorage` to `true`. keydux utilizes a storage adapter that defaults to localStorage (with a fallback if not in the browser):

```tsx:src/StorageExample.tsx
import React from "react";
import { useSharedState } from "keydux/src/useSharedState";

function TodoList() {
  const { value: todos, setValue, clear } = useSharedState<string[]>({
    key: "todos",
    initialValue: [],
    shouldSaveToStorage: true, // persist todos in storage
  });

  const addTodo = (todo: string) => {
    setValue([...todos, todo]);
  };

  return (
    <div>
      <h2>Todo List</h2>
      <button onClick={() => addTodo("New Todo")}>Add Todo</button>
      <button onClick={clear}>Clear Todos</button>
      <ul>
        {todos.map((todo, idx) => (
          <li key={idx}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
```

## Comparison to Redux

While Redux is a powerful state management library, it comes with its own set of complexities and boilerplate. keydux offers a simpler, hook-based approach.

In practice, redux usage often involves basic state management -- ie getters and setters --
complicated by a whole lot of indirection and boilerplate.

In contract, keydux gets to the meat of your usage without all the headaches.

| Feature               | keydux                                          | Redux                                                  |
|-----------------------|-------------------------------------------------|--------------------------------------------------------|
| **Boilerplate**       | Minimal setup with a provider and hooks         | Requires explicit reducers, actions, and middleware    |
| **API Style**         | Simple, hook-driven API                         | Action dispatch, reducers, and middleware chaining     |
| **Debouncing Support**| Built-in with `useDebouncedValue`               | Needs external libraries or custom implementation      |
| **Local Persistence** | Built-in with `shouldSaveToStorage`            | Must be implemented separately                          |
| **Type Safety**       | Full TypeScript integration out-of-the-box      | Available but requires additional configuration        |
| **Browser Devtools**  | Available and easy to install                   | Available and easy to install                          |

## Conclusion

keydux provides an effortless way to manage shared state in React applications with built-in support for debouncing, localStorage persistence, and type safety. It's ideal for projects looking for a practical, less verbose state management solution compared to Redux.

## License

[MIT](LICENSE)
