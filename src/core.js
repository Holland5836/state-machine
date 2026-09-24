/**
 * A small finite state machine.
 *
 * The machine is deliberately synchronous and side-effect free. Transition
 * guards are plain boolean-returning functions so the decision to allow a
 * move is always explicit and testable.
 */
export class StateMachine {
  /**
   * @param {Object} config
   * @param {string} config.initial The state the machine starts in.
   * @param {Record<string, Record<string, (() => boolean) | undefined>>} config.transitions
   *   A map of "from state" -> "to state" -> guard function. A missing guard
   *   means the transition is never allowed. A guard returning `true` allows
   *   the transition; `false` rejects it.
   */
  constructor({ initial, transitions }) {
    if (typeof initial !== 'string' || initial.length === 0) {
      throw new TypeError('initial state must be a non-empty string');
    }
    if (transitions === null || typeof transitions !== 'object' || Array.isArray(transitions)) {
      throw new TypeError('transitions must be an object');
    }

    this.initial = initial;
    this.current = initial;
    this.transitions = transitions;
    this.history = [initial];
  }

  /**
   * Try to move to `nextState`.
   *
   * The lookup is deliberately `undefined`-safe: a state that has never been
   * mentioned in the transition table has no outgoing edges and therefore
   * rejects every transition. This prevents accidental implicit "allow all"
   * behaviour.
   *
   * @param {string} nextState
   * @returns {boolean} `true` if the transition was allowed and applied.
   */
  transitionTo(nextState) {
    if (typeof nextState !== 'string' || nextState.length === 0) {
      return false;
    }

    const outgoing = this.transitions[this.current];
    const guard = outgoing?.[nextState];

    if (typeof guard !== 'function' || !guard()) {
      return false;
    }

    this.current = nextState;
    this.history.push(nextState);
    return true;
  }

  /**
   * Return whether `nextState` would be accepted from the current state
   * without actually moving. Useful for UI affordances.
   *
   * @param {string} nextState
   * @returns {boolean}
   */
  canTransitionTo(nextState) {
    if (typeof nextState !== 'string' || nextState.length === 0) {
      return false;
    }

    const outgoing = this.transitions[this.current];
    const guard = outgoing?.[nextState];
    return typeof guard === 'function' && guard();
  }

  /**
   * Reset the machine to its initial state and clear the history.
   */
  reset() {
    this.current = this.initial;
    this.history = [this.initial];
  }
}
