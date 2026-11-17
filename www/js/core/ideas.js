// Idea finder: rules-based suggestions for turning numbers, days, months, letters, cards and
// abstract words into pictures. Nothing here is fetched; everything is built in.

import { NOUNS } from '../content/lexicon.js';
import { WORDS } from '../content/words.js';
import { EXAMPLE_PEGS, pegId, effectivePeg, effectiveImage } from './systems.js';
import { effectivePao } from './pao.js';
import { parseCard, cardName } from './cards.js';

// ── Major code from spelling ────────────────────────────────────
// Spelling is only a guide to sound, so this handles the common patterns (silent letters,
// soft c and g, sh/ch/ph/th, doubled letters) and the word list avoids the rest.
const DIGIT = { s: '0', z: '0', t: '1', d: '1', n: '2', m: '3', r: '4', l: '5', j: '6', k: '7', q: '7', f: '8', v: '8', p: '9', b: '9' };
const SOFT = /[eiy]/;

export function majorCode(word) {
  let w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  w = w.replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/^gn/, 'n').replace(/^ps/, 's').replace(/mb$/, 'm').replace(/alk/g, 'ak').replace(/stle$/, 'sle');
  let out = '';
  let prev = '';
  const push = (d, letter) => { if (d && !(letter === prev && out.endsWith(d))) out += d; };
  for (let i = 0; i < w.length; i += 1) {
    const c = w[i];
    const n = w[i + 1] || '';
    const two = c + n;
    if (two === 'ti' && /^(on|al|en)/.test(w.slice(i + 2)) && i > 0) { push('6'); i += 1; prev = 'sh'; continue; }
    if (two === 'si' && /^on/.test(w.slice(i + 2)) && i > 0) { push('6'); i += 1; prev = 'sh'; continue; }
    if (w.startsWith('tch', i)) { push('6'); i += 2; prev = 'ch'; continue; }
    if (w.startsWith('dge', i)) { push('6'); i += 1; prev = 'j'; continue; }
    if (two === 'sh' || two === 'ch') { push('6'); i += 1; prev = two; continue; }
    if (two === 'ph') { push('8'); i += 1; prev = 'f'; continue; }
    if (two === 'th') { push('1'); i += 1; prev = 'th'; continue; }
    if (two === 'ck') { push('7'); i += 1; prev = 'k'; continue; }
    if (two === 'gh') { if (i === 0) push('7'); i += 1; prev = 'gh'; continue; }
    if (two === 'wh') { i += 1; prev = 'wh'; continue; }
    if (c === 'c') { push(SOFT.test(n) ? '0' : '7', c); prev = c; continue; }
    // g is soft at the start before e/i/y (giant, gem) and in a final -ge/-ges (cage); hard elsewhere (tiger).
    if (c === 'g') { const soft = SOFT.test(n) && (i === 0 || /^es?$/.test(w.slice(i + 1))); push(soft ? '6' : '7', c); prev = c; continue; }
    if (c === 'x') { out += '70'; prev = c; continue; }
    push(DIGIT[c], c);
    prev = c;
  }
  return out;
}

// The noun list with codes, built once. Words the encoder would mis-sound are listed here.
const OVERRIDE = {
  ketchup: '769', sieve: '08', cocoa: '77', chef: '68', doughnut: '121', sugar: '674', island: '521', ocean: '62',
  gecko: '77', salmon: '032', yoghurt: '741', pizza: '910', soldier: '0564', anchor: '274', scissors: '0040', xylophone: '0582',
};
let LEX = null;
function lexicon() {
  if (LEX) return LEX;
  LEX = new Map();
  for (const word of new Set([...NOUNS, ...WORDS, ...EXAMPLE_PEGS])) {
    const code = OVERRIDE[word] ?? majorCode(word);
    if (!LEX.has(code)) LEX.set(code, []);
    LEX.get(code).push(word);
  }
  return LEX;
}
/** Nouns whose consonant sounds spell exactly these digits. */
export const majorWords = (digits) => [...(lexicon().get(digits) || [])];

// ── built-in associations ───────────────────────────────────────
const SHAPE = ['an egg or a ball', 'a candle or a pencil', 'a swan', 'handcuffs or a pair of lips', 'a sailing boat',
  'a hook or a seahorse', 'a golf club or a cherry', 'a boomerang or a cliff edge', 'a snowman or an hourglass', 'a balloon on a string or a tadpole'];
