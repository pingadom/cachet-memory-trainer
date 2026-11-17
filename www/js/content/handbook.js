// The handbook: a reference to every technique, written to be searched and reread.
export const HANDBOOK = [
  { id: 'principles', title: 'How memory techniques work', tags: 'association encoding visualisation rote repetition', html: `
<p>Every technique in this handbook does the same two things. It <b>encodes</b> information as something easy to remember, usually a concrete image. And it <b>attaches</b> that image to something you can find again: another image, or a place.</p>
<p>Plain repetition does neither. It holds items in short-term memory for as long as you keep repeating, and leaves little behind. That is why it feels like hard work for small results.</p>
<p>Nothing here needs an unusual memory. Studies of memory athletes find ordinary general memory and a heavily practised method.</p>` },
  { id: 'images', title: 'Making images that last', tags: 'vivid imagery interaction exaggeration senses absurd', html: `
<p>An image holds when it is <b>concrete</b>, <b>specific</b> and <b>doing something</b>.</p>
<ul><li><b>Interaction</b>: two things in one scene must act on each other. Side by side is two separate memories.</li>
<li><b>Movement</b>: prefer verbs. Smashing, pouring, climbing.</li>
<li><b>Exaggeration</b>: wrong size, wrong number, wrong material.</li>
<li><b>Senses</b>: a sound, a smell or a texture makes an image distinctive.</li>
<li><b>Absurdity</b>: implausible scenes stand out from plausible ones.</li></ul>
<p>Use your own first association. And make each image decode to exactly one thing: "a boat" is ambiguous; "a yacht with white sails and a man in a blazer" is not.</p>
<p>As you get faster, images get lighter: a glance at who is doing what, where. Start vivid and trim with experience.</p>` },
  { id: 'link', title: 'The link method', tags: 'chain story sequence list words', html: `
<p>For short ordered lists. Link item 1 to item 2 in one scene, then item 2 to item 3 in a new scene, and so on. Each scene has exactly two items, and the earlier one acts on the later.</p>
<p>Anchor the first item to yourself or the room so you have a way in.</p>
<p><b>Weakness:</b> the chain is only as strong as each link. Lose one and the rest is unreachable. For anything long, use a palace.</p>` },
  { id: 'loci', title: 'The method of loci (memory palace)', tags: 'palace locus loci route journey location spatial', html: `
<p>Choose a route through a place you know well. Fix a series of stopping points along it, the <b>loci</b>. To memorise, walk the route in your mind and leave one image (or one small scene) at each locus. To recall, walk it again.</p>
<p><b>Good loci</b> are fixed, distinct from their neighbours, large enough to stage a scene on, a few steps apart, and clear in your mind. Move through each room in the same direction and never cross your path. Group in fives so you can find the 23rd without counting.</p>
<p><b>Placing:</b> the image must affect the locus. Ask whether the place would look different afterwards.</p>
<p><b>Review:</b> one fast pass over the whole route after the last item.</p>
<p><b>Why it beats linking:</b> order comes from the route, which you already know. A lost image costs one item, not the rest of the list.</p>` },
  { id: 'interference', title: 'Reusing palaces and interference', tags: 'ghost images reuse rotate fade', html: `
<p>Fill the same palace twice in quick succession and old images intrude on the new list. Unreviewed images fade in a day or two, so:</p>
<ul><li>keep several palaces and rotate them;</li><li>rest a palace for a day after a full-deck attempt;</li><li>make the new image act directly on the locus, strongly enough to dominate;</li><li>keep separate palaces for things you want to retain permanently.</li></ul>
<p>How many loci you need: 52 for one image per card, 26 with two per locus, 18 with PAO.</p>` },
  { id: 'major', title: 'Numbers: the Major system', tags: 'digits major code pegs 00-99 number', html: `
<p>Each digit is a consonant sound: 0 s/z · 1 t/d · 2 n · 3 m · 4 r · 5 l · 6 sh/ch/j · 7 k/g · 8 f/v · 9 p/b. Vowels and w, h, y are free. Go by sound, not spelling.</p>
<p>Two digits make a word: 32 m–n <em>moon</em>, 74 k–r <em>car</em>. Fix one image for each of 00–99 and never vary it. A 20-digit number is then ten images at ten loci.</p>
<p>Edit your list under <a href="#/systems/numbers">My Systems → Numbers</a>.</p>
<p><b>The 20-digit goals:</b> two minutes, 60 s, 30 s, 15 s and 5 s, each needing all twenty digits correct without hints. The last is the pace of the best competitors in the world; the others are realistic training targets.</p>` },
  { id: 'card-images', title: 'Card images', tags: 'cards suit rank image system one-card', html: `
<p>Each of the 52 cards gets one permanent image. Cachet's example system builds a word from the suit's first letter (S, H, D, C) and the rank's Major-code sound (ace = 1 = t/d; ten = 0 = s/z): 7♣ is C + k, <em>cake</em>. Jacks are the suit symbol itself; queens and kings have their own words.</p>
<p>A system must be <b>complete</b>, <b>unambiguous</b> (no look-alike images) and <b>reversible</b> (image back to card). Replace any suggestion with your own association, and add a cue describing the specific thing you picture.</p>
<p>Train both directions. Card → image is needed for speed. Image → card is needed for correct recall.</p>` },
  { id: 'srs', title: 'The review schedule', tags: 'spaced repetition srs interval due mastery level adaptive', html: `
<p>Every association (card image, PAO part, number image) has its own record. After each answer:</p>
<ul><li><b>Wrong</b>: due again in 10 minutes. Interval resets. Ease falls by 0.2 (minimum 1.3).</li>
<li><b>Right, slower than 2.5 s</b>: interval × 1.3 (at least one day).</li>
<li><b>Right, faster than 2.5 s</b>: interval × ease. Ease starts at 2.3 and rises 0.05 per fast answer, to a maximum of 2.8.</li></ul>
<p><b>Levels</b>, from the last ten answers: <em>learning</em> (fewer than 3 attempts), <em>shaky</em> (under 70% right), <em>solid</em> (80% or more), <em>automatic</em> (90% or more, at least 5 attempts, median under 1.8 s).</p>
<p><b>Strength</b> is recent accuracy, reduced for slow answers and for having few attempts.</p>
<p><b>Weak-card training</b> picks cards at random with weight 0.15 + 1.5 × (1 − strength), and unseen cards at 1.2, so weaker cards appear more often without strong ones vanishing.</p>` },
  { id: 'adaptive', title: 'How recommendations are chosen', tags: 'adaptive recommend daily plan rules dashboard', html: `
<p>Recommendations come from fixed rules, checked in this order:</p>
<ol><li>Two cards confused with each other at least twice: a drill on that pair.</li>
<li>Five or more reviews due: review them.</li>
<li>Recognition accuracy under 80% (13+ cards seen): slow, accurate practice.</li>
<li>Recent sequences fast (under 4 s a card) but under 90% right: one untimed attempt.</li>
<li>Three failures in a row at the next sequence length after clearing the previous one: palace walk.</li>
<li>The next lesson.</li>
<li>Four or more weak cards: weak-card training.</li>
<li>Accuracy 90%+ on 40+ cards but median over 2.5 s: rapid recognition.</li>
<li>The next rung of the sequence ladder (3, 5, 10, 15, 26, 52). Two perfect unassisted attempts clear a rung.</li>
<li>PAO: the weakest of people, actions and objects; then scene speed.</li>
<li>The 20-digit number, until the 30-second goal is reached.</li></ol>
<p>The daily plan takes from the top of that list until it reaches about 12 to 20 minutes.</p>` },
  { id: 'sequences', title: 'Memorising card sequences', tags: 'sequence deck recall errors blank swap misplaced', html: `
<p>For each card: its image arrives, you place it at the next locus, you move on. Do not rehearse card names. Give every card about the same time. Review the route once at the end.</p>
<p>At recall, fill in what you are sure of, leave gaps, then repair. The unused cards are your shortlist.</p>
<p><b>Reading errors:</b></p>
<ul><li><b>Blank</b>: no image formed, or a locus was skipped.</li><li><b>Swapped</b>: both images there, order lost. Two images shared a locus, or two loci are alike.</li><li><b>Wrong place</b>: the image came loose from its locus.</li><li><b>Not in the list</b>: a decoding slip. Right image, wrong card.</li></ul>
<p><b>Two per locus:</b> the first card's image acts on the second's. The actor is always the earlier card.</p>` },
  { id: 'pao', title: 'Person–Action–Object', tags: 'pao person action object triple scene decode 17 18', html: `
<p>Every card has a person, an action and an object. Three cards make one scene: the <b>person of the first</b>, the <b>action of the second</b>, the <b>object of the third</b>. Position in the triple decides the role, so the scene stores the order.</p>
<p>Example: K♥ (Superman, flying off with, a cape), 7♠ (a witch, stirring, a cauldron), A♣ (a golfer, putting, a golf ball) → <em>Superman is stirring a golf ball.</em></p>
<p>Decode with three separate questions: who is it? whose move is that? whose thing is that?</p>
<p>52 cards = 17 scenes + 1 card, at 18 loci.</p>
<p><b>Building one:</b> theme the suits; choose people you see instantly; actions must be visible and transferable to any object; objects must be distinct. No action or object may appear twice. The <a href="#/systems/pao">builder</a> checks this.</p>
<p>PAO costs 156 associations to learn. It is optional: one image per card, two per locus, also reaches a fast deck.</p>` },
  { id: 'speed', title: 'Speed', tags: 'speed fast latency recheck auto-advance target pacing', html: `
<p>Time in a deck attempt goes to recognition, image-making, moving between loci, and rechecking. Recognition is the largest and most trainable part.</p>
<ul><li><b>Recognition</b>: rapid drill and deck run-through. Aim for a median under 1.5 s, then 1 s.</li><li><b>Image-making</b>: lighter images, trusted. Let the review pass catch failures.</li><li><b>Transitions</b>: timed empty walks.</li><li><b>Rechecking</b>: forward only, then one review pass.</li></ul>
<p><b>Pacing rule:</b> three perfect attempts in a row, go faster. Two of three with errors, go slower.</p>
<p><b>Budget for 2:00:</b> 2.3 s per card overall. Typically 75–90 s first pass, the rest on review.</p>
<p><b>When an image fails mid-deck:</b> keep moving, look again on the review pass, and at recall fill everything else first.</p>` },
  { id: 'arena', title: 'Speed Cards: rules and milestones', tags: 'arena milestone rules two minute perfect assisted', html: `
<p>An attempt is memorisation, recall, results. The deck is shuffled with the browser's cryptographic random source, every order equally likely. Once recall begins the cards are not shown again until you submit.</p>
<p><b>Milestones:</b> first perfect deck; then under 15, 10, 5, 3 and 2 minutes. Each requires all 52 cards in the correct position and no hints. The time is memorisation time. Recall time is recorded separately and does not count.</p>
<p>A fast attempt with any error is saved as what it is and earns nothing. So is an assisted attempt.</p>
<p>Two minutes is a goal to work towards. How long it takes differs from person to person and depends mainly on regular practice.</p>` },
  { id: 'practice', title: 'How to practise', tags: 'practice routine daily plateau spacing recall recognition', html: `
<p><b>Test, do not reread.</b> Produce the answer, then check. Recognising an answer is not the same as recalling it.</p>
<p><b>Space it.</b> Ten to twenty minutes most days beats two hours on Sunday.</p>
<p><b>Accuracy before speed.</b> Work at the pace where you usually succeed and sometimes fail.</p>
<p><b>A typical day:</b> due reviews and weak cards (3–5 min); one speed component (3–5 min); one or two sequences at your current length (5–8 min). Full decks once or twice a week.</p>
<p><b>Plateaus:</b> compare your deck run-through time with your deck time. If they are close, recognition is the limit. If the deck is much slower, the time is in placing and reviewing.</p>` },
];
