export let dropEffectListener: 'move' | 'copy' = 'move';

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    if (e.key === 'Alt') {
      dropEffectListener = 'copy';
    }
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'Alt') {
      dropEffectListener = 'move';
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('blur', () => {
    dropEffectListener = 'move';
  });
}