const RHYME = ['hero', 'bun', 'shoe', 'tree', 'door', 'hive', 'sticks', 'heaven', 'gate', 'vine', 'hen', 'elf', 'shelf'];
const FAMOUS = {
  0: 'a doughnut, a hole, an empty plate', 1: 'a podium winner holding up one finger', 2: 'a pair of dice showing snake eyes, a tandem bike',
  3: 'a tricycle, a traffic light, a trident', 4: 'a four-leaf clover, a car with four flat tyres', 5: 'a high five, a starfish',
  6: 'a dice showing six, a beetle with six legs', 7: 'Cristiano Ronaldo in his number 7 shirt, the seven dwarfs, a rainbow',
  8: 'an octopus, a spider, a pool table\'s black ball', 9: 'a cat with nine lives, a golfer on the ninth hole',
  10: 'Lionel Messi\'s number 10 shirt, ten-pin bowling, a black front door', 11: 'a football team lined up, a pair of chopsticks',
  12: 'a dozen eggs, a clock striking twelve', 13: 'a black cat crossing your path', 16: 'a sweet-sixteen birthday cake',
  18: 'a key to the door on an eighteenth birthday', 21: 'a blackjack hand: an ace and a king', 23: 'Michael Jordan mid-dunk in his 23 shirt',
  24: 'a ticking digital clock counting down a day', 42: 'a towel, the answer to everything', 50: 'a golden wedding cake',
  52: 'a full deck of cards spraying into the air', 64: 'a chessboard', 66: 'a long desert highway with a Route 66 sign',
  99: 'an ice-cream cone with a flake in it', 100: 'a centurion in a red helmet, a cricketer raising the bat', 101: 'a crowd of Dalmatian puppies',
  180: 'a darts player hitting three treble twenties', 360: 'a skateboarder spinning all the way round', 365: 'a calendar tearing off its pages',
  404: 'a signpost pointing nowhere', 747: 'a jumbo jet', 911: 'a fire engine with sirens wailing', '007': 'James Bond in a tuxedo',
  1066: 'an arrow in a king\'s eye', 1984: 'a giant eye watching from a screen', 2001: 'a spaceship drifting past a black slab',
};
const COUNT = { 2: 'bicycle wheels', 3: 'a traffic light\'s lamps', 4: 'a chair\'s legs', 5: 'fingers on a hand', 6: 'eggs in a box',
  7: 'colours in a rainbow', 8: 'a spider\'s legs', 9: 'skittles', 10: 'toes', 11: 'players in a football team', 12: 'months on a calendar' };

