import {
  DestroyRef,
  Injector,
  PendingTasks,
  RuntimeError,
  assertInInjectionContext,
  assertNotInReactiveContext,
  computed,
  effect,
  inject,
  signal,
  untracked
} from "./chunk-J4EMSBI6.js";
import {
  Observable,
  ReplaySubject,
  takeUntil
} from "./chunk-Y72XGDAT.js";

// node_modules/@angular/core/fesm2022/rxjs-interop.mjs
function takeUntilDestroyed(destroyRef) {
  if (!destroyRef) {
    ngDevMode && assertInInjectionContext(takeUntilDestroyed);
    destroyRef = inject(DestroyRef);
  }
  const destroyed$ = new Observable((subscriber) => {
    if (destroyRef.destroyed) {
      subscriber.next();
      return;
    }
    const unregisterFn = destroyRef.onDestroy(subscriber.next.bind(subscriber));
    return unregisterFn;
  });
  return (source) => {
    return source.pipe(takeUntil(destroyed$));
  };
}
function toObservable(source, options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(toObservable);
  }
  const injector = options?.injector ?? inject(Injector);
  const subject = new ReplaySubject(1);
  const watcher = effect(() => {
    let value;
    try {
      value = source();
    } catch (err) {
      untracked(() => subject.error(err));
      return;
    }
    untracked(() => subject.next(value));
  }, { injector, manualCleanup: true });
  injector.get(DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });
  return subject.asObservable();
}
function toSignal(source, options) {
  typeof ngDevMode !== "undefined" && ngDevMode && assertNotInReactiveContext(toSignal, "Invoking `toSignal` causes new subscriptions every time. Consider moving `toSignal` outside of the reactive context and read the signal value where needed.");
  const requiresCleanup = !options?.manualCleanup;
  if (ngDevMode && requiresCleanup && !options?.injector) {
    assertInInjectionContext(toSignal);
  }
  const cleanupRef = requiresCleanup ? options?.injector?.get(DestroyRef) ?? inject(DestroyRef) : null;
  const equal = makeToSignalEqual(options?.equal);
  let state;
  if (options?.requireSync) {
    state = signal({
      kind: 0
      /* StateKind.NoValue */
    }, { equal });
  } else {
    state = signal({ kind: 1, value: options?.initialValue }, { equal });
  }
  let destroyUnregisterFn;
  const sub = source.subscribe({
    next: (value) => state.set({ kind: 1, value }),
    error: (error) => {
      state.set({ kind: 2, error });
      destroyUnregisterFn?.();
    },
    complete: () => {
      destroyUnregisterFn?.();
    }
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });
  if (options?.requireSync && state().kind === 0) {
    throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
  }
  destroyUnregisterFn = cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));
  return computed(() => {
    const current = state();
    switch (current.kind) {
      case 1:
        return current.value;
      case 2:
        throw current.error;
      case 0:
        throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
    }
  }, { equal: options?.equal });
}
function makeToSignalEqual(userEquality = Object.is) {
  return (a, b) => a.kind === 1 && b.kind === 1 && userEquality(a.value, b.value);
}
function pendingUntilEvent(injector) {
  if (injector === void 0) {
    ngDevMode && assertInInjectionContext(pendingUntilEvent);
    injector = inject(Injector);
  }
  const taskService = injector.get(PendingTasks);
  return (sourceObservable) => {
    return new Observable((originalSubscriber) => {
      const removeTask = taskService.add();
      let cleanedUp = false;
      function cleanupTask() {
        if (cleanedUp) {
          return;
        }
        removeTask();
        cleanedUp = true;
      }
      const innerSubscription = sourceObservable.subscribe({
        next: (v) => {
          originalSubscriber.next(v);
          cleanupTask();
        },
        complete: () => {
          originalSubscriber.complete();
          cleanupTask();
        },
        error: (e) => {
          originalSubscriber.error(e);
          cleanupTask();
        }
      });
      innerSubscription.add(() => {
        originalSubscriber.unsubscribe();
        cleanupTask();
      });
      return innerSubscription;
    });
  };
}

export {
  takeUntilDestroyed,
  toObservable,
  toSignal,
  pendingUntilEvent
};
/*! Bundled license information:

@angular/core/fesm2022/rxjs-interop.mjs:
  (**
   * @license Angular v20.3.7
   * (c) 2010-2025 Google LLC. https://angular.dev/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-5UIKFNEE.js.map
