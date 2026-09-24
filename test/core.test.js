import test from 'node:test';
import assert from 'node:assert/strict';

import { StateMachine } from '../src/core.js';

test('initial state is set and recorded in history', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {},
  });

  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('allowed transition changes state and appends history', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  const moved = machine.transitionTo('running');

  assert.equal(moved, true);
  assert.equal(machine.current, 'running');
  assert.deepEqual(machine.history, ['idle', 'running']);
});

test('guard returning false rejects transition', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => false,
      },
    },
  });

  const moved = machine.transitionTo('running');

  assert.equal(moved, false);
  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('missing transition is rejected', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  const moved = machine.transitionTo('stopped');

  assert.equal(moved, false);
  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('state with no outgoing edges rejects all transitions', () => {
  const machine = new StateMachine({
    initial: 'done',
    transitions: {
      idle: {
        done: () => true,
      },
    },
  });

  const moved = machine.transitionTo('idle');

  assert.equal(moved, false);
  assert.equal(machine.current, 'done');
  assert.deepEqual(machine.history, ['done']);
});

test('canTransitionTo reports availability without moving', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  assert.equal(machine.canTransitionTo('running'), true);
  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('canTransitionTo reports false for missing edge', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  assert.equal(machine.canTransitionTo('stopped'), false);
});

test('non-string target is rejected by transitionTo', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  assert.equal(machine.transitionTo(42), false);
  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('empty string target is rejected by transitionTo', () => {
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: () => true,
      },
    },
  });

  assert.equal(machine.transitionTo(''), false);
  assert.equal(machine.current, 'idle');
});

test('reset returns to initial state and clears history', () => {
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

  machine.transitionTo('running');
  machine.transitionTo('stopped');
  machine.reset();

  assert.equal(machine.current, 'idle');
  assert.deepEqual(machine.history, ['idle']);
});

test('constructor throws on missing initial state', () => {
  assert.throws(
    () => new StateMachine({ transitions: {} }),
    TypeError,
  );
});

test('constructor throws on empty initial state', () => {
  assert.throws(
    () => new StateMachine({ initial: '', transitions: {} }),
    TypeError,
  );
});

test('constructor throws on non-object transitions', () => {
  assert.throws(
    () => new StateMachine({ initial: 'idle', transitions: null }),
    TypeError,
  );
  assert.throws(
    () => new StateMachine({ initial: 'idle', transitions: [] }),
    TypeError,
  );
});

test('guard is called with no arguments', () => {
  let seenArgs = null;
  const machine = new StateMachine({
    initial: 'idle',
    transitions: {
      idle: {
        running: (...args) => {
          seenArgs = args;
          return true;
        },
      },
    },
  });

  machine.transitionTo('running');

  assert.deepEqual(seenArgs, []);
});

test('transition table is not mutated by transition attempts', () => {
  const transitions = {
    idle: {
      running: () => true,
    },
  };
  const snapshot = JSON.stringify(transitions);

  const machine = new StateMachine({ initial: 'idle', transitions });
  machine.transitionTo('running');
  machine.transitionTo('missing');

  assert.equal(JSON.stringify(transitions), snapshot);
});