const DAYS = {
  monday: { n: 1, sound: ['money', 'the moon', 'a mundane grey office'], meaning: ['an alarm clock smashed against the wall', 'a commuter dragging a briefcase through rain'] },
  tuesday: { n: 2, sound: ['twos: identical twins', 'chews: a cow chewing gum', 'a tube of toothpaste'], meaning: ['Tyr, the one-handed Norse war god'] },
  wednesday: { n: 3, sound: ['a wedding', 'wins: a trophy', 'a wet sandwich'], meaning: ['a camel climbing over a hump', 'Odin with his one eye and two ravens'] },
  thursday: { n: 4, sound: ['thirsty: someone gulping from a hose', 'Thor swinging his hammer'], meaning: ['a thunderstorm'] },
  friday: { n: 5, sound: ['a frying pan', 'a fried egg', 'a fryer bubbling'], meaning: ['a fish supper', 'a weekend bag being flung over a shoulder'] },
  saturday: { n: 6, sound: ['the planet Saturn with its rings', 'someone sat on a whoopee cushion', 'a satellite dish'], meaning: ['a football match', 'a lie-in under a duvet'] },
  sunday: { n: 7, sound: ['an ice-cream sundae', 'the sun'], meaning: ['a roast dinner', 'a newspaper the size of a duvet'] },
};
const MONTHS = {
  january: { sound: ['a janitor with a mop', 'a jar of jam'], meaning: ['fireworks', 'a frozen lake', 'Janus with two faces'] },
  february: { sound: ['a fibbing Pinocchio', 'a fabric roll', 'a fever thermometer'], meaning: ['a Valentine\'s heart', 'a pancake flipping'] },
  march: { sound: ['soldiers marching', 'a marching band'], meaning: ['daffodils', 'a mad March hare'] },
  april: { sound: ['an ape grilling', 'an apricot'], meaning: ['an umbrella in a shower', 'a fool in a jester\'s hat'] },
  may: { sound: ['mayonnaise', 'a maypole'], meaning: ['blossom snowing off a tree', 'a maypole dance'] },
  june: { sound: ['a dune', 'a jukebox'], meaning: ['a strawberry at Wimbledon', 'a bride (June weddings)'] },
  july: { sound: ['jewellery', 'a jellyfish'], meaning: ['a beach towel', 'a melting ice lolly'] },
  august: { sound: ['a gust of wind', 'an augur reading birds'], meaning: ['a suitcase on a beach', 'Augustus in a laurel crown'] },
  september: { sound: ['a sceptre', 'a septic tank'], meaning: ['a school bag', 'a pile of falling leaves'] },
  october: { sound: ['an octopus', 'an octagon'], meaning: ['a carved pumpkin', 'a beer stein'] },
  november: { sound: ['a novel', 'a novice monk'], meaning: ['a bonfire', 'a poppy'] },
  december: { sound: ['a decimal point', 'a decorated tree'], meaning: ['a snowman', 'a stocking stuffed full'] },
};
const MONTH_KEYS = Object.keys(MONTHS);
const LETTERS = {
  a: ['an ace of spades', 'hay bale (sounds like A)', 'a tent (shape)'], b: ['a bee', 'a pair of glasses on its side (shape)'],
  c: ['the sea', 'a horseshoe magnet (shape)'], d: ['a dee-jay\'s turntable', 'a bow and string (shape)'], e: ['an eel', 'a comb (shape)'],
  f: ['an elf', 'a flag (shape)'], g: ['a gee-gee: a horse', 'a golf hook (shape)'], h: ['an itch', 'a ladder (shape)'],
  i: ['an eye', 'a pillar (shape)'], j: ['a jay bird', 'a fish hook (shape)'], k: ['a cake', 'a kicking leg (shape)'],
  l: ['an elbow', 'a boot (shape)'], m: ['an emerald', 'mountains (shape)'], n: ['a hen', 'a zig-zag lightning bolt (shape)'],
  o: ['an oboe', 'a ring doughnut (shape)'], p: ['a pea', 'a lollipop (shape)'], q: ['a queue', 'a magnifying glass (shape)'],
  r: ['an oar', 'a pirate (arr!)'], s: ['an S-bend', 'a snake (shape)'], t: ['a cup of tea', 'a hammer (shape)'],
  u: ['a ewe', 'a horseshoe (shape)'], v: ['a vulture', 'a funnel (shape)'], w: ['a double-yew hedge', 'a pair of fangs (shape)'],
  x: ['an X-ray', 'crossed swords (shape)'], y: ['a wise owl (why?)', 'a catapult (shape)'], z: ['a zebra', 'a lightning bolt (shape)'],
};
// Abstract words: a meaning image and, where useful, a sound route.
const ABSTRACT = {
  justice: ['a judge slamming a gavel', 'scales tipping', 'a blindfolded statue holding a sword'],
  patience: ['a fisherman asleep by his rod', 'a queue that never moves', 'a hospital patient (sound)'],
  freedom: ['a bird bursting out of a cage', 'broken chains', 'a free sample stall (sound)'],
  love: ['a heart-shaped balloon', 'Cupid firing an arrow'], hate: ['a snarling dog', 'a hat (sound)'],
  peace: ['a white dove', 'a piece of cake (sound)'], war: ['a tank', 'a cannon firing'],
  time: ['a melting clock', 'an hourglass running out'], money: ['a pile of gold coins', 'a monkey (sound)'],
  knowledge: ['an owl in a graduation cap', 'a lightbulb', 'a towering stack of books'], power: ['a lightning bolt', 'a weightlifter'],
  truth: ['someone under a spotlight with hand on a book', 'Pinocchio\'s nose shrinking'], fear: ['a tarantula on a pillow', 'a fair ride (sound)'],
  hope: ['a candle in a dark window', 'a hoop (sound)'], luck: ['a four-leaf clover', 'a horseshoe', 'a lock (sound)'],
  success: ['a trophy held aloft', 'a summit flag'], failure: ['a collapsing house of cards', 'a red cross on a test'],
  democracy: ['a ballot box swallowing papers', 'a crowd raising hands'], economy: ['a shopping trolley', 'an economy-class seat'],
  inflation: ['a price tag swelling like a balloon', 'a banknote inflated until it bursts'], tax: ['a taxman taking a bite of your sandwich', 'tacks (sound)'],
  health: ['an apple a day', 'a stethoscope'], anger: ['a red face with steam from the ears', 'a bull charging'],
  happiness: ['a dog wagging its tail', 'a sunflower turning to the sun'], sadness: ['a rain cloud over one person', 'a melting ice cream'],
  memory: ['an elephant', 'a filing cabinet bursting open'], idea: ['a lightbulb', 'a spark'], energy: ['a battery', 'a sprinter'],
  growth: ['a beanstalk shooting up', 'a growth chart on a door frame'], change: ['a caterpillar into a butterfly', 'coins (sound)'],
  danger: ['a skull-and-crossbones sign', 'a lion\'s mouth'], safety: ['a hard hat', 'a safe (sound)'], wisdom: ['an owl', 'a wise old man'],
  courage: ['a lion', 'a knight facing a dragon'], honesty: ['an open hand', 'honey (sound)'], greed: ['a dragon on a hoard', 'a pig at a trough'],
  pride: ['a peacock', 'a pride of lions'], envy: ['a green-eyed monster'], speed: ['a cheetah', 'a speedometer needle in the red'],
  science: ['a bubbling test tube', 'an atom'], history: ['a dusty scroll', 'a knight in armour'], art: ['a paintbrush', 'a framed portrait'],
  music: ['a grand piano', 'notes flying off a stave'], law: ['a policeman', 'a law book'], education: ['a mortarboard', 'a blackboard'],
  religion: ['a church spire', 'praying hands'], nature: ['a tree', 'a fern unfurling'], technology: ['a robot', 'a circuit board'],
};

