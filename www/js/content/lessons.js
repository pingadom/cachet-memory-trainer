// The course. Every lesson has: an objective, an explanation, a demonstration, a worked example,
// an exercise, and a recap. Feedback and the next step are produced from the exercise result.
//
// Three kinds of claim are kept apart in the text:
//   .research  a general finding from memory research
//   .technique how competitive memorisers actually do it
//   .coach     practical advice; reasonable, but a matter of judgement

export const STAGES = [
  { id: 'memory', n: 1, title: 'Understanding memory', blurb: 'Why repetition is a poor tool for ordered lists, and what works instead.' },
  { id: 'imagery', n: 2, title: 'Building mental imagery', blurb: 'Turning anything into a picture that is hard to forget, and linking pictures in order.' },
  { id: 'loci', n: 3, title: 'The memory palace', blurb: 'The method of loci: a familiar route as a filing system for ordered information.' },
  { id: 'numbers', n: 4, title: 'Numbers', blurb: 'A first reusable code. Digits become sounds, sounds become images. Goal: a 20-digit number.' },
  { id: 'cards', n: 5, title: 'Cards as images', blurb: 'One fixed image for each of the 52 cards, and back again.' },
  { id: 'recognition', n: 6, title: 'Card recognition', blurb: 'Making the card-to-image step automatic before asking it to carry a whole deck.' },
  { id: 'sequences', n: 7, title: 'Card sequences', blurb: 'Images plus palace: 3, 5, 10, 15, 26 and then all 52 cards, accuracy first.' },
  { id: 'pao', n: 8, title: 'Person–Action–Object', blurb: 'Three cards per location. The main advanced route, taken when you are ready for it.' },
  { id: 'speed', n: 9, title: 'Speed training', blurb: 'Removing hesitation without giving back accuracy.' },
  { id: 'challenge', n: 10, title: 'The two-minute deck', blurb: 'A full shuffled deck, memorised in under 120 seconds and recalled perfectly.' },
];

const R = (t) => `<p class="claim research"><b>Research</b>${t}</p>`;
const T = (t) => `<p class="claim technique"><b>Technique</b>${t}</p>`;
const C = (t) => `<p class="claim coach"><b>Coaching</b>${t}</p>`;

