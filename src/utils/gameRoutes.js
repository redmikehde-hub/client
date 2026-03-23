export function getGameRoute(game) {
  const name = game?.name?.toLowerCase();

  if (name === 'ludo') return '/dashboard/ludo-multi';
  if (name === 'matka') return '/dashboard/matka';
  if (name === 'aviator') return '/dashboard/aviator';
  if (name === 'colour') return `/dashboard/colour/${game.id}`;
  if (name === 'sport') return `/dashboard/sport/${game.id}`;

  return `/dashboard/games/${game.id}`;
}