// ── the finder ───────────────────────────────────────────────────
const g = (title, items, note = '') => ({ title, items: items.filter(Boolean), note });
const pegLine = (state, n) => { const p = effectivePeg(state, pegId(n)); return `${p.own ? 'your' : 'the example'} image for ${pegId(n)}: ${p.image}`; };
const CONCRETE = new Set([...NOUNS, ...WORDS]);
const prefixMatch = (input, keys) => {
  const q = input.toLowerCase();
  if (q.length < 3) return null;
  return keys.find((k) => k === q || k.startsWith(q)) || null;
};

function forNumber(digits, state) {
  const groups = [];
  const n = Number(digits);
  if (digits.length <= 2) {
    const id = pegId(digits);
    if (digits.length === 2 || digits === '0') {
      const peg = effectivePeg(state, id);
      groups.push(g(peg.own ? 'Your image' : 'The example image', [peg.image], peg.own ? 'From your number system.' : `Not yet your own. Save one below or in Numbers.`));
    }
  }
  if (FAMOUS[digits] || FAMOUS[n]) groups.push(g('Famous and cultural', [FAMOUS[digits] ?? FAMOUS[n]]));
  if (digits.length <= 3) {
    const words = majorWords(digits);
    groups.push(g('Major code words', words.slice(0, 18), words.length ? `Words whose consonant sounds spell ${digits}. Say them aloud to check.` : `No word in the built-in list spells ${digits}. Try splitting it.`));
  }
  if (digits.length === 1) {
    groups.push(g('Shape', [SHAPE[n]]));
    groups.push(g('Rhyme', [RHYME[n]]));
  } else if (digits.length === 2 && n <= 12) {
    groups.push(g('Rhyme', [RHYME[n]]));
  }
  if (COUNT[n] && digits.length <= 2) groups.push(g('Things that come in ' + n, [COUNT[n]]));
  if (digits.length === 2 && !COUNT[n]) groups.push(g('Two shapes', [`${SHAPE[+digits[0]]}, meeting ${SHAPE[+digits[1]]}`]));
  if (digits.length >= 3) {
    const pairs = digits.match(/\d{1,2}/g);
    const imgs = pairs.map((p) => (p.length === 2 ? effectivePeg(state, p).image : (majorWords(p)[0] || SHAPE[+p])));
    groups.push(g('In pairs', [pairs.map((p, i) => `${p} → ${imgs[i]}`).join(' · ')], 'One image per pair, placed at one location each, or chained into a little story.'));
    if (digits.length === 4 && digits >= '1000' && digits <= '2099') groups.push(g('As a year', [`Picture something that happened in ${digits}, or the pair images for ${digits.slice(0, 2)} and ${digits.slice(2)}.`]));
    const threes = digits.length % 3 === 0 ? digits.match(/\d{3}/g) : null;
    if (threes) {
      const ws = threes.map((t) => majorWords(t)[0]);
      if (ws.every(Boolean)) groups.push(g('In threes', [threes.map((t, i) => `${t} → ${ws[i]}`).join(' · ')], 'Fewer, longer words, if the Major code comes easily.'));
    }
  }
  return { kind: 'number', label: digits.length > 2 ? `the number ${digits}` : `the number ${digits}`, groups, peg: digits.length === 2 ? digits : null };
}

