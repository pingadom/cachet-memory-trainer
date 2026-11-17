// Example encoding systems. These are SUGGESTIONS: the learner's saved entries live in the store
// and always win. Nothing here is ever written over a saved entry.

import { DECK, RANKS, SUITS } from './cards.js';

// Major-system consonant sounds for the digits 0-9.
export const MAJOR = [
  { d: 0, sounds: 's, z', hint: 'zero starts with z' },
  { d: 1, sounds: 't, d', hint: 't has one downstroke' },
  { d: 2, sounds: 'n', hint: 'n has two downstrokes' },
  { d: 3, sounds: 'm', hint: 'm has three downstrokes' },
  { d: 4, sounds: 'r', hint: 'four ends in r' },
  { d: 5, sounds: 'l', hint: 'L is the Roman numeral for 50' },
  { d: 6, sounds: 'sh, ch, j', hint: 'a 6 looks like a mirrored J' },
  { d: 7, sounds: 'k, hard g', hint: 'K is two 7s back to back' },
  { d: 8, sounds: 'f, v', hint: 'a handwritten f has two loops, like 8' },
  { d: 9, sounds: 'p, b', hint: '9 is a mirrored P' },
];

// One image per card. Suit gives the first letter (S, H, D, C); the rank gives the next
// consonant sound using the Major code above (ace = 1, ten = 0). Court cards are special cases.
const WORDS = {
  S: ['Suit', 'Sun', 'Sumo', 'Sari', 'Sail', 'Sash', 'Sock', 'Safe', 'Soap', 'Sauce', 'Spade', 'Steam', 'Sword'],
  H: ['Hat', 'Hen', 'Ham', 'Hare', 'Hail', 'Hedge', 'Hog', 'Hoof', 'Hoop', 'Hose', 'Heart', 'Honey', 'Hammer'],
  D: ['Dart', 'Dune', 'Dam', 'Door', 'Doll', 'Dish', 'Duck', 'Dove', 'Dab of paint', 'Daisy', 'Diamond', 'Dream', 'Drum'],
  C: ['Cat', 'Can', 'Comb', 'Car', 'Coal', 'Cage', 'Cake', 'Cave', 'Cap', 'Case', 'Club', 'Cream', 'Crown'],
};
const COURT_CUE = {
  J: 'Jack: the suit symbol itself',
  Q: 'Queen: a soft word starting with the suit letter',
  K: 'King: a hard, heavy object starting with the suit letter',
};
const SOUND = ['t/d', 'n', 'm', 'r', 'l', 'sh/j', 'k/g', 'f/v', 'p/b', 's/z'];

export const EXAMPLE_IMAGES = Object.freeze(Object.fromEntries(
  SUITS.flatMap((s) => RANKS.map((r, i) => {
    const cue = i < 10 ? `${s} + ${SOUND[i]} (${i === 9 ? '10 → 0' : i + 1})` : COURT_CUE[r];
    return [r + s, { image: WORDS[s][i], cue }];
  })),
));