export const LESSONS = [
  // ───────────────────────── Stage 1 ─────────────────────────
  {
    id: 'why-techniques', stage: 'memory', title: 'Why repetition fails, and what replaces it', minutes: 7, pass: 0,
    objective: 'Feel the difference between repeating a list and encoding it, using your own results.',
    body: `
<p>Ask most people to learn a shopping list and they will say it over and over under their breath. This is <em>rote rehearsal</em>. It keeps words circulating in short-term memory, which holds only a handful of items and empties the moment your attention moves. Rehearsal does little to connect the items to each other, or to anything you already know, so when the loop stops there is nothing to pull them back with.</p>
<p>Memory techniques do something different. They take what you want to remember and <b>attach it to something</b>: to an image, to the previous item, to a place. Recalling then stops being a matter of hoping the item floats up. You follow the attachment.</p>
${R('Memory for a list depends far more on <em>how</em> it was processed than on how long or how often it was repeated. Material that is processed for meaning and connected to existing knowledge is retained better than material that is merely repeated.')}
<p>Nothing in this course requires an unusual memory. Competitors who memorise a deck of cards in under a minute perform ordinarily on memory tasks they have no system for. What they have is a method and a great deal of practice.</p>`,
    demo: `<p>You are about to run the experiment on yourself. Two lists of eight words, forty seconds each. For the first you will repeat the words. For the second you will chain them into one ridiculous story, each word doing something to the next.</p>`,
    worked: `<p>Take <span class="mono">candle · bicycle · octopus · ladder</span>. A chain: a <b>candle</b> is melting onto the saddle of a <b>bicycle</b>; the bicycle is being pedalled by an <b>octopus</b>, one tentacle per pedal and six to spare; the octopus rides straight up a <b>ladder</b>, which bends under the weight. Close your eyes and you can replay it. Notice that you are not remembering four words. You are remembering one short film, and reading the words off it.</p>`,
    exercise: { type: 'compare', n: 8, seconds: 40 },
    recap: ['Rehearsal holds items briefly; it does not build a route back to them.', 'Techniques work by attaching new information to images, to each other, or to places.', 'This is a skill with a method. It does not depend on natural talent.'],
  },
  {
    id: 'encoding', stage: 'memory', title: 'Association, visualisation and meaning', minutes: 6, pass: 0,
    objective: 'Convert abstract information into concrete images that can be remembered.',
    body: `
<p>Three ideas carry almost everything that follows.</p>
<p><b>Association.</b> You remember new things by linking them to things you already have. A new fact with no links is an island: nothing leads to it.</p>
<p><b>Visualisation.</b> Most people remember scenes much better than they remember words or symbols. A string like <span class="mono">7♣ Q♦ 3♠</span> has nothing to see. A weightlifter and Cleopatra arguing over a blackboard does.</p>
<p><b>Meaningful encoding.</b> Before you can picture something abstract, you translate it. "Justice" becomes a judge's gavel. "Tuesday" might become <em>two</em> swans (Tuesday sounds like "twos-day"). The translation does not need to be clever. It needs to be the first concrete thing that comes to <em>you</em>, because that is what will come back later.</p>
${R('Concrete, easily imaged words are recalled better than abstract ones, and items that are distinctive against their background are recalled better than items that blend in. Both effects are robust and long established.')}
${C('"Visualise" does not mean seeing a photograph. Some people get vivid pictures; many get only a faint sense of a scene, where things are and what is happening. That is enough. If you can say what is to the left of what, you are doing it.')}`,
    demo: `<p>Three translations, from easy to awkward:</p>
<ul><li><b>Apple</b> — already concrete. Picture it: colour, size, the bite taken out.</li>
<li><b>Freedom</b> — abstract. A bird leaving an open cage.</li>
<li><b>Thirty-four</b> — a pure symbol. Later you will have a fixed image for it; for now, a football shirt with 34 on the back.</li></ul>`,
    worked: `<p>Suppose you need to remember the word <b>"inflation"</b>. Meaning route: a banknote blown up like a balloon until it bursts. Sound route: someone <em>inflating</em> a tyre. Either works. The balloon-banknote is better, because the picture contains the idea itself and you are less likely to read it back as "pump" or "tyre".</p>`,
    exercise: { type: 'imagine', prompts: ['justice', 'Tuesday', 'patience', 'inflation', 'the number 7'], examples: [
      'A judge brings a gavel down so hard the bench splits in two and splinters fly at you.',
      'By sound: "Tues" is "twos". A pair of identical twins high-five so hard they knock a wall calendar flying.',
      'A fisherman asleep in a deckchair while cobwebs grow over his rod and a snail climbs up his boot.',
      'A price tag swelling like a balloon until it lifts a loaf of bread off the shelf and floats it out of the shop.',
      'Cristiano Ronaldo in his number 7 shirt, leaping into his goal celebration and landing with a thud. Or by shape: a 7 as a cliff edge, with someone stepping off it.'] },
    recap: ['Abstract things must be translated into something you can picture.', 'Use the first concrete association you have. Yours will be more reliable than a borrowed one.', 'A faint sense of a scene is enough; you do not need photographic imagery.'],
  },
  {
    id: 'chunking', stage: 'memory', title: 'Chunking, and where it stops', minutes: 5, pass: 0,
    objective: 'Understand what chunking does, measure your own digit span, and see why chunking alone will not hold a deck.',
    body: `
<p>Short-term memory holds a small number of <em>items</em>, but an item can be as large as you can make it. <span class="mono">1 9 6 9 2 0 0 1 1 0 6 6</span> is twelve digits. <span class="mono">1969 · 2001 · 1066</span> is three familiar dates. This regrouping is <b>chunking</b>, and you already do it with phone numbers.</p>
${R('The capacity of immediate memory is usually put at around four chunks, give or take, when rehearsal is prevented. The older figure of "seven plus or minus two" overstates it for most material.')}
<p>Chunking has two limits. First, it only helps when the chunks mean something. <span class="mono">8 3 7 2</span> is not a date, so it stays four items. Second, chunks sit in the same small store. Fifty-two cards in chunks of three is still seventeen chunks, far more than you can hold.</p>
<p>Memory techniques answer both limits. A <b>code</b> makes <em>every</em> chunk meaningful by giving it a fixed image. A <b>memory palace</b> stores those images outside short-term memory, in a place you already know. The rest of the course builds exactly those two things.</p>`,
    demo: `<p>Read once, look away, repeat: <span class="mono">4 9 1 6 2 5 3 6 4 9 6 4</span>. Hard. Now notice it is <span class="mono">4 · 9 · 16 · 25 · 36 · 49 · 64</span>, the squares from two to eight. One idea in place of twelve digits. That only worked because the pattern happened to exist.</p>`,
    worked: `<p>Twelve random digits: <span class="mono">7 2 0 4 1 9 5 5 8 3 6 1</span>. Grouped as <span class="mono">72 · 04 · 19 · 55 · 83 · 61</span> it is six two-digit numbers. Easier to say, but still six arbitrary things. With a number code (stage 4), those six become a can, a sari, a tap, a lily, foam and a jet, which can be pictured and placed. Grouping reduces the count; the code supplies the meaning.</p>`,
    exercise: { type: 'digits', n: 12, plain: true },
    recap: ['Short-term memory holds about four chunks.', 'Chunking helps only when chunks are meaningful, and long lists still overflow.', 'A code makes every chunk meaningful; a palace gives the chunks somewhere to live.'],
  },
  {
    id: 'recall-spacing', stage: 'memory', title: 'Recall, recognition and spacing', minutes: 6, pass: 0.75,
    objective: 'Know the difference between recognising and recalling, and how practice should be timed.',
    body: `
<p><b>Recognition</b> is knowing something when you see it. <b>Recall</b> is producing it from nothing. Recognition is much easier, which makes it a poor test: rereading your notes feels fluent because everything is familiar, and that feeling is easily mistaken for knowing.</p>
<p>Memorising a deck is pure recall. Nobody shows you four options for the seventeenth card. So this course tests by recall wherever it can: you will type sequences, rebuild orders and pick cards from a full deck, not from a shortlist.</p>
${R('Retrieving information from memory strengthens it more than restudying it does (the testing effect). Practice spread over time produces more durable learning than the same amount massed together (the spacing effect). Both are among the most replicated findings in the study of learning.')}
<p>Spacing is how your card images will become permanent. Each image is reviewed, then left alone for longer and longer: ten minutes, a day, a few days, a week. Review comes just as the image starts to fade, which is when the effort of retrieving it does most good. The schedule Cachet uses is written out in the handbook; there is nothing hidden in it.</p>
${C('Being wrong during practice is useful information. An exercise you get 100% on the first time was too easy to teach you much.')}`,
    demo: `<p>Which of these was in the last lesson's twelve-digit example: <span class="mono">83</span> or <span class="mono">38</span>? You can probably pick. Now, without looking: what were the six two-digit groups, in order? That gap between the two questions is the gap between recognition and recall.</p>`,
    worked: `<p>A learner drills card images by flipping through a printed list, reading "seven of clubs: cake" and nodding. After a week they "know" all 52, and then freeze when shown a bare 7♣. They practised recognition. The fix is to cover the answer, produce it, and only then check. Every drill in the Train section works that way.</p>`,
    exercise: {
      type: 'quiz', items: [
        { q: 'You reread a chapter and it all feels familiar. What does that tell you?', options: ['You could reproduce it from memory', 'You can recognise it; recall is untested', 'It is in long-term memory'], answer: 1, why: 'Familiarity is recognition. Only an attempt to produce the material tests recall.' },
        { q: 'You have 40 minutes this week to learn 52 card images. Which plan is best?', options: ['One 40-minute session', 'Four 10-minute sessions on different days', 'Two 20-minute sessions back to back'], answer: 1, why: 'Spaced sessions beat the same time massed together.' },
        { q: 'During a drill, which step does the learning?', options: ['Seeing the answer', 'Trying to retrieve the answer before seeing it', 'Reading the card name aloud'], answer: 1, why: 'Retrieval practice: the attempt itself strengthens the memory.' },
        { q: 'Recalling the order of a deck is a test of…', options: ['Recognition', 'Recall', 'Chunking capacity'], answer: 1, why: 'Nothing is shown to you; every card must be produced.' },
      ],
    },
    recap: ['Recognition feels like knowing but is not recall.', 'Test yourself by producing the answer, then checking.', 'Short sessions spread over days beat one long one.'],
  },

  // ───────────────────────── Stage 2 ─────────────────────────
  {
    id: 'vivid-images', stage: 'imagery', title: 'What makes an image stick', minutes: 7, pass: 0.8,
    objective: 'Build a two-image association strong enough that either image brings back the other.',
    body: `
<p>An association is two images <em>doing something to each other</em>. A dog <em>next to</em> a piano is two separate pictures and will be recalled as one or neither. A dog hammering the keys with its paws, howling along, is one picture.</p>
<p>Five levers make an image more durable. Use whichever come naturally; you rarely need all five.</p>
<ul>
<li><b>Interaction.</b> One thing acts on the other: crushes it, wears it, eats it, rides it.</li>
<li><b>Movement.</b> Scenes in motion hold better than stills.</li>
<li><b>Exaggeration.</b> Make it enormous, tiny, or a thousand of them.</li>
<li><b>Senses.</b> The smell of burning, a cold wet handle, a noise that makes you wince.</li>
<li><b>Absurdity and humour.</b> The impossible is distinctive. Sensible images blur into each other.</li>
</ul>
${R('Interactive imagery, where two items are pictured as a single interacting scene, reliably improves memory for the pair compared with picturing them separately. Bizarreness helps mainly because it makes an image distinctive among ordinary ones.')}
${T('Experienced memorisers do not make every image maximally vivid. That is slow. They make it <em>just distinct enough</em>, and save the extra effort for images they know are weak. For now, err on the side of too vivid. Economy comes with practice.')}`,
    demo: `<p>Pair: <b>violin — cement mixer</b>.</p>
<p><em>Weak:</em> a violin lying beside a cement mixer.<br><em>Strong:</em> you feed a violin into the mixer; it splinters with a shriek of strings and the drum spits out varnished matchwood.</p>
<p>Later, "cement mixer" will pull back the splintering violin without effort. It would not pull back something that merely sat beside it.</p>`,
    worked: `<p>Pair: <b>lawyer — pineapple</b>. Interaction: the lawyer is cross-examining a pineapple in the witness box. Exaggeration: the pineapple is the size of a person and sweating juice. Sense: the courtroom smells of it. Ten seconds of imagining, and the pair holds in both directions.</p>`,
    exercise: { type: 'pairs', n: 6 },
    recap: ['Images must interact; side by side is not an association.', 'Movement, exaggeration, senses and absurdity each add durability.', 'Start too vivid and trim later.'],
  },
  {
    id: 'link-stories', stage: 'imagery', title: 'Linking images into a sequence', minutes: 8, pass: 0.8,
    objective: 'Memorise ten unrelated words in order with the link method.',
    body: `
<p>The <b>link method</b> stores a sequence as a chain. Image 1 interacts with image 2. Then, in a <em>new</em> scene, image 2 interacts with image 3. And so on. To recall, start at the first image and ask what it did.</p>
<p>Two rules keep the chain reliable.</p>
<p><b>Link only neighbours.</b> Each scene contains exactly two items. If you build one grand story with everything in it, you will remember the cast and lose the order.</p>
<p><b>Make direction visible.</b> The earlier item should act on the later one, or the later should emerge from the earlier. "A kettle pours boiling tea over a trumpet" has an order. "A kettle and a trumpet in a cupboard" does not.</p>
<p>You also need a way in. Tie the first item to yourself or to the room: it lands on your head, or it is blocking the door.</p>
${T('The link method is the oldest and simplest technique, and its weakness is structural: break one link and everything after it is unreachable. It is excellent for short lists and for learning to make images quickly. For long sequences you will move to the memory palace, which has no such single point of failure.')}`,
    demo: `<p><span class="mono">kettle → trumpet → glacier → sandal → parliament</span></p>
<p>A kettle is balanced on my head, whistling. It pours tea down the bell of a <b>trumpet</b>. The trumpet blasts a note that cracks a <b>glacier</b> in two. Out of the crack slides a giant frozen <b>sandal</b>. The sandal stamps down on the roof of <b>parliament</b>, and the members scatter.</p>
<p>Four links, each between two things, each with a clear before and after.</p>`,
    worked: `<p>Recall is a walk along the chain. Something was on my head: <em>kettle</em>. What did the kettle do? Poured into a <em>trumpet</em>. What did the trumpet do? Cracked a <em>glacier</em>. If "glacier" will not come, the cause is usually that the trumpet's action was too mild. Louder next time.</p>`,
    exercise: { type: 'words', n: 10, method: 'link' },
    recap: ['Chain items in pairs: 1→2, 2→3, 3→4.', 'Make the order visible in the action.', 'A broken link loses the rest of the chain, which is why longer lists need a palace.'],
  },
  {
    id: 'clean-links', stage: 'imagery', title: 'Ambiguity, and recalling in reverse', minutes: 7, pass: 0.75,
    objective: 'Diagnose why an image failed, and build links robust enough to run backwards.',
    body: `
<p>When recall fails, the image is usually still there. What failed is one of three things.</p>
<p><b>The image was ambiguous.</b> You pictured "a boat" for <em>yacht</em> and read back <em>ship</em>. An image must lead to exactly one answer. Add the detail that makes it unmistakable: white sails, champagne, a blazer.</p>
<p><b>The link was passive.</b> Two things sharing a scene, with nothing happening between them.</p>
<p><b>The image was borrowed.</b> You used the "obvious" picture instead of yours. If <em>bank</em> first makes you think of a river bank, use the river bank.</p>
<p>A good test of a link is whether it runs in reverse. If the glacier was cracked <em>by a trumpet</em>, then "glacier" should lead back to "trumpet" as easily as forward to "sandal". Reverse recall is not a party trick. It shows whether your links are real two-way associations or a memorised recital.</p>
${R('Recalling a list backwards is harder than forwards when the list was learned by rehearsal, because rehearsal encodes a forward chain. Lists encoded as interacting images or at spatial locations show a much smaller penalty.')}`,
    demo: `<p>Ambiguous: <em>coat</em>, pictured as "someone wearing something". Read back as jacket? jumper? scarf?</p>
<p>Unambiguous: a floor-length fur coat with a brass hanger still in it, dragging on the ground. Only one word fits that picture.</p>`,
    worked: `<p>List: <span class="mono">anchor · violin · ticket</span>. Forward: the anchor drops through a violin; the smashed violin leaks tickets like confetti. Backward: tickets — what were they coming out of? The broken violin. What broke it? The anchor. Each scene answers both "what next?" and "what before?".</p>`,
    exercise: { type: 'words', n: 8, method: 'link', reverse: true },
    recap: ['Most failures are ambiguous images or passive links, not "bad memory".', 'Each image should decode to exactly one answer.', 'If a link will not run backwards, it was not a real association.'],
  },

  // ───────────────────────── Stage 3 ─────────────────────────
  {
    id: 'palace-idea', stage: 'loci', title: 'The method of loci', minutes: 8, pass: 0.85,
    objective: 'Understand what a memory palace is and use a ready-made one to hold seven items.',
    body: `
<p>You can already recall, in order and without effort, the things you pass on the way from your front door to your bed. You never studied this. Spatial memory for familiar places is something people are simply good at.</p>
<p>The <b>method of loci</b> uses that. You choose a route through a place you know well and pick out fixed stopping points along it, the <b>loci</b> (singular <em>locus</em>). To memorise a list, you walk the route in your mind and leave one image at each locus. To recall, you walk it again and look at what is there.</p>
<p>Compare this with the link method. Order no longer depends on each item leading to the next. It comes from the route, which you already know. Forget what was at the fifth locus and the sixth is still waiting. One failure costs one item.</p>
${R('The method of loci is the best-studied mnemonic technique. In controlled studies, people trained in it for a few weeks recall substantially more of a word list than untrained controls, and brain imaging of memory athletes shows the technique recruiting regions involved in spatial navigation. It is a learned strategy; studies of memory athletes have not found exceptional general memory or intelligence.')}
${T('"Palace" is a grand name for an ordinary thing. Almost every competitor uses their own home, their school, a walk to work. It does not need to be large or beautiful. It needs to be known.')}`,
    demo: `<p>A small palace, used in the exercise below. Walk it once now:</p>
<ol class="route-demo"><li>Front door</li><li>Coat hooks</li><li>Stairs</li><li>Kitchen sink</li><li>Oven</li><li>Sofa</li><li>Television</li></ol>
<p>To store <span class="mono">octopus</span> at the first locus: an octopus is suckered onto the <b>front door</b>, and you have to peel off a tentacle to reach the handle. The image <em>uses</em> the locus.</p>`,
    worked: `<p>List: <span class="mono">octopus · trombone · snow</span>.</p>
<p><b>Front door</b>: the octopus on the handle. <b>Coat hooks</b>: a trombone hanging by its slide, which extends and pokes you as you pass. <b>Stairs</b>: every step is packed with snow and you slip.</p>
<p>Recall: go to the front door. What is there? Something wet on the handle. Walk on.</p>`,
    exercise: { type: 'words', n: 7, method: 'loci', palace: 'example' },
    recap: ['A memory palace is a familiar route with fixed stopping points.', 'One image per locus, and the image must interact with the locus.', 'Order comes from the route, so one lost image does not lose the rest.'],
  },
  {
    id: 'build-palace', stage: 'loci', title: 'Building your first palace', minutes: 10, pass: 1,
    objective: 'Create your own palace of at least ten well-chosen loci.',
    body: `
<p>Your first palace should be the place you know best, usually where you live now. Stand at the entrance in your mind and move through it in the order you naturally would.</p>
<p><b>Choosing loci.</b> A good locus is:</p>
<ul>
<li><b>Fixed.</b> A fireplace, not the cat.</li>
<li><b>Distinct.</b> Not four identical dining chairs. If you must use similar things, use one.</li>
<li><b>Big enough to stage a scene on.</b> A sofa, a sink, a doorway. A light switch is cramped.</li>
<li><b>Well separated.</b> A step or two apart, so images do not bleed into each other.</li>
<li><b>Well lit in your mind.</b> If you cannot picture the spot clearly, skip it.</li>
</ul>
<p><b>Fixing the order.</b> The route must be the same every time. Two conventions help: move through each room in one direction (always clockwise, say), and never cross your own path. Group loci by room, with the same number in each if you can: five per room makes it trivial to know that the 13th locus is the third in the third room.</p>
${T('Competitors keep many palaces and number their loci, because a 52-card deck with one image per card needs 52 loci, and with a three-card system it needs 18. Start with ten. You will extend it.')}
${C('Write loci down as short, concrete names: "kitchen sink", not "kitchen". The name is only a label for a place you can already see.')}`,
    demo: `<p>A flat, five loci per room, clockwise from each doorway:</p>
<p class="small"><b>Hall:</b> doormat · coat hooks · mirror · shoe rack · radiator<br><b>Kitchen:</b> fridge · sink · hob · kettle · bin<br><b>Living room:</b> armchair · bookshelf · window · television · sofa</p>
<p>Fifteen loci in three groups, enough for fifteen words, thirty digits, or forty-five cards with PAO.</p>`,
    worked: `<p>Common first-attempt faults: "bedroom" as a single locus (too vague: which spot?); "left bedside table" and "right bedside table" as consecutive loci (too similar: merge them, or use only one); a route that goes kitchen → bedroom → back through the kitchen (crossing itself). Fix each as you build.</p>`,
    exercise: { type: 'task', check: 'palace10', label: 'Build a palace with at least 10 loci', href: '#/systems/palaces', cta: 'Open the palace builder' },
    recap: ['Use the place you know best.', 'Loci should be fixed, distinct, roomy and separated.', 'One direction per room, never crossing your path; group in fives.'],
  },
  {
    id: 'palace-walk', stage: 'loci', title: 'Walking the route', minutes: 6, pass: 0.9,
    objective: 'Recall your loci in order, forwards and backwards, without hesitation.',
    body: `
<p>Before a palace can hold anything, moving through it must cost you nothing. If you have to work out which locus comes next, that effort is taken from the images you are trying to place.</p>
<p>Walk the empty route in your head. At each locus, pause and <em>look</em>: what is it made of, where is the light coming from, what is to its left? Then walk it backwards. Then jump: what is the seventh locus? What comes before the bookshelf?</p>
<p>You are done when the walk feels like reciting the alphabet, automatic and slightly dull.</p>
${T('Speed memorisers time their empty walks. Passing 26 loci in well under ten seconds is ordinary for a trained route, because at that point the route supplies the next location before it is asked for.')}
${C('If two loci keep swapping, they are too similar or too close. Change one of them in the builder now, before you have anything stored there.')}`,
    demo: `<p>Try it on the example route: front door, coat hooks, stairs, kitchen sink, oven, sofa, television. Close your eyes and go backwards from the television. Where did you slow down? That is the join to rehearse.</p>`,
    worked: `<p>The exercise shows nothing but a position number. You say or picture the locus, reveal it, and mark yourself honestly. First forwards, then in reverse. A hesitation counts as a miss: the standard is instant.</p>`,
    exercise: { type: 'walk' },
    recap: ['The route must be automatic before it carries images.', 'Practise forwards, backwards and by number.', 'Fix loci that swap or blur before you rely on them.'],
  },
  {
    id: 'palace-use', stage: 'loci', title: 'Filling, reviewing and reusing a palace', minutes: 10, pass: 0.8,
    objective: 'Hold 20 items in your palace, and know how to reuse it without old images intruding.',
    body: `
<p><b>Placing.</b> At each locus, the image must do something <em>to the locus</em>. A pineapple on the sofa is weak. A pineapple so spiky it has shredded the sofa cushions, stuffing everywhere, is strong. Ask of every image: would this locus look different afterwards?</p>
<p><b>More than one per locus.</b> With ten loci and twenty items, put two at each, and link them in order: the first image acts on the second, both act on the locus. This is how you will later hold two or three cards at one location.</p>
<p><b>Reviewing.</b> After placing the last item, walk the whole route once at speed and glance at each image. This single pass catches faint images while the original is still in front of you. In competition it is often the difference between 50 cards and 52.</p>
<p><b>Reusing.</b> Fill the same palace twice in an hour and yesterday's sandal may turn up in today's list. This is <em>interference</em>. Images fade by themselves within a day or two if not reviewed, so the practical remedies are:</p>
<ul><li>rotate between several palaces, resting each one;</li><li>make new images act <em>on top of</em> the locus, vividly enough to dominate;</li><li>keep one palace for permanent knowledge, and others for throwaway practice.</li></ul>
${R('Interference from earlier lists learned in the same context is a well-documented cause of forgetting. It is strongest when the old and new material are similar and learned close together in time.')}`,
    demo: `<p>Two items at one locus, <span class="mono">magnet → custard</span> at the <b>fridge</b>: a horseshoe magnet the size of the door has pulled the fridge off the wall; a tide of custard pours out of the magnet's two ends onto the floor. Magnet first (it is the cause), custard second (the result).</p>`,
    worked: `<p>Twenty words, ten loci. Words 1–2 at locus 1, 3–4 at locus 2, and so on. Recall: locus 1, what is happening? Read off the first actor, then what it acts on. If you find only one image at a locus, leave a gap and move on; it often returns when you see the next scene.</p>`,
    exercise: { type: 'words', n: 20, method: 'loci', palace: 'own' },
    recap: ['The image must change the locus.', 'Two images at a locus: the first acts on the second.', 'Review once at the end. Rotate palaces to limit interference.'],
  },

  // ───────────────────────── Stage 4: numbers ─────────────────────────
  {
    id: 'major-code', stage: 'numbers', title: 'Digits as sounds: the Major system', minutes: 8, pass: 0.75,
    objective: 'Learn the ten digit-to-consonant pairs and read numbers out of words.',
    body: `
<p>Digits are the hardest thing to picture, so memorisers replace them. The <b>Major system</b> gives each digit a consonant <em>sound</em>. Vowels (and w, h, y) carry no value, so you are free to add them to turn sounds into words.</p>
<div data-widget="majorTable"></div>
<p>It is sound, not spelling. <em>Knife</em> is n–f, so 28: the k is silent. <em>Cheese</em> is ch–z: 60. A doubled letter is one sound: <em>mummy</em> is m–m, 33.</p>
<p>With the code, any two-digit number becomes a noun: 32 is m–n, <em>moon</em>. 74 is k–r, <em>car</em>. A twenty-digit number is ten nouns, and you already know how to store ten nouns in order.</p>
${T('The Major system is several centuries old and still the most common way into number memorisation. It is one option. Others include a number-shape system for single digits, or a list of 100 people. Competitors eventually fix one image for every pair 00–99, or every triple 000–999, and drill them to automaticity, exactly as you will with cards.')}`,
    demo: `<div data-widget="majorDemo"></div>`,
    worked: `<p><span class="mono">3 2 7 4 9 5</span> → pairs <span class="mono">32 · 74 · 95</span> → m-n, k-r, b-l → <b>moon, car, bell</b>. A moon has fallen and flattened a car; the car's horn has been replaced by a bell that will not stop ringing. Decode: moon = m, n = 32. Car = k, r = 74. Bell = b, l = 95.</p>`,
    exercise: {
      type: 'typed', prompt: 'Which two-digit number does this word encode?', items: [
        { q: 'moon', a: '32', why: 'm = 3, n = 2' }, { q: 'car', a: '74', why: 'k = 7, r = 4' }, { q: 'lid', a: '51', why: 'l = 5, d = 1' },
        { q: 'fish', a: '86', why: 'f = 8, sh = 6' }, { q: 'nose', a: '20', why: 'n = 2, z = 0' }, { q: 'bomb', a: '93', why: 'b = 9, m = 3; the final b is silent' },
        { q: 'tyre', a: '14', why: 't = 1, r = 4' }, { q: 'jam', a: '63', why: 'j = 6, m = 3' },
      ],
    },
    recap: ['Ten digits, ten consonant sounds; vowels are free.', 'Go by sound, not spelling.', 'Any pair of digits becomes a picturable noun.'],
  },
  {
    id: 'number-pegs', stage: 'numbers', title: 'A fixed image for every pair', minutes: 8, pass: 0,
    objective: 'Start a personal list of 100 number images and drill the first twenty.',
    body: `
<p>Inventing a word each time you see 47 is slow and unreliable: today "rock", tomorrow "rake". Under time pressure the rule is <b>one number, one image, always</b>. A fixed list of 100 images for 00–99 is your first complete <em>encoding system</em>.</p>
<p>Cachet has an example list built with the Major code. Open <a href="#/systems/numbers">My Systems → Numbers</a> to see it. Treat it as a draft. Wherever your mind offers a different word that fits the sounds, save yours instead. Where you ignore the code entirely because 07 can only ever be James Bond, that is fine too. The code is there to help you learn the list. Once learned, the list is all that matters.</p>
${T('Good pegs are objects you can see, grab and do things with. Avoid near-duplicates within your list (a "cup" and a "mug" will be confused at speed), and avoid images that overlap with your card images later.')}
${C('Learn the list in tens, across several days. Twenty pairs a day with reviews is comfortable. The drill below is self-graded: see the number, bring the image to mind, then reveal.')}`,
    demo: `<p>The tens row by row: every image in the 30s starts with <b>m</b> (moose, mat, moon, mummy…), every image in the 70s with a hard <b>c/k</b> (case, cat, can, comb…). If you blank on 73, the code narrows it to k–m and "comb" usually arrives.</p>`,
    worked: `<p><span class="mono">19</span> appears. Sounds t–p. <em>Tap.</em> Picture a particular tap, the dripping one in your bathroom. Reveal: tap. Mark it known. If it took three seconds of working through the code, it is known but not yet fast; the schedule will bring it back sooner than the ones you answer instantly.</p>`,
    exercise: { type: 'drill', kind: 'peg', pool: 'range:0-19', count: 20 },
    recap: ['One number, one image, always.', 'The example list is a draft; your own associations are stronger.', 'Learn in tens over several days.'],
  },
  {
    id: 'digits-20', stage: 'numbers', title: 'A 20-digit number', minutes: 8, pass: 0.9,
    objective: 'Memorise 20 random digits in a palace and recall them exactly.',
    body: `
<p>You now have everything needed. Twenty digits are ten pairs; ten pairs are ten images; ten images go at ten loci (or two per locus at five).</p>
<p>The procedure, which is the same procedure you will use for cards:</p>
<ol><li><b>Read</b> the next pair.</li><li><b>Translate</b> it to its image.</li><li><b>Place</b> the image at the next locus, acting on it.</li><li><b>Move.</b> Do not look back.</li><li>After the last pair, <b>review</b> the route once.</li></ol>
<p>Recall is the same walk: locus, image, sounds, digits.</p>
<p>This is the first of Cachet's timed intermediate goals. The ladder runs: 20 digits in two minutes, then 60 seconds, 30, 15, and finally 5.</p>
${T('To calibrate that ladder: 20 digits in a minute is a good first week. Thirty seconds needs a fluent list. Fifteen seconds is strong club-level speed. Five seconds is four digits a second, the pace of the very best competitors in the world over short numbers, usually with a three-digit system. It is on the ladder as a horizon, and reaching the earlier rungs is already an achievement.')}`,
    demo: `<p><span class="mono">72 04 19 55 83 61 …</span> at the hall: a <b>can</b> wedged under the doormat so the door will not close; a silk <b>sari</b> draped over all the coat hooks; a <b>tap</b> growing out of the mirror, running; <b>lilies</b> planted in every shoe on the rack; the radiator buried in <b>foam</b>…</p>`,
    worked: `<p>At recall you reach the shoe rack and see flowers. Lily: l–l: 55. If you see "flowers" and think <em>rose</em> (40) you have a decoding error, which is why a peg should be a specific thing: white lilies, with the smell.</p>`,
    exercise: { type: 'digits', n: 20 },
    recap: ['Read, translate, place, move; review once.', 'Decode by sound: image → consonants → digits.', 'The goals ladder for 20 digits runs from two minutes down to five seconds.'],
  },

  // ───────────────────────── Stage 5: cards ─────────────────────────
  {
    id: 'cards-as-images', stage: 'cards', title: 'How cards become images', minutes: 8, pass: 0,
    objective: 'Know the structure of a deck and learn your first thirteen card images.',
    body: `
<p>A deck has four <b>suits</b>, spades ♠, hearts ♥, diamonds ♦ and clubs ♣, and thirteen <b>ranks</b> in each: ace, 2 to 10, jack, queen, king. Fifty-two cards, each unique.</p>
<p>The cards themselves are hard to remember because they are so alike: the same thirteen symbols repeated in four flavours. So memorisers never store cards. They give every card a permanent image and store those. The seven of clubs is not "seven, clubs". It is a <em>cake</em>, instantly, the way the letters c-a-t are instantly a cat.</p>
<p>The image system needs three properties.</p>
<ul><li><b>Complete</b>: all 52 cards, no gaps.</li><li><b>Unambiguous</b>: no two cards with similar images.</li><li><b>Reversible</b>: from the image, you can always get back to the card.</li></ul>
<p>Cachet's example system makes the images derivable, so you are never stuck. The suit gives the first letter, <b>S</b>, <b>H</b>, <b>D</b>, <b>C</b>, and the rank gives the next consonant using the Major code from the numbers stage (ace = 1 = t/d; ten counts as 0 = s/z). So 7♣ is C + k: <b>cake</b>. 2♥ is H + n: <b>hen</b>. Jacks are the suit symbol itself; queens and kings have their own words.</p>
${T('This letter-code approach is one of two common routes. The other assigns people (often with actions and objects) to cards: that is the PAO system in stage 8. Either can take you to a full deck. A one-image-per-card system is simpler to learn and is the right place to start.')}`,
    demo: `<div data-widget="cardCode"></div>`,
    worked: `<p>You see <b>4♥</b>. Suit: hearts, H. Rank: 4 is r. H–r: <em>hare</em>. Picture it: long ears, mid-leap. After a few dozen repetitions the middle steps vanish and 4♥ simply <em>is</em> the hare.</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'c2i', pool: 'suit:H', count: 13, order: true },
    recap: ['Cards are stored as fixed images, never as rank and suit.', 'A system must be complete, unambiguous and reversible.', 'Example code: suit letter + rank sound.'],
  },
  {
    id: 'card-system', stage: 'cards', title: 'Making the system yours', minutes: 10, pass: 1,
    objective: 'Review the 52 suggested images and save your own version of at least one suit.',
    body: `
<p>A borrowed system works, but your own associations are faster and last longer. The <a href="#/systems/cards">card association editor</a> shows all 52 cards with a suggested image for each. Suggestions appear in grey italics. Nothing is yours until you save it, and nothing you save is ever replaced by a suggestion.</p>
<p>Go through one suit at a time. For each card:</p>
<ul>
<li>If the suggestion gives you an instant, clear picture, <b>adopt it</b>.</li>
<li>If something else comes to mind first, <b>use that</b>. The first thing that comes to mind is what will come to mind under pressure.</li>
<li>Add a <b>cue</b>: the specific version you picture. Not "car" but "the red Fiesta I learned to drive in".</li>
</ul>
<p>Then check the system as a whole:</p>
<ul>
<li><b>Similar images.</b> Cap and hat, cage and case, hen and dove. If two feel alike, change one or make their pictures very different (a cap is a baseball cap; a hat is a top hat).</li>
<li><b>Images that cannot act.</b> Each one needs to be able to do something to a location. "Hail" works if it is smashing things; "dream" is hard to stage unless you fix it as, say, a floating thought-bubble.</li>
</ul>
${C('Do not agonise. A mediocre image used a hundred times beats a perfect one changed every week. Fix an image only when the drills show it is being confused or is persistently slow.')}`,
    demo: `<p>The same card, three learners: 9♦. One keeps the suggestion, a <em>dab of paint</em>. One prefers <em>dip</em> and pictures a tub of hummus. A third ignores the code: nine of diamonds is their grandmother, who wore a nine-stone ring. All three are fine. Only consistency matters.</p>`,
    worked: `<p>Conflict check: you have <em>cap</em> (9♣) and <em>hat</em> (A♥). In a rushed scene both are "something on a head". Fix: the cap becomes a bottle cap, flicked like a coin. Now they share nothing.</p>`,
    exercise: { type: 'task', check: 'images13', label: 'Save your own image for at least 13 cards', href: '#/systems/cards', cta: 'Open the card editor' },
    recap: ['Adopt, replace or refine each suggestion, one suit at a time.', 'Add a specific cue.', 'Remove look-alike images now. They are much harder to fix later.'],
  },
  {
    id: 'both-directions', stage: 'cards', title: 'From image back to card', minutes: 7, pass: 0.8,
    objective: 'Decode images to cards as reliably as you encode cards to images.',
    body: `
<p>Memorising uses card → image. Recall uses the reverse: you walk the palace, see a hen, and must say "two of hearts". These are different skills, and the second is usually neglected, because all the time pressure is on the first.</p>
<p>A weak return path produces a specific, frustrating error: at recall you can <em>see</em> the image perfectly well and still name the wrong card. In the results screen this shows up as a card that "was not in the sequence" or is in the wrong place, with its neighbours correct.</p>
<p>The code helps here. <em>Hen</em>: starts with H, hearts. Next sound n: 2. But decoding by rule takes seconds. The aim is direct recognition, and it is trained the same way as the forward direction, by retrieval with feedback.</p>
${T('In competition, recall time is generous (five minutes for a deck), so decoding does not have to be as fast as encoding. It does have to be certain.')}`,
    demo: `<p><em>Sock</em> → S, k → spades, 7 → <b>7♠</b>.<br><em>Dune</em> → D, n → diamonds, 2 → <b>2♦</b>.<br><em>Crown</em> → a king word starting with C → <b>K♣</b>.</p>`,
    worked: `<p>The drill shows an image and the full 52-card grid. You pick the card. It is graded automatically, and if you pick wrongly, Cachet records <em>which</em> card you chose. Two cards that are swapped more than once become a recommendation on your dashboard.</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'i2c', pool: 'suit:H', count: 13 },
    recap: ['Recall runs image → card; train it separately.', 'Seeing the image but naming the wrong card is a decoding failure.', 'Confused pairs are tracked and brought back for practice.'],
  },

  // ───────────────────────── Stage 6: recognition ─────────────────────────
  {
    id: 'automaticity', stage: 'recognition', title: 'Automatic recognition', minutes: 8, pass: 0.7,
    objective: 'Understand why recognition speed is the foundation of deck speed, and take a first timed measurement.',
    body: `
<p>Memorising a card has three steps: recognise the card as its image, picture the image at a locus, move on. Only the first can become close to instant, and until it does it dominates. At three seconds a card, the deck takes over two and a half minutes before any time is spent on the palace at all.</p>
<p><b>Automatic</b> means the image arrives without being sent for, the way you cannot look at a word without reading it. You get there by many spaced retrievals with feedback. There is no shortcut. Because the reviews are spaced, it takes about ten minutes a day.</p>
<p>The <a href="#/train">Train</a> section has a drill for each stage:</p>
<ul>
<li><b>Card → Image</b>: untimed, for learning.</li>
<li><b>Image → Card</b>: for decoding.</li>
<li><b>Rapid recognition</b>: cards flash; you press a key the moment the image is there.</li>
<li><b>Suit training</b>: one suit or chosen ranks.</li>
<li><b>Weak cards</b> and <b>Due reviews</b>: chosen for you from your history.</li>
</ul>
<p>Every answer updates that card's record: accuracy, recent response times, mistakes, and when it is next due. The <a href="#/progress">mastery grid</a> shows all 52 at once.</p>
${C('Do not start timed deck attempts until most of the grid is at least "solid". Trying to go fast on shaky associations trains hesitation and guessing. Until then, short accurate sequences (stage 7) are the right practice.')}`,
    demo: `<p>Cachet's levels, from a card's last ten answers: <b>learning</b> (under three attempts), <b>shaky</b> (under 70% right), <b>solid</b> (80% or better), <b>automatic</b> (90% or better with a median time under 1.8 seconds).</p>`,
    worked: `<p>In rapid recognition a card appears. The moment you have its image, press <kbd>Space</kbd>. If nothing comes, press <kbd>X</kbd> and the answer is shown. Be honest: a Space pressed on a guess makes your record better and your deck attempts worse.</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'rapid', pool: 'all', count: 26 },
    recap: ['Recognition time multiplies by 52.', 'Automaticity comes from spaced retrieval, a few minutes a day.', 'Accuracy on the mastery grid first; speed after.'],
  },
  {
    id: 'weak-cards', stage: 'recognition', title: 'Weak cards and spaced review', minutes: 6, pass: 0.8,
    objective: 'Use targeted practice so that time goes to the associations that need it.',
    body: `
<p>After a few sessions your 52 cards will not be equally known. Forty will be quick. A dozen will be slow, or wrong, or confused with a neighbour. Practising all 52 equally spends most of your time on cards that do not need it.</p>
<p><b>Weak-card training</b> draws more often from cards with low accuracy or slow times, in proportion to how weak they are. <b>Due reviews</b> draws the cards whose scheduled interval has run out.</p>
<p>The schedule is simple. A wrong answer brings the card back in ten minutes. A correct but slow answer lengthens its interval a little (×1.3). A correct, fast answer lengthens it more (by the card's ease factor, around ×2.3–2.8). Strong cards drift out to weeks; weak ones stay close.</p>
<p>When a card stays weak across several sessions, the association itself is at fault, and repetition will not repair it. Open the editor and change the image: make it more specific, or replace it with whatever you keep <em>wrongly</em> thinking of. A wrong answer that comes to you every time is a strong association, so you may as well use it.</p>
${R('Expanding or spaced retrieval schedules outperform massed practice for long-term retention. The exact multipliers matter much less than the principle of reviewing after a delay, when retrieval takes some effort.')}`,
    demo: `<p>A typical trouble pair in the example system: 6♥ <em>hedge</em> and 6♦ <em>dish</em>, both sixes, both red. The confusion is between the cards themselves, since the images are nothing alike. The cure is seeing the two cards near each other and being made to choose, which is what the "separate these cards" recommendation does.</p>`,
    worked: `<p>Your grid shows 9♠ as shaky after ten attempts: you keep saying "soup" for <em>soap</em>. Adopt it. Change 9♠ to soup (S–p still fits the code), picture a steaming bowl, save. The record carries on and the card recovers within two sessions.</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'c2i', pool: 'weak', count: 20 },
    recap: ['Spend practice where the weakness is.', 'Wrong: back in ten minutes. Right and fast: a longer gap.', 'A persistently weak card needs a better image, not more repetition.'],
  },

  // ───────────────────────── Stage 7: sequences ─────────────────────────
  {
    id: 'first-sequence', stage: 'sequences', title: 'Your first card sequence', minutes: 8, pass: 0.8,
    objective: 'Memorise five cards in order using your images and your palace.',
    body: `
<p>Two skills are about to meet. You have fixed images for cards and a route with fixed loci. Memorising a sequence is placing each card's image at the next locus.</p>
<p>The loop for each card:</p>
<ol><li>See the card; its image arrives.</li><li>Put the image at the current locus, <em>doing something to it</em>.</li><li>Step to the next locus.</li></ol>
<p>Recall: walk the route, see each image, name its card.</p>
<p>The sequence trainer runs in three phases. In <b>memorise</b>, you page through the cards at your own pace while a timer runs. When you choose to start <b>recall</b>, the cards are gone for good; you rebuild the order by picking from a full deck. <b>Results</b> then compares your order with the original, position by position.</p>
<p>While learning, you can switch on <b>hints</b>, which show each card's image underneath it. Hinted attempts are recorded separately as <em>assisted</em> and never count towards clearing a rung or earning a milestone.</p>
${C('Use five loci from the palace you built. Say nothing aloud and do not repeat the card names to yourself. Rehearsing them brings back the habit this course started by replacing. Trust the images.')}`,
    demo: `<p><span class="mono">7♣ · 2♥ · K♠</span> at hall loci: a <b>cake</b> squashed under the doormat, icing oozing out of the sides; a <b>hen</b> roosting on the coat hooks, pecking at the coats; a <b>sword</b> thrust through the mirror, cracks spreading.</p>`,
    worked: `<p>Recall. Doormat: squelch, cake, C–k, 7♣. Coat hooks: clucking, hen, 2♥. Mirror: cracked by a sword, K♠. If one locus is empty, leave the slot blank, finish the rest, and return to it: with four of five placed, the missing card is often obvious from what remains.</p>`,
    exercise: { type: 'seq', n: 5, hints: true },
    recap: ['One card image per locus, acting on the locus.', 'Do not rehearse card names; trust the images.', 'Hints are for learning and are recorded as assisted.'],
  },
  {
    id: 'longer-sequences', stage: 'sequences', title: 'Ten and fifteen cards', minutes: 10, pass: 0.9,
    objective: 'Extend to ten cards with perfect recall, and learn to read an error report.',
    body: `
<p>The ladder is 3 → 5 → 10 → 15 → 26 → 52. A rung is cleared by two perfect, unassisted attempts. The standard is two because a single clean run can be luck.</p>
<p>At ten cards and beyond, three habits start to matter.</p>
<p><b>Keep a steady rhythm.</b> Give every card roughly the same time. Lingering on an awkward image does not rescue it and steals attention from the next.</p>
<p><b>Review once.</b> After the last card, run the whole route quickly. Any locus where the image is faint, look at again while you still can.</p>
<p><b>Recall in order, then repair.</b> Fill in what you are sure of, leave gaps, then work on the gaps. The cards you have not used are your shortlist: the recall grid greys out every card already placed.</p>
<p><b>Reading the results.</b> Errors come in recognisable types, and each points to a different fix.</p>
<ul>
<li><b>Blank</b>: no image at that locus. The image was too weak, or you skipped the locus.</li>
<li><b>Swapped neighbours</b>: both images present, order lost. Two images shared a locus, or two loci are too alike.</li>
<li><b>Misplaced</b>: the card was in the deck but elsewhere. The image came loose from its locus.</li>
<li><b>Wrong card</b>: not in the sequence at all. A decoding slip: right image, wrong card.</li>
</ul>`,
    demo: `<p>A result of 8/10 with positions 4 and 5 swapped is one mistake, not two: a single order slip. A result of 8/10 with two blanks at positions 9 and 10 is a pacing problem, because the last two images were rushed.</p>`,
    worked: `<p>You recall ten cards and slot 6 is empty. Unused cards: 42 remain, which is too many to guess from. So walk backwards from locus 7. What was happening there, and what was it <em>next to</em>? Approaching a locus from the other side often brings back an image the forward walk missed.</p>`,
    exercise: { type: 'seq', n: 10 },
    recap: ['Steady rhythm; one review pass.', 'Recall the certain cards first, then repair gaps.', 'Blank, swap, misplaced and wrong-card errors each have a different cause.'],
  },
  {
    id: 'full-deck', stage: 'sequences', title: 'Half a deck, then all of it', minutes: 12, pass: 0.85,
    objective: 'Memorise 26 cards accurately, and prepare the loci and the stamina for 52.',
    body: `
<p>Twenty-six cards is the first length where preparation shows. You need 26 loci for one image each, or 13 with two per locus. A full deck needs 52, or 26 in pairs.</p>
<p><b>Two per locus.</b> Most people settle on pairs: the first card's image acts on the second's, and together they act on the locus. A <em>hen</em> pecking a <em>cake</em> on the doormat is 2♥ then 7♣. The actor is always the first card. This halves the walking and is a gentle introduction to what PAO does with three.</p>
<p><b>Extend your palaces.</b> Add loci in the builder until you have at least 26, in groups of five. Two different palaces of 26 are better than one of 52 while learning, because you can alternate them.</p>
<p><b>Your first full deck.</b> Do it untimed, in good light, with no intention of being quick. Expect 10 to 20 minutes for memorisation and several minutes for recall. The first perfect deck is the milestone that matters most in this course. Speed training comes after it and makes little sense before it.</p>
${T('Accuracy first is how competitors train as well. In competition a deck with a single error scores only the cards before the mistake, so athletes practise at a pace where perfect recall is normal, and push the pace only at the edge of that.')}
${C('After a full-deck attempt, let the palace rest for a day, or use another, before you fill it again.')}`,
    demo: `<p>Milestone rule, stated exactly: a deck attempt earns a milestone only if all 52 cards are in the correct positions <em>and</em> no hints were used. Time alone earns nothing. 100 seconds with three errors is recorded as 49/52 and is not a sub-two-minute deck.</p>`,
    worked: `<p>Pair at the fridge: <span class="mono">K♣ · 3♦</span>. Crown, dam. A golden crown is being used as a dam: wedged in the fridge door, holding back a flood of milk. First card is the thing acting (the crown damming); second is what it does or acts on. Recall reads it off in that order.</p>`,
    exercise: { type: 'seq', n: 26 },
    recap: ['26 cards needs 26 loci, or 13 with two images each.', 'In a pair, the first card is the actor.', 'First full deck: untimed, accurate. That is the milestone.'],
  },

  // ───────────────────────── Stage 8: PAO ─────────────────────────
  {
    id: 'pao-idea', stage: 'pao', title: 'Person, action, object', minutes: 10, pass: 0.75,
    objective: 'Understand how three cards become one scene, and how the scene decodes back.',
    body: `
<p>With one image per card, a deck is 52 images. That is 52 things to place and 52 things to see at recall. <b>Person–Action–Object</b> (PAO) compresses three cards into a single scene, so a deck becomes 18.</p>
<p>In a PAO system every card has three attributes:</p>
<ul><li>a <b>Person</b>,</li><li>an <b>Action</b> that person characteristically performs,</li><li>an <b>Object</b> the action is performed on or with.</li></ul>
<p>In the example system the king of hearts is <b>Superman</b> — <b>flying off with</b> — <b>a cape</b>. Each card's own triple is easy to learn because it is already a sensible scene.</p>
<p>Now the trick. To encode three cards, take the <b>person from the first</b>, the <b>action from the second</b> and the <b>object from the third</b>. Three cards produce one new scene: a person doing someone else's action to a third card's object. That scene goes at one locus.</p>
<p>Because position in the triple decides which attribute is used, the scene carries the order. The person is always card one, the action card two, the object card three. To decode: who is it? What are they doing? To what?</p>
<p>Seventeen scenes cover 51 cards. The 52nd card stands alone at an eighteenth locus, as its person.</p>
${T('PAO, and its two-card cousin Person–Object, is the system used by a large share of competitive card memorisers. Its cost is the learning: 156 associations, not 52, each needing to be automatic. It is the main advanced route in this course, and it is optional. A one-image system with two cards per locus can also reach a fast deck, and you can stay on it for as long as it keeps improving.')}`,
    demo: `<div data-widget="paoDemo"></div>`,
    worked: `<p>Cards: <span class="mono">K♥ · 7♠ · A♣</span>.</p>
<p>Person from K♥: <b>Superman</b>. Action from 7♠ (a witch, stirring, a cauldron): <b>stirring</b>. Object from A♣ (a golfer, putting, a golf ball): <b>a golf ball</b>.</p>
<p>Scene: <em>Superman is stirring a golf ball.</em> Decode: Superman → K♥. Stirring is the witch's action → 7♠. A golf ball is the golfer's object → A♣. The same three cards in another order give a different scene: A♣ · K♥ · 7♠ is <em>a golfer flying off with a cauldron</em>.</p>`,
    exercise: {
      type: 'quiz', items: [
        { q: 'In a PAO triple, which card supplies the action?', options: ['The first', 'The second', 'The third'], answer: 1, why: 'Person, action, object map to cards one, two, three.' },
        { q: 'How many loci does a 52-card deck need with full PAO?', options: ['17', '18', '26'], answer: 1, why: '17 triples hold 51 cards; the last card takes an 18th locus.' },
        { q: 'Scene: "A witch is flying off with a golf ball." (Witch: 7♠. Flying off with: K♥. Golf ball: A♣.) What was the card order?', options: ['K♥ · 7♠ · A♣', '7♠ · K♥ · A♣', 'A♣ · K♥ · 7♠'], answer: 1, why: 'Person first (7♠), then the action\'s card (K♥), then the object\'s (A♣).' },
        { q: 'Why can the same three cards never produce the same scene in two different orders?', options: ['The suits differ', 'Each position uses a different attribute of the card', 'The palace keeps them apart'], answer: 1, why: 'Order is built into the scene: who / does what / to what.' },
      ],
    },
    recap: ['Each card has a person, an action and an object.', 'Card 1 gives the person, card 2 the action, card 3 the object.', '17 scenes + 1 card = 52 cards at 18 loci.'],
  },
  {
    id: 'pao-build', stage: 'pao', title: 'Building your PAO system', minutes: 12, pass: 0,
    objective: 'Set up your people, actions and objects, and begin learning the people.',
    body: `
<p>Open the <a href="#/systems/pao">PAO builder</a>. It lists all 52 cards with a person, action and object for each. As in the card editor, examples are shown in grey until you save your own, and saved entries are never overwritten.</p>
<p><b>People first.</b> Choose people you can picture immediately: family, friends, characters, public figures. Give suits a theme so a forgotten card is guessable: in the example, hearts are storybook characters, diamonds are rich or glamorous, clubs are sporty, spades are dark or clever. Kings and queens can be the "royalty" of each theme.</p>
<p><b>Then the action.</b> Each person's action should be the thing they are known for, and it must be <em>transferable</em>: something anyone could do to any object. "Juggling", "kicking", "stirring" work. "Thinking" does not, because you cannot see it. "Wearing" barely does.</p>
<p><b>Then the object.</b> The thing the action is normally done to or with. It must be visibly different from every other object, and must not be another card's person.</p>
<p>The builder checks two things for you:</p>
<ul><li><b>Duplicates</b>: the same action or object on two cards makes scenes undecodable.</li><li><b>Shared words</b>: "glass slipper" and "wine glass" will blur at speed.</li></ul>
${C('Learn in the order person → action → object, one suit at a time. The people are the backbone; once "K♥ = Superman" is automatic, "flying off with" and "cape" come almost free, because they are his.')}`,
    demo: `<p>Good action/object pairs separate cleanly: a boxer <b>punching</b> a <b>punchbag</b>; a witch <b>stirring</b> a <b>cauldron</b>. In any mixed scene (a boxer stirring a punchbag, a witch punching a cauldron) each part still points to exactly one card.</p>`,
    worked: `<p>You pick your sister for Q♦. Her action: she is always <em>photographing</em> things. Object: her <em>phone</em>. Check: does anyone else in your system photograph, or have a camera? If your 10♦ film director has a camera, change one. The builder would flag "camera" appearing twice.</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'c2i', field: 'p', pool: 'suit:H', count: 13, order: true },
    recap: ['Theme the suits; choose people you see instantly.', 'Actions must be visible and transferable; objects distinct.', 'Learn people first, a suit at a time.'],
  },
  {
    id: 'pao-scenes', stage: 'pao', title: 'Composing scenes', minutes: 10, pass: 0.7,
    objective: 'Turn random card triples into scenes without pausing between the parts.',
    body: `
<p>Encoding a triple is three recognitions fused into one picture. Beginners do them one at a time and then assemble: "Superman… stirring… golf ball… right, Superman stirring a golf ball." The target is to build as you go. The person appears. The second card sets them moving. The third card drops into their hands.</p>
<p><b>Read each card for one attribute only.</b> When the second card is 7♠ you must think <em>stirring</em> and not see the witch at all. This is the hard part of PAO, and it is why the three attributes are drilled separately first: person drill, action drill, object drill.</p>
<p><b>Let the person keep their character.</b> Superman stirs with a clenched jaw and a cape in the way; a sumo wrestler stirs differently. The person's character is what makes two scenes with the same action distinct.</p>
<p><b>Put the scene on the locus.</b> As before, it must affect the place. Superman stirs the golf ball <em>in your kitchen sink</em>, and water goes everywhere.</p>
${T('A mismatch between person and action is an advantage. Scenes that could never normally happen are distinctive. The scenes that cause trouble are those that happen to be plausible, because they look like each other.')}`,
    demo: `<div data-widget="paoDemo"></div>`,
    worked: `<p>In the scene drill you are shown three cards. Form the scene, then press <kbd>Space</kbd> to reveal it. You mark each of the three parts right or wrong separately, so a slow <em>action</em> is recorded against that card's action, not against the whole triple. Your time to reveal is your scene-generation time.</p>`,
    exercise: { type: 'pao', dir: 'encode', count: 6 },
    recap: ['Build the scene as the cards arrive; do not assemble afterwards.', 'Read card 2 for its action only, card 3 for its object only.', 'Implausible scenes are the memorable ones.'],
  },
  {
    id: 'pao-decode', stage: 'pao', title: 'Decoding, and the full deck in 18 scenes', minutes: 10, pass: 0.8,
    objective: 'Decode scenes back into three cards in order, and lay out a full deck as 17 + 1.',
    body: `
<p>At recall you meet a scene and take it apart in a fixed order: <b>who → doing what → to what</b>. Each answer is a lookup in a different column of your system.</p>
<ul><li>The person → the card whose <em>person</em> that is.</li><li>The action → the card whose <em>action</em> that is. Ask "whose move is that?"</li><li>The object → the card whose <em>object</em> that is. Ask "whose is that?"</li></ul>
<p>The action step is where decoding errors live. You see Superman stirring and write down K♥ twice, because the person dominates. Always ask the three questions separately.</p>
<p><b>The full deck.</b> 52 = 17 × 3 + 1. You need a route of 18 loci. Cards 1–3 are the scene at locus 1; cards 49–51 the scene at locus 17; card 52 is a lone person at locus 18. Some people prefer to notice the last card and simply hold it. Either is fine.</p>
<p>The <a href="#/speed">Speed Cards arena</a> can show cards one, two or three at a time. With PAO, set it to three: you see a whole triple, make one scene, and move one locus.</p>
${C('Switch your full-deck practice to PAO only once the component drills are mostly solid. For a while your PAO decks will be slower than your one-image decks. That is expected. Keep the old system for timed attempts until PAO overtakes it.')}`,
    demo: `<p>Scene: <em>A ninja is juggling a magic lamp.</em><br>Who? The ninja → 9♠. Whose move is juggling? The juggler's → 10♣. Whose is the lamp? Aladdin's → J♦.<br>Cards, in order: <span class="mono">9♠ · 10♣ · J♦</span>.</p>`,
    worked: `<p>In the decode drill you are given a scene sentence and pick three cards from the grid, in order. Each position is graded on its own. A person picked where the action should be is recorded as a confusion on that card's <em>action</em>.</p>`,
    exercise: { type: 'pao', dir: 'decode', count: 5 },
    recap: ['Decode as three separate questions: who, whose move, whose thing.', '17 scenes and one single card: 18 loci.', 'Run both systems in parallel until PAO is the faster one.'],
  },

  // ───────────────────────── Stage 9: speed ─────────────────────────
  {
    id: 'speed-principles', stage: 'speed', title: 'Where the time goes', minutes: 8, pass: 0.85,
    objective: 'Identify the sources of lost time in a deck attempt and measure your recognition latency.',
    body: `
<p>Once you can memorise a deck accurately, getting faster is mostly a matter of removing waste. Time goes to four things.</p>
<p><b>Recognition latency.</b> The gap between seeing the card and having the image. This is the largest and most trainable component. Drill: rapid recognition, target a median under 1.5 seconds, then under 1.</p>
<p><b>Image-making.</b> Over-building. A fast image is a glance: who, doing what, where. You no longer need the smell. Trust the weaker image, and let the review pass catch the few that fail.</p>
<p><b>Route transitions.</b> Hesitating over the next locus. Drill: timed empty walks until the route is faster than you can use it.</p>
<p><b>Rechecking.</b> Paging back "to be sure". Each look back costs seconds and mostly confirms what you knew. Commit to forward-only passes; if you review, do it once, at the end, as a whole second pass.</p>
${R('Speed and accuracy trade off against each other in almost every skilled task. Practising slightly faster than is comfortable, with immediate feedback about errors, is how the trade-off curve itself moves.')}
${C('A rule for pacing: if your last three attempts at a length were all perfect, go faster. If two of three had errors, go slower. Stay in the band where you succeed most of the time and fail sometimes.')}`,
    demo: `<p>The arithmetic of two minutes: 120 seconds over 52 cards is 2.3 seconds per card including everything. With PAO, 120 over 18 scenes is 6.7 seconds per scene. A typical split for a successful two-minute deck is 75–90 seconds on a first pass and the rest on a quick review.</p>`,
    worked: `<p>A learner's deck takes 6:30. Rapid-recognition median: 2.4 s. Fifty-two cards × 2.4 s = 2:05 of pure recognition, a third of the total. Bringing the median to 1.2 s saves a full minute before anything else changes. Their dashboard says the same thing in one line: "accurate but slow: rapid recognition".</p>`,
    exercise: { type: 'drill', kind: 'card', mode: 'rapid', pool: 'all', count: 30 },
    recap: ['Time is lost to recognition, over-built images, route hesitation and rechecking.', 'Recognition latency is the biggest lever.', 'Train in the band where you mostly succeed.'],
  },
  {
    id: 'speed-drills', stage: 'speed', title: 'Drills, targets and recovering from mistakes', minutes: 8, pass: 0.9,
    objective: 'Use the speed drills with measurable targets, and practise recovering mid-deck.',
    body: `
<p>Each speed drill isolates one component and gives it a number.</p>
<ul>
<li><b>Deck run-through</b>: page through all 52 cards, seeing each image, with no palace and no recall. Measures cards per second of pure recognition. Target: under 60 seconds, then under 40.</li>
<li><b>Scene generation</b> (PAO): time from three cards to a formed scene. Target: under 5 seconds, then under 3.</li>
<li><b>Timed 10 cards</b>: a complete memorise–recall cycle. Target: 10 cards in 30 seconds, perfect.</li>
<li><b>Timed half deck</b>: target one minute, perfect.</li>
<li><b>Auto-advance</b>: the arena turns cards for you at a fixed pace. Set it slightly faster than comfortable. You must keep up, and looking back is impossible.</li>
</ul>
<p>Cachet sets each target from your own best: about 10% faster than your best perfect attempt at that length.</p>
<p><b>Recovering.</b> At speed, an image will sometimes fail to form. The costly response is to stop. The trained response:</p>
<ol><li>Leave the locus with whatever you have, even a fragment.</li><li>Keep your rhythm for the next card.</li><li>On the review pass, look at that card again properly.</li><li>At recall, fill everything else first; the missing card is among the unused ones.</li></ol>
${T('In competition formats a deck is scored up to the first error, so athletes usually do a fast first pass and a faster second, and stop the clock only when they are confident. A slightly slower perfect deck always beats a fast flawed one.')}`,
    demo: `<p>Auto-advance at 2.0 s per card is a 1:44 deck. At 3.0 s it is 2:36; at 5.0 s, 4:20. Pick the pace that matches your next milestone and practise keeping up with ten cards, then twenty-six.</p>`,
    worked: `<p>Target drill: your best perfect 10 is 52 s, so the target is 47 s. First try: 44 s, 9/10. Too fast. Second: 48 s, 10/10. Third: 46 s, 10/10. The target is beaten and it resets to 41 s.</p>`,
    exercise: { type: 'seq', n: 10, timed: true },
    recap: ['Each drill isolates one component and has a number.', 'Targets track about 10% under your own best perfect time.', 'When an image fails: keep moving, repair on review.'],
  },

  // ───────────────────────── Stage 10: challenge ─────────────────────────
  {
    id: 'competition-format', stage: 'challenge', title: 'The Speed Cards arena', minutes: 6, pass: 1,
    objective: 'Know exactly how a full-deck attempt runs and is scored, then make one.',
    body: `
<p>The <a href="#/speed">Speed Cards arena</a> is where everything is put together. An attempt has three phases.</p>
<p><b>Memorisation.</b> A deck is shuffled as you press start. Every one of the 52! orderings is equally likely, using the browser's cryptographic random source. The clock starts with the first card. You move through the deck with the arrow keys, by tapping, or on auto-advance, seeing one, two or three cards at a time. You may go back and review as much as you like; the clock keeps running. When ready, you start recall, which stops the memorisation clock.</p>
<p><b>Recall.</b> The deck is no longer shown. You rebuild the order in 52 slots by choosing from a grid of all 52 cards. A card can be used only once. You can clear, move and swap freely. A separate clock records recall time; it does not affect milestones.</p>
<p><b>Results.</b> Your order beside the original, position by position, with the kinds of error, the cards involved, and drills chosen from them.</p>
<p>The milestones, in order: a first perfect deck; then under 15, 10, 5, 3 and 2 minutes of memorisation time. Each needs <em>52 of 52</em>, unassisted. A fast attempt with any error is saved in your history as what it is.</p>
${T('This mirrors the Speed Cards discipline in memory competitions: up to five minutes to memorise one deck, five to recall, ranked by time among perfect decks. Sub-two-minute decks are a strong amateur standard; the best competitors are under twenty seconds.')}`,
    demo: `<p>Keys in the arena: <kbd>→</kbd> or <kbd>Space</kbd> next, <kbd>←</kbd> back, <kbd>Enter</kbd> start recall. In recall: type a rank (<kbd>A</kbd> <kbd>2</kbd>–<kbd>9</kbd> <kbd>T</kbd> <kbd>J</kbd> <kbd>Q</kbd> <kbd>K</kbd>) then a suit (<kbd>S</kbd> <kbd>H</kbd> <kbd>D</kbd> <kbd>C</kbd>), <kbd>Backspace</kbd> to clear a slot, arrows to move.</p>`,
    worked: `<p>You may attempt the arena at any point in the course. An early attempt is useful as a baseline: 14 of 52 today is a number to beat next month.</p>`,
    exercise: { type: 'task', check: 'deckAttempt', label: 'Complete a full 52-card attempt in the arena (any score)', href: '#/speed', cta: 'Go to the arena' },
    recap: ['Memorise, recall, results: the deck is never shown again once recall begins.', 'Milestones need 52/52 with no hints; time is memorisation time.', 'An early baseline attempt is worth making.'],
  },
  {
    id: 'road-to-120', stage: 'challenge', title: 'The road to two minutes', minutes: 8, pass: 1,
    objective: 'Plan your training from a first perfect deck down to 120 seconds.',
    body: `
<p>Getting from a first perfect deck to two minutes is ordinary skill acquisition: steady early gains, then plateaus. How long it takes varies a great deal between people and depends mostly on how regularly you practise. Many get there in a few months of short daily sessions; some take longer. Nobody can honestly promise you a date. What Cachet can do is show you which component is currently holding you back.</p>
<p><b>A week of training</b>, around 15 minutes a day:</p>
<ul>
<li><b>Daily</b>: due reviews and weak cards (3–5 min). This keeps the foundation from eroding.</li>
<li><b>Most days</b>: one speed component, either rapid recognition, a deck run-through, or scene generation (3–5 min).</li>
<li><b>Most days</b>: one or two timed sequences at the length where you succeed about two times in three (5–8 min).</li>
<li><b>Once or twice a week</b>: a full-deck attempt, rested, in a fresh palace.</li>
</ul>
<p><b>When you plateau</b>, look at the split, not the total. Is the run-through time (pure recognition) most of your deck time? Then recognition is the limit. Is your deck much slower than your run-through? Then the time is in placing and transitions: practise auto-advance and empty walks. Are fast attempts failing at recall? Then you have outrun your accuracy; back off 10% for a week.</p>
<p><b>Changing systems.</b> Moving from one image per card to pairs, or to PAO, usually makes you slower for a few weeks and faster afterwards. It is worth it when your recognition is already near a second per card and the deck is still well over three minutes, because at that point the number of loci and images is what limits you.</p>
${C('Record everything, including the bad attempts. Progress in this skill is noisy from day to day and clear from month to month. The chart of perfect-deck times on your Progress page is the one to watch.')}`,
    demo: `<p>Rough budgets for a 1:55 deck. One image per card, two per locus: 26 loci, about 3 s per pair on the first pass (78 s), 35 s review. PAO: 18 loci, about 4.5 s per scene (81 s), 30 s review. Neither figure is fast in itself. What matters is that nothing in it is wasted.</p>`,
    worked: `<p>A learner sits at 3:20 for a month. Run-through: 55 s. So about 2:25 goes on placing and reviewing. They are reviewing twice. Dropping to one review pass and practising 26 cards on 2.5 s auto-advance brings the deck to 2:40 within two weeks.</p>`,
    exercise: { type: 'task', check: 'deckPerfect', label: 'Recall a full deck perfectly, unassisted', href: '#/speed', cta: 'Go to the arena' },
    recap: ['Fifteen minutes a day: reviews, one speed component, timed sequences.', 'At a plateau, find which component the time is in.', 'Two minutes is an aspiration. Consistent practice is what makes it likely.'],
  },
];
