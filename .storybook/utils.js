import { memoize } from 'lodash-es';

/**
 * This function solves a very specific issue where a full-page reload breaks
 * when a complex component (such as admin) changes history state. To counteract this
 * problem, this function logs last viewed story at `lastStoryKey` and last visited demo URL
 * at `lastPathKey` in session storage every `refreshRate` ms (listening to `popstate` turned out
 * to be not enough, unfortunately). When HMR is triggered, it quickly replaces the current
 * history state with the value at `lastStoryKey` in session storage, allowing the reload to
 * proceed without error, and then restores the previous history state from the value
 * at `lastPathKey` in session storage on page load.
 */
export function persistHistoryStateBetweenReloads({
  lastStoryKey,
  lastPathKey,
  refreshRate,
  module,
}) {
  const getItem = memoize(key => sessionStorage.getItem(key));
  const setItem = (key, value) => {
    if (getItem(key) === value) return;
    value ? getItem.cache.set(key, value) : getItem.cache.delete(key);
    value ? sessionStorage.setItem(key, value) : sessionStorage.removeItem(key);
  };

  const lastStory = getItem(lastStoryKey);
  const lastHref = getItem(lastPathKey);

  if (lastHref && lastStory === location.href) {
    history.pushState(null, null, lastHref);
  } else {
    setItem(lastPathKey, null);
    setItem(lastStoryKey, location.href);
  }

  setInterval(() => {
    if (location.pathname.endsWith('/iframe.html')) {
      setItem(lastPathKey, null);
      setItem(lastStoryKey, location.href);
    } else {
      setItem(lastPathKey, location.href);
    }
  }, refreshRate);

  module.hot.addStatusHandler(status => {
    if (status === 'check' && !location.pathname.endsWith('/iframe.html')) {
      const lastStory = getItem(lastStoryKey);
      if (lastStory) history.pushState(null, null, lastStory);
    }
  });
}