function soundAlikes(word) {
  const w = word.toLowerCase();
  const pool = [...new Set([...NOUNS, ...WORDS])].filter((x) => x !== w);
  const start = pool.filter((x) => x.length >= 3 && w.startsWith(x.slice(0, 3))).slice(0, 6);
  const end = w.length >= 4 ? pool.filter((x) => x.length >= 3 && x.slice(-3) === w.slice(-3)).slice(0, 6) : [];
  const inside = pool.filter((x) => x.length >= 4 && w.includes(x)).slice(0, 6);
  return { start, end, inside };
}

export function findIdeas(raw, state) {
  const input = String(raw || '').trim();
  if (!input) return null;
  const low = input.toLowerCase();

  const digits = input.replace(/[\s,]/g, '');
  if (/^\d+$/.test(digits) && digits.length <= 24) return forNumber(digits, state);

  // "7 of hearts", "10 of clubs", "K of spades" as well as "seven of hearts" and "7H".
  const numeric = low.match(/^(10|[2-9ajqk])\s+of\s+(spade|heart|diamond|club)s?$/);
  const card = numeric ? parseCard(`${numeric[1] === '10' ? 'T' : numeric[1]}${numeric[2][0]}`) : parseCard(input);
  if (card) {
    const img = effectiveImage(state, card);
    const pao = effectivePao(state.pao)[card];
    const ownPao = Boolean(state.pao?.[card]?.p);
    return { kind: 'card', label: cardName(card), groups: [
      g(img.own ? 'Your card image' : 'The example card image', [img.image], img.own ? '' : img.cue),
      g(ownPao ? 'Your PAO' : 'The example PAO', [`${pao.p} ${pao.a} ${pao.o}`]),
    ] };
  }

  const day = prefixMatch(low, Object.keys(DAYS));
  if (day) {
    const d = DAYS[day];
    return { kind: 'day', label: day[0].toUpperCase() + day.slice(1), groups: [
      g('Sounds like', d.sound), g('What it means to you', d.meaning, 'The day\'s mood or what you always do on it.'),
      g(`As a number (day ${d.n} of the week)`, [pegLine(state, d.n), SHAPE[d.n]]),
    ] };
  }

  const month = prefixMatch(low, MONTH_KEYS);
  if (month) {
    const m = MONTHS[month];
    const n = MONTH_KEYS.indexOf(month) + 1;
    return { kind: 'month', label: month[0].toUpperCase() + month.slice(1), groups: [
      g('Sounds like', m.sound), g('The season and its events', m.meaning),
      g(`As a number (month ${n})`, [pegLine(state, n)]),
    ] };
  }

  if (/^[a-z]$/i.test(input)) {
    return { kind: 'letter', label: `the letter ${input.toUpperCase()}`, groups: [g('Sound and shape', LETTERS[low])] };
  }

  const words = low.split(/\s+/);
  if (words.length > 1) {
    return { kind: 'phrase', label: input, groups: words.map((w) => {
      const r = findIdeas(w, state);
      return g(w, r ? r.groups.filter((x) => x.title !== 'Questions to ask').flatMap((x) => x.items).slice(0, 4) : []);
    }).concat([g('Join them', ['Make one scene where the first image does something to the next.'])]) };
  }

  const groups = [];
  if (CONCRETE.has(low)) groups.push(g('Already concrete', [`the ${low} itself, made vivid: huge, moving, or doing something it should not`]));
  if (ABSTRACT[low]) groups.push(g('Meaning', ABSTRACT[low]));
  const s = soundAlikes(low);
  if (s.inside.length) groups.push(g('Hidden inside it', s.inside));
  if (s.start.length) groups.push(g('Starts like it', s.start));
  if (s.end.length) groups.push(g('Ends like it', s.end));
  groups.push(g('Questions to ask', [
    'What does it look like in a cartoon or a film poster?',
    'Who is famous for it?',
    'What would you see happening the moment it happens?',
    'Can you split it into sounds that are things?',
  ]));
  return { kind: 'word', label: input, groups };
}
