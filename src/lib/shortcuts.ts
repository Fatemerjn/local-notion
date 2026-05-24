export const matchesShortcut = (
  event: KeyboardEvent,
  code: string,
  options?: {
    altKey?: boolean;
    shiftKey?: boolean;
    ctrlOrMeta?: boolean;
  },
) => {
  if (event.isComposing) {
    return false;
  }

  return (
    event.code === code &&
    Boolean(event.altKey) === Boolean(options?.altKey) &&
    Boolean(event.shiftKey) === Boolean(options?.shiftKey) &&
    (options?.ctrlOrMeta
      ? event.ctrlKey || event.metaKey
      : !event.ctrlKey && !event.metaKey)
  );
};
