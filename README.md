# State Machine

A small, zero-dependency finite state machine for JavaScript that rejects transitions which are not explicitly allowed from the current state.

```js
import { StateMachine } from './src/index.js';

const machine = new StateMachine({
  initial: 'idle',
  transitions: {
    idle: {
      running: () => true,
    },
    running: {
      stopped: () => true,
    },
  },
});

machine.transitionTo('running'); // true, machine.current === 'running'
machine.transitionTo('stopped'); // true
machine.transitionTo('idle');     // false, no such edge exists
```

## Why this exists

Many state machine libraries bundle dispatch, async effects, or hierarchical states. This one is deliberately small: it only answers the question "is this transition allowed right now?". A transition is allowed exactly when the transition table has an edge from the current state to the target state and that edge's guard function returns `true`. There is no implicit fallback and no wildcard matching, so every allowed path is visible in the configuration.

The trade-off is that the machine is synchronous and does not store extra context. If a guard needs data, capture it in a closure. That keeps the core predictable and easy to test.

## Awkward edge to be aware of

A state that appears nowhere as a key in the transition table has no outgoing edges. Every transition from that state is rejected, even if some other state has an edge with the same target name. This is intentional: states do not inherit edges from one another.

## Exports

`src/index.js` exports:

- `StateMachine`

`StateMachine` instances expose:

- `constructor({ initial, transitions })`
- `transitionTo(nextState)` — returns `true` if the transition was allowed and applied, `false` otherwise
- `canTransitionTo(nextState)` — returns `true` if the transition would be allowed without moving
- `reset()` — returns the machine to its initial state and clears its history
- `current` — the current state
- `history` — an array of every state the machine has entered, starting with the initial state
- `initial` — the configured initial state
- `transitions` — the configured transition table

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