// Person-Action-Object example. Suits are themes, which makes a forgotten entry guessable:
// hearts = storybook characters, diamonds = wealth and show business,
// clubs = sport and strength, spades = the dark, the clever and the dug-up.
const P = (p, a, o) => ({ p, a, o });
export const EXAMPLE_PAO = Object.freeze({
  AH: P('Cupid', 'shooting an arrow through', 'a heart-shaped balloon'),
  '2H': P('Romeo', 'serenading', 'a balcony'),
  '3H': P('Winnie the Pooh', 'licking', 'a honey pot'),
  '4H': P('Mary Poppins', 'floating down on', 'an umbrella'),
  '5H': P('Paddington Bear', 'munching', 'a marmalade sandwich'),
  '6H': P('Cinderella', 'scrubbing', 'a slipper'),
  '7H': P('Snow White', 'biting into', 'a poisoned apple'),
  '8H': P('Pinocchio', 'sawing', 'a wooden nose'),
  '9H': P('Father Christmas', 'squeezing down', 'a chimney'),
  TH: P('Mickey Mouse', 'steering', 'a steamboat wheel'),
  JH: P('Peter Pan', 'sprinkling fairy dust on', 'a crocodile'),
  QH: P('the Queen of Hearts', 'playing croquet with', 'a flamingo'),
  KH: P('Superman', 'flying off with', 'a cape'),

  AD: P('Scrooge', 'counting', 'a pile of gold coins'),
  '2D': P('a pirate', 'burying', 'a treasure chest'),
  '3D': P('a jeweller', 'polishing', 'a diamond ring'),
  '4D': P('a banker', 'rubber-stamping', 'a stack of banknotes'),
  '5D': P('Elvis', 'strumming', 'a guitar'),
  '6D': P('James Bond', 'shaking', 'a martini'),
  '7D': P('a gambler', 'rolling', 'a pair of dice'),
  '8D': P('a magician', 'pulling a rabbit out of', 'a top hat'),
  '9D': P('an opera singer', 'shattering', 'a champagne flute'),
  TD: P('a film director', 'shouting through', 'a megaphone'),
  JD: P('Aladdin', 'rubbing', 'a magic lamp'),
  QD: P('Cleopatra', 'bathing in', 'a tub of milk'),
  KD: P('King Midas', 'turning to gold', 'a crown'),

  AC: P('a golfer', 'putting', 'a golf ball'),
  '2C': P('a boxer', 'punching', 'a punchbag'),
  '3C': P('a sumo wrestler', 'belly-flopping onto', 'a mattress'),
  '4C': P('a footballer', 'kicking', 'a football'),
  '5C': P('a sprinter', 'hurdling', 'a hurdle'),
  '6C': P('a surfer', 'riding', 'a surfboard'),
  '7C': P('a weightlifter', 'lifting overhead', 'a barbell'),
  '8C': P('a cowboy', 'lassoing', 'a wild horse'),
  '9C': P('a tennis player', 'smashing', 'a tennis racket'),
  TC: P('a juggler', 'juggling', 'three bowling pins'),
  JC: P('Robin Hood', 'robbing', 'a sack of loot'),
  QC: P('a figure skater', 'spinning on', 'a pair of ice skates'),
  KC: P('King Kong', 'climbing', 'a skyscraper'),

  AS: P('the Grim Reaper', 'slicing', 'a scythe'),
  '2S': P('Sherlock Holmes', 'inspecting', 'a magnifying glass'),
  '3S': P('Einstein', 'scribbling on', 'a blackboard'),
  '4S': P('Dracula', 'sleeping in', 'a coffin'),
  '5S': P('a gardener', 'digging up', 'a spade'),
  '6S': P('Darth Vader', 'choking', 'a lightsaber'),
  '7S': P('a witch', 'stirring', 'a cauldron'),
  '8S': P('an astronaut', 'planting', 'a flag'),
  '9S': P('a ninja', 'throwing', 'a throwing star'),
  TS: P("Frankenstein's monster", 'electrocuting', 'a lightning rod'),
  JS: P('Jack Sparrow', 'swigging from', 'a bottle of rum'),
  QS: P('Marie Curie', 'pouring out', 'a glowing test tube'),
  KS: P('King Arthur', 'pulling out', 'a sword in a stone'),
});

// 00-99 pegs built with the Major code: each word's first two consonant sounds are the digits.
export const EXAMPLE_PEGS = Object.freeze(('sauce seed sun sumo sari seal sash sock sofa soap ' +
  'toes toad tin tomb tyre towel dish duck dove tap ' +
  'nose net nun gnome Nero nail nacho neck knife knob ' +
  'moose mat moon mummy mower mole match mug movie mop ' +
  'rose rat rain ram rower rail roach rock roof rope ' +
  'lasso lid lion lime lorry lily leech log lava lip ' +
  'cheese jet chain jam chair jelly judge chalk chef ship ' +
  'case cat can comb car coal cage cake cave cap ' +
  'vase foot fan foam fire file fish fig fife fob ' +
  'bus bat bone bomb bear bell beach book beef pipe').split(' '));

export const pegId = (n) => String(n).padStart(2, '0');

/** The image used in practice for a card: the saved one if present, otherwise the suggestion. */
export function effectiveImage(state, id) {
  const saved = state.cardImages[id];
  if (saved && saved.image) return { ...saved, own: true };
  return { ...EXAMPLE_IMAGES[id], own: false };
}

export function effectivePeg(state, id) {
  const saved = state.pegs[id];
  return saved ? { image: saved, own: true } : { image: EXAMPLE_PEGS[Number(id)], own: false };
}

export const savedImageCount = (state) => DECK.filter((id) => state.cardImages[id]?.image).length;
