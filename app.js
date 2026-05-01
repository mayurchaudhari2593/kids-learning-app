/* ============== KIDS LEARNING APP - LOGIC ============== */
/* Classes: nursery (3-4) | kg1 (4-5) | kg2 (5-6)         */

// ---------- STATE ----------
const STATE = {
  lang: localStorage.getItem('lang') || 'en',
  muted: localStorage.getItem('muted') === '1',
  stars: parseInt(localStorage.getItem('stars') || '0'),
  klass: localStorage.getItem('klass') || null,   // 'nursery' | 'kg1' | 'kg2'
  chapter: null,                                  // current chapter id
  current: 'classSelect'
};

// ---------- SPEECH ----------
let voices = [];
function loadVoices() { voices = speechSynthesis.getVoices(); }
loadVoices();
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoices;
}
function speak(text, langOverride) {
  if (STATE.muted || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const lang = langOverride || (STATE.lang === 'hi' ? 'hi-IN' : 'en-US');
    u.lang = lang; u.rate = 0.85; u.pitch = 1.2;
    const m = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (m) u.voice = m;
    speechSynthesis.speak(u);
  } catch (e) {}
}

// ---------- TOAST ----------
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ---------- STARS ----------
function addStar(n = 1) {
  if (n <= 0) return;
  STATE.stars += n;
  localStorage.setItem('stars', STATE.stars);
  document.getElementById('stars').textContent = '⭐ ' + STATE.stars;
  showToast('🎉 +' + n + ' Star!');
}
function setStars() { document.getElementById('stars').textContent = '⭐ ' + STATE.stars; }

// ---------- HELPERS ----------
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (k.startsWith('on')) e[k] = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}
const T = (en, hi) => {
  const lang = STATE.lang;
  if (lang === 'en') return en;
  if (lang === 'hi') return hi || en;
  // For mr/ta/bn/gu/pa: lookup in TR_MAP, fallback to hi, then en
  try {
    if (TR_MAP && TR_MAP[en] && TR_MAP[en][lang]) return TR_MAP[en][lang];
  } catch (e) { /* TR_MAP may be in TDZ during early script init */ }
  return hi || en;
};
function header(en, hi, sub_en, sub_hi) {
  const wrap = el('div');
  wrap.appendChild(el('h2', { class: 'section-title' }, T(en, hi)));
  if (sub_en) wrap.appendChild(el('p', { class: 'section-sub' }, T(sub_en, sub_hi)));
  return wrap;
}
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

// ---------- DATA ----------
const ALPHABET = [
  ['A','Apple','सेब','🍎'],['B','Ball','गेंद','⚽'],['C','Cat','बिल्ली','🐈'],
  ['D','Dog','कुत्ता','🐕'],['E','Elephant','हाथी','🐘'],['F','Fish','मछली','🐟'],
  ['G','Goat','बकरी','🐐'],['H','Hat','टोपी','🎩'],['I','Ice','बर्फ़','🧊'],
  ['J','Jug','जग','🫙'],['K','Kite','पतंग','🪁'],['L','Lion','शेर','🦁'],
  ['M','Monkey','बंदर','🐒'],['N','Nest','घोंसला','🪺'],['O','Orange','संतरा','🍊'],
  ['P','Parrot','तोता','🦜'],['Q','Queen','रानी','👸'],['R','Rabbit','खरगोश','🐇'],
  ['S','Sun','सूरज','☀️'],['T','Tiger','बाघ','🐯'],['U','Umbrella','छाता','☂️'],
  ['V','Van','वैन','🚐'],['W','Watch','घड़ी','⌚'],['X','Xylophone','ज़ाइलोफ़ोन','🎶'],
  ['Y','Yak','याक','🐂'],['Z','Zebra','ज़ेबरा','🦓']
];

// Phonics sounds - English letter sounds for KG2
const PHONICS = {
  'A':'aa','B':'buh','C':'kuh','D':'duh','E':'eh','F':'fuh','G':'guh','H':'huh',
  'I':'ih','J':'juh','K':'kuh','L':'luh','M':'muh','N':'nuh','O':'oh','P':'puh',
  'Q':'kwuh','R':'ruh','S':'sss','T':'tuh','U':'uh','V':'vuh','W':'wuh','X':'ks',
  'Y':'yuh','Z':'zzz'
};

const HINDI_SWAR = [
  ['अ','अनार','Pomegranate','🍎'],['आ','आम','Mango','🥭'],['इ','इमली','Tamarind','🌰'],
  ['ई','ईख','Sugarcane','🎋'],['उ','उल्लू','Owl','🦉'],['ऊ','ऊन','Wool','🧶'],
  ['ऋ','ऋषि','Sage','🧙'],['ए','एड़ी','Heel','🦶'],['ऐ','ऐनक','Glasses','👓'],
  ['ओ','ओखली','Mortar','🪔'],['औ','औरत','Woman','👩'],['अं','अंगूर','Grapes','🍇']
];

const HINDI_VYANJAN = [
  ['क','कमल','Lotus','🪷'],['ख','खरगोश','Rabbit','🐇'],['ग','गमला','Pot','🪴'],
  ['घ','घर','House','🏠'],['च','चम्मच','Spoon','🥄'],['छ','छतरी','Umbrella','☂️'],
  ['ज','जहाज़','Ship','🚢'],['झ','झंडा','Flag','🚩'],['ट','टमाटर','Tomato','🍅'],
  ['ठ','ठग','Thug','😈'],['ड','डमरू','Drum','🥁'],['ढ','ढोल','Drum','🪘'],
  ['ण','गणेश','Ganesh','🐘'],['त','तरबूज़','Watermelon','🍉'],['थ','थाली','Plate','🍽️'],
  ['द','दवात','Inkpot','🖋️'],['ध','धनुष','Bow','🏹'],['न','नल','Tap','🚰'],
  ['प','पतंग','Kite','🪁'],['फ','फल','Fruit','🍎'],['ब','बकरी','Goat','🐐'],
  ['भ','भालू','Bear','🐻'],['म','मछली','Fish','🐟'],['य','यज्ञ','Yagya','🔥'],
  ['र','रथ','Chariot','🛞'],['ल','लड्डू','Laddu','🟡'],['व','वन','Forest','🌳'],
  ['श','शेर','Lion','🦁'],['ष','षट्कोण','Hexagon','⬡'],['स','सूरज','Sun','☀️'],
  ['ह','हाथी','Elephant','🐘'],['क्ष','क्षत्रिय','Warrior','⚔️'],['त्र','त्रिशूल','Trident','🔱'],
  ['ज्ञ','ज्ञानी','Wise','🧠']
];
const HINDI_ALL = HINDI_SWAR.concat(HINDI_VYANJAN);

const NUM_HI = {1:'एक',2:'दो',3:'तीन',4:'चार',5:'पाँच',6:'छह',7:'सात',8:'आठ',9:'नौ',10:'दस',
  11:'ग्यारह',12:'बारह',13:'तेरह',14:'चौदह',15:'पंद्रह',16:'सोलह',17:'सत्रह',18:'अठारह',19:'उन्नीस',
  20:'बीस',21:'इक्कीस',22:'बाईस',23:'तेईस',24:'चौबीस',25:'पच्चीस',30:'तीस',40:'चालीस',
  50:'पचास',60:'साठ',70:'सत्तर',80:'अस्सी',90:'नब्बे',100:'सौ'};
function numberToEnglish(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
  const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n < 10) return ones[n] || 'Zero';
  if (n < 20) return teens[n-10];
  if (n === 100) return 'One Hundred';
  return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
}
const numberToHindi = n => NUM_HI[n] || String(n);

const COLORS_BASIC = [
  ['Red','लाल','#e53935'],['Blue','नीला','#1e88e5'],['Green','हरा','#43a047'],
  ['Yellow','पीला','#fdd835'],['Black','काला','#212121'],['White','सफ़ेद','#fafafa']
];
const COLORS_FULL = [
  ['Red','लाल','#e53935'],['Blue','नीला','#1e88e5'],['Green','हरा','#43a047'],
  ['Yellow','पीला','#fdd835'],['Orange','नारंगी','#fb8c00'],['Purple','बैंगनी','#8e24aa'],
  ['Pink','गुलाबी','#ec407a'],['Brown','भूरा','#795548'],['Black','काला','#212121'],
  ['White','सफ़ेद','#fafafa'],['Grey','धूसर','#9e9e9e'],['Gold','सुनहरा','#ffb300']
];

const SHAPES_BASIC = [
  ['Circle','वृत्त','<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/></svg>'],
  ['Square','वर्ग','<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#42a5f5"/></svg>'],
  ['Triangle','त्रिकोण','<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#66bb6a"/></svg>'],
  ['Star','तारा','<svg viewBox="0 0 100 100"><polygon points="50,5 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" fill="#fdd835"/></svg>']
];
const SHAPES_FULL = SHAPES_BASIC.concat([
  ['Rectangle','आयत','<svg viewBox="0 0 100 100"><rect x="5" y="25" width="90" height="50" fill="#ffa726"/></svg>'],
  ['Heart','दिल','<svg viewBox="0 0 100 100"><path d="M50 88 L15 50 a20 20 0 0 1 35 -15 a20 20 0 0 1 35 15 z" fill="#ef5350"/></svg>'],
  ['Diamond','हीरा','<svg viewBox="0 0 100 100"><polygon points="50,5 95,50 50,95 5,50" fill="#26c6da"/></svg>'],
  ['Oval','अंडाकार','<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="30" fill="#ab47bc"/></svg>'],
  ['Pentagon','पंचभुज','<svg viewBox="0 0 100 100"><polygon points="50,5 95,40 78,92 22,92 5,40" fill="#7e57c2"/></svg>'],
  ['Hexagon','षट्भुज','<svg viewBox="0 0 100 100"><polygon points="25,10 75,10 95,50 75,90 25,90 5,50" fill="#5c6bc0"/></svg>']
]);

const ANIMALS_BASIC = [
  ['🐶','Dog','कुत्ता'],['🐱','Cat','बिल्ली'],['🐮','Cow','गाय'],['🐵','Monkey','बंदर'],
  ['🦁','Lion','शेर'],['🐘','Elephant','हाथी'],['🐰','Rabbit','खरगोश'],['🐴','Horse','घोड़ा']
];
const ANIMALS_FULL = ANIMALS_BASIC.concat([
  ['🐷','Pig','सूअर'],['🐯','Tiger','बाघ'],['🦒','Giraffe','जिराफ़'],['🦓','Zebra','ज़ेबरा'],
  ['🐑','Sheep','भेड़'],['🐐','Goat','बकरी'],['🐻','Bear','भालू'],['🦊','Fox','लोमड़ी'],
  ['🐺','Wolf','भेड़िया'],['🐼','Panda','पांडा'],['🐨','Koala','कोआला'],['🦘','Kangaroo','कंगारू'],
  ['🐭','Mouse','चूहा'],['🐿️','Squirrel','गिलहरी'],['🦌','Deer','हिरण'],['🐊','Crocodile','मगरमच्छ']
]);

const BIRDS = [
  ['🦜','Parrot','तोता'],['🦅','Eagle','चील'],['🦉','Owl','उल्लू'],['🦆','Duck','बत्तख'],
  ['🦢','Swan','हंस'],['🐦','Sparrow','गौरैया'],['🦚','Peacock','मोर'],['🐓','Rooster','मुर्गा'],
  ['🐔','Hen','मुर्गी'],['🐧','Penguin','पेंग्विन'],['🦩','Flamingo','राजहंस'],['🕊️','Pigeon','कबूतर']
];

const FRUITS_BASIC = [
  ['🍎','Apple','सेब'],['🍌','Banana','केला'],['🍇','Grapes','अंगूर'],['🍊','Orange','संतरा'],
  ['🥭','Mango','आम'],['🍉','Watermelon','तरबूज़'],['🍓','Strawberry','स्ट्रॉबेरी'],['🍒','Cherry','चेरी']
];
const FRUITS_FULL = FRUITS_BASIC.concat([
  ['🍍','Pineapple','अनानास'],['🍑','Peach','आड़ू'],['🥥','Coconut','नारियल'],['🍐','Pear','नाशपाती'],
  ['🥝','Kiwi','कीवी'],['🫐','Blueberry','ब्लूबेरी'],['🍋','Lemon','नींबू'],['🍈','Melon','खरबूज़ा']
]);

const VEGETABLES = [
  ['🥕','Carrot','गाजर'],['🥔','Potato','आलू'],['🍅','Tomato','टमाटर'],['🌽','Corn','मक्का'],
  ['🥒','Cucumber','खीरा'],['🧅','Onion','प्याज़'],['🧄','Garlic','लहसुन'],['🥦','Broccoli','ब्रोकली'],
  ['🍆','Brinjal','बैंगन'],['🌶️','Chilli','मिर्च'],['🫑','Capsicum','शिमला मिर्च'],['🥬','Spinach','पालक'],
  ['🫛','Peas','मटर'],['🍠','Sweet Potato','शकरकंद'],['🥗','Salad','सलाद'],['🍄','Mushroom','मशरूम']
];

const BODY_BASIC = [
  ['👁️','Eye','आँख'],['👂','Ear','कान'],['👃','Nose','नाक'],['👄','Mouth','मुँह'],
  ['🖐️','Hand','हाथ'],['🦵','Leg','पैर']
];
const BODY_FULL = BODY_BASIC.concat([
  ['🦷','Tooth','दाँत'],['👅','Tongue','जीभ'],['🧠','Brain','दिमाग़'],['❤️','Heart','दिल'],
  ['💪','Arm','बाज़ू'],['🦶','Foot','तलवा'],['👆','Finger','उंगली'],['💇','Hair','बाल']
]);

const FAMILY = [
  ['👨','Father','पिता'],['👩','Mother','माँ'],['👦','Brother','भाई'],['👧','Sister','बहन'],
  ['👴','Grandfather','दादा'],['👵','Grandmother','दादी'],['👶','Baby','शिशु'],['👨‍👩‍👧‍👦','Family','परिवार'],
  ['👫','Friends','दोस्त'],['🧑‍🏫','Teacher','शिक्षक']
];

const DAYS = [
  ['Sunday','रविवार'],['Monday','सोमवार'],['Tuesday','मंगलवार'],['Wednesday','बुधवार'],
  ['Thursday','गुरुवार'],['Friday','शुक्रवार'],['Saturday','शनिवार']
];
const MONTHS = [
  ['January','जनवरी'],['February','फ़रवरी'],['March','मार्च'],['April','अप्रैल'],
  ['May','मई'],['June','जून'],['July','जुलाई'],['August','अगस्त'],
  ['September','सितंबर'],['October','अक्टूबर'],['November','नवंबर'],['December','दिसंबर']
];
const SEASONS = [
  ['☀️','Summer','गर्मी'],['🌧️','Monsoon','बारिश'],['🍂','Autumn','पतझड़'],
  ['❄️','Winter','सर्दी'],['🌸','Spring','बसंत']
];
const VEHICLES = [
  ['🚗','Car','कार'],['🚌','Bus','बस'],['🚲','Bicycle','साइकिल'],['🏍️','Motorcycle','मोटरसाइकिल'],
  ['🚂','Train','रेलगाड़ी'],['✈️','Aeroplane','हवाई जहाज़'],['🚢','Ship','जहाज़'],['🚁','Helicopter','हेलिकॉप्टर'],
  ['🚜','Tractor','ट्रैक्टर'],['🚑','Ambulance','एम्बुलेंस'],['🚓','Police Car','पुलिस कार'],['🚒','Fire Truck','दमकल']
];
const OPPOSITES = [
  ['Big','बड़ा','Small','छोटा'],['Hot','गरम','Cold','ठंडा'],['Day','दिन','Night','रात'],
  ['Up','ऊपर','Down','नीचे'],['Tall','लंबा','Short','छोटा'],['Fast','तेज़','Slow','धीमा'],
  ['Happy','खुश','Sad','उदास'],['Open','खुला','Close','बंद'],['Clean','साफ़','Dirty','गंदा'],
  ['Rich','अमीर','Poor','गरीब'],['Full','भरा','Empty','खाली'],['New','नया','Old','पुराना']
];
const HABITS = [
  ['🪥','Brush teeth daily','रोज़ दाँत साफ करें'],
  ['🧼','Wash hands before eating','खाने से पहले हाथ धोएँ'],
  ['🛁','Take a bath','नहाना ज़रूरी है'],
  ['🥦','Eat healthy food','सेहतमंद खाना खाएँ'],
  ['💧','Drink lots of water','खूब पानी पिएँ'],
  ['📚','Read books daily','रोज़ किताब पढ़ें'],
  ['😴','Sleep early','जल्दी सोएँ'],
  ['🙏','Respect elders','बड़ों का आदर करें'],
  ['🤝','Share with friends','दोस्तों के साथ बाँटें'],
  ['🙋','Say please & thank you','कृपया और धन्यवाद कहें']
];

const RHYMES_SIMPLE = [
  ['Twinkle Twinkle Little Star',
`Twinkle, twinkle, little star,
How I wonder what you are!
Up above the world so high,
Like a diamond in the sky.`,
'टिमटिम तारा',
`टिमटिम टिमटिम छोटा तारा,
तू कितना सुंदर प्यारा।
ऊपर ऊँचे आसमान में,
हीरे जैसा चमक रहा।`],
  ['Johny Johny Yes Papa',
`Johny Johny, Yes Papa,
Eating sugar? No Papa,
Telling lies? No Papa,
Open your mouth, Ha Ha Ha!`,
'जॉनी जॉनी',
`जॉनी जॉनी, हाँ पापा,
चीनी खाई? ना पापा,
झूठ बोला? ना पापा,
मुँह खोलो, हा हा हा!`],
  ['Machhli Jal Ki Rani',
`Machhli jal ki rani hai,
Jeevan uska paani hai,
Haath lagao to dar jaaye,
Bahar nikalo to mar jaaye.`,
'मछली जल की रानी',
`मछली जल की रानी है,
जीवन उसका पानी है।
हाथ लगाओ तो डर जाए,
बाहर निकालो तो मर जाए।`]
];
const RHYMES_FULL = RHYMES_SIMPLE.concat([
  ['Old MacDonald',
`Old MacDonald had a farm, E-I-E-I-O,
And on his farm he had a cow, E-I-E-I-O,
With a moo-moo here, and a moo-moo there,
Here a moo, there a moo, everywhere a moo-moo!`,
'मक्का डोनाल्ड का खेत',
`मक्का डोनाल्ड का खेत था, ई-आई-ई-आई-ओ,
और उस खेत में एक गाय थी, ई-आई-ई-आई-ओ,
मूँ-मूँ इधर, मूँ-मूँ उधर,
हर तरफ़ बस मूँ-मूँ-मूँ!`],
  ['Baa Baa Black Sheep',
`Baa baa black sheep, have you any wool?
Yes sir, yes sir, three bags full!
One for my master, one for my dame,
One for the little boy who lives down the lane.`,
'काली भेड़',
`बाँ बाँ काली भेड़, ऊन है तेरे पास?
हाँ जी, हाँ जी, तीन थैले भर के।
एक मालिक के लिए, एक मालकिन के लिए,
एक उस छोटे बच्चे के लिए जो गली में रहता है।`],
  ['Chanda Mama',
`Chanda mama door ke,
Pue pakaaye boor ke,
Aap khaaye thali mein,
Munne ko de pyaale mein.`,
'चंदा मामा',
`चंदा मामा दूर के,
पुए पकाए बूर के।
आप खाएँ थाली में,
मुन्ने को दें प्याली में।`]
]);

// =================================================================
// RHYMES LIBRARY — class-wise karaoke rhymes
// MP3s host kiye hue hain GitHub Pages /sounds/ folder me.
// MP3 missing ho to automatically TTS fall back ho jata hai.
// =================================================================
const RHYMES_LIB = {
  twinkle: {
    emoji: '⭐',
    title_en: 'Twinkle Twinkle Little Star',
    title_hi: 'टिमटिम तारा',
    audio: 'sounds/twinkle.mp3',
    text_en: `Twinkle, twinkle, little star,
How I wonder what you are!
Up above the world so high,
Like a diamond in the sky.
Twinkle, twinkle, little star,
How I wonder what you are!`,
    text_hi: `टिमटिम टिमटिम छोटा तारा,
तू कितना सुंदर प्यारा।
ऊपर ऊँचे आसमान में,
हीरे जैसा चमक रहा।
टिमटिम टिमटिम छोटा तारा,
तू कितना सुंदर प्यारा।`
  },
  abc: {
    emoji: '🔤',
    title_en: 'ABC Song',
    title_hi: 'ABC गीत',
    audio: 'sounds/abc.mp3',
    text_en: `A B C D E F G,
H I J K L M N O P,
Q R S, T U V,
W X Y and Z.
Now I know my ABCs,
Next time won't you sing with me!`,
    text_hi: `A B C D E F G,
H I J K L M N O P,
Q R S, T U V,
W X Y और Z.
अब मुझे ABC आ गई,
अगली बार साथ गाओ!`
  },
  baabaa: {
    emoji: '🐑',
    title_en: 'Baa Baa Black Sheep',
    title_hi: 'काली भेड़',
    audio: 'sounds/baabaa.mp3',
    text_en: `Baa baa black sheep, have you any wool?
Yes sir, yes sir, three bags full!
One for my master, one for my dame,
One for the little boy who lives down the lane.`,
    text_hi: `बाँ बाँ काली भेड़, ऊन है तेरे पास?
हाँ जी, हाँ जी, तीन थैले भर के।
एक मालिक के लिए, एक मालकिन के लिए,
एक उस छोटे बच्चे के लिए जो गली में रहता है।`
  },
  itsybitsy: {
    emoji: '🕷️',
    title_en: 'Itsy Bitsy Spider',
    title_hi: 'छोटी मकड़ी',
    audio: 'sounds/itsybitsy.mp3',
    text_en: `The itsy bitsy spider climbed up the water spout,
Down came the rain and washed the spider out,
Out came the sun and dried up all the rain,
And the itsy bitsy spider climbed up the spout again.`,
    text_hi: `छोटी सी मकड़ी पाइप पर चढ़ी,
बारिश आई मकड़ी को बहा ले गई।
सूरज आया बारिश सुखा दी,
और मकड़ी फिर से पाइप पर चढ़ गई।`
  },
  machhli: {
    emoji: '🐟',
    title_en: 'Machhli Jal Ki Rani',
    title_hi: 'मछली जल की रानी',
    audio: 'sounds/machhli.mp3',
    text_en: `Machhli jal ki rani hai,
Jeevan uska paani hai,
Haath lagao to dar jaaye,
Bahar nikalo to mar jaaye.`,
    text_hi: `मछली जल की रानी है,
जीवन उसका पानी है।
हाथ लगाओ तो डर जाए,
बाहर निकालो तो मर जाए।`
  },
  chanda: {
    emoji: '🌙',
    title_en: 'Chanda Mama Door Ke',
    title_hi: 'चंदा मामा',
    audio: 'sounds/chanda.mp3',
    text_en: `Chanda mama door ke,
Pue pakaaye boor ke,
Aap khaaye thali mein,
Munne ko de pyaale mein.`,
    text_hi: `चंदा मामा दूर के,
पुए पकाए बूर के।
आप खाएँ थाली में,
मुन्ने को दें प्याली में।`
  },
  wheels: {
    emoji: '🚌',
    title_en: 'Wheels on the Bus',
    title_hi: 'बस के पहिए',
    audio: 'sounds/wheels.mp3',
    text_en: `The wheels on the bus go round and round,
Round and round, round and round,
The wheels on the bus go round and round,
All through the town.
The wipers on the bus go swish swish swish,
The horn on the bus goes beep beep beep,
The babies on the bus go waa waa waa,
All through the town.`,
    text_hi: `बस के पहिए घूमे गोल गोल,
गोल गोल, गोल गोल,
बस के पहिए घूमे गोल गोल,
सारे शहर में।
वाइपर चले स्विश स्विश स्विश,
हॉर्न बजे बीप बीप बीप,
बच्चे रोएँ वाँ वाँ वाँ,
सारे शहर में।`
  },
  oldmac: {
    emoji: '🐄',
    title_en: 'Old MacDonald Had a Farm',
    title_hi: 'मैक डोनाल्ड का खेत',
    audio: 'sounds/oldmac.mp3',
    text_en: `Old MacDonald had a farm, E-I-E-I-O,
And on his farm he had a cow, E-I-E-I-O,
With a moo-moo here, and a moo-moo there,
Here a moo, there a moo, everywhere a moo-moo!
Old MacDonald had a farm, E-I-E-I-O.`,
    text_hi: `मैक डोनाल्ड का खेत था, ई-आई-ई-आई-ओ,
उस खेत में एक गाय थी, ई-आई-ई-आई-ओ।
मूँ-मूँ इधर, मूँ-मूँ उधर,
हर तरफ़ बस मूँ-मूँ-मूँ!
मैक डोनाल्ड का खेत था, ई-आई-ई-आई-ओ।`
  },
  head: {
    emoji: '👶',
    title_en: 'Head, Shoulders, Knees and Toes',
    title_hi: 'सिर, कंधे, घुटने, पैर',
    audio: 'sounds/head.mp3',
    text_en: `Head, shoulders, knees and toes,
Knees and toes, knees and toes,
Head, shoulders, knees and toes,
Eyes and ears and mouth and nose.
Head, shoulders, knees and toes!`,
    text_hi: `सिर, कंधे, घुटने और पैर,
घुटने और पैर, घुटने और पैर,
सिर, कंधे, घुटने और पैर,
आँख कान मुँह और नाक।
सिर, कंधे, घुटने और पैर!`
  },
  hathi: {
    emoji: '🐘',
    title_en: 'Hathi Raja Kahan Chale',
    title_hi: 'हाथी राजा कहाँ चले',
    audio: 'sounds/hathi.mp3',
    text_en: `Hathi Raja kahan chale?
Idhar udhar mat dekho,
Sundh hilaate badhte chalo,
Jangal mein le chalo.`,
    text_hi: `हाथी राजा कहाँ चले?
इधर उधर मत देखो।
सूँड़ हिलाते बढ़ते चलो,
जंगल में ले चलो।`
  },
  aloo: {
    emoji: '🥔',
    title_en: 'Aloo Kachaloo Beta',
    title_hi: 'आलू कचालू बेटा',
    audio: 'sounds/aloo.mp3',
    text_en: `Aloo Kachaloo Beta kahan gaye thay?
Bandi bagiya mein so rahe thay.
Bandi bagiya mein chor aaya,
Aloo Kachaloo darr ke bhaaga.`,
    text_hi: `आलू कचालू बेटा कहाँ गए थे?
बंदी बगिया में सो रहे थे।
बंदी बगिया में चोर आया,
आलू कचालू डर के भागा।`
  },
  johny: {
    emoji: '👦',
    title_en: 'Johny Johny Yes Papa',
    title_hi: 'जॉनी जॉनी',
    audio: 'sounds/johny.mp3',
    text_en: `Johny Johny, Yes Papa,
Eating sugar? No Papa,
Telling lies? No Papa,
Open your mouth, Ha Ha Ha!`,
    text_hi: `जॉनी जॉनी, हाँ पापा,
चीनी खाई? ना पापा,
झूठ बोला? ना पापा,
मुँह खोलो, हा हा हा!`
  },
  mary: {
    emoji: '🐑',
    title_en: 'Mary Had a Little Lamb',
    title_hi: 'मेरी का मेमना',
    audio: 'sounds/mary.mp3',
    text_en: `Mary had a little lamb,
Little lamb, little lamb,
Mary had a little lamb,
Its fleece was white as snow.
And everywhere that Mary went,
Mary went, Mary went,
Everywhere that Mary went,
The lamb was sure to go.`,
    text_hi: `मेरी के पास एक मेमना था,
छोटा मेमना, छोटा मेमना,
मेरी के पास एक मेमना था,
उसकी ऊन बर्फ़ जैसी सफ़ेद।
मेरी जहाँ भी जाती थी,
जहाँ भी जाती थी,
मेरी जहाँ भी जाती थी,
मेमना ज़रूर साथ जाता था।`
  },
  happy: {
    emoji: '😊',
    title_en: "If You're Happy and You Know It",
    title_hi: 'खुश हो तो ताली बजाओ',
    audio: 'sounds/happy.mp3',
    text_en: `If you're happy and you know it, clap your hands,
If you're happy and you know it, clap your hands,
If you're happy and you know it, then your face will surely show it,
If you're happy and you know it, clap your hands.`,
    text_hi: `खुश हो तो ताली बजाओ,
खुश हो तो ताली बजाओ,
खुश हो तो दिखाओ चेहरे पे ख़ुशी,
खुश हो तो ताली बजाओ।`
  },
  lakdi: {
    emoji: '🐎',
    title_en: 'Lakdi Ki Kathi',
    title_hi: 'लकड़ी की काठी',
    audio: 'sounds/lakdi.mp3',
    text_en: `Lakdi ki kaathi, kaathi pe ghoda,
Ghoda hai chanchal taang udaata,
Bachpan ki yaadein, ek kahaani,
Lakdi ki kaathi, kaathi pe ghoda.`,
    text_hi: `लकड़ी की काठी, काठी पे घोड़ा,
घोड़ा है चंचल टांग उड़ाता।
बचपन की यादें, एक कहानी,
लकड़ी की काठी, काठी पे घोड़ा।`
  }
};

const RHYMES_BY_CLASS = {
  nursery: ['twinkle', 'abc', 'baabaa', 'itsybitsy', 'machhli', 'chanda'],
  kg1:     ['wheels', 'oldmac', 'head', 'hathi', 'aloo', 'twinkle', 'abc'],
  kg2:     ['johny', 'mary', 'happy', 'lakdi', 'wheels', 'oldmac', 'head']
};

const STORIES = [
  ['The Thirsty Crow',
`Once a thirsty crow could not find water. He saw a pot with little water at the bottom. The crow dropped pebbles one by one. The water rose up. The clever crow drank water and flew away happily.

Lesson: Where there is a will, there is a way!`,
'प्यासा कौआ',
`एक बार एक प्यासे कौए को पानी नहीं मिल रहा था। उसने एक मटके में थोड़ा पानी देखा। कौए ने एक-एक करके कंकड़ डाले। पानी ऊपर आ गया। चतुर कौआ पानी पीकर खुशी-खुशी उड़ गया।

सीख: जहाँ चाह, वहाँ राह!`],
  ['The Lion and the Mouse',
`A lion was sleeping. A small mouse climbed on him. The lion caught the mouse but let him go. Later, the lion got trapped in a hunter's net. The mouse cut the net with his teeth and saved the lion.

Lesson: Even small friends can help.`,
'शेर और चूहा',
`एक शेर सो रहा था। एक छोटा चूहा उस पर चढ़ गया। शेर ने उसे पकड़ा पर छोड़ दिया। बाद में शेर शिकारी के जाल में फँस गया। चूहे ने अपने दाँतों से जाल काटकर शेर को बचा लिया।

सीख: छोटा दोस्त भी काम आता है।`],
  ['The Tortoise and the Hare',
`A hare and a tortoise had a race. The hare was very fast and slept on the way. The tortoise walked slowly but did not stop. The tortoise won the race!

Lesson: Slow and steady wins the race.`,
'खरगोश और कछुआ',
`एक खरगोश और कछुए ने दौड़ लगाई। खरगोश बहुत तेज़ था और रास्ते में सो गया। कछुआ धीरे-धीरे चलता रहा, रुका नहीं। कछुआ दौड़ जीत गया!

सीख: धीमा पर लगातार चलने वाला जीतता है।`]
];

// ---------- CLASS-WISE MENU CONFIG ----------
const CLASS_INFO = {
  nursery: { en: 'Nursery', hi: 'नर्सरी', emoji: '🧸', color: '#ff6b9d' },
  kg1:     { en: 'KG 1',    hi: 'के.जी. १', emoji: '🎨', color: '#42a5f5' },
  kg2:     { en: 'KG 2',    hi: 'के.जी. २', emoji: '🎓', color: '#66bb6a' }
};

const CLASS_MENU = {
  nursery: [
    { s:'alphabetBasic', en:'ABC',           hi:'अंग्रेज़ी A-Z', ico:'🔤', c:'#ff6b9d' },
    { s:'capSmall',      en:'Aa Bb Cc',      hi:'बड़े-छोटे',   ico:'🅰️', c:'#f06292' },
    { s:'numbers',       en:'Numbers 1-10', hi:'गिनती १-१०',  ico:'🔢', c:'#42a5f5' },
    { s:'hindiNumbers',  en:'१-१० Hindi',   hi:'हिंदी १-१०',  ico:'🔟', c:'#3949ab' },
    { s:'numberNames',   en:'Number Names',  hi:'संख्या के नाम',ico:'🔤', c:'#1e88e5' },
    { s:'colors',        en:'Colors',        hi:'रंग',         ico:'🎨', c:'#ef5350' },
    { s:'shapes',        en:'Shapes',        hi:'आकार',       ico:'🔷', c:'#ab47bc' },
    { s:'comparison',    en:'Big & Small',   hi:'बड़ा-छोटा',  ico:'📏', c:'#ff7043' },
    { s:'prepositions',  en:'In/On/Under',   hi:'अंदर/ऊपर/नीचे',ico:'🌍', c:'#26a69a' },
    { s:'timeWords',     en:'Today/Yest/Tom',hi:'आज/कल/परसों', ico:'📅', c:'#7986cb' },
    { s:'animals',       en:'Animals',       hi:'जानवर',       ico:'🐘', c:'#8d6e63' },
    { s:'fruits',        en:'Fruits',        hi:'फल',          ico:'🍎', c:'#66bb6a' },
    { s:'body',          en:'Body Parts',    hi:'शरीर',       ico:'👁️', c:'#ffca28' },
    { s:'family',        en:'Family',        hi:'परिवार',     ico:'👨‍👩‍👧', c:'#ec407a' },
    { s:'rhymes',        en:'Rhymes',        hi:'कविताएँ',     ico:'🎵', c:'#d4e157' },
    { s:'animalSounds',  en:'Animal Sounds', hi:'जानवरों की आवाज़',ico:'🔊', c:'#8d6e63' },
    { s:'natureSounds',  en:'Nature Sounds', hi:'प्रकृति आवाज़',ico:'🌧️', c:'#26a69a' },
    { s:'tracing',       en:'Letter Writing',hi:'अक्षर लिखें', ico:'✍️', c:'#5e35b1' },
    { s:'numTracing',    en:'Number Writing',hi:'संख्या लिखें',ico:'🖊️', c:'#3949ab' },
    { s:'coloring',      en:'Coloring',      hi:'रंग भरना',   ico:'🎨', c:'#e91e63' },
    { s:'weather',       en:'Weather',       hi:'मौसम',       ico:'🌧️', c:'#03a9f4' },
    { s:'helpers',       en:'Helpers',       hi:'सहायक लोग',  ico:'💼', c:'#5d4037' },
    { s:'homeThings',    en:'Home Things',   hi:'घर की चीज़ें',ico:'🏠', c:'#795548' },
    { s:'clothes',       en:'Clothes',       hi:'कपड़े',       ico:'👗', c:'#9c27b0' },
    { s:'memMatch',      en:'Memory Match',  hi:'याद मिलान',  ico:'🧠', c:'#9575cd' },
    { s:'dice',          en:'Dice Game',     hi:'पासा खेल',   ico:'🎲', c:'#ff7043' },
    { s:'traffic',       en:'Traffic Light', hi:'ट्रैफ़िक लाइट',ico:'🚦', c:'#f44336' },
    { s:'oddOne',        en:'Odd One Out',   hi:'अलग कौन',    ico:'🧩', c:'#7e57c2' },
    { s:'countObj',      en:'Count Objects', hi:'गिनो',       ico:'🧮', c:'#00897b' },
    { s:'games',         en:'Match Game',    hi:'मिलान खेल',   ico:'🎮', c:'#ba68c8' },
    { s:'wordBuilder',   en:'Word Builder',  hi:'शब्द बनाओ',  ico:'🔤', c:'#7e57c2' },
    { s:'dailyChallenge',en:'Daily Challenge',hi:'रोज़ चुनौती', ico:'⚡', c:'#ab47bc' },
    { s:'rewards',       en:'Rewards',       hi:'पुरस्कार',     ico:'🏆', c:'#fdd835' }
  ],
  kg1: [
    { s:'alphabet',      en:'A-Z Words',     hi:'A-Z शब्द',    ico:'🔤', c:'#ff6b9d' },
    { s:'capSmall',      en:'Aa Bb Cc',      hi:'बड़े-छोटे',   ico:'🅰️', c:'#f06292' },
    { s:'hindiSwar',     en:'Hindi स्वर',    hi:'हिंदी स्वर',  ico:'🕉️', c:'#ffa726' },
    { s:'vowelCons',     en:'Vowels & Consonants', hi:'स्वर-व्यंजन',ico:'🔠',c:'#ff8a65' },
    { s:'threeLetter',   en:'3-Letter Words',hi:'३ अक्षर शब्द',ico:'✍️', c:'#ad1457' },
    { s:'sightWords',    en:'Sight Words',   hi:'पहचान शब्द',  ico:'👀', c:'#6a1b9a' },
    { s:'numbers',       en:'Numbers 1-50', hi:'गिनती १-५०', ico:'🔢', c:'#42a5f5' },
    { s:'hindiNumbers',  en:'Hindi १-५०',   hi:'हिंदी १-५०',  ico:'🔟', c:'#3949ab' },
    { s:'numberNames',   en:'Number Names',  hi:'संख्या के नाम',ico:'🔤', c:'#1e88e5' },
    { s:'math',          en:'Addition',      hi:'जोड़ना',      ico:'➕', c:'#26c6da' },
    { s:'tables',        en:'Tables 2-10',   hi:'पहाड़े २-१०', ico:'✖️', c:'#0097a7' },
    { s:'skipCounting',  en:'Skip Counting', hi:'छलांग गिनती', ico:'⏩', c:'#00838f' },
    { s:'greaterLess',   en:'Greater/Less',  hi:'बड़ा-छोटा',  ico:'⚖️', c:'#039be5' },
    { s:'measurement',   en:'Measurement',   hi:'मापन',       ico:'📐', c:'#0288d1' },
    { s:'tellTime',      en:'Tell Time',     hi:'समय देखें',   ico:'🕐', c:'#01579b' },
    { s:'money',         en:'Indian Money',  hi:'भारतीय पैसा',ico:'💰', c:'#827717' },
    { s:'comparison',    en:'Big & Small',   hi:'बड़ा-छोटा',  ico:'📏', c:'#ff7043' },
    { s:'prepositions',  en:'In/On/Under',   hi:'अंदर/ऊपर/नीचे',ico:'🌍', c:'#26a69a' },
    { s:'timeWords',     en:'Today/Yest/Tom',hi:'आज/कल/परसों', ico:'📅', c:'#7986cb' },
    { s:'colors',        en:'Colors',        hi:'रंग',         ico:'🎨', c:'#ef5350' },
    { s:'shapes',        en:'Shapes',        hi:'आकार',       ico:'🔷', c:'#ab47bc' },
    { s:'animals',       en:'Animals',       hi:'जानवर',       ico:'🐘', c:'#8d6e63' },
    { s:'birds',         en:'Birds',         hi:'पक्षी',       ico:'🦜', c:'#7e57c2' },
    { s:'fruits',        en:'Fruits',        hi:'फल',          ico:'🍎', c:'#66bb6a' },
    { s:'vegetables',    en:'Vegetables',    hi:'सब्ज़ी',       ico:'🥕', c:'#9ccc65' },
    { s:'body',          en:'Body Parts',    hi:'शरीर',       ico:'👁️', c:'#ffca28' },
    { s:'family',        en:'Family',        hi:'परिवार',     ico:'👨‍👩‍👧', c:'#ec407a' },
    { s:'days',          en:'Days',          hi:'दिन',         ico:'📅', c:'#5c6bc0' },
    { s:'opposites',     en:'Opposites',     hi:'विपरीत शब्द', ico:'↔️', c:'#26a69a' },
    { s:'rhymes',        en:'Rhymes',        hi:'कविताएँ',     ico:'🎵', c:'#d4e157' },
    { s:'animalSounds',  en:'Animal Sounds', hi:'जानवरों की आवाज़',ico:'🔊', c:'#8d6e63' },
    { s:'vehicleSounds', en:'Vehicle Sounds',hi:'वाहन आवाज़',  ico:'🚓', c:'#37474f' },
    { s:'natureSounds',  en:'Nature Sounds', hi:'प्रकृति आवाज़',ico:'🌧️', c:'#26a69a' },
    { s:'tracing',       en:'Letter Writing',hi:'अक्षर लिखें', ico:'✍️', c:'#5e35b1' },
    { s:'numTracing',    en:'Number Writing',hi:'संख्या लिखें',ico:'🖊️', c:'#3949ab' },
    { s:'coloring',      en:'Coloring',      hi:'रंग भरना',   ico:'🎨', c:'#e91e63' },
    // Cultural
    { s:'festivals',     en:'Festivals',     hi:'त्योहार',     ico:'🪔', c:'#ff9800' },
    { s:'nationalSymbols', en:'National Symbols', hi:'राष्ट्रीय चिह्न', ico:'🇮🇳', c:'#ff5722' },
    { s:'famousPlaces',  en:'Famous Places', hi:'प्रसिद्ध स्थल',ico:'🏛️', c:'#6d4c41' },
    { s:'famousPeople',  en:'Famous People', hi:'प्रसिद्ध लोग',ico:'👨‍🚀',c:'#5e35b1' },
    // GK
    { s:'solarSystem',   en:'Solar System',  hi:'सौर मंडल',   ico:'🌞', c:'#fbc02d' },
    { s:'weather',       en:'Weather',       hi:'मौसम',       ico:'🌧️', c:'#03a9f4' },
    { s:'helpers',       en:'Helpers',       hi:'सहायक लोग',  ico:'💼', c:'#5d4037' },
    { s:'homeThings',    en:'Home Things',   hi:'घर की चीज़ें',ico:'🏠', c:'#795548' },
    { s:'schoolThings',  en:'School Things', hi:'स्कूल चीज़ें', ico:'🏫', c:'#7b1fa2' },
    { s:'instruments',   en:'Instruments',   hi:'वाद्य यंत्र', ico:'🎺', c:'#ec407a' },
    { s:'sports',        en:'Sports',        hi:'खेल कूद',    ico:'⚽', c:'#43a047' },
    { s:'indianFoods',   en:'Indian Foods',  hi:'भारतीय भोजन',ico:'🍱', c:'#e64a19' },
    { s:'clothes',       en:'Clothes',       hi:'कपड़े',       ico:'👗', c:'#9c27b0' },
    // Brain
    { s:'memMatch',      en:'Memory Match',  hi:'याद मिलान',  ico:'🧠', c:'#9575cd' },
    { s:'dragSort',      en:'Sort & Drop',   hi:'छाँटो रखो',   ico:'🎯', c:'#ef6c00' },
    { s:'soundQuiz',     en:'Sound Quiz',    hi:'आवाज़ क्विज़',ico:'🎧', c:'#00838f' },
    { s:'timedChallenge',en:'Timed Challenge',hi:'समय खेल',   ico:'⏱️', c:'#c62828' },
    { s:'dice',          en:'Dice Game',     hi:'पासा खेल',   ico:'🎲', c:'#ff7043' },
    { s:'traffic',       en:'Traffic Light', hi:'ट्रैफ़िक लाइट',ico:'🚦', c:'#f44336' },
    { s:'pattern',       en:'Pattern',       hi:'पैटर्न',     ico:'🔁', c:'#5c6bc0' },
    { s:'sequence',      en:'Sequence',      hi:'क्रम',       ico:'🔢', c:'#3f51b5' },
    { s:'sortGame',      en:'Sort by Size',  hi:'आकार से क्रम',ico:'📊', c:'#283593' },
    { s:'oddOne',        en:'Odd One Out',   hi:'अलग कौन',    ico:'🧩', c:'#7e57c2' },
    { s:'countObj',      en:'Count Objects', hi:'गिनो',       ico:'🧮', c:'#00897b' },
    { s:'spotDiff',      en:'Spot Difference',hi:'फ़र्क ढूंढो', ico:'🔍', c:'#bf360c' },
    { s:'whatNext',      en:'What Comes Next',hi:'अगला क्या',  ico:'🔮', c:'#4527a0' },
    { s:'tracing',       en:'Letter Writing',hi:'अक्षर लिखें', ico:'✍️', c:'#5e35b1' },
    { s:'numTracing',    en:'Number Writing',hi:'संख्या लिखें',ico:'🖊️', c:'#3949ab' },
    { s:'games',         en:'Games',         hi:'खेल',         ico:'🎮', c:'#ba68c8' },
    { s:'wordBuilder',   en:'Word Builder',  hi:'शब्द बनाओ',  ico:'🔤', c:'#7e57c2' },
    { s:'dailyChallenge',en:'Daily Challenge',hi:'रोज़ चुनौती', ico:'⚡', c:'#ab47bc' },
    { s:'rewards',       en:'Rewards',       hi:'पुरस्कार',     ico:'🏆', c:'#fdd835' }
  ],
  kg2: [
    { s:'phonics',       en:'Phonics A-Z',   hi:'फोनिक्स A-Z', ico:'🔤', c:'#ff6b9d' },
    { s:'capSmall',      en:'Aa Bb Cc',      hi:'बड़े-छोटे',   ico:'🅰️', c:'#f06292' },
    { s:'hindi',         en:'Hindi अ-ज्ञ',    hi:'हिंदी पूर्ण', ico:'🕉️', c:'#ffa726' },
    { s:'hindiWords',    en:'Hindi Words',   hi:'हिंदी शब्द',  ico:'📜', c:'#fb8c00' },
    { s:'vowelCons',     en:'Vowels & Consonants', hi:'स्वर-व्यंजन',ico:'🔠',c:'#ff8a65' },
    { s:'threeLetter',   en:'3-Letter Words',hi:'३ अक्षर शब्द',ico:'✍️', c:'#ad1457' },
    { s:'sightWords',    en:'Sight Words',   hi:'पहचान शब्द',  ico:'👀', c:'#6a1b9a' },
    { s:'sentence',      en:'Make Sentences',hi:'वाक्य बनाओ',  ico:'📝', c:'#7b1fa2' },
    { s:'comprehension', en:'Reading',       hi:'पढ़ना समझना', ico:'📚', c:'#4a148c' },
    { s:'numbers',       en:'Numbers 1-100',hi:'गिनती १-१००',ico:'🔢', c:'#42a5f5' },
    { s:'hindiNumbers',  en:'Hindi १-१००',  hi:'हिंदी १-१००', ico:'🔟', c:'#3949ab' },
    { s:'numberNames',   en:'Number Names',  hi:'संख्या के नाम',ico:'🔤', c:'#1e88e5' },
    { s:'math',          en:'Add & Subtract',hi:'जोड़-घटाव',  ico:'➕', c:'#26c6da' },
    { s:'wordProblems',  en:'Word Problems', hi:'शब्द सवाल',  ico:'🤔', c:'#00897b' },
    { s:'tables',        en:'Tables 2-10',   hi:'पहाड़े २-१०', ico:'✖️', c:'#0097a7' },
    { s:'skipCounting',  en:'Skip Counting', hi:'छलांग गिनती', ico:'⏩', c:'#00838f' },
    { s:'greaterLess',   en:'Greater/Less',  hi:'बड़ा-छोटा',  ico:'⚖️', c:'#039be5' },
    { s:'measurement',   en:'Measurement',   hi:'मापन',       ico:'📐', c:'#0288d1' },
    { s:'tellTime',      en:'Tell Time',     hi:'समय देखें',   ico:'🕐', c:'#01579b' },
    { s:'money',         en:'Indian Money',  hi:'भारतीय पैसा',ico:'💰', c:'#827717' },
    { s:'comparison',    en:'Big & Small',   hi:'बड़ा-छोटा',  ico:'📏', c:'#ff7043' },
    { s:'prepositions',  en:'In/On/Under',   hi:'अंदर/ऊपर/नीचे',ico:'🌍', c:'#26a69a' },
    { s:'timeWords',     en:'Today/Yest/Tom',hi:'आज/कल/परसों', ico:'📅', c:'#7986cb' },
    { s:'gk',            en:'GK Quiz',       hi:'सामान्य ज्ञान',ico:'🌟', c:'#d81b60' },
    // Audio
    { s:'animalSounds',  en:'Animal Sounds', hi:'जानवरों की आवाज़',ico:'🔊', c:'#8d6e63' },
    { s:'vehicleSounds', en:'Vehicle Sounds',hi:'वाहन आवाज़',  ico:'🚓', c:'#37474f' },
    { s:'natureSounds',  en:'Nature Sounds', hi:'प्रकृति आवाज़',ico:'🌧️', c:'#26a69a' },
    // Cultural
    { s:'festivals',     en:'Festivals',     hi:'त्योहार',     ico:'🪔', c:'#ff9800' },
    { s:'mantras',       en:'Prayers',       hi:'प्रार्थना',   ico:'🕉️', c:'#ff6f00' },
    { s:'nationalSymbols', en:'National Symbols', hi:'राष्ट्रीय चिह्न', ico:'🇮🇳', c:'#ff5722' },
    { s:'famousPlaces',  en:'Famous Places', hi:'प्रसिद्ध स्थल',ico:'🏛️', c:'#6d4c41' },
    { s:'famousPeople',  en:'Famous People', hi:'प्रसिद्ध लोग',ico:'👨‍🚀',c:'#5e35b1' },
    // GK extras
    { s:'solarSystem',   en:'Solar System',  hi:'सौर मंडल',   ico:'🌞', c:'#fbc02d' },
    { s:'weather',       en:'Weather',       hi:'मौसम',       ico:'🌧️', c:'#03a9f4' },
    { s:'helpers',       en:'Helpers',       hi:'सहायक लोग',  ico:'💼', c:'#5d4037' },
    { s:'homeThings',    en:'Home Things',   hi:'घर की चीज़ें',ico:'🏠', c:'#795548' },
    { s:'schoolThings',  en:'School Things', hi:'स्कूल चीज़ें', ico:'🏫', c:'#7b1fa2' },
    { s:'instruments',   en:'Instruments',   hi:'वाद्य यंत्र', ico:'🎺', c:'#ec407a' },
    { s:'sports',        en:'Sports',        hi:'खेल कूद',    ico:'⚽', c:'#43a047' },
    { s:'indianFoods',   en:'Indian Foods',  hi:'भारतीय भोजन',ico:'🍱', c:'#e64a19' },
    { s:'clothes',       en:'Clothes',       hi:'कपड़े',       ico:'👗', c:'#9c27b0' },
    // Brain & Logic
    { s:'memMatch',      en:'Memory Match',  hi:'याद मिलान',  ico:'🧠', c:'#9575cd' },
    { s:'dragSort',      en:'Sort & Drop',   hi:'छाँटो रखो',   ico:'🎯', c:'#ef6c00' },
    { s:'soundQuiz',     en:'Sound Quiz',    hi:'आवाज़ क्विज़',ico:'🎧', c:'#00838f' },
    { s:'coloring',      en:'Coloring',      hi:'रंग भरना',   ico:'🎨', c:'#e91e63' },
    { s:'timedChallenge',en:'Timed Challenge',hi:'समय खेल',   ico:'⏱️', c:'#c62828' },
    { s:'dice',          en:'Dice Game',     hi:'पासा खेल',   ico:'🎲', c:'#ff7043' },
    { s:'traffic',       en:'Traffic Light', hi:'ट्रैफ़िक लाइट',ico:'🚦', c:'#f44336' },
    { s:'pattern',       en:'Pattern',       hi:'पैटर्न',     ico:'🔁', c:'#5c6bc0' },
    { s:'sequence',      en:'Sequence',      hi:'क्रम',       ico:'🔢', c:'#3f51b5' },
    { s:'sortGame',      en:'Sort by Size',  hi:'आकार से क्रम',ico:'📊', c:'#283593' },
    { s:'oddOne',        en:'Odd One Out',   hi:'अलग कौन',    ico:'🧩', c:'#7e57c2' },
    { s:'countObj',      en:'Count Objects', hi:'गिनो',       ico:'🧮', c:'#00897b' },
    { s:'spotDiff',      en:'Spot Difference',hi:'फ़र्क ढूंढो', ico:'🔍', c:'#bf360c' },
    { s:'whatNext',      en:'What Comes Next',hi:'अगला क्या',  ico:'🔮', c:'#4527a0' },
    { s:'colors',        en:'Colors',        hi:'रंग',         ico:'🎨', c:'#ef5350' },
    { s:'shapes',        en:'Shapes',        hi:'आकार',       ico:'🔷', c:'#ab47bc' },
    { s:'animals',       en:'Animals',       hi:'जानवर',       ico:'🐘', c:'#8d6e63' },
    { s:'birds',         en:'Birds',         hi:'पक्षी',       ico:'🦜', c:'#7e57c2' },
    { s:'fruits',        en:'Fruits',        hi:'फल',          ico:'🍎', c:'#66bb6a' },
    { s:'vegetables',    en:'Vegetables',    hi:'सब्ज़ी',       ico:'🥕', c:'#9ccc65' },
    { s:'body',          en:'Body Parts',    hi:'शरीर',       ico:'👁️', c:'#ffca28' },
    { s:'family',        en:'Family',        hi:'परिवार',     ico:'👨‍👩‍👧', c:'#ec407a' },
    { s:'days',          en:'Days',          hi:'दिन',         ico:'📅', c:'#5c6bc0' },
    { s:'months',        en:'Months',        hi:'महीने',      ico:'🗓️', c:'#29b6f6' },
    { s:'seasons',       en:'Seasons',       hi:'ऋतुएँ',      ico:'🌦️', c:'#ff7043' },
    { s:'vehicles',      en:'Vehicles',      hi:'वाहन',       ico:'🚗', c:'#78909c' },
    { s:'opposites',     en:'Opposites',     hi:'विपरीत',     ico:'↔️', c:'#26a69a' },
    { s:'goodhabits',    en:'Good Habits',   hi:'अच्छी आदतें', ico:'✨', c:'#9e9d24' },
    { s:'rhymes',        en:'Rhymes',        hi:'कविताएँ',     ico:'🎵', c:'#d4e157' },
    { s:'stories',       en:'Stories',       hi:'कहानियाँ',   ico:'📖', c:'#ff8a65' },
    { s:'tracing',       en:'Letter Writing',hi:'अक्षर लिखें', ico:'✍️', c:'#5e35b1' },
    { s:'numTracing',    en:'Number Writing',hi:'संख्या लिखें',ico:'🖊️', c:'#3949ab' },
    { s:'spelling',      en:'Spelling',      hi:'वर्तनी',     ico:'🔡', c:'#00897b' },
    { s:'games',         en:'Games',         hi:'खेल',         ico:'🎮', c:'#ba68c8' },
    { s:'quiz',          en:'Quiz',          hi:'क्विज़',      ico:'🧠', c:'#ff5252' },
    { s:'wordBuilder',   en:'Word Builder',  hi:'शब्द बनाओ',  ico:'🔤', c:'#7e57c2' },
    { s:'dailyChallenge',en:'Daily Challenge',hi:'रोज़ चुनौती', ico:'⚡', c:'#ab47bc' },
    { s:'rewards',       en:'Rewards',       hi:'पुरस्कार',     ico:'🏆', c:'#fdd835' }
  ]
};

// ---------- CHAPTERS (groups of subjects) ----------
// Each chapter lists subject keys (matching CLASS_MENU items by `s`).
// Subjects not present in current class's CLASS_MENU are auto-skipped.
const CHAPTERS = [
  { id:'english',  en:'English',         hi:'अंग्रेज़ी',     ico:'🔤', c:'#ff6b9d',
    items:['alphabetBasic','alphabet','phonics','capSmall','vowelCons','threeLetter','sightWords','sentence','comprehension','spelling'] },
  { id:'hindi',    en:'Hindi',           hi:'हिंदी',         ico:'🕉️', c:'#ffa726',
    items:['hindiSwar','hindi','hindiWords'] },
  { id:'maths',    en:'Maths',           hi:'गणित',          ico:'🔢', c:'#42a5f5',
    items:['numbers','hindiNumbers','numberNames','math','tables','skipCounting','greaterLess','wordProblems','measurement','tellTime','money','comparison'] },
  { id:'world',    en:'World Around Us', hi:'हमारी दुनिया', ico:'🌍', c:'#66bb6a',
    items:['colors','shapes','animals','birds','fruits','vegetables','body','family','days','months','seasons','vehicles','weather','opposites','goodhabits','prepositions','timeWords','helpers','homeThings','schoolThings','instruments','sports','indianFoods','clothes','solarSystem'] },
  { id:'culture',  en:'Culture & GK',    hi:'संस्कृति व GK', ico:'🪔', c:'#ff5722',
    items:['festivals','mantras','nationalSymbols','famousPlaces','famousPeople','gk'] },
  { id:'writing',  en:'Writing & Art',   hi:'लिखना व कला',  ico:'✍️', c:'#5e35b1',
    items:['tracing','numTracing','coloring'] },
  { id:'stories',  en:'Stories & Rhymes',hi:'कहानी व कविता', ico:'📖', c:'#ff8a65',
    items:['rhymes','stories'] },
  { id:'sounds',   en:'Sounds',          hi:'आवाज़ें',         ico:'🔊', c:'#26a69a',
    items:['animalSounds','vehicleSounds','natureSounds'] },
  { id:'games',    en:'Games & Puzzles', hi:'खेल व पहेली',  ico:'🎮', c:'#ba68c8',
    items:['wordBuilder','dailyChallenge','games','quiz','memMatch','dragSort','soundQuiz','timedChallenge','traffic','dice','pattern','sequence','sortGame','oddOne','countObj','spotDiff','whatNext'] },
  { id:'rewards',  en:'Rewards',         hi:'पुरस्कार',       ico:'🏆', c:'#fdd835',
    items:['rewards'] }
];

// Returns chapters that actually have at least one subject in current class
function chaptersForClass() {
  const menu = CLASS_MENU[STATE.klass] || [];
  const map = {};
  menu.forEach(m => map[m.s] = m);
  return CHAPTERS
    .map(ch => ({ ...ch, subjects: ch.items.map(k => map[k]).filter(Boolean) }))
    .filter(ch => ch.subjects.length > 0);
}

// ---------- SCOPE per class ----------
function scope() {
  const k = STATE.klass;
  return {
    numMax:    k === 'nursery' ? 10  : k === 'kg1' ? 50 : 100,
    colors:    k === 'nursery' ? COLORS_BASIC : COLORS_FULL,
    shapes:    k === 'nursery' ? SHAPES_BASIC : SHAPES_FULL,
    animals:   k === 'nursery' ? ANIMALS_BASIC : ANIMALS_FULL,
    fruits:    k === 'nursery' ? FRUITS_BASIC : FRUITS_FULL,
    body:      k === 'nursery' ? BODY_BASIC : BODY_FULL,
    rhymes:    (RHYMES_BY_CLASS[k] || RHYMES_BY_CLASS.nursery).map(id => RHYMES_LIB[id]).filter(Boolean),
    mathOps:   k === 'kg1' ? ['+'] : ['+','-'],
    mathRange: k === 'kg1' ? 10 : 20
  };
}

// ---------- NAV ----------
function go(screenId) {
  // Track navigation history (max depth 8)
  if (!STATE._hist) STATE._hist = [];
  if (STATE.current && STATE.current !== screenId) {
    STATE._hist.push(STATE.current);
    if (STATE._hist.length > 8) STATE._hist.shift();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const e = document.getElementById(screenId);
  if (!e) return;
  e.classList.add('active');
  STATE.current = screenId;
  document.getElementById('backBtn').style.display = (screenId === 'classSelect') ? 'none' : 'inline-block';
  // Always rebuild non-static screens (so scope changes apply)
  if (screenId !== 'classSelect') {
    if (screenId === 'classHome') buildClassHome(e);
    else if (screenId === 'chapterHome') buildChapterHome(e);
    else if (screenId === 'todayLesson') buildTodayLesson(e);
    else if (BUILDERS[screenId]) BUILDERS[screenId](e);
  }
  window.scrollTo(0, 0);
  // Update mascot visibility — only show on home screens
  if (typeof updateMascotVisibility === 'function') updateMascotVisibility();
}

document.getElementById('backBtn').onclick = () => {
  const utilityScreens = ['parentZone','parentDashboard','themesScreen','profiles','avatarBuilder'];
  if (STATE.current === 'classHome') { STATE._hist = []; go('classSelect'); }
  else if (STATE.current === 'parentDashboard') go('parentZone');
  else if (utilityScreens.includes(STATE.current)) go(STATE.klass ? 'classHome' : 'classSelect');
  else if (STATE.current === 'chapterHome' || STATE.current === 'todayLesson') go('classHome');
  else if (STATE.chapter === '__today__') go('todayLesson');
  else if (STATE.chapter) go('chapterHome');
  else go('classHome');
};

// Class card click
document.querySelectorAll('#classSelect .class-card').forEach(c => {
  c.onclick = () => {
    STATE.klass = c.dataset.class;
    localStorage.setItem('klass', STATE.klass);
    updateClassBadge();
    speak(T(CLASS_INFO[STATE.klass].en, CLASS_INFO[STATE.klass].hi));
    go('classHome');
  };
});

function updateClassBadge() {
  const b = document.getElementById('classBadge');
  if (STATE.klass) {
    b.textContent = CLASS_INFO[STATE.klass].emoji + ' ' + T(CLASS_INFO[STATE.klass].en, CLASS_INFO[STATE.klass].hi);
    b.classList.add('show');
  } else {
    b.classList.remove('show');
  }
}

// ---------- CLASS HOME (chapters) ----------
function buildClassHome(root) {
  root.innerHTML = '';
  STATE.chapter = null;
  const info = CLASS_INFO[STATE.klass];
  const w = el('div', { class: 'welcome' });
  w.appendChild(el('div', { class: 'welcome-emoji' }, info.emoji));
  w.appendChild(el('h2', {}, T(info.en + ' Learning', info.hi + ' पाठशाला')));
  w.appendChild(el('p', {}, T('Pick a chapter to begin', 'कोई अध्याय चुनें')));
  const change = el('button', { class: 'btn', style: 'margin-top:10px;background:#fff;color:#ff4081;box-shadow:0 4px 0 #ddd' },
    T('🔄 Change Class', '🔄 कक्षा बदलें'));
  change.onclick = () => go('classSelect');
  w.appendChild(change);
  root.appendChild(w);

  // Continue Last Activity banner
  const lastScreen = localStorage.getItem(profileKey('lastScreen'));
  const lastMenu = lastScreen && (CLASS_MENU[STATE.klass] || []).find(m => m.s === lastScreen);
  if (lastMenu) {
    const cont = el('div', { class: 'continue-banner' }, [
      el('div', { class: 'continue-ico' }, lastMenu.ico),
      el('div', { class: 'continue-text' }, [
        el('h4', {}, T('Continue Learning', 'जारी रखें')),
        el('p', {}, T(lastMenu.en, lastMenu.hi))
      ]),
      el('div', { class: 'today-arrow' }, '▶')
    ]);
    cont.onclick = () => go(lastMenu.s);
    root.appendChild(cont);
  }

  // Today's Lesson banner
  const today = el('div', { class: 'today-banner' }, [
    el('div', { class: 'today-ico' }, '📅'),
    el('div', { class: 'today-text' }, [
      el('h3', {}, T("Today's Lesson", 'आज का पाठ')),
      el('p', {}, T('5 fun activities for today', 'आज के 5 मज़ेदार पाठ'))
    ]),
    el('div', { class: 'today-arrow' }, '▶')
  ]);
  today.onclick = () => { speak(T("Today's Lesson", 'आज का पाठ')); STATE.chapter = '__today__'; go('todayLesson'); };
  root.appendChild(today);

  // Daily Challenge button
  const todayD = new Date().toDateString();
  const challengeDone = localStorage.getItem(profileKey('dchal_' + todayD));
  const chal = el('div', { class: 'continue-banner', style:'background:linear-gradient(135deg,#ab47bc,#7e57c2)' }, [
    el('div', { class: 'continue-ico' }, challengeDone ? '✅' : '⚡'),
    el('div', { class: 'continue-text' }, [
      el('h4', {}, T('Daily Challenge', 'रोज़ की चुनौती')),
      el('p', {}, challengeDone ? T('Done — come back tomorrow', 'पूरा! कल फिर')
                                : T('5 quick questions, 10 stars!', '5 सवाल, 10 तारे!'))
    ]),
    el('div', { class: 'today-arrow' }, '▶')
  ]);
  chal.onclick = () => go('dailyChallenge');
  root.appendChild(chal);

  const grid = el('div', { class: 'chapter-grid' });
  chaptersForClass().forEach(ch => {
    const pct = chapterProgress(ch.id);
    const card = el('div', { class: 'chapter-card', style: `--c:${ch.c}` }, [
      el('div', { class: 'chapter-ico' }, ch.ico),
      el('h3', {}, T(ch.en, ch.hi)),
      el('small', {}, ch.subjects.length + ' ' + T('topics', 'विषय') + (pct > 0 ? ` · ${pct}%` : '')),
      el('div', { class: 'chapter-progress' }, [el('i', { style:`width:${pct}%` })])
    ]);
    card.onclick = () => { speak(T(ch.en, ch.hi)); STATE.chapter = ch.id; go('chapterHome'); };
    grid.appendChild(card);
  });
  root.appendChild(grid);

  // Random mascot tip on load
  setTimeout(() => {
    const i = Math.floor(Math.random() * MASCOT_TIPS_EN.length);
    showMascot(MASCOT_TIPS_EN[i], MASCOT_TIPS_HI[i]);
  }, 800);
}

// ---------- CHAPTER HOME (subjects inside a chapter) ----------
function buildChapterHome(root) {
  root.innerHTML = '';
  const list = chaptersForClass();
  const ch = list.find(c => c.id === STATE.chapter) || list[0];
  if (!ch) { go('classHome'); return; }
  STATE.chapter = ch.id;

  const w = el('div', { class: 'welcome', style: `background:linear-gradient(135deg, ${ch.c}33, #ffffffcc)` });
  w.appendChild(el('div', { class: 'welcome-emoji' }, ch.ico));
  w.appendChild(el('h2', {}, T(ch.en, ch.hi)));
  w.appendChild(el('p', {}, T('Tap any topic to start', 'किसी भी विषय पर टैप करें')));
  root.appendChild(w);

  const grid = el('div', { class: 'menu-grid' });
  ch.subjects.forEach(item => {
    const tile = el('div', { class: 'tile', style: `--c:${item.c}` }, [
      el('div', { class: 'ico' }, item.ico),
      el('span', {}, T(item.en, item.hi))
    ]);
    tile.onclick = () => { speak(T(item.en, item.hi)); go(item.s); };
    grid.appendChild(tile);
  });
  root.appendChild(grid);
}

// ---------- TODAY'S LESSON (5 picks, stable per day) ----------
function buildTodayLesson(root) {
  root.innerHTML = '';
  STATE.chapter = '__today__';
  // Seed = klass + day of year, so picks stay same all day per class
  const now = new Date();
  const dayKey = now.getFullYear() + '-' + (Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000));
  const seed = (STATE.klass + dayKey).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => {
    let x = (seed * 9301 + 49297 + n * 233) % 233280;
    return x / 233280;
  };

  // Pick 1 each from English, Hindi, Maths, World, plus 1 from Writing/Stories/Games
  const list = chaptersForClass();
  const pickFrom = (id) => {
    const ch = list.find(c => c.id === id);
    if (!ch || !ch.subjects.length) return null;
    return ch.subjects[Math.floor(rng(id.length) * ch.subjects.length)];
  };
  const funIds = ['writing','stories','games','sounds','culture'];
  const funId = funIds[Math.floor(rng(7) * funIds.length)];
  const funChapter = list.find(c => c.id === funId);
  const funPick = funChapter && funChapter.subjects.length
    ? funChapter.subjects[Math.floor(rng(11) * funChapter.subjects.length)]
    : null;

  const picks = [
    pickFrom('english'),
    pickFrom('hindi'),
    pickFrom('maths'),
    pickFrom('world'),
    funPick
  ].filter(Boolean);

  const w = el('div', { class: 'welcome' });
  w.appendChild(el('div', { class: 'welcome-emoji' }, '📅'));
  w.appendChild(el('h2', {}, T("Today's Lesson", 'आज का पाठ')));
  w.appendChild(el('p', {}, T('Finish all 5 to earn a star!', 'सभी 5 पूरे करो और स्टार पाओ!')));
  root.appendChild(w);

  const grid = el('div', { class: 'menu-grid' });
  picks.forEach((item, i) => {
    const tile = el('div', { class: 'tile today-tile', style: `--c:${item.c}` }, [
      el('div', { class: 'today-num' }, (i + 1) + ''),
      el('div', { class: 'ico' }, item.ico),
      el('span', {}, T(item.en, item.hi))
    ]);
    tile.onclick = () => { speak(T(item.en, item.hi)); go(item.s); };
    grid.appendChild(tile);
  });
  root.appendChild(grid);
}

// ---------- LANG / MUTE ----------
function applyLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = T(el.dataset.en, el.dataset.hi || el.dataset.en);
  });
  let label = STATE.lang === 'hi' ? 'हि' : 'EN';
  try { if (LANG_INFO && LANG_INFO[STATE.lang]) label = LANG_INFO[STATE.lang].label; } catch (e) {}
  document.getElementById('langBtn').textContent = label;
  updateClassBadge();
}
document.getElementById('langBtn').onclick = () => {
  STATE.lang = STATE.lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('lang', STATE.lang);
  applyLang();
  if (STATE.current !== 'classSelect') go(STATE.current);
};
document.getElementById('muteBtn').onclick = () => {
  STATE.muted = !STATE.muted;
  localStorage.setItem('muted', STATE.muted ? '1' : '0');
  document.getElementById('muteBtn').textContent = STATE.muted ? '🔇' : '🔊';
  if (STATE.muted) speechSynthesis.cancel();
};
document.getElementById('muteBtn').textContent = STATE.muted ? '🔇' : '🔊';
applyLang();
setStars();

// If class already chosen previously, jump to its menu
if (STATE.klass && CLASS_INFO[STATE.klass]) {
  updateClassBadge();
  go('classHome');
}

// ---------- SCREEN TIME LIMIT CHECK ----------
function checkScreenTimeLimit() {
  const limit = parseInt(localStorage.getItem('screenLimitMin') || '0');
  if (!limit || typeof profileKey !== 'function') return;
  const today = new Date().toDateString();
  const used = parseInt(localStorage.getItem(profileKey('screenTime_' + today)) || '0');
  if (used >= limit) {
    // Show lockout
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const lock = document.getElementById('classSelect');
    lock.innerHTML = `
      <div class="welcome" style="background:linear-gradient(135deg,#ffcdd2,#f8bbd0)">
        <div class="welcome-emoji">⏰</div>
        <h2 style="color:#c62828">${STATE.lang === 'hi' ? 'आज का समय पूरा' : 'Screen Time Up'}</h2>
        <p style="font-size:18px;margin:14px 0">${STATE.lang === 'hi'
          ? `आज आप ${used} मिनट पढ़ चुके! कल फिर मिलते हैं 👋`
          : `You learned for ${used} min today! See you tomorrow 👋`}</p>
        <p style="color:#666;font-size:14px">${STATE.lang === 'hi' ? 'पैरेंट PIN से अनलॉक करें' : 'Parent PIN to unlock'}</p>
      </div>`;
    lock.classList.add('active');
    const unlock = document.createElement('button');
    unlock.className = 'btn orange';
    unlock.textContent = '🔐 ' + (STATE.lang === 'hi' ? 'अनलॉक' : 'Unlock');
    unlock.onclick = () => {
      const p = prompt(STATE.lang === 'hi' ? 'पैरेंट PIN:' : 'Parent PIN:');
      if (p === getParentPin()) location.reload();
      else showToast(STATE.lang === 'hi' ? 'गलत PIN' : 'Wrong PIN');
    };
    lock.querySelector('.welcome').appendChild(unlock);
    return true;
  }
  return false;
}
// Run check every 60 seconds
setInterval(checkScreenTimeLimit, 60000);
// And once on load
setTimeout(checkScreenTimeLimit, 2000);

// ============== BUILDERS ==============
const BUILDERS = {};

// ALPHABET BASIC (Nursery — letters only, big & colorful)
BUILDERS.alphabetBasic = (root) => {
  root.innerHTML = '';
  root.appendChild(header('A-Z Letters', 'A-Z अक्षर', 'Tap a letter', 'अक्षर पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  ALPHABET.forEach(([l, en, hi, em]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, l),
      el('div', { class: 'emoji' }, em)
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 600);
      speak(l, 'en-US');
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ALPHABET FULL (KG1 — letter + word)
BUILDERS.alphabet = (root) => {
  root.innerHTML = '';
  root.appendChild(header('English Alphabet A-Z', 'अंग्रेज़ी वर्णमाला A-Z',
    'Tap to hear letter & word', 'अक्षर और शब्द सुनें'));
  const grid = el('div', { class: 'card-grid' });
  ALPHABET.forEach(([l, en, hi, em]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, l),
      el('div', { class: 'emoji' }, em),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 600);
      speak(STATE.lang === 'hi' ? `${l} से ${hi}` : `${l} for ${en}`);
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// PHONICS (KG2)
BUILDERS.phonics = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Phonics A-Z', 'फोनिक्स A-Z',
    'Tap: sound + letter + word', 'ध्वनि + अक्षर + शब्द'));
  const grid = el('div', { class: 'card-grid' });
  ALPHABET.forEach(([l, en, hi, em]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, l),
      el('div', { class: 'emoji' }, em),
      el('div', { class: 'word' }, T(en, hi)),
      el('div', { style: 'font-size:11px;color:#999' }, '/' + PHONICS[l] + '/')
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 700);
      speak(`${l}. ${PHONICS[l]}. ${l} for ${en}.`, 'en-US');
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// HINDI SWAR (KG1)
BUILDERS.hindiSwar = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Hindi Swar (Vowels) अ-अं', 'हिंदी स्वर अ-अं', 'Tap to hear', 'टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  HINDI_SWAR.forEach(([l, hi, en, em]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, l),
      el('div', { class: 'emoji' }, em),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 600);
      speak(`${l} से ${hi}`, 'hi-IN');
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// HINDI FULL (KG2)
BUILDERS.hindi = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Hindi Varnamala अ-ज्ञ', 'हिंदी वर्णमाला अ-ज्ञ', 'Tap an akshar', 'अक्षर पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  HINDI_ALL.forEach(([l, hi, en, em]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, l),
      el('div', { class: 'emoji' }, em),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 600);
      speak(`${l} से ${hi}`, 'hi-IN');
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// NUMBERS (scoped)
BUILDERS.numbers = (root) => {
  root.innerHTML = '';
  const max = scope().numMax;
  root.appendChild(header(`Numbers 1 to ${max}`, `गिनती १ से ${max}`, 'Tap a number', 'संख्या पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  for (let n = 1; n <= max; n++) {
    const word = STATE.lang === 'hi' ? numberToHindi(n) : numberToEnglish(n);
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, String(n)),
      el('div', { class: 'word' }, word)
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 500);
      speak(String(n) + '. ' + word);
    };
    grid.appendChild(card);
  }
  root.appendChild(grid);
};

// MATH (scoped)
BUILDERS.math = (root) => {
  root.innerHTML = '';
  const sc = scope();
  const title = sc.mathOps.length === 1 ? T('Addition Practice','जोड़ अभ्यास') : T('Add & Subtract','जोड़-घटाव');
  root.appendChild(header(title, title));
  const display = el('div', { class: 'math-display' }, '?');
  const opts = el('div', { class: 'options' });
  const wrap = el('div', { class: 'game-area' });
  let q = null;
  function newQ() {
    const op = rand(sc.mathOps);
    let a = Math.floor(Math.random() * sc.mathRange) + 1;
    let b = Math.floor(Math.random() * sc.mathRange) + 1;
    if (op === '-' && b > a) [a, b] = [b, a];
    const ans = op === '+' ? a + b : a - b;
    q = { ans };
    display.textContent = `${a} ${op} ${b} = ?`;
    opts.innerHTML = '';
    const choices = [...new Set(shuffle([ans, ans+1, ans-1, ans+2]).map(x => Math.max(0,x)))].slice(0,4);
    choices.forEach(c => {
      const btn = el('div', { class: 'option-card' }, String(c));
      btn.onclick = () => {
        if (c === q.ans) {
          btn.classList.add('correct');
          speak(T('Correct!','सही!')); addStar(1);
          setTimeout(newQ, 900);
        } else {
          btn.classList.add('wrong');
          speak(T('Try again','फिर कोशिश करो'));
          setTimeout(() => btn.classList.remove('wrong'), 600);
        }
      };
      opts.appendChild(btn);
    });
    speak((STATE.lang==='hi'?'':'What is ') + `${a} ${op==='+'?(STATE.lang==='hi'?'जमा':'plus'):(STATE.lang==='hi'?'घटा':'minus')} ${b}?`);
  }
  wrap.appendChild(display);
  wrap.appendChild(opts);
  const next = el('button', { class: 'btn blue' }, T('Next Question','अगला सवाल'));
  next.onclick = newQ;
  wrap.appendChild(el('div', { class: 'btn-row' }, [next]));
  root.appendChild(wrap);
  newQ();
};

// MULTIPLICATION TABLES (KG1+ → 2-10)
BUILDERS.tables = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Tables 2 to 10','पहाड़े २ से १०','Tap to listen','सुनने के लिए टैप करें'));
  const wrap = el('div', { class: 'game-area' });
  for (let t = 2; t <= 10; t++) {
    const card = el('div', { class: 'rhyme-card' });
    card.appendChild(el('h3', {}, '✖️ ' + (STATE.lang==='hi' ? `${t} का पहाड़ा` : `Table of ${t}`)));
    const lines = [];
    for (let i = 1; i <= 10; i++) lines.push(`${t} × ${i} = ${t*i}`);
    card.appendChild(el('pre', {}, lines.join('\n')));
    const play = el('button', { class: 'btn green' }, '▶ ' + T('Play','सुनें'));
    play.onclick = () => {
      const text = lines.map(l => l.replace('×', STATE.lang==='hi'?'गुणा':'times').replace('=', STATE.lang==='hi'?'बराबर':'equals')).join('. ');
      speak(text);
    };
    card.appendChild(el('div', { class: 'btn-row' }, [play]));
    wrap.appendChild(card);
  }
  root.appendChild(wrap);
};

// COLORS (scoped)
BUILDERS.colors = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Colors','रंग','Tap a color','रंग पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  scope().colors.forEach(([en, hi, hex]) => {
    const card = el('div', { class: 'color-tile' }, [
      el('div', { class: 'swatch', style: `background:${hex}` }),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// SHAPES (scoped)
BUILDERS.shapes = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Shapes','आकार','Tap a shape','आकार पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  scope().shapes.forEach(([en, hi, svg]) => {
    const card = el('div', { class: 'shape-tile', html: svg + `<div class="word">${T(en,hi)}</div>` });
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

function buildEmojiList(root, en, hi, list) {
  root.innerHTML = '';
  root.appendChild(header(en, hi, 'Tap to hear','सुनने के लिए टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  list.forEach(([em, n_en, n_hi]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'emoji', style: 'font-size:48px' }, em),
      el('div', { class: 'word' }, T(n_en, n_hi))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 500);
      speak(T(n_en, n_hi));
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
}

BUILDERS.animals    = r => buildEmojiList(r, 'Animals',    'जानवर',       scope().animals);
BUILDERS.birds      = r => buildEmojiList(r, 'Birds',      'पक्षी',       BIRDS);
BUILDERS.fruits     = r => buildEmojiList(r, 'Fruits',     'फल',         scope().fruits);
BUILDERS.vegetables = r => buildEmojiList(r, 'Vegetables', 'सब्ज़ियाँ',     VEGETABLES);
BUILDERS.body       = r => buildEmojiList(r, 'Body Parts', 'शरीर के अंग',   scope().body);
BUILDERS.family     = r => buildEmojiList(r, 'Family',     'परिवार',      FAMILY);
BUILDERS.vehicles   = r => buildEmojiList(r, 'Vehicles',   'वाहन',        VEHICLES);
BUILDERS.seasons    = r => buildEmojiList(r, 'Seasons',    'ऋतुएँ',       SEASONS);

BUILDERS.days = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Days of the Week','सप्ताह के दिन','7 days','७ दिन'));
  const grid = el('div', { class: 'card-grid' });
  DAYS.forEach(([en, hi]) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big', style: 'font-size:32px' }, '📅'),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

BUILDERS.months = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Months','महीने','12 months','१२ महीने'));
  const grid = el('div', { class: 'card-grid' });
  MONTHS.forEach(([en, hi], i) => {
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big', style: 'font-size:28px' }, String(i+1)),
      el('div', { class: 'word' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

BUILDERS.opposites = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Opposites','विपरीत शब्द','Tap to hear','टैप करें'));
  const grid = el('div', { class: 'card-grid', style: 'grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))' });
  OPPOSITES.forEach(([a_en, a_hi, b_en, b_hi]) => {
    const left  = T(a_en, a_hi), right = T(b_en, b_hi);
    const card = el('div', { class: 'card', style: 'padding:14px' });
    card.innerHTML = `<div style="font-size:18px;font-weight:bold;color:#1976d2">${left} ↔ <span style="color:#e91e63">${right}</span></div>`;
    card.onclick = () => speak(`${left} — ${right}`);
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

BUILDERS.goodhabits = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Good Habits','अच्छी आदतें','Learn & follow','सीखें और अपनाएँ'));
  const grid = el('div', { class: 'card-grid', style: 'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))' });
  HABITS.forEach(([em, en, hi]) => {
    const card = el('div', { class: 'card', style: 'padding:18px' }, [
      el('div', { class: 'emoji', style: 'font-size:46px' }, em),
      el('div', { class: 'word', style: 'font-size:15px;line-height:1.4' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// RHYMES — class-wise karaoke player
// Tap a thumbnail → fullscreen karaoke screen with line-by-line highlight.
// Plays MP3 from `sounds/<name>.mp3` if available, otherwise falls back to TTS.
BUILDERS.rhymes = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Nursery Rhymes', 'बाल कविताएँ', 'Pick a rhyme to sing', 'गाने के लिए चुनें'));

  const grid = el('div', { class: 'rhyme-thumb-grid' });
  scope().rhymes.forEach((r) => {
    const card = el('div', { class: 'rhyme-thumb' });
    card.appendChild(el('div', { class: 'rhyme-thumb-emoji' }, r.emoji || '🎵'));
    card.appendChild(el('div', { class: 'rhyme-thumb-title' }, T(r.title_en, r.title_hi)));
    card.appendChild(el('div', { class: 'rhyme-thumb-play' }, '▶'));
    card.onclick = () => openKaraoke(root, r);
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// Karaoke fullscreen view (rendered inside the rhymes screen, swaps with grid)
function openKaraoke(root, r) {
  speechSynthesis.cancel();
  const titleText = T(r.title_en, r.title_hi);
  const lyricsText = T(r.text_en, r.text_hi);
  const lines = lyricsText.split('\n').map(s => s.trim()).filter(Boolean);

  root.innerHTML = '';

  const back = el('button', { class: 'btn', style: 'margin:6px 0' }, '← ' + T('Back to rhymes', 'कविताओं की सूची'));
  back.onclick = () => { stopAll(); BUILDERS.rhymes(root); };
  root.appendChild(back);

  const hero = el('div', { class: 'karaoke-hero' });
  hero.appendChild(el('div', { class: 'karaoke-hero-emoji' }, r.emoji || '🎵'));
  hero.appendChild(el('div', { class: 'karaoke-hero-title' }, titleText));
  root.appendChild(hero);

  const lyricsBox = el('div', { class: 'karaoke-lyrics' });
  const lineEls = lines.map((line, i) => {
    const lEl = el('div', { class: 'karaoke-line' }, line);
    lyricsBox.appendChild(lEl);
    return lEl;
  });
  root.appendChild(lyricsBox);

  const status = el('div', { class: 'karaoke-status' }, T('Ready to play', 'सुनने के लिए तैयार'));
  root.appendChild(status);

  // Controls
  const playBtn   = el('button', { class: 'btn green' }, '▶ ' + T('Play', 'गाओ'));
  const pauseBtn  = el('button', { class: 'btn' }, '⏸ ' + T('Pause', 'रोको'));
  const restartBtn= el('button', { class: 'btn orange' }, '⟲ ' + T('Restart', 'फिर से'));
  const nextBtn   = el('button', { class: 'btn' }, T('Next ▶', 'अगला ▶'));
  const ctrls = el('div', { class: 'karaoke-controls' }, [playBtn, pauseBtn, restartBtn, nextBtn]);
  root.appendChild(ctrls);

  // Player state
  let audio = null;
  let usingTTS = false;
  let ttsIdx = 0;
  let ttsTimer = null;

  function highlight(idx) {
    lineEls.forEach((e, i) => e.classList.toggle('active', i === idx));
    if (idx >= 0 && lineEls[idx]) {
      lineEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function stopAll() {
    if (audio) { try { audio.pause(); } catch(_){} audio = null; }
    speechSynthesis.cancel();
    if (ttsTimer) { clearTimeout(ttsTimer); ttsTimer = null; }
    highlight(-1);
  }

  function tryAudio() {
    return new Promise((resolve) => {
      const a = new Audio(r.audio);
      a.preload = 'auto';
      let settled = false;
      const ok = () => { if (settled) return; settled = true; resolve(a); };
      const fail = () => { if (settled) return; settled = true; resolve(null); };
      a.addEventListener('canplaythrough', ok, { once: true });
      a.addEventListener('error', fail, { once: true });
      // give it 4 seconds to load on first try; treat as missing otherwise
      setTimeout(fail, 4000);
    });
  }

  function startMP3(a) {
    audio = a;
    usingTTS = false;
    status.textContent = T('🎵 Singing along…', '🎵 गाते हुए…');

    // Distribute lines evenly across audio duration; highlight current line.
    const total = isFinite(a.duration) && a.duration > 0 ? a.duration : (lines.length * 3);
    const per = total / lines.length;

    a.ontimeupdate = () => {
      const idx = Math.min(lines.length - 1, Math.floor(a.currentTime / per));
      highlight(idx);
    };
    a.onended = () => { highlight(-1); status.textContent = T('Great singing! ⭐', 'बहुत बढ़िया! ⭐'); addStar(2); };
    a.play().catch(() => startTTS());
  }

  function startTTS() {
    usingTTS = true;
    audio = null;
    status.textContent = T('🎤 Reading aloud…', '🎤 पढ़ कर सुनाते हैं…');
    ttsIdx = 0;
    speakLine();
  }

  function speakLine() {
    if (ttsIdx >= lines.length) {
      highlight(-1);
      status.textContent = T('Great singing! ⭐', 'बहुत बढ़िया! ⭐');
      addStar(2);
      return;
    }
    highlight(ttsIdx);
    const u = new SpeechSynthesisUtterance(lines[ttsIdx]);
    u.rate = 0.85;
    u.pitch = 1.15;
    const vlang = (STATE && STATE.lang === 'hi') ? 'hi-IN' : 'en-US';
    u.lang = vlang;
    // Pick a matching voice if available
    try {
      const voices = speechSynthesis.getVoices();
      const v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(vlang.toLowerCase().slice(0,2)));
      if (v) u.voice = v;
    } catch(_) {}
    u.onend = () => {
      ttsIdx++;
      ttsTimer = setTimeout(speakLine, 220); // tiny pause between lines
    };
    u.onerror = () => { ttsIdx++; ttsTimer = setTimeout(speakLine, 220); };
    speechSynthesis.speak(u);
  }

  async function play() {
    stopAll();
    status.textContent = T('Loading…', 'लोड हो रहा है…');
    const a = r.audio ? await tryAudio() : null;
    if (a) startMP3(a); else startTTS();
  }

  function pause() {
    if (audio) { audio.pause(); status.textContent = T('Paused', 'रुका हुआ'); }
    else if (usingTTS) { speechSynthesis.pause(); status.textContent = T('Paused', 'रुका हुआ'); }
  }

  function resume() {
    if (audio) { audio.play(); status.textContent = T('🎵 Singing along…', '🎵 गाते हुए…'); }
    else if (usingTTS && speechSynthesis.paused) { speechSynthesis.resume(); status.textContent = T('🎤 Reading aloud…', '🎤 पढ़ कर सुनाते हैं…'); }
    else play();
  }

  function nextRhyme() {
    stopAll();
    const list = scope().rhymes;
    const idx = list.indexOf(r);
    const nxt = list[(idx + 1) % list.length];
    openKaraoke(root, nxt);
  }

  playBtn.onclick   = resume;
  pauseBtn.onclick  = pause;
  restartBtn.onclick= play;
  nextBtn.onclick   = nextRhyme;

  // Auto-start on open
  setTimeout(play, 100);
}

BUILDERS.stories = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Short Stories','छोटी कहानियाँ','Tap Play to listen','सुनें'));
  STORIES.forEach(([t_en, txt_en, t_hi, txt_hi]) => {
    const t = T(t_en, t_hi), txt = T(txt_en, txt_hi);
    const card = el('div', { class: 'story-card' });
    card.appendChild(el('h3', {}, '📖 ' + t));
    card.appendChild(el('p', {}, txt));
    const play = el('button', { class: 'btn green' }, '▶ ' + T('Play','सुनें'));
    const stop = el('button', { class: 'btn' }, '⏸ ' + T('Stop','रोकें'));
    play.onclick = () => speak(txt);
    stop.onclick = () => speechSynthesis.cancel();
    card.appendChild(el('div', { class: 'btn-row' }, [play, stop]));
    root.appendChild(card);
  });
};

// GAMES — different sets per class
BUILDERS.games = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Games','खेल','Pick a game','खेल चुनें'));
  const wrap = el('div', { class: 'game-area' });
  let games;
  if (STATE.klass === 'nursery') {
    games = [
      ['🎨', 'Match the Color', 'रंग मिलाओ', 'matchColor'],
      ['🐘', 'Guess the Animal','जानवर पहचानो','guessAnimal'],
      ['🍎', 'Guess the Fruit','फल पहचानो','guessFruit']
    ];
  } else if (STATE.klass === 'kg1') {
    games = [
      ['🔤', 'Find the Letter','अक्षर ढूंढो','findLetter'],
      ['🔢', 'Find the Number','संख्या ढूंढो','findNumber'],
      ['🎨', 'Match the Color','रंग मिलाओ','matchColor'],
      ['🐘', 'Guess the Animal','जानवर पहचानो','guessAnimal']
    ];
  } else {
    games = [
      ['🔤', 'Find the Letter','अक्षर ढूंढो','findLetter'],
      ['🔢', 'Find the Number','संख्या ढूंढो','findNumber'],
      ['🎨', 'Match the Color','रंग मिलाओ','matchColor'],
      ['🐘', 'Guess the Animal','जानवर पहचानो','guessAnimal'],
      ['➕', 'Math Quiz','गणित खेल','mathGame']
    ];
  }
  games.forEach(([em, en, hi, key]) => {
    const b = el('button', { class: 'btn orange', style: 'font-size:18px;display:block;width:100%;margin:10px 0' }, em + '  ' + T(en, hi));
    b.onclick = () => GAMES[key](wrap);
    wrap.appendChild(b);
  });
  root.appendChild(wrap);
};

const GAMES = {};
GAMES.findLetter = (wrap) => {
  wrap.innerHTML = '';
  const target = rand(ALPHABET);
  const opts = shuffle([target, rand(ALPHABET), rand(ALPHABET), rand(ALPHABET)]);
  wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081' },
    T(`Find the letter "${target[0]}"`,`अक्षर ढूंढो: "${target[0]}"`)));
  speak(T(`Where is the letter ${target[0]}?`,`अक्षर ${target[0]} कहाँ है?`));
  const row = el('div', { class: 'options' });
  opts.forEach(([l]) => {
    const o = el('div', { class: 'option-card' }, l);
    o.onclick = () => {
      if (l === target[0]) { o.classList.add('correct'); addStar(1); speak(T('Well done!','शाबाश!')); setTimeout(()=>GAMES.findLetter(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};
GAMES.findNumber = (wrap) => {
  wrap.innerHTML = '';
  const max = scope().numMax;
  const target = Math.floor(Math.random() * Math.min(max, 30)) + 1;
  const opts = shuffle([target, target+1, target-1, target+2].map(x => Math.max(1,x)));
  const word = STATE.lang === 'hi' ? numberToHindi(target) : numberToEnglish(target);
  wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081' },
    (T('Find: ','ढूंढो: ')) + word));
  speak(word);
  const row = el('div', { class: 'options' });
  [...new Set(opts)].slice(0,4).forEach(n => {
    const o = el('div', { class: 'option-card' }, String(n));
    o.onclick = () => {
      if (n === target) { o.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(()=>GAMES.findNumber(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};
GAMES.matchColor = (wrap) => {
  wrap.innerHTML = '';
  const colors = scope().colors;
  const target = rand(colors);
  const opts = shuffle([target, rand(colors), rand(colors), rand(colors)]);
  const name = T(target[0], target[1]);
  wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081' }, T('Find: ','ढूंढो: ') + name));
  speak(name);
  const row = el('div', { class: 'options' });
  opts.forEach(([en, hi, hex]) => {
    const o = el('div', { class: 'option-card', style: `background:${hex};color:#fff;text-shadow:1px 1px 0 #000;min-width:100px;height:80px` }, ' ');
    o.onclick = () => {
      if (en === target[0]) { o.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(()=>GAMES.matchColor(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};
GAMES.guessAnimal = (wrap) => {
  wrap.innerHTML = '';
  const list = scope().animals;
  const target = rand(list);
  const opts = shuffle([target, rand(list), rand(list), rand(list)]);
  wrap.appendChild(el('div', { style: 'text-align:center;font-size:90px;margin:10px' }, target[0]));
  wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081' }, T('Who is this?','यह कौन है?')));
  const row = el('div', { class: 'options' });
  opts.forEach(([em, en, hi]) => {
    const o = el('div', { class: 'option-card', style: 'font-size:18px' }, T(en, hi));
    o.onclick = () => {
      if (en === target[1]) { o.classList.add('correct'); addStar(1); speak(T('Well done!','शाबाश!')); setTimeout(()=>GAMES.guessAnimal(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};
GAMES.guessFruit = (wrap) => {
  wrap.innerHTML = '';
  const list = scope().fruits;
  const target = rand(list);
  const opts = shuffle([target, rand(list), rand(list), rand(list)]);
  wrap.appendChild(el('div', { style: 'text-align:center;font-size:90px;margin:10px' }, target[0]));
  wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081' }, T('Which fruit?','यह कौन सा फल है?')));
  const row = el('div', { class: 'options' });
  opts.forEach(([em, en, hi]) => {
    const o = el('div', { class: 'option-card', style: 'font-size:18px' }, T(en, hi));
    o.onclick = () => {
      if (en === target[1]) { o.classList.add('correct'); addStar(1); speak(T('Yes!','सही!')); setTimeout(()=>GAMES.guessFruit(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};
GAMES.mathGame = (wrap) => {
  wrap.innerHTML = '';
  const a = Math.floor(Math.random()*15)+1, b = Math.floor(Math.random()*10)+1;
  const op = Math.random()<0.5 ? '+' : '-';
  let A = a, B = b;
  if (op === '-' && B > A) [A, B] = [B, A];
  const ans = op === '+' ? A+B : A-B;
  wrap.appendChild(el('div', { class: 'math-display' }, `${A} ${op} ${B} = ?`));
  speak(`${A} ${op==='+'?'plus':'minus'} ${B}`);
  const row = el('div', { class: 'options' });
  shuffle([ans, ans+1, ans-1, ans+2].filter(x=>x>=0)).slice(0,4).forEach(c => {
    const o = el('div', { class: 'option-card' }, String(c));
    o.onclick = () => {
      if (c === ans) { o.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(()=>GAMES.mathGame(wrap),1000); }
      else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
    };
    row.appendChild(o);
  });
  wrap.appendChild(row);
};

// QUIZ (KG2)
BUILDERS.quiz = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Quiz Time!','क्विज़ समय!','5 mixed questions','५ मिश्रित प्रश्न'));
  const wrap = el('div', { class: 'game-area' });
  let score = 0, qNum = 0; const total = 5;
  const scoreEl = el('div', { style: 'text-align:center;font-weight:bold;font-size:18px;color:#1976d2' });
  function nextQ() {
    if (qNum >= total) {
      wrap.innerHTML = '';
      wrap.appendChild(el('h2', { style: 'text-align:center;color:#ff4081' },
        T(`Your Score: ${score}/${total} 🎉`,`आपका स्कोर: ${score}/${total} 🎉`)));
      addStar(score);
      const again = el('button', { class: 'btn green' }, T('Play Again','फिर खेलें'));
      again.onclick = () => { score=0; qNum=0; wrap.appendChild(scoreEl); nextQ(); };
      wrap.appendChild(el('div', { class: 'btn-row' }, [again]));
      speak(T(`You scored ${score} out of ${total}`,`आपने ${score} अंक प्राप्त किए`));
      return;
    }
    qNum++;
    scoreEl.textContent = T('Question ','प्रश्न ') + qNum + '/' + total + ' | ⭐ ' + score;
    const types = ['letter','number','color','animal','fruit'];
    const t = rand(types);
    let target, opts, qText, isCorrect;
    if (t === 'letter') {
      target = rand(ALPHABET);
      opts = shuffle([target, rand(ALPHABET), rand(ALPHABET)]).map(x=>x[0]);
      qText = T(`Which letter starts "${target[1]}"?`,`"${target[1]}" किस अक्षर से शुरू होता है?`);
      isCorrect = o => o === target[0];
    } else if (t === 'number') {
      const n = Math.floor(Math.random()*9)+2;
      opts = shuffle([n+1, n, n+2, n-1].map(String));
      qText = T(`What comes after ${n}?`,`${n} के बाद क्या आता है?`);
      isCorrect = o => o === String(n+1);
    } else if (t === 'color') {
      target = rand(COLORS_FULL);
      opts = shuffle([target, rand(COLORS_FULL), rand(COLORS_FULL)]).map(c => T(c[0], c[1]));
      qText = T(`Which is "${target[0]}"?`,`"${target[1]}" कौन सा है?`);
      isCorrect = o => o === T(target[0], target[1]);
    } else if (t === 'animal') {
      target = rand(ANIMALS_FULL);
      opts = shuffle([target, rand(ANIMALS_FULL), rand(ANIMALS_FULL)]).map(a => T(a[1], a[2]));
      qText = T('Which animal? ','यह कौन सा जानवर? ') + target[0];
      isCorrect = o => o === T(target[1], target[2]);
    } else {
      target = rand(FRUITS_FULL);
      opts = shuffle([target, rand(FRUITS_FULL), rand(FRUITS_FULL)]).map(f => T(f[1], f[2]));
      qText = T('Which fruit? ','यह कौन सा फल? ') + target[0];
      isCorrect = o => o === T(target[1], target[2]);
    }
    wrap.innerHTML = '';
    wrap.appendChild(scoreEl);
    wrap.appendChild(el('h3', { style: 'text-align:center;color:#ff4081;margin:14px 0' }, qText));
    speak(qText);
    const row = el('div', { class: 'options' });
    opts.slice(0,3).forEach(o => {
      const card = el('div', { class: 'option-card', style: 'font-size:20px' }, String(o));
      card.onclick = () => {
        if (isCorrect(o)) { card.classList.add('correct'); score++; speak(T('Correct!','सही!')); }
        else { card.classList.add('wrong'); speak(T('Wrong','गलत')); }
        setTimeout(nextQ, 1100);
      };
      row.appendChild(card);
    });
    wrap.appendChild(row);
  }
  wrap.appendChild(scoreEl);
  root.appendChild(wrap);
  nextQ();
};

// ---------- Generic tracing canvas builder ----------
function buildTracer(root, opts) {
  // opts = { titleEn, titleHi, items: [{char, lang, label}], showLetterPicker, showNumberPicker, showHindiPicker }
  root.innerHTML = '';
  root.appendChild(header(opts.titleEn, opts.titleHi,
    'Trace with finger or mouse', 'उंगली या माउस से बनाएँ'));

  const wrap = el('div', { class: 'game-area', style: 'text-align:center' });
  const label = el('div', { style: 'font-size:20px;color:#666;margin-bottom:8px' },
    opts.subtitleEn ? T(opts.subtitleEn, opts.subtitleHi) : T('Trace this:','इसे बनाएँ:'));
  wrap.appendChild(label);

  const canvas = el('canvas', { id: 'traceCanvas', width: '400', height: '400' });
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let current = opts.items[0];
  function drawGuide() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ffe0ec';
    ctx.font = 'bold 320px Comic Sans MS, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(current.char, canvas.width/2, canvas.height/2);
    // dotted helper guide lines (4-line ruled)
    ctx.strokeStyle = 'rgba(255,107,157,.35)';
    ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
    [80, 200, 320].forEach(y => { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(380, y); ctx.stroke(); });
    ctx.setLineDash([]);
    // pen settings
    ctx.strokeStyle = '#1976d2'; ctx.lineWidth = 10; ctx.lineCap='round'; ctx.lineJoin='round';
    label.textContent = (opts.subtitleEn ? T(opts.subtitleEn, opts.subtitleHi) + ' ' : '') + current.char;
  }
  drawGuide();
  speak(current.char, current.lang);

  let drawing = false;
  const pos = e => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x:(t.clientX - r.left)*(canvas.width/r.width), y:(t.clientY - r.top)*(canvas.height/r.height) };
  };
  const start = e => { e.preventDefault(); drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const move  = e => { if(!drawing) return; e.preventDefault(); const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); };
  const end   = () => { drawing=false; };
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive:false });
  canvas.addEventListener('touchmove', move, { passive:false });
  canvas.addEventListener('touchend', end);

  // Letter / number quick picker grid
  if (opts.items.length > 1) {
    const picker = el('div', {
      style: 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0 4px'
    });
    opts.items.forEach(it => {
      const b = el('button', {
        class: 'btn blue',
        style: 'padding:8px 12px;font-size:18px;min-width:44px'
      }, it.char);
      b.onclick = () => { current = it; drawGuide(); speak(it.char, it.lang); };
      picker.appendChild(b);
    });
    wrap.appendChild(picker);
  }

  const row = el('div', { class: 'btn-row' });
  const clear = el('button', { class: 'btn' }, T('🧽 Clear','🧽 मिटाएँ'));
  clear.onclick = drawGuide;
  const prev = el('button', { class: 'btn orange' }, T('◀ Prev','◀ पिछला'));
  prev.onclick = () => {
    const i = opts.items.indexOf(current);
    current = opts.items[(i - 1 + opts.items.length) % opts.items.length];
    drawGuide(); speak(current.char, current.lang);
  };
  const next = el('button', { class: 'btn green' }, T('Next ▶','अगला ▶'));
  next.onclick = () => {
    const i = opts.items.indexOf(current);
    current = opts.items[(i + 1) % opts.items.length];
    drawGuide(); speak(current.char, current.lang); addStar(1);
  };
  row.appendChild(prev); row.appendChild(clear); row.appendChild(next);
  wrap.appendChild(row);
  root.appendChild(wrap);
}

// LETTER TRACING (A-Z + Hindi for higher classes)
BUILDERS.tracing = (root) => {
  let items = [];
  for (let i = 65; i <= 90; i++) items.push({ char: String.fromCharCode(i), lang: 'en-US' });
  if (STATE.klass === 'kg1') {
    HINDI_SWAR.forEach(([l]) => items.push({ char: l, lang: 'hi-IN' }));
  } else if (STATE.klass === 'kg2') {
    HINDI_ALL.forEach(([l]) => items.push({ char: l, lang: 'hi-IN' }));
  }
  buildTracer(root, {
    titleEn: 'Letter Writing A-Z',
    titleHi: 'अक्षर लिखना A-Z',
    subtitleEn: 'Trace this letter:',
    subtitleHi: 'इस अक्षर को बनाएँ:',
    items
  });
};

// NUMBER TRACING (0-9 for nursery, 0-9 for all classes)
BUILDERS.numTracing = (root) => {
  const items = [];
  for (let n = 1; n <= 10; n++) {
    items.push({ char: n === 10 ? '10' : String(n), lang: STATE.lang === 'hi' ? 'hi-IN' : 'en-US' });
  }
  buildTracer(root, {
    titleEn: 'Number Writing 1-10',
    titleHi: 'संख्या लिखना १-१०',
    subtitleEn: 'Trace this number:',
    subtitleHi: 'इस संख्या को बनाएँ:',
    items
  });
};

// SPELLING (KG2) — show emoji + word with one missing letter
BUILDERS.spelling = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Spelling Practice','वर्तनी अभ्यास','Pick the missing letter','छूटा अक्षर चुनें'));
  const wrap = el('div', { class: 'game-area' });
  function newQ() {
    wrap.innerHTML = '';
    const item = rand(FRUITS_FULL.concat(ANIMALS_FULL).concat(VEHICLES));
    const word = item[1].toUpperCase();
    const idx = Math.floor(Math.random() * word.length);
    const missing = word[idx];
    const display = word.split('').map((c, i) => i === idx ? '_' : c).join(' ');
    wrap.appendChild(el('div', { style: 'text-align:center;font-size:80px' }, item[0]));
    wrap.appendChild(el('div', { style: 'text-align:center;font-size:36px;font-weight:bold;letter-spacing:6px;color:#1976d2;margin:14px 0' }, display));
    wrap.appendChild(el('p', { style: 'text-align:center;color:#666' }, T('Find the missing letter','छूटा हुआ अक्षर ढूंढो')));
    speak(T(`Spell ${item[1]}`, `${item[1]} की वर्तनी`));
    const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const opts = shuffle([missing, rand(ABC), rand(ABC), rand(ABC)]);
    const row = el('div', { class: 'options' });
    [...new Set(opts)].slice(0,4).forEach(L => {
      const o = el('div', { class: 'option-card' }, L);
      o.onclick = () => {
        if (L === missing) { o.classList.add('correct'); addStar(1); speak(item[1]); setTimeout(newQ, 1200); }
        else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
      };
      row.appendChild(o);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// (Old simple Rewards removed — new full Rewards with Pets/Garden/Certificate/Birthday is below)

// ============================================
// ============== ACADEMIC ADD-ONS ==============
// ============================================

// ---------- CAPITAL + SMALL LETTERS ----------
BUILDERS.capSmall = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Capital & Small Letters','बड़े और छोटे अक्षर',
    'Tap a pair to hear', 'जोड़ी पर टैप करें'));
  const grid = el('div', { class: 'card-grid' });
  for (let i = 0; i < 26; i++) {
    const cap = String.fromCharCode(65 + i);
    const sm  = String.fromCharCode(97 + i);
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, cap + ' ' + sm),
      el('div', { class: 'word' }, ALPHABET[i][3] + ' ' + T(ALPHABET[i][1], ALPHABET[i][2]))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 600);
      speak(`Capital ${cap}, small ${sm}, ${cap} for ${ALPHABET[i][1]}`, 'en-US');
    };
    grid.appendChild(card);
  }
  root.appendChild(grid);
};

// ---------- HINDI NUMBERS १-१००  (scoped) ----------
const HINDI_DIGITS = ['०','१','२','३','४','५','६','७','८','९'];
function toDevanagari(n) { return String(n).split('').map(d => HINDI_DIGITS[d] || d).join(''); }
BUILDERS.hindiNumbers = (root) => {
  root.innerHTML = '';
  const max = scope().numMax;
  root.appendChild(header(`Hindi Numbers १-${toDevanagari(max)}`, `हिंदी गिनती १-${toDevanagari(max)}`,
    'Devanagari digits + name', 'देवनागरी अंक और नाम'));
  const grid = el('div', { class: 'card-grid' });
  for (let n = 1; n <= max; n++) {
    const dev = toDevanagari(n);
    const word = numberToHindi(n);
    const card = el('div', { class: 'card' }, [
      el('div', { class: 'big' }, dev),
      el('div', { class: 'word' }, word + ' (' + n + ')')
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 500);
      speak(`${word}`, 'hi-IN');
    };
    grid.appendChild(card);
  }
  root.appendChild(grid);
};

// ---------- NUMBER NAMES SPELLING ----------
BUILDERS.numberNames = (root) => {
  root.innerHTML = '';
  const max = Math.min(scope().numMax, 20);
  root.appendChild(header(`Number Names 1-${max}`,`संख्या नाम १-${max}`,
    'Tap to spell','वर्तनी सुनने को टैप करें'));
  const grid = el('div', { class: 'card-grid', style:'grid-template-columns:repeat(auto-fill, minmax(160px, 1fr))' });
  for (let n = 1; n <= max; n++) {
    const name = numberToEnglish(n);
    const hi = numberToHindi(n);
    const card = el('div', { class: 'card', style:'padding:14px' }, [
      el('div', { class: 'big', style: 'font-size:36px' }, String(n)),
      el('div', { class: 'word', style:'font-size:14px;letter-spacing:2px;color:#1976d2' }, name.toUpperCase()),
      el('div', { class: 'word', style:'font-size:13px;color:#666' }, hi)
    ]);
    card.onclick = () => {
      const letters = name.toUpperCase().replace(/ /g,'').split('').join(', ');
      speak(`${n} is spelled ${letters}. ${name}`, 'en-US');
    };
    grid.appendChild(card);
  }
  root.appendChild(grid);
};

// ---------- BIG / SMALL / TALL / SHORT ----------
BUILDERS.comparison = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Big & Small, Tall & Short','बड़ा-छोटा, लंबा-छोटा',
    'Compare the pictures','तस्वीरों की तुलना करें'));
  const wrap = el('div', { class: 'game-area' });
  const pairs = [
    ['🐘','🐭','Big','छोटा/बड़ा','Elephant is big, mouse is small','हाथी बड़ा, चूहा छोटा'],
    ['🦒','🐈','Tall','लंबा/छोटा','Giraffe is tall, cat is short','जिराफ़ लंबा, बिल्ली छोटी'],
    ['🐳','🐠','Big','बड़ा-छोटा','Whale is big, fish is small','व्हेल बड़ी, मछली छोटी'],
    ['🌳','🌱','Tall','लंबा-छोटा','Tree is tall, plant is short','पेड़ लंबा, पौधा छोटा'],
    ['🏠','⛺','Big','बड़ा-छोटा','House is big, tent is small','घर बड़ा, तंबू छोटा'],
    ['🚛','🚗','Big','बड़ा-छोटा','Truck is big, car is small','ट्रक बड़ा, कार छोटी']
  ];
  pairs.forEach(([a,b,_,__,sen_en,sen_hi]) => {
    const card = el('div', { class: 'rhyme-card' });
    card.innerHTML = `<div style="text-align:center;font-size:60px;margin:6px">${a} <span style="font-size:28px;color:#666">vs</span> ${b}</div>`;
    card.appendChild(el('p', { style:'text-align:center;font-weight:bold;color:#1976d2' }, T(sen_en, sen_hi)));
    const play = el('button', { class:'btn green' }, '🔊 ' + T('Listen','सुनें'));
    play.onclick = () => speak(T(sen_en, sen_hi));
    card.appendChild(el('div', { class:'btn-row' }, [play]));
    wrap.appendChild(card);
  });
  root.appendChild(wrap);
};

// ---------- PREPOSITIONS ----------
BUILDERS.prepositions = (root) => {
  root.innerHTML = '';
  root.appendChild(header('In, On, Under, Above, Beside','अंदर, ऊपर, नीचे, पास',
    'Position words','स्थान बताने वाले शब्द'));
  const grid = el('div', { class: 'card-grid', style:'grid-template-columns:repeat(auto-fill, minmax(180px, 1fr))' });
  const items = [
    ['📦🐈','Cat IN the box','बिल्ली डिब्बे के अंदर','In','अंदर'],
    ['📦🐱','Cat ON the box','बिल्ली डिब्बे के ऊपर','On','ऊपर'],
    ['🐈📦','Cat UNDER the box','बिल्ली डिब्बे के नीचे','Under','नीचे'],
    ['🦅🌳','Bird ABOVE the tree','चिड़िया पेड़ के ऊपर','Above','ऊपर'],
    ['🐶🐱','Dog BESIDE the cat','कुत्ता बिल्ली के पास','Beside','पास'],
    ['🚗🏠','Car BEHIND the house','गाड़ी घर के पीछे','Behind','पीछे'],
    ['🐢🌊','Turtle IN FRONT of water','कछुआ पानी के सामने','In Front','सामने'],
    ['👦👧','Boy NEXT TO girl','लड़का लड़की के पास','Next to','बगल में']
  ];
  items.forEach(([emo, en, hi, word_en, word_hi]) => {
    const card = el('div', { class: 'card', style:'padding:16px' }, [
      el('div', { style:'font-size:42px' }, emo),
      el('div', { style:'font-size:18px;font-weight:bold;color:#1976d2;margin:6px 0' }, T(word_en, word_hi)),
      el('div', { class: 'word', style:'font-size:13px' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- TODAY / YESTERDAY / TOMORROW ----------
BUILDERS.timeWords = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Today, Yesterday, Tomorrow','आज, कल, परसों','Time concepts','समय की समझ'));
  const today = new Date();
  const dayName = en => DAYS[(today.getDay() + (en === -1 ? 6 : en === 1 ? 1 : 0)) % 7];
  const wrap = el('div', { class: 'game-area' });
  const items = [
    ['📅','Today','आज', dayName(0), 'This is the day right now','यह आज का दिन है'],
    ['⏪','Yesterday','कल (बीता)', dayName(-1), 'The day before today','आज से एक दिन पहले'],
    ['⏩','Tomorrow','कल (आने वाला)', dayName(1), 'The day after today','आज के अगले दिन'],
    ['📆','Day before yesterday','परसों (पहले)', '-', 'Two days ago','दो दिन पहले'],
    ['🗓️','Day after tomorrow','परसों (बाद)', '-', 'Two days from now','दो दिन बाद']
  ];
  items.forEach(([em, en, hi, day, sen_en, sen_hi]) => {
    const card = el('div', { class: 'card', style:'padding:18px;text-align:left' });
    card.innerHTML = `
      <div style="font-size:48px">${em}</div>
      <div style="font-size:22px;font-weight:bold;color:#ff4081">${T(en, hi)}</div>
      <div style="color:#666;margin:6px 0">${T(sen_en, sen_hi)}</div>
      ${day !== '-' ? `<div style="color:#1976d2;font-weight:bold">${T('Day:','दिन:')} ${T(day[0], day[1])}</div>` : ''}
    `;
    card.onclick = () => speak(T(en + '. ' + sen_en, hi + '। ' + sen_hi));
    wrap.appendChild(card);
  });
  root.appendChild(wrap);
};

// ---------- 3-LETTER WORDS (CVC family rhymes) ----------
BUILDERS.threeLetter = (root) => {
  root.innerHTML = '';
  root.appendChild(header('3-Letter Words','तीन अक्षर के शब्द',
    'Tap to read','पढ़ने के लिए टैप करें'));
  const families = [
    ['-AT', '🎩', ['CAT','BAT','HAT','MAT','RAT','SAT','PAT','FAT']],
    ['-AN', '🚐', ['CAN','MAN','PAN','RAN','VAN','FAN','TAN','BAN']],
    ['-IT', '🪺', ['BIT','HIT','SIT','FIT','PIT','KIT','LIT','WIT']],
    ['-OG', '🐶', ['DOG','FOG','HOG','JOG','LOG','BOG','COG']],
    ['-UN', '☀️', ['SUN','RUN','FUN','BUN','GUN','NUN','PUN']],
    ['-IG', '🐷', ['BIG','DIG','FIG','PIG','WIG','JIG','RIG']],
    ['-EN', '🖊️', ['PEN','HEN','TEN','MEN','DEN','BEN']],
    ['-OP', '🛒', ['HOP','MOP','POP','TOP','COP','SHOP']]
  ];
  families.forEach(([fam, em, words]) => {
    const card = el('div', { class: 'rhyme-card' });
    card.appendChild(el('h3', {}, em + '  ' + T(`Family ${fam}`,`परिवार ${fam}`)));
    const wordRow = el('div', { style:'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px' });
    words.forEach(w => {
      const b = el('button', { class:'btn blue', style:'font-size:18px;padding:10px 14px;letter-spacing:2px' }, w);
      b.onclick = () => speak(w + '. ' + w.split('').join(' '), 'en-US');
      wordRow.appendChild(b);
    });
    card.appendChild(wordRow);
    root.appendChild(card);
  });
};

// ---------- SIGHT WORDS ----------
const SIGHT_WORDS = [
  'the','a','I','is','am','are','it','in','on','to','go','no','yes','my','we','you','he','she','at','up',
  'and','can','do','see','look','for','run','this','that','here','play','like','have','help','said','make'
];
BUILDERS.sightWords = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Sight Words','देखकर पहचानने वाले शब्द',
    'Common words to recognize fast','तुरंत पहचानने वाले शब्द'));
  const grid = el('div', { class: 'card-grid', style:'grid-template-columns:repeat(auto-fill, minmax(110px, 1fr))' });
  SIGHT_WORDS.forEach(w => {
    const card = el('div', { class: 'card', style:'padding:18px' }, [
      el('div', { class: 'big', style:'font-size:32px' }, w.toUpperCase())
    ]);
    card.onclick = () => speak(w, 'en-US');
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- VOWELS vs CONSONANTS ----------
BUILDERS.vowelCons = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Vowels & Consonants','स्वर और व्यंजन',
    'A E I O U are vowels','A E I O U स्वर हैं'));
  const wrap = el('div', { class: 'game-area' });
  const vowels = ['A','E','I','O','U'];
  // Vowels card
  const vCard = el('div', { class:'rhyme-card', style:'background:#fff3e0' });
  vCard.appendChild(el('h3', { style:'color:#e65100' }, '🔤 ' + T('Vowels (5)','स्वर (5)')));
  const vRow = el('div', { style:'display:flex;gap:10px;flex-wrap:wrap' });
  vowels.forEach(v => {
    const b = el('button', { class:'btn orange', style:'font-size:30px;padding:14px 20px' }, v);
    b.onclick = () => speak(`${v} is a vowel`, 'en-US');
    vRow.appendChild(b);
  });
  vCard.appendChild(vRow);
  wrap.appendChild(vCard);
  // Consonants card
  const cCard = el('div', { class:'rhyme-card', style:'background:#e3f2fd' });
  cCard.appendChild(el('h3', { style:'color:#1565c0' }, '🔠 ' + T('Consonants (21)','व्यंजन (21)')));
  const cRow = el('div', { style:'display:flex;gap:6px;flex-wrap:wrap' });
  for (let i = 65; i <= 90; i++) {
    const L = String.fromCharCode(i);
    if (vowels.indexOf(L) >= 0) continue;
    const b = el('button', { class:'btn blue', style:'font-size:20px;padding:10px 14px;min-width:48px' }, L);
    b.onclick = () => speak(`${L} is a consonant`, 'en-US');
    cRow.appendChild(b);
  }
  cCard.appendChild(cRow);
  wrap.appendChild(cCard);
  // Quick game
  const gameCard = el('div', { class:'rhyme-card' });
  gameCard.appendChild(el('h3', {}, '🎯 ' + T('Quick Quiz','छोटा खेल')));
  const qDiv = el('div', { style:'text-align:center' });
  const qLetter = el('div', { style:'font-size:80px;font-weight:bold;color:#ff4081' });
  const qBtns = el('div', { class:'options' });
  function nextQ() {
    const L = String.fromCharCode(65 + Math.floor(Math.random()*26));
    qLetter.textContent = L;
    qBtns.innerHTML = '';
    [['Vowel','स्वर'], ['Consonant','व्यंजन']].forEach(([en, hi]) => {
      const b = el('div', { class:'option-card' }, T(en, hi));
      b.onclick = () => {
        const isVowel = vowels.indexOf(L) >= 0;
        const correct = (en === 'Vowel') === isVowel;
        if (correct) { b.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(nextQ, 900); }
        else { b.classList.add('wrong'); setTimeout(()=>b.classList.remove('wrong'),500); }
      };
      qBtns.appendChild(b);
    });
    speak(T(`Is ${L} a vowel or consonant?`, `${L} स्वर है या व्यंजन?`), 'en-US');
  }
  qDiv.appendChild(qLetter); qDiv.appendChild(qBtns);
  gameCard.appendChild(qDiv);
  wrap.appendChild(gameCard);
  root.appendChild(wrap);
  nextQ();
};

// ---------- SKIP COUNTING (2s, 5s, 10s) ----------
BUILDERS.skipCounting = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Skip Counting','छलांग गिनती','By 2s, 5s, 10s','२-२, ५-५, १०-१०'));
  const wrap = el('div', { class: 'game-area' });
  const groups = [
    [2, 'By 2s', '२ की छलांग'],
    [5, 'By 5s', '५ की छलांग'],
    [10, 'By 10s', '१० की छलांग']
  ];
  groups.forEach(([step, en, hi]) => {
    const card = el('div', { class: 'rhyme-card' });
    card.appendChild(el('h3', {}, '⏩ ' + T(en, hi)));
    const seq = [];
    for (let n = step; n <= step * 10; n += step) seq.push(n);
    card.appendChild(el('pre', { style:'font-size:22px;letter-spacing:6px;color:#1976d2;text-align:center' }, seq.join(', ')));
    const play = el('button', { class:'btn green' }, '🔊 ' + T('Listen','सुनें'));
    play.onclick = () => speak(seq.join(', '), STATE.lang === 'hi' ? 'hi-IN' : 'en-US');
    card.appendChild(el('div', { class:'btn-row' }, [play]));
    wrap.appendChild(card);
  });
  root.appendChild(wrap);
};

// ---------- GREATER / LESS THAN ----------
BUILDERS.greaterLess = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Greater Than / Less Than','बड़ा / छोटा','5 > 3, 2 < 7','चिह्न पहचानो'));
  const wrap = el('div', { class: 'game-area' });
  const display = el('div', { class:'math-display', style:'font-size:54px' });
  const opts = el('div', { class:'options' });
  let q = null;
  function newQ() {
    let a = Math.floor(Math.random()*20)+1, b = Math.floor(Math.random()*20)+1;
    while (a === b) b = Math.floor(Math.random()*20)+1;
    q = { a, b, sign: a > b ? '>' : '<' };
    display.textContent = `${a}  ?  ${b}`;
    opts.innerHTML = '';
    ['>','<','='].forEach(s => {
      const o = el('div', { class:'option-card', style:'font-size:42px' }, s);
      o.onclick = () => {
        if (s === q.sign) {
          o.classList.add('correct'); addStar(1);
          speak(T(`${a} is ${s === '>' ? 'greater than' : 'less than'} ${b}`,
                   `${a} ${b} से ${s === '>' ? 'बड़ा' : 'छोटा'} है`));
          setTimeout(newQ, 1100);
        } else {
          o.classList.add('wrong');
          setTimeout(()=>o.classList.remove('wrong'),500);
        }
      };
      opts.appendChild(o);
    });
  }
  wrap.appendChild(display);
  wrap.appendChild(opts);
  const next = el('button', { class:'btn blue' }, T('Next ▶','अगला ▶'));
  next.onclick = newQ;
  wrap.appendChild(el('div', { class:'btn-row' }, [next]));
  root.appendChild(wrap);
  newQ();
};

// ---------- MEASUREMENT (Long/Short, Heavy/Light) ----------
BUILDERS.measurement = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Measurement','मापन','Long/Short, Heavy/Light','लंबा-छोटा, भारी-हल्का'));
  const wrap = el('div', { class: 'game-area' });
  const pairs = [
    ['🐍','🐛','Long','Short','लंबा','छोटा','Snake is long, worm is short','साँप लंबा, कीड़ा छोटा'],
    ['🚂','🛴','Long','Short','लंबा','छोटा','Train is long, scooter is short','रेलगाड़ी लंबी, स्कूटर छोटा'],
    ['🐘','🐁','Heavy','Light','भारी','हल्का','Elephant is heavy, mouse is light','हाथी भारी, चूहा हल्का'],
    ['📚','🪶','Heavy','Light','भारी','हल्का','Books are heavy, feather is light','किताबें भारी, पंख हल्का'],
    ['🍉','🍓','Heavy','Light','भारी','हल्का','Watermelon is heavy, strawberry is light','तरबूज़ भारी, स्ट्रॉबेरी हल्की'],
    ['🪨','🎈','Heavy','Light','भारी','हल्का','Stone is heavy, balloon is light','पत्थर भारी, गुब्बारा हल्का']
  ];
  pairs.forEach(([a,b,en1,en2,hi1,hi2,sen_en,sen_hi]) => {
    const card = el('div', { class: 'rhyme-card' });
    card.innerHTML = `
      <div style="display:flex;justify-content:space-around;align-items:center;font-size:60px">
        <div style="text-align:center"><div>${a}</div><div style="font-size:16px;color:#1976d2;font-weight:bold">${T(en1,hi1)}</div></div>
        <div style="font-size:24px;color:#999">vs</div>
        <div style="text-align:center"><div>${b}</div><div style="font-size:16px;color:#e91e63;font-weight:bold">${T(en2,hi2)}</div></div>
      </div>
      <p style="text-align:center;margin-top:10px">${T(sen_en, sen_hi)}</p>`;
    const play = el('button', { class:'btn green' }, '🔊 ' + T('Listen','सुनें'));
    play.onclick = () => speak(T(sen_en, sen_hi));
    card.appendChild(el('div', { class:'btn-row' }, [play]));
    wrap.appendChild(card);
  });
  root.appendChild(wrap);
};

// ---------- TELL TIME (analog clock) ----------
BUILDERS.tellTime = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Tell the Time','समय देखना सीखें',
    'Read the clock','घड़ी पढ़ना सीखें'));
  const wrap = el('div', { class: 'game-area', style:'text-align:center' });
  const clockDiv = el('div', { style:'margin: 10px auto' });
  const ans = el('div', { style:'font-size:32px;color:#1976d2;font-weight:bold;margin:10px 0' });
  const opts = el('div', { class:'options' });

  function clockSVG(h, m) {
    const cx = 150, cy = 150, r = 130;
    const hourAngle = ((h % 12) + m / 60) * 30 - 90;
    const minAngle  = m * 6 - 90;
    const hr = (a, len) => `${cx + Math.cos(a*Math.PI/180)*len},${cy + Math.sin(a*Math.PI/180)*len}`;
    let ticks = '';
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 - 90;
      const x = cx + Math.cos(a*Math.PI/180) * (r - 24);
      const y = cy + Math.sin(a*Math.PI/180) * (r - 24);
      ticks += `<text x="${x}" y="${y+8}" text-anchor="middle" font-size="22" font-weight="bold" fill="#333">${i}</text>`;
    }
    return `<svg viewBox="0 0 300 300" width="280" height="280">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#ff6b9d" stroke-width="6"/>
      ${ticks}
      <line x1="${cx}" y1="${cy}" x2="${hr(hourAngle, r-60)}" stroke="#1976d2" stroke-width="8" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${hr(minAngle, r-30)}" stroke="#ff4081" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="#333"/>
    </svg>`;
  }

  let q = null;
  function newQ() {
    const h = Math.floor(Math.random()*12)+1;
    const m = [0, 15, 30, 45][Math.floor(Math.random()*4)];
    q = { h, m };
    clockDiv.innerHTML = clockSVG(h, m);
    ans.textContent = '?';
    opts.innerHTML = '';
    const correct = `${h}:${String(m).padStart(2,'0')}`;
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const dh = Math.floor(Math.random()*12)+1;
      const dm = [0,15,30,45][Math.floor(Math.random()*4)];
      choices.add(`${dh}:${String(dm).padStart(2,'0')}`);
    }
    shuffle([...choices]).forEach(c => {
      const o = el('div', { class:'option-card', style:'font-size:22px' }, c);
      o.onclick = () => {
        if (c === correct) {
          o.classList.add('correct'); addStar(1);
          ans.textContent = correct;
          const words = m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : `quarter to ${h+1}`;
          speak(words, 'en-US');
          setTimeout(newQ, 1500);
        } else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
      };
      opts.appendChild(o);
    });
  }
  wrap.appendChild(clockDiv);
  wrap.appendChild(el('p', {}, T('What time is it?','यह कौन सा समय है?')));
  wrap.appendChild(opts);
  wrap.appendChild(ans);
  root.appendChild(wrap);
  newQ();
};

// ---------- INDIAN MONEY ----------
BUILDERS.money = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Indian Money','भारतीय पैसा','Coins & Notes','सिक्के और नोट'));
  const wrap = el('div', { class: 'game-area' });
  const items = [
    ['🪙','₹1','One Rupee','एक रुपया','#9e9e9e'],
    ['🪙','₹2','Two Rupees','दो रुपये','#bdbdbd'],
    ['🪙','₹5','Five Rupees','पाँच रुपये','#ffb300'],
    ['🪙','₹10','Ten Rupees','दस रुपये','#fb8c00'],
    ['💵','₹10','Ten Rupee Note','दस का नोट','#8d6e63'],
    ['💵','₹20','Twenty Rupees','बीस रुपये','#ef6c00'],
    ['💵','₹50','Fifty Rupees','पचास रुपये','#5d4037'],
    ['💵','₹100','Hundred Rupees','सौ रुपये','#1e88e5'],
    ['💵','₹200','Two Hundred','दो सौ','#fdd835'],
    ['💵','₹500','Five Hundred','पाँच सौ','#558b2f'],
    ['💵','₹2000','Two Thousand','दो हज़ार','#c62828']
  ];
  const grid = el('div', { class: 'card-grid', style:'grid-template-columns:repeat(auto-fill,minmax(160px,1fr))' });
  items.forEach(([em, val, en, hi, color]) => {
    const card = el('div', { class:'card', style:`padding:14px;border-top:6px solid ${color}` }, [
      el('div', { style:'font-size:42px' }, em),
      el('div', { class:'big', style:'font-size:30px;color:#0d47a1' }, val),
      el('div', { class:'word' }, T(en, hi))
    ]);
    card.onclick = () => speak(T(en, hi));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  // Money quiz
  const quizCard = el('div', { class:'rhyme-card' });
  quizCard.appendChild(el('h3', {}, '🎯 ' + T('Money Quiz','पैसा क्विज़')));
  const qText = el('div', { style:'text-align:center;font-size:22px;font-weight:bold;color:#1976d2;margin:10px 0' });
  const qOpts = el('div', { class:'options' });
  function newMQ() {
    const a = Math.floor(Math.random()*10)+1;
    const b = Math.floor(Math.random()*10)+1;
    const sum = a + b;
    qText.textContent = T(`₹${a} + ₹${b} = ?`, `₹${a} + ₹${b} = ?`);
    qOpts.innerHTML = '';
    [...new Set([sum, sum+1, sum-1, sum+2])].slice(0,4).forEach(c => {
      const o = el('div', { class:'option-card' }, '₹' + c);
      o.onclick = () => {
        if (c === sum) { o.classList.add('correct'); addStar(1); speak(T(`Total is ${sum} rupees`,`कुल ${sum} रुपये`)); setTimeout(newMQ, 1100); }
        else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
      };
      qOpts.appendChild(o);
    });
  }
  quizCard.appendChild(qText);
  quizCard.appendChild(qOpts);
  wrap.appendChild(quizCard);
  root.appendChild(wrap);
  newMQ();
};

// ---------- SENTENCE FORMATION (KG2) ----------
BUILDERS.sentence = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Make Sentences','वाक्य बनाओ','Tap words in order','सही क्रम में टैप करें'));
  const wrap = el('div', { class:'game-area' });
  const SENTENCES = [
    ['I am a boy', 'मैं एक लड़का हूँ'],
    ['She is my mother', 'वह मेरी माँ है'],
    ['The cat is black', 'बिल्ली काली है'],
    ['I like to play', 'मुझे खेलना पसंद है'],
    ['We go to school', 'हम स्कूल जाते हैं'],
    ['The sun is hot', 'सूरज गरम है'],
    ['Birds can fly high', 'पक्षी ऊँचा उड़ सकते हैं'],
    ['I love my family', 'मुझे अपना परिवार पसंद है']
  ];
  let q = null;
  const display = el('div', { style:'background:#fff;border-radius:16px;padding:20px;text-align:center;font-size:22px;font-weight:bold;color:#1976d2;min-height:60px;letter-spacing:1px;box-shadow:inset 0 0 0 2px #ddd' });
  const wordRow = el('div', { class:'options' });
  function newQ() {
    const sen = T(...rand(SENTENCES));
    q = { sen, words: sen.split(' '), built: [] };
    display.textContent = '___';
    wordRow.innerHTML = '';
    shuffle(q.words).forEach(w => {
      const b = el('div', { class:'option-card', style:'font-size:18px' }, w);
      b.onclick = () => {
        q.built.push(w);
        b.style.opacity = '0.3';
        b.onclick = null;
        display.textContent = q.built.join(' ');
        if (q.built.length === q.words.length) {
          if (q.built.join(' ') === q.sen) {
            display.style.color = '#388e3c';
            speak(q.sen); addStar(2);
            setTimeout(() => { display.style.color = '#1976d2'; newQ(); }, 1700);
          } else {
            display.style.color = '#d32f2f';
            speak(T('Try again','फिर कोशिश करो'));
            setTimeout(newQ, 1500);
          }
        }
      };
      wordRow.appendChild(b);
    });
    speak(T('Build the sentence','वाक्य बनाओ'));
  }
  wrap.appendChild(display);
  wrap.appendChild(wordRow);
  const skip = el('button', { class:'btn' }, T('Skip ▶','छोड़ें ▶'));
  skip.onclick = newQ;
  wrap.appendChild(el('div', { class:'btn-row' }, [skip]));
  root.appendChild(wrap);
  newQ();
};

// ---------- READING COMPREHENSION ----------
BUILDERS.comprehension = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Reading Practice','पढ़ना और समझना',
    'Read and answer','पढ़ें और जवाब दें'));
  const wrap = el('div', { class:'game-area' });
  const PASSAGES = [
    {
      en: 'Riya has a red ball. She plays with it every day. Her friend Aman has a blue bat. They play together in the park.',
      hi: 'रिया के पास एक लाल गेंद है। वह रोज़ उससे खेलती है। उसके दोस्त अमन के पास एक नीला बल्ला है। वे पार्क में साथ खेलते हैं।',
      q_en: 'What color is the ball?',
      q_hi: 'गेंद किस रंग की है?',
      opts_en: ['Red','Blue','Green'],
      opts_hi: ['लाल','नीला','हरा'],
      ans: 0
    },
    {
      en: 'The cow gives us milk. Milk is white. We drink milk every morning. Milk makes us strong.',
      hi: 'गाय हमें दूध देती है। दूध सफ़ेद होता है। हम रोज़ सुबह दूध पीते हैं। दूध से हम मज़बूत बनते हैं।',
      q_en: 'Who gives us milk?',
      q_hi: 'हमें दूध कौन देती है?',
      opts_en: ['Goat','Cow','Cat'],
      opts_hi: ['बकरी','गाय','बिल्ली'],
      ans: 1
    },
    {
      en: 'The sun rises in the east. It sets in the west. The sun gives us light and warmth. We see during the day because of the sun.',
      hi: 'सूरज पूरब में उगता है। पश्चिम में डूबता है। सूरज हमें रोशनी और गर्मी देता है। दिन में सूरज की वजह से हम देख पाते हैं।',
      q_en: 'Where does the sun rise?',
      q_hi: 'सूरज कहाँ उगता है?',
      opts_en: ['West','East','North'],
      opts_hi: ['पश्चिम','पूरब','उत्तर'],
      ans: 1
    }
  ];
  PASSAGES.forEach(p => {
    const card = el('div', { class:'rhyme-card' });
    const passage = T(p.en, p.hi);
    const ques = T(p.q_en, p.q_hi);
    const opts = STATE.lang === 'hi' ? p.opts_hi : p.opts_en;
    card.appendChild(el('p', { style:'font-size:16px;line-height:1.7;background:#f9f9f9;padding:14px;border-radius:12px' }, passage));
    const playBtn = el('button', { class:'btn green' }, '🔊 ' + T('Read aloud','सुनाओ'));
    playBtn.onclick = () => speak(passage);
    card.appendChild(el('div', { class:'btn-row' }, [playBtn]));
    card.appendChild(el('h4', { style:'color:#ff4081;margin-top:14px' }, '❓ ' + ques));
    const oRow = el('div', { class:'options' });
    opts.forEach((o, i) => {
      const ob = el('div', { class:'option-card', style:'font-size:18px' }, o);
      ob.onclick = () => {
        if (i === p.ans) { ob.classList.add('correct'); addStar(2); speak(T('Correct!','सही!')); }
        else { ob.classList.add('wrong'); }
      };
      oRow.appendChild(ob);
    });
    card.appendChild(oRow);
    wrap.appendChild(card);
  });
  root.appendChild(wrap);
};

// ---------- WORD PROBLEMS ----------
BUILDERS.wordProblems = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Word Problems','शब्द सवाल',
    'Read and solve','पढ़कर हल करें'));
  const wrap = el('div', { class:'game-area' });
  const problems = [
    (a,b)=>({ en:`Ram has ${a} apples. His mother gives him ${b} more. How many apples does Ram have now?`,
              hi:`राम के पास ${a} सेब हैं। उसकी माँ उसे ${b} और देती है। अब राम के पास कितने सेब हैं?`,
              ans: a+b }),
    (a,b)=>({ en:`There are ${a} birds on a tree. ${b} fly away. How many are left?`,
              hi:`पेड़ पर ${a} चिड़िया हैं। ${b} उड़ जाती हैं। कितनी बची?`,
              ans: a-b, swap: true }),
    (a,b)=>({ en:`Sita has ${a} chocolates. She gives ${b} to her friend. How many chocolates left?`,
              hi:`सीता के पास ${a} चॉकलेट हैं। वह ${b} अपने दोस्त को देती है। कितनी बची?`,
              ans: a-b, swap: true }),
    (a,b)=>({ en:`A pencil costs ₹${a}. An eraser costs ₹${b}. What is the total?`,
              hi:`पेंसिल ₹${a} की है। रबर ₹${b} का है। कुल कितना?`,
              ans: a+b }),
    (a,b)=>({ en:`There are ${a} red balloons and ${b} blue balloons. How many balloons in all?`,
              hi:`${a} लाल गुब्बारे और ${b} नीले गुब्बारे हैं। कुल कितने?`,
              ans: a+b })
  ];
  function newQ() {
    let a = Math.floor(Math.random()*10)+3, b = Math.floor(Math.random()*5)+1;
    const tmpl = rand(problems);
    if (tmpl({a:1,b:1}).swap && b > a) [a,b] = [b,a];
    const p = tmpl(a,b);
    wrap.innerHTML = '';
    const text = T(p.en, p.hi);
    wrap.appendChild(el('div', { style:'background:#fff;padding:18px;border-radius:16px;font-size:18px;line-height:1.7;color:#333;box-shadow:inset 0 0 0 2px #ddd' }, text));
    const playBtn = el('button', { class:'btn green' }, '🔊 ' + T('Read','पढ़ें'));
    playBtn.onclick = () => speak(text);
    wrap.appendChild(el('div', { class:'btn-row' }, [playBtn]));
    const opts = el('div', { class:'options' });
    [...new Set([p.ans, p.ans+1, p.ans-1, p.ans+2].filter(x=>x>=0))].slice(0,4).forEach(c => {
      const o = el('div', { class:'option-card', style:'font-size:24px' }, String(c));
      o.onclick = () => {
        if (c === p.ans) { o.classList.add('correct'); addStar(2); speak(T(`The answer is ${p.ans}`,`जवाब है ${p.ans}`)); setTimeout(newQ, 1500); }
        else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
      };
      opts.appendChild(o);
    });
    wrap.appendChild(opts);
  }
  root.appendChild(wrap);
  newQ();
};

// ---------- HINDI WORDS & SENTENCES ----------
BUILDERS.hindiWords = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Hindi Words & Sentences','हिंदी शब्द और वाक्य',
    'Tap to listen','सुनने के लिए टैप करें'));
  const wrap = el('div', { class:'game-area' });

  // 2-akshar words
  const words2 = [
    ['कमल','Lotus'],['मगर','Crocodile'],['बकरा','Goat'],['नल','Tap'],
    ['घर','House'],['फल','Fruit'],['राजा','King'],['माला','Garland'],
    ['पानी','Water'],['धागा','Thread'],['कपड़ा','Cloth'],['डाली','Branch']
  ];
  const card1 = el('div', { class:'rhyme-card' });
  card1.appendChild(el('h3', {}, '📝 ' + T('Simple Words','सरल शब्द')));
  const grid1 = el('div', { class:'card-grid' });
  words2.forEach(([hi, en]) => {
    const c = el('div', { class:'card' }, [
      el('div', { class:'big', style:'font-size:36px' }, hi),
      el('div', { class:'word' }, en)
    ]);
    c.onclick = () => speak(hi, 'hi-IN');
    grid1.appendChild(c);
  });
  card1.appendChild(grid1);
  wrap.appendChild(card1);

  // Sentences
  const sentences = [
    ['राम घर जाता है।', 'Ram goes home.'],
    ['सीता पानी पीती है।', 'Sita drinks water.'],
    ['यह मेरा भाई है।', 'This is my brother.'],
    ['गाय दूध देती है।', 'Cow gives milk.'],
    ['सूरज पूरब से उगता है।', 'Sun rises from east.'],
    ['मैं स्कूल जाता हूँ।', 'I go to school.']
  ];
  const card2 = el('div', { class:'rhyme-card' });
  card2.appendChild(el('h3', {}, '📜 ' + T('Sentences','वाक्य')));
  sentences.forEach(([hi, en]) => {
    const row = el('div', { style:'background:#f5f5f5;padding:10px 14px;border-radius:12px;margin:6px 0;cursor:pointer' });
    row.innerHTML = `<div style="font-size:18px;color:#1976d2;font-weight:bold">${hi}</div><div style="font-size:14px;color:#666">${en}</div>`;
    row.onclick = () => speak(hi, 'hi-IN');
    card2.appendChild(row);
  });
  wrap.appendChild(card2);
  root.appendChild(wrap);
};

// ---------- GENERAL KNOWLEDGE Q&A ----------
BUILDERS.gk = (root) => {
  root.innerHTML = '';
  root.appendChild(header('General Knowledge','सामान्य ज्ञान',
    'India & World facts','भारत और दुनिया'));
  const wrap = el('div', { class:'game-area' });
  const GK = [
    {q_en:'Which is the national bird of India?',q_hi:'भारत का राष्ट्रीय पक्षी कौन सा है?',
     opts:[['Crow','कौआ'],['Peacock','मोर'],['Sparrow','गौरैया']], ans:1},
    {q_en:'Which is the national animal of India?',q_hi:'भारत का राष्ट्रीय पशु कौन सा है?',
     opts:[['Lion','शेर'],['Elephant','हाथी'],['Tiger','बाघ']], ans:2},
    {q_en:'Which is the national flower of India?',q_hi:'भारत का राष्ट्रीय फूल कौन सा है?',
     opts:[['Rose','गुलाब'],['Lotus','कमल'],['Sunflower','सूरजमुखी']], ans:1},
    {q_en:'Which is the national fruit of India?',q_hi:'भारत का राष्ट्रीय फल कौन सा है?',
     opts:[['Apple','सेब'],['Banana','केला'],['Mango','आम']], ans:2},
    {q_en:'How many colors are in Indian flag?',q_hi:'भारतीय झंडे में कितने रंग हैं?',
     opts:[['2','२'],['3','३'],['4','४']], ans:1},
    {q_en:'Which planet do we live on?',q_hi:'हम किस ग्रह पर रहते हैं?',
     opts:[['Mars','मंगल'],['Earth','पृथ्वी'],['Moon','चाँद']], ans:1},
    {q_en:'How many days are in a week?',q_hi:'एक सप्ताह में कितने दिन होते हैं?',
     opts:[['5','५'],['7','७'],['10','१०']], ans:1},
    {q_en:'How many months are in a year?',q_hi:'एक साल में कितने महीने होते हैं?',
     opts:[['10','१०'],['12','१२'],['15','१५']], ans:1},
    {q_en:'Which is the largest animal on land?',q_hi:'धरती पर सबसे बड़ा जानवर कौन सा है?',
     opts:[['Elephant','हाथी'],['Lion','शेर'],['Cow','गाय']], ans:0},
    {q_en:'Who wrote the Indian national anthem?',q_hi:'भारत का राष्ट्रगान किसने लिखा?',
     opts:[['Tagore','टैगोर'],['Gandhi','गाँधी'],['Nehru','नेहरू']], ans:0},
    {q_en:'Which is the fastest animal?',q_hi:'सबसे तेज़ जानवर कौन सा है?',
     opts:[['Tiger','बाघ'],['Cheetah','चीता'],['Horse','घोड़ा']], ans:1},
    {q_en:'Which gives us light during the day?',q_hi:'दिन में हमें रोशनी कौन देता है?',
     opts:[['Moon','चाँद'],['Stars','तारे'],['Sun','सूरज']], ans:2}
  ];
  let i = 0, score = 0;
  const scoreEl = el('div', { style:'text-align:center;font-weight:bold;color:#1976d2;font-size:18px' });
  function showQ() {
    if (i >= GK.length) {
      wrap.innerHTML = '';
      wrap.appendChild(el('h2', { style:'text-align:center;color:#ff4081' },
        T(`Final Score: ${score}/${GK.length} 🎉`,`अंतिम स्कोर: ${score}/${GK.length} 🎉`)));
      addStar(score);
      const again = el('button', { class:'btn green' }, T('Play Again','फिर खेलें'));
      again.onclick = () => { i=0; score=0; wrap.innerHTML=''; wrap.appendChild(scoreEl); showQ(); };
      wrap.appendChild(el('div', { class:'btn-row' }, [again]));
      return;
    }
    const q = GK[i];
    wrap.innerHTML = '';
    scoreEl.textContent = T('Question ','प्रश्न ') + (i+1) + '/' + GK.length + ' | ⭐ ' + score;
    wrap.appendChild(scoreEl);
    const ques = T(q.q_en, q.q_hi);
    wrap.appendChild(el('h3', { style:'text-align:center;color:#ff4081;margin:14px 0' }, '🌟 ' + ques));
    speak(ques);
    const opts = el('div', { class:'options' });
    q.opts.forEach(([en, hi], idx) => {
      const o = el('div', { class:'option-card', style:'font-size:18px' }, T(en, hi));
      o.onclick = () => {
        if (idx === q.ans) { o.classList.add('correct'); score++; speak(T('Correct!','सही!')); }
        else { o.classList.add('wrong'); speak(T('Wrong','गलत')); }
        setTimeout(() => { i++; showQ(); }, 1300);
      };
      opts.appendChild(o);
    });
    wrap.appendChild(opts);
  }
  wrap.appendChild(scoreEl);
  root.appendChild(wrap);
  showQ();
};

// ============================================================
// =================== PROFILES + STREAK =====================
// ============================================================
function profileKey(k) { const p = localStorage.getItem('activeProfile') || 'default'; return `p_${p}_${k}`; }

function loadProfile() {
  STATE.stars = parseInt(localStorage.getItem(profileKey('stars')) || '0');
  setStars();
  updateStreak();
}
const _origAddStar = addStar;
addStar = function(n=1) {
  if (n <= 0) return;
  STATE.stars += n;
  localStorage.setItem(profileKey('stars'), STATE.stars);
  document.getElementById('stars').textContent = '⭐ ' + STATE.stars;
  showToast('🎉 +' + n + ' Star!');
  // Mark today as active for streak
  const today = new Date().toDateString();
  localStorage.setItem(profileKey('lastActive'), today);
};

function updateStreak() {
  const today = new Date().toDateString();
  const last = localStorage.getItem(profileKey('lastActive'));
  let streak = parseInt(localStorage.getItem(profileKey('streak')) || '0');
  if (last === today) {
    // already active today
  } else if (last === new Date(Date.now() - 86400000).toDateString()) {
    streak += 1;
  } else if (last) {
    streak = 1;
  } else {
    streak = 0;
  }
  localStorage.setItem(profileKey('streak'), streak);
  // show in topbar
  let s = document.getElementById('streakBadge');
  if (!s) {
    s = document.createElement('span');
    s.id = 'streakBadge'; s.className = 'streak';
    document.querySelector('.topright').insertBefore(s, document.getElementById('stars'));
  }
  s.textContent = '🔥 ' + streak;
  s.style.display = streak > 0 ? '' : 'none';
}

// ---------- DARK MODE ----------
if (localStorage.getItem('dark') === '1') document.body.classList.add('dark');
document.getElementById('darkBtn').onclick = () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('dark', isDark ? '1' : '0');
  document.getElementById('darkBtn').textContent = isDark ? '☀️' : '🌙';
};
document.getElementById('darkBtn').textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

// ---------- PROFILE BUTTON ----------
document.getElementById('profileBtn').onclick = () => go('profiles');

// ============================================================
// =================== THEME SYSTEM ==========================
// ============================================================
const THEMES = ['sunset','ocean','forest','candy','space'];
const THEME_INFO = {
  sunset: { en:'Sunset', hi:'सूर्यास्त', em:'🌅' },
  ocean:  { en:'Ocean',  hi:'समुद्र',   em:'🌊' },
  forest: { en:'Forest', hi:'वन',       em:'🌳' },
  candy:  { en:'Candy',  hi:'कैंडी',    em:'🍭' },
  space:  { en:'Space',  hi:'अंतरिक्ष', em:'🌌' }
};
function applyTheme(t) {
  THEMES.forEach(x => document.body.classList.remove('theme-' + x));
  if (t && t !== 'sunset') document.body.classList.add('theme-' + t);
  localStorage.setItem('theme', t);
  STATE.theme = t;
}
STATE.theme = localStorage.getItem('theme') || 'sunset';
applyTheme(STATE.theme);
document.getElementById('themeBtn').onclick = () => go('themesScreen');

// ============================================================
// =================== BACKGROUND MUSIC =====================
// ============================================================
STATE.music = localStorage.getItem('music') === '1';
let _musicNodes = null;
function startMusic() {
  if (_musicNodes) return;
  try {
    const ctx = getAudio();
    const master = ctx.createGain(); master.gain.value = 0.04;
    master.connect(ctx.destination);
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    let i = 0;
    const t = setInterval(() => {
      if (!STATE.music || STATE.muted) return;
      const f = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(g); g.connect(master);
      osc.start(); osc.stop(ctx.currentTime + 0.7);
      i++;
    }, 700);
    _musicNodes = { master, t };
  } catch(e) {}
}
function stopMusic() {
  if (!_musicNodes) return;
  clearInterval(_musicNodes.t);
  try { _musicNodes.master.disconnect(); } catch(e){}
  _musicNodes = null;
}
function toggleMusic() {
  STATE.music = !STATE.music;
  localStorage.setItem('music', STATE.music ? '1' : '0');
  document.getElementById('musicBtn').textContent = STATE.music ? '🎵' : '🎶';
  document.getElementById('musicBtn').style.opacity = STATE.music ? '1' : '0.45';
  if (STATE.music) startMusic(); else stopMusic();
}
document.getElementById('musicBtn').onclick = toggleMusic;
document.getElementById('musicBtn').textContent = STATE.music ? '🎵' : '🎶';
document.getElementById('musicBtn').style.opacity = STATE.music ? '1' : '0.45';
if (STATE.music) {
  // start on first user interaction (autoplay block)
  const startOnce = () => { startMusic(); document.removeEventListener('click', startOnce); };
  document.addEventListener('click', startOnce);
}

// ============================================================
// =================== CONFETTI ==============================
// ============================================================
const _confCanvas = document.getElementById('confetti');
const _confCtx = _confCanvas.getContext('2d');
function fireConfetti(amount = 80) {
  _confCanvas.width = window.innerWidth;
  _confCanvas.height = window.innerHeight;
  _confCanvas.classList.add('show');
  const colors = ['#ff4081','#42a5f5','#ffa726','#66bb6a','#ab47bc','#ff5722','#ffeb3b'];
  const particles = [];
  for (let i = 0; i < amount; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      g: 0.3 + Math.random() * 0.2,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 100 + Math.random() * 50
    });
  }
  let frame = 0;
  function step() {
    frame++;
    _confCtx.clearRect(0, 0, _confCanvas.width, _confCanvas.height);
    let alive = 0;
    particles.forEach(p => {
      if (p.life <= 0) return;
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
      _confCtx.save();
      _confCtx.translate(p.x, p.y); _confCtx.rotate(p.rot);
      _confCtx.fillStyle = p.color;
      _confCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.5);
      _confCtx.restore();
      alive++;
    });
    if (alive > 0 && frame < 200) requestAnimationFrame(step);
    else _confCanvas.classList.remove('show');
  }
  step();
  tone(660, 0.15, 'triangle', 0.2);
  setTimeout(() => tone(880, 0.2, 'triangle', 0.2), 120);
}

// ============================================================
// =================== MASCOT ================================
// ============================================================
const MASCOT_CHARS = ['🦉','🐰','🦊','🐻','🐼','🦄','🐯','🐨'];
const MASCOT_TIPS_EN = [
  "Tap a chapter to start!",
  "Try Today's Lesson — 5 fun activities!",
  "You're doing great! ⭐",
  "Want to switch theme? Tap 🎨",
  "Earn stars to collect pets!",
  "Practice daily to keep your streak 🔥",
  "Parents — check 🔐 for dashboard"
];
const MASCOT_TIPS_HI = [
  "अध्याय पर टैप करो!",
  "आज का पाठ देखो — 5 मज़ेदार गतिविधियाँ!",
  "बहुत बढ़िया! ⭐",
  "थीम बदलना है? 🎨 दबाओ",
  "तारे जीतकर पालतू इकट्ठा करो!",
  "रोज़ अभ्यास करके स्ट्रीक बनाए रखो 🔥",
  "पैरेंट्स — डैशबोर्ड के लिए 🔐 दबाएँ"
];
function setMascot(char) {
  const m = localStorage.getItem('mascot') || char || MASCOT_CHARS[0];
  document.getElementById('mascotChar').textContent = m;
}
function showMascot(msgEn, msgHi, durationMs = 3500) {
  const m = document.getElementById('mascot');
  const b = document.getElementById('mascotBubble');
  b.textContent = T(msgEn, msgHi);
  m.classList.remove('hidden');
  b.classList.add('show');
  clearTimeout(showMascot._t);
  showMascot._t = setTimeout(() => {
    b.classList.remove('show');
  }, durationMs);
}
function hideMascot() {
  document.getElementById('mascot').classList.add('hidden');
  document.getElementById('mascotBubble').classList.remove('show');
}
document.getElementById('mascotChar').onclick = () => {
  const i = Math.floor(Math.random() * MASCOT_TIPS_EN.length);
  showMascot(MASCOT_TIPS_EN[i], MASCOT_TIPS_HI[i]);
};
setMascot();
// Show mascot on class home only
function updateMascotVisibility() {
  if (STATE.current === 'classHome' || STATE.current === 'chapterHome') {
    document.getElementById('mascot').classList.remove('hidden');
  } else {
    document.getElementById('mascot').classList.add('hidden');
  }
}

// ============================================================
// =================== ACHIEVEMENT POPUP =====================
// ============================================================
function showAchievement(icon, titleEn, titleHi, subEn, subHi) {
  document.getElementById('achieveIcon').textContent = icon;
  document.getElementById('achieveTitle').textContent = T(titleEn, titleHi);
  document.getElementById('achieveSub').textContent = T(subEn, subHi);
  document.getElementById('achievePop').classList.add('show');
  fireConfetti(120);
  speak(T(titleEn, titleHi));
}
document.getElementById('achieveClose').onclick = () => {
  document.getElementById('achievePop').classList.remove('show');
};
document.getElementById('achieveShare').onclick = async () => {
  const title = document.getElementById('achieveTitle').textContent;
  const sub = document.getElementById('achieveSub').textContent;
  const text = `🏆 ${title} - ${sub}\n\nKids Learning App`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Achievement', text }); } catch(e){}
  } else {
    try {
      await navigator.clipboard.writeText(text);
      showToast(T('Copied! Share with friends','कॉपी हो गया!'));
    } catch(e) { showToast(text); }
  }
};

// ============================================================
// =================== ACHIEVEMENT TRIGGERS ==================
// ============================================================
const ACHIEVEMENTS = [
  { stars: 10,  icon:'🥉', en:'Beginner Badge!',  hi:'शुरुआती बैज!',  subEn:'10 stars earned',   subHi:'10 तारे जीते' },
  { stars: 25,  icon:'🥈', en:'Learner Badge!',   hi:'शिक्षार्थी बैज!',subEn:'25 stars earned',   subHi:'25 तारे जीते' },
  { stars: 50,  icon:'🥇', en:'Smart Kid!',       hi:'होशियार!',      subEn:'50 stars earned',   subHi:'50 तारे जीते' },
  { stars: 100, icon:'🏆', en:'Champion!',         hi:'चैंपियन!',      subEn:'100 stars earned',  subHi:'100 तारे जीते' },
  { stars: 200, icon:'👑', en:'Genius!',           hi:'प्रतिभावान!',  subEn:'200 stars earned',  subHi:'200 तारे जीते' },
  { stars: 500, icon:'💎', en:'Diamond Master!',   hi:'हीरा मास्टर!',  subEn:'500 stars earned',  subHi:'500 तारे जीते' }
];
function checkAchievements(prev, now) {
  ACHIEVEMENTS.forEach(a => {
    if (prev < a.stars && now >= a.stars) {
      const key = profileKey('ach_' + a.stars);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        setTimeout(() => showAchievement(a.icon, a.en, a.hi, a.subEn, a.subHi), 300);
      }
    }
  });
}

// ============================================================
// =================== ACTIVITY COMPLETION TRACKING ==========
// ============================================================
function markActivityVisited(screenId) {
  const key = profileKey('visited');
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[screenId] = Date.now();
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(profileKey('lastScreen'), screenId);
  // Track screen time
  const today = new Date().toDateString();
  const tk = profileKey('screenTime_' + today);
  // increment 1 minute per visit (rough)
  const now = parseInt(localStorage.getItem(tk) || '0');
  localStorage.setItem(tk, now + 1);
}
function chapterProgress(chapterId) {
  const list = chaptersForClass();
  const ch = list.find(c => c.id === chapterId);
  if (!ch) return 0;
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  const done = ch.subjects.filter(s => visited[s.s]).length;
  return Math.round((done / ch.subjects.length) * 100);
}

// Wrap addStar to also fire confetti + check achievements
const _NON_LEARNING = new Set(['classSelect','classHome','chapterHome','todayLesson',
  'parentZone','parentDashboard','themesScreen','profiles','avatarBuilder','settings']);
const _addStar2 = addStar;
addStar = function(n=1) {
  const before = STATE.stars;
  _addStar2(n);
  if (n >= 2) fireConfetti(40);
  if (STATE.current && !_NON_LEARNING.has(STATE.current)) {
    markActivityVisited(STATE.current);
  }
  checkAchievements(before, STATE.stars);
};

// ============================================================
// =================== PARENT ZONE ===========================
// ============================================================
document.getElementById('parentBtn').onclick = () => go('parentZone');
function getParentPin() { return localStorage.getItem('parentPin') || '1234'; }

BUILDERS.parentZone = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🔐 Parent Zone','🔐 अभिभावक क्षेत्र','Enter PIN to continue','जारी रखने के लिए PIN डालें'));
  const wrap = el('div', { class:'game-area', style:'max-width:380px' });
  const display = el('div', { class:'pin-display' }, '');
  let entered = '';
  wrap.appendChild(display);
  wrap.appendChild(el('p', { style:'text-align:center;color:#666;font-size:13px' },
    T(`Default PIN: ${getParentPin() === '1234' ? '1234' : '****'} (change in dashboard)`,
      `डिफ़ॉल्ट PIN: ${getParentPin() === '1234' ? '1234' : '****'} (डैशबोर्ड में बदलें)`)));
  const pad = el('div', { class:'pin-pad' });
  ['1','2','3','4','5','6','7','8','9','⌫','0','✓'].forEach(k => {
    const btn = el('button', { class:'pin-key' }, k);
    btn.onclick = () => {
      if (k === '⌫') { entered = entered.slice(0, -1); }
      else if (k === '✓') {
        if (entered === getParentPin()) {
          go('parentDashboard');
        } else {
          display.style.color = '#f44336';
          showToast(T('Wrong PIN','गलत PIN'));
          entered = '';
          setTimeout(() => display.style.color = '', 800);
        }
      } else if (entered.length < 4) {
        entered += k;
      }
      display.textContent = '•'.repeat(entered.length);
    };
    pad.appendChild(btn);
  });
  wrap.appendChild(pad);
  root.appendChild(wrap);
};

BUILDERS.parentDashboard = (root) => {
  root.innerHTML = '';
  root.appendChild(header('📊 Parent Dashboard','📊 अभिभावक डैशबोर्ड',
    'Track learning progress','सीखने की प्रगति देखें'));
  const wrap = el('div', { class:'game-area' });

  // Profile selector
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const active = localStorage.getItem('activeProfile') || 'default';
  const activeP = profiles.find(p => p.id === active) || { name:'Kid 1', emoji:'🧒' };
  wrap.appendChild(el('div', { style:'text-align:center;margin-bottom:14px' }, [
    el('div', { style:'font-size:50px' }, activeP.emoji),
    el('h3', { style:'color:var(--primary)' }, activeP.name)
  ]));

  // Quick stats
  const stars = parseInt(localStorage.getItem(profileKey('stars')) || '0');
  const streak = parseInt(localStorage.getItem(profileKey('streak')) || '0');
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  const today = new Date().toDateString();
  const todayMin = parseInt(localStorage.getItem(profileKey('screenTime_' + today)) || '0');
  const totalMin = (() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`p_${active}_screenTime_`)) total += parseInt(localStorage.getItem(k) || '0');
    }
    return total;
  })();
  const grid = el('div', { class:'dash-grid' });
  [['⭐', stars, T('Total Stars','कुल तारे')],
   ['🔥', streak, T('Day Streak','दिन स्ट्रीक')],
   ['📚', Object.keys(visited).length, T('Topics Tried','विषय आज़माए')],
   ['⏰', todayMin + 'm', T('Today','आज')],
   ['🕐', totalMin + 'm', T('All Time','कुल समय')]
  ].forEach(([icon, val, lbl]) => {
    grid.appendChild(el('div', { class:'dash-stat' }, [
      el('div', { style:'font-size:24px' }, icon),
      el('div', { class:'v' }, String(val)),
      el('div', { class:'l' }, lbl)
    ]));
  });
  wrap.appendChild(grid);

  // Streak calendar (last 14 days)
  const calBox = el('div', { class:'rhyme-card' });
  calBox.appendChild(el('h3', {}, '📅 ' + T('Activity (last 14 days)','गतिविधि (पिछले 14 दिन)')));
  const cal = el('div', { class:'streak-cal' });
  const todayD = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayD); d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const min = parseInt(localStorage.getItem(profileKey('screenTime_' + ds)) || '0');
    const cls = 'streak-day' + (min > 0 ? ' active' : '') + (i === 0 ? ' today' : '');
    cal.appendChild(el('div', { class: cls }, d.getDate() + ''));
  }
  calBox.appendChild(cal);
  wrap.appendChild(calBox);

  // Screen time limit
  const limitMin = parseInt(localStorage.getItem('screenLimitMin') || '0');
  const limitBox = el('div', { class:'rhyme-card' });
  limitBox.appendChild(el('h3', {}, '⏱️ ' + T('Screen Time Limit','समय सीमा')));
  limitBox.appendChild(el('p', { style:'font-size:13px;color:#666;margin-bottom:8px' },
    limitMin > 0
      ? T(`Today: ${todayMin}/${limitMin} min`, `आज: ${todayMin}/${limitMin} मिनट`)
      : T('No limit set','कोई सीमा नहीं')));
  const limRow = el('div', { class:'btn-row' });
  [0, 15, 30, 45, 60].forEach(m => {
    const b = el('button', { class:'btn' + (limitMin === m ? ' green' : '') },
      m === 0 ? T('Off','बंद') : (m + 'm'));
    b.onclick = () => {
      localStorage.setItem('screenLimitMin', m);
      BUILDERS.parentDashboard(root);
    };
    limRow.appendChild(b);
  });
  limitBox.appendChild(limRow);
  wrap.appendChild(limitBox);

  // PIN change
  const pinBox = el('div', { class:'rhyme-card' });
  pinBox.appendChild(el('h3', {}, '🔑 ' + T('Change Parent PIN','PIN बदलें')));
  const pinBtn = el('button', { class:'btn orange' }, T('Set New PIN','नया PIN सेट करें'));
  pinBtn.onclick = () => {
    const np = prompt(T('Enter new 4-digit PIN:','नया 4-अंक PIN:'), '');
    if (np && /^\d{4}$/.test(np)) {
      localStorage.setItem('parentPin', np);
      showToast(T('PIN updated!','PIN बदल गया!'));
    } else if (np) {
      showToast(T('Must be 4 digits','4 अंक होने चाहिए'));
    }
  };
  pinBox.appendChild(el('div', { class:'btn-row' }, [pinBtn]));
  wrap.appendChild(pinBox);

  // Backup / Restore
  const backupBox = el('div', { class:'rhyme-card' });
  backupBox.appendChild(el('h3', {}, '💾 ' + T('Backup & Restore','बैकअप')));
  const exp = el('button', { class:'btn green' }, '⬇️ ' + T('Export','निर्यात'));
  exp.onclick = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kids-app-backup-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast(T('Backup downloaded','बैकअप डाउनलोड हो गया'));
  };
  const imp = el('button', { class:'btn blue' }, '⬆️ ' + T('Import','आयात'));
  imp.onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (confirm(T('Replace all current data?','सब डेटा बदलें?'))) {
            localStorage.clear();
            Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
            location.reload();
          }
        } catch(e) { showToast(T('Invalid file','गलत फ़ाइल')); }
      };
      r.readAsText(f);
    };
    inp.click();
  };
  backupBox.appendChild(el('div', { class:'btn-row' }, [exp, imp]));
  wrap.appendChild(backupBox);

  // Difficulty
  const diff = localStorage.getItem('difficulty') || 'medium';
  const diffBox = el('div', { class:'rhyme-card' });
  diffBox.appendChild(el('h3', {}, '🎯 ' + T('Difficulty Level','कठिनाई')));
  const dr = el('div', { class:'diff-row' });
  ['easy','medium','hard'].forEach(d => {
    const labels = { easy:['Easy','आसान'], medium:['Medium','मध्यम'], hard:['Hard','कठिन'] };
    const b = el('button', { class:'diff-btn' + (diff === d ? ' active' : '') }, T(labels[d][0], labels[d][1]));
    b.onclick = () => { localStorage.setItem('difficulty', d); BUILDERS.parentDashboard(root); };
    dr.appendChild(b);
  });
  diffBox.appendChild(dr);
  wrap.appendChild(diffBox);

  // Reset
  const resetBox = el('div', { class:'rhyme-card' });
  resetBox.appendChild(el('h3', {}, '🗑️ ' + T('Danger Zone','खतरनाक क्षेत्र')));
  const r1 = el('button', { class:'btn', style:'background:#fff;color:#f57c00;box-shadow:0 4px 0 #ddd' }, T('Reset Stars Only','सिर्फ़ तारे रीसेट'));
  r1.onclick = () => {
    if (confirm(T('Reset stars for current child?','इस बच्चे के तारे रीसेट?'))) {
      STATE.stars = 0; localStorage.setItem(profileKey('stars'), 0); setStars();
    }
  };
  const r2 = el('button', { class:'btn', style:'background:#fff;color:#d32f2f;box-shadow:0 4px 0 #ddd' }, T('Wipe All Data','सब हटाएँ'));
  r2.onclick = () => {
    if (confirm(T('Delete ALL data for ALL kids?','सब बच्चों का सब डेटा हटाएँ?'))) {
      localStorage.clear(); location.reload();
    }
  };
  resetBox.appendChild(el('div', { class:'btn-row' }, [r1, r2]));
  wrap.appendChild(resetBox);

  root.appendChild(wrap);
};

// ============================================================
// =================== THEMES SCREEN =========================
// ============================================================
BUILDERS.themesScreen = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🎨 Themes','🎨 थीम','Pick your favorite look','अपनी पसंदीदा थीम चुनें'));
  const wrap = el('div', { class:'game-area' });
  const grid = el('div', { class:'theme-grid' });
  THEMES.forEach(t => {
    const info = THEME_INFO[t];
    const tile = el('div', { class:'theme-tile t-' + t + (STATE.theme === t ? ' active' : '') }, [
      el('div', { class:'te' }, info.em),
      el('div', {}, T(info.en, info.hi))
    ]);
    tile.onclick = () => { applyTheme(t); BUILDERS.themesScreen(root); showToast(T(info.en, info.hi)); };
    grid.appendChild(tile);
  });
  wrap.appendChild(grid);

  // Mascot character picker
  const mb = el('div', { class:'rhyme-card' });
  mb.appendChild(el('h3', {}, '🦉 ' + T('Choose Helper','सहायक चुनें')));
  const mg = el('div', { class:'avatar-grid' });
  const cur = localStorage.getItem('mascot') || MASCOT_CHARS[0];
  MASCOT_CHARS.forEach(em => {
    const c = el('div', { class:'avatar-pick' + (em === cur ? ' active' : '') }, em);
    c.onclick = () => {
      localStorage.setItem('mascot', em);
      setMascot();
      BUILDERS.themesScreen(root);
      showMascot('Hi! I am your new helper!','नमस्ते! मैं आपका नया सहायक हूँ!');
    };
    mg.appendChild(c);
  });
  mb.appendChild(mg);
  wrap.appendChild(mb);

  root.appendChild(wrap);
};

// ============================================================
// =================== DAILY CHALLENGE =======================
// ============================================================
BUILDERS.dailyChallenge = (root) => {
  root.innerHTML = '';
  root.appendChild(header('⚡ Daily Challenge','⚡ रोज़ की चुनौती',
    'Answer 5 quick questions','5 तेज़ सवाल'));
  const wrap = el('div', { class:'game-area' });
  const today = new Date().toDateString();
  const doneKey = profileKey('dchal_' + today);
  if (localStorage.getItem(doneKey)) {
    wrap.appendChild(el('div', { style:'text-align:center;padding:20px' }, [
      el('div', { style:'font-size:60px' }, '✅'),
      el('h3', {}, T('Done for today!','आज पूरा!')),
      el('p', { style:'color:#666' }, T('Come back tomorrow for new challenge','कल नई चुनौती के लिए वापस आना'))
    ]));
    root.appendChild(wrap); return;
  }
  let qIdx = 0, correct = 0;
  const questions = [];
  // Generate 5 mixed: math + alphabet + colors
  for (let i = 0; i < 3; i++) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    const opts = shuffle([a + b, a + b + 1, a + b - 1, a + b + 2]);
    questions.push({ q: `${a} + ${b} = ?`, opts: opts.map(String), ans: String(a + b) });
  }
  const letters = shuffle(ALPHABET).slice(0, 2);
  letters.forEach(([l, en, hi, em]) => {
    const wrong = shuffle(ALPHABET.filter(x => x[0] !== l)).slice(0, 3).map(x => x[3]);
    questions.push({ q: T(`What starts with ${l}?`, `${l} से क्या शुरू?`), opts: shuffle([em, ...wrong]), ans: em });
  });

  const qBox = el('div');
  function showQ() {
    qBox.innerHTML = '';
    if (qIdx >= questions.length) {
      localStorage.setItem(doneKey, '1');
      addStar(correct * 2);
      qBox.appendChild(el('div', { style:'text-align:center' }, [
        el('div', { style:'font-size:80px' }, correct >= 4 ? '🏆' : '🎉'),
        el('h2', {}, T(`Score: ${correct}/${questions.length}`, `स्कोर: ${correct}/${questions.length}`)),
        el('p', { style:'margin:10px 0' }, T(`+${correct * 2} stars earned!`, `+${correct * 2} तारे जीते!`))
      ]));
      fireConfetti(150);
      return;
    }
    const q = questions[qIdx];
    qBox.appendChild(el('div', { style:'text-align:center;font-size:14px;color:#666' }, `${qIdx + 1} / ${questions.length}`));
    qBox.appendChild(el('div', { class:'math-display' }, q.q));
    const opts = el('div', { class:'options' });
    q.opts.forEach(o => {
      const b = el('div', { class:'option-card' }, o);
      b.onclick = () => {
        if (o === q.ans) { b.classList.add('correct'); correct++; addStar(1); }
        else { b.classList.add('wrong'); }
        setTimeout(() => { qIdx++; showQ(); }, 800);
      };
      opts.appendChild(b);
    });
    qBox.appendChild(opts);
  }
  wrap.appendChild(qBox);
  root.appendChild(wrap);
  showQ();
};

// ============================================================
// =================== WORD BUILDER ==========================
// ============================================================
BUILDERS.wordBuilder = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🔤 Word Builder','🔤 शब्द बनाओ','Tap letters in order','क्रम से अक्षर दबाओ'));
  const wrap = el('div', { class:'game-area' });
  const wordsPool = ALPHABET.map(([l, en]) => en).filter(w => w.length >= 3 && w.length <= 6);
  let currentWord = '';
  let placed = '';
  const slotsBox = el('div', { style:'text-align:center;margin:14px 0' });
  const lettersBox = el('div', { style:'text-align:center;margin:14px 0' });
  const hintBox = el('div', { style:'text-align:center;font-size:18px;color:#666;margin-bottom:8px' });

  function newWord() {
    currentWord = wordsPool[Math.floor(Math.random() * wordsPool.length)].toUpperCase();
    placed = '';
    const letterMatch = ALPHABET.find(a => a[1].toUpperCase() === currentWord);
    hintBox.textContent = letterMatch ? `${letterMatch[3]} ${T(letterMatch[1], letterMatch[2])}` : currentWord;
    render();
  }
  function render() {
    slotsBox.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
      const s = el('div', { class:'wb-slot' }, placed[i] || '');
      slotsBox.appendChild(s);
    }
    lettersBox.innerHTML = '';
    const all = currentWord.split('').concat(shuffle(ALPHABET.map(a => a[0])).slice(0, 3));
    shuffle(all).forEach((l, i) => {
      const used = placed.includes(l) && placed.split('').filter(x => x === l).length >= currentWord.split('').filter(x => x === l).length;
      const b = el('div', { class:'wb-letter' + (used ? ' used' : '') }, l);
      b.onclick = () => {
        if (placed.length >= currentWord.length) return;
        const next = currentWord[placed.length];
        if (l === next) {
          placed += l;
          tone(660, 0.15);
          if (placed === currentWord) {
            speak(currentWord);
            addStar(2);
            fireConfetti(60);
            setTimeout(newWord, 1500);
          } else render();
        } else {
          tone(220, 0.2, 'sawtooth');
          showToast(T('Try again','फिर से'));
        }
      };
      lettersBox.appendChild(b);
    });
  }
  wrap.appendChild(hintBox);
  wrap.appendChild(slotsBox);
  wrap.appendChild(lettersBox);
  const sk = el('button', { class:'btn' }, T('Skip','छोड़ो'));
  sk.onclick = newWord;
  wrap.appendChild(el('div', { class:'btn-row' }, [sk]));
  root.appendChild(wrap);
  newWord();
};

// ============================================================
// =================== AVATAR BUILDER ========================
// ============================================================
BUILDERS.avatarBuilder = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🧑 Choose Avatar','🧑 अवतार चुनें','Pick your character','अपना अवतार चुनें'));
  const wrap = el('div', { class:'game-area' });
  const avatars = ['🧒','👧','👦','🧑','👶','👨','👩','🧓','👴','👵',
                   '🦊','🐰','🐯','🐼','🦁','🐶','🐱','🐭','🐻','🐨',
                   '🦄','🐲','🐉','🦖','🦕','🐢','🐧','🦅','🦉','🦋',
                   '⭐','🌟','💫','🌈','🌸','🌻','🍓','🍎','🎈','🎁'];
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const active = localStorage.getItem('activeProfile') || 'default';
  const me = profiles.find(p => p.id === active) || { emoji:'🧒' };

  wrap.appendChild(el('div', { style:'text-align:center;font-size:80px;margin:10px' }, me.emoji));
  const grid = el('div', { class:'avatar-grid' });
  avatars.forEach(em => {
    const t = el('div', { class:'avatar-pick' + (em === me.emoji ? ' active' : '') }, em);
    t.onclick = () => {
      const idx = profiles.findIndex(p => p.id === active);
      if (idx >= 0) {
        profiles[idx].emoji = em;
        localStorage.setItem('profiles', JSON.stringify(profiles));
        BUILDERS.avatarBuilder(root);
        showToast(T('Avatar saved!','अवतार सेव हो गया!'));
      }
    };
    grid.appendChild(t);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
};

// ============================================================
// =================== AUDIO HELPERS =========================
// ============================================================
let audioCtx = null;
function getAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function tone(freq, dur=0.3, type='sine', vol=0.3) {
  if (STATE.muted) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function noiseBurst(dur=0.5, vol=0.2) {
  if (STATE.muted) return;
  try {
    const ctx = getAudio();
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * vol;
    const src = ctx.createBufferSource(); src.buffer = buf;
    src.connect(ctx.destination); src.start();
  } catch (e) {}
}

// ============================================================
// =================== BUILDERS ==============================
// ============================================================

// ---------- ANIMAL SOUNDS (TTS-based) ----------
const ANIMAL_SOUNDS = [
  ['🐶','Dog','कुत्ता','Woof Woof Woof','भौं भौं'],
  ['🐱','Cat','बिल्ली','Meow Meow','म्याऊँ म्याऊँ'],
  ['🐮','Cow','गाय','Moo Moo Moo','मूँ मूँ'],
  ['🐷','Pig','सूअर','Oink Oink','घुर घुर'],
  ['🐴','Horse','घोड़ा','Neigh Neigh','हिनहिनाहट'],
  ['🐑','Sheep','भेड़','Baa Baa Baa','बाँ बाँ'],
  ['🐐','Goat','बकरी','Maa Maa Maa','में में'],
  ['🦁','Lion','शेर','Roar! Roar!','दहाड़'],
  ['🐯','Tiger','बाघ','Growl Growl','गुर्राहट'],
  ['🐘','Elephant','हाथी','Trumpet sound','चिंघाड़'],
  ['🐸','Frog','मेंढक','Ribbit Ribbit','टर्र टर्र'],
  ['🐦','Bird','चिड़िया','Tweet Tweet','चहचहाहट'],
  ['🦆','Duck','बत्तख','Quack Quack','क्वैक क्वैक'],
  ['🐔','Hen','मुर्गी','Cluck Cluck','कुडकुड़ाहट'],
  ['🐓','Rooster','मुर्गा','Cock-a-doodle-doo','कुकड़ू कूँ']
];
BUILDERS.animalSounds = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Animal Sounds','जानवरों की आवाज़','Tap to hear','सुनने के लिए टैप करें'));
  const grid = el('div', { class:'card-grid' });
  ANIMAL_SOUNDS.forEach(([em, en, hi, sound_en, sound_hi]) => {
    const card = el('div', { class:'card' }, [
      el('div', { class:'emoji', style:'font-size:54px' }, em),
      el('div', { class:'word' }, T(en, hi)),
      el('div', { style:'font-size:12px;color:#888;margin-top:4px' }, T(sound_en, sound_hi))
    ]);
    card.onclick = () => {
      card.classList.add('playing');
      setTimeout(()=>card.classList.remove('playing'), 800);
      speak(T(`${en} says ${sound_en}`, `${hi} बोलती है ${sound_hi}`));
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- VEHICLE SOUNDS ----------
const VEHICLE_SOUNDS = [
  ['🚗','Car','कार','Vroom Vroom','वूम वूम', 200],
  ['🚌','Bus','बस','Honk Honk','हॉर्न', 300],
  ['🚂','Train','रेलगाड़ी','Choo Choo','छुक छुक', 150],
  ['✈️','Aeroplane','हवाई जहाज़','Whoosh','सूँ सूँ', 800],
  ['🚓','Police','पुलिस','Wee Woo Wee Woo','साइरन', 600],
  ['🚑','Ambulance','एम्बुलेंस','Nee Naw Nee Naw','साइरन', 700],
  ['🚒','Fire Truck','दमकल','Beep Beep','हॉर्न', 400],
  ['🏍️','Motorcycle','मोटरसाइकिल','Brrr Brrr','भर्र भर्र', 250],
  ['🚲','Bicycle','साइकिल','Ring Ring','टन टन', 1000],
  ['🚁','Helicopter','हेलिकॉप्टर','Whir Whir','फर्र फर्र', 350]
];
BUILDERS.vehicleSounds = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Vehicle Sounds','वाहनों की आवाज़','Tap to hear','सुनने के लिए टैप करें'));
  const grid = el('div', { class:'card-grid' });
  VEHICLE_SOUNDS.forEach(([em, en, hi, sound_en, sound_hi, freq]) => {
    const card = el('div', { class:'card' }, [
      el('div', { class:'emoji', style:'font-size:54px' }, em),
      el('div', { class:'word' }, T(en, hi)),
      el('div', { style:'font-size:12px;color:#888' }, T(sound_en, sound_hi))
    ]);
    card.onclick = () => {
      tone(freq, 0.4, 'sawtooth');
      setTimeout(() => speak(T(sound_en, sound_hi)), 500);
    };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- NATURE SOUNDS ----------
BUILDERS.natureSounds = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Nature Sounds','प्रकृति की आवाज़','Tap to hear','सुनने के लिए टैप करें'));
  const items = [
    ['🌧️','Rain','बारिश', () => { for (let i=0;i<8;i++) setTimeout(() => noiseBurst(0.4, 0.1), i*120); }],
    ['⛈️','Thunder','बिजली', () => noiseBurst(1.2, 0.3)],
    ['💨','Wind','हवा', () => noiseBurst(2, 0.05)],
    ['🌊','Sea Waves','समुद्री लहरें', () => { for (let i=0;i<3;i++) setTimeout(() => noiseBurst(1, 0.15), i*900); }],
    ['🐦','Birds Chirping','चिड़ियों की चहचहाहट', () => { for (let i=0;i<5;i++) setTimeout(() => tone(2200 + Math.random()*1000, 0.15, 'sine', 0.2), i*200); }],
    ['🦗','Crickets','झींगुर', () => { for (let i=0;i<6;i++) setTimeout(() => tone(4500, 0.06, 'sine', 0.1), i*180); }],
    ['🔥','Fire Crackle','आग चटकना', () => { for (let i=0;i<10;i++) setTimeout(() => noiseBurst(0.08, 0.15), i*100 + Math.random()*200); }],
    ['🌲','Forest','जंगल', () => { tone(3000, 0.1, 'sine', 0.15); setTimeout(()=>tone(4000, 0.1, 'sine', 0.15), 300); setTimeout(()=>noiseBurst(1.5, 0.04), 600); }]
  ];
  const grid = el('div', { class:'card-grid' });
  items.forEach(([em, en, hi, play]) => {
    const card = el('div', { class:'card' }, [
      el('div', { class:'emoji', style:'font-size:54px' }, em),
      el('div', { class:'word' }, T(en, hi))
    ]);
    card.onclick = () => { play(); speak(T(en, hi)); };
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- CULTURAL ----------
const FESTIVALS = [
  ['🪔','Diwali','दीवाली','Festival of lights — celebrate good over evil','रोशनी का त्योहार — अच्छाई की जीत'],
  ['🎨','Holi','होली','Festival of colors — spring','रंगों का त्योहार — बसंत'],
  ['🌙','Eid','ईद','Festival after Ramadan fasting','रमज़ान के बाद का त्योहार'],
  ['🎄','Christmas','क्रिसमस','Birth of Jesus, gift exchange','यीशु का जन्म, उपहारों का त्योहार'],
  ['🎗️','Raksha Bandhan','रक्षा बंधन','Brother-sister bond, tying rakhi','भाई-बहन का प्यार, राखी बांधना'],
  ['🐘','Ganesh Chaturthi','गणेश चतुर्थी','Birthday of Lord Ganesha','गणपति का जन्मदिन'],
  ['🥭','Janmashtami','जन्माष्टमी','Krishna’s birthday','कृष्ण का जन्मदिन'],
  ['🎉','New Year','नया साल','Welcoming new year','नये साल की शुरुआत'],
  ['🎂','Birthday','जन्मदिन','Your special day!','आपका खास दिन!'],
  ['🍎','Pongal','पोंगल','Tamil harvest festival','तमिल फसल का त्योहार'],
  ['🌾','Baisakhi','बैसाखी','Punjabi new year & harvest','पंजाबी नया साल और फसल'],
  ['🪁','Makar Sankranti','मकर संक्रांति','Kite festival','पतंग का त्योहार']
];
BUILDERS.festivals = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Festivals of India','भारत के त्योहार','Tap to learn','जानने के लिए टैप करें'));
  const grid = el('div', { class:'card-grid', style:'grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))' });
  FESTIVALS.forEach(([em, en, hi, d_en, d_hi]) => {
    const card = el('div', { class:'card', style:'padding:16px;text-align:left' });
    card.innerHTML = `<div style="font-size:54px;text-align:center">${em}</div>
      <div style="font-weight:bold;color:#ff4081;font-size:18px;text-align:center;margin:6px 0">${T(en, hi)}</div>
      <div style="font-size:13px;color:#666;line-height:1.5">${T(d_en, d_hi)}</div>`;
    card.onclick = () => speak(T(`${en}. ${d_en}`, `${hi}। ${d_hi}`));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

const MANTRAS = [
  ['🌞','Gayatri Mantra','गायत्री मंत्र',
   `Om Bhur Bhuvah Svaha,
Tat Savitur Varenyam,
Bhargo Devasya Dhimahi,
Dhiyo Yo Nah Prachodayat.`,
   `ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं।
भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्।`],
  ['🐒','Hanuman Chalisa (Doha)','हनुमान चालीसा (दोहा)',
   `Shri Guru Charan Saroj Raj,
Nij Mann Mukur Sudhari,
Barnau Raghuvar Bimal Jasu,
Jo Dayaku Phal Chari.`,
   `श्रीगुरु चरन सरोज रज,
निज मनु मुकुरु सुधारि।
बरनउँ रघुबर बिमल जसु,
जो दायकु फल चारि।`],
  ['📚','Saraswati Vandana','सरस्वती वंदना',
   `Ya Kundendu Tushara Hara Dhavala,
Ya Shubhra Vastravrita,
Ya Veena Vara Danda Mandita Kara,
Ya Shweta Padmasana.`,
   `या कुन्देन्दु तुषारहार धवला,
या शुभ्रवस्त्रावृता।
या वीणावरदण्डमण्डितकरा,
या श्वेतपद्मासना।`],
  ['🙏','Om Namah Shivaya','ॐ नमः शिवाय',
   'Om Namah Shivaya. (Salutations to Lord Shiva)',
   'ॐ नमः शिवाय। (भगवान शिव को नमस्कार)'],
  ['🪔','Asato Maa','असतो मा',
   `Asato Maa Sat Gamaya,
Tamaso Maa Jyotir Gamaya,
Mrityor Maa Amritam Gamaya.`,
   `असतो मा सद्गमय।
तमसो मा ज्योतिर्गमय।
मृत्योर्मा अमृतं गमय।`]
];
BUILDERS.mantras = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Prayers & Mantras','प्रार्थना और मंत्र','Listen with respect','भक्ति से सुनें'));
  MANTRAS.forEach(([em, t_en, t_hi, txt_en, txt_hi]) => {
    const card = el('div', { class:'rhyme-card' });
    card.appendChild(el('h3', {}, em + '  ' + T(t_en, t_hi)));
    card.appendChild(el('pre', {}, T(txt_en, txt_hi)));
    const play = el('button', { class:'btn green' }, '▶ ' + T('Play','सुनें'));
    const stop = el('button', { class:'btn' }, '⏸ ' + T('Stop','रोकें'));
    play.onclick = () => speak(T(txt_en, txt_hi), 'hi-IN');
    stop.onclick = () => speechSynthesis.cancel();
    card.appendChild(el('div', { class:'btn-row' }, [play, stop]));
    root.appendChild(card);
  });
};

const NATIONAL_SYMBOLS = [
  ['🇮🇳','National Flag','राष्ट्रीय ध्वज','Tiranga — saffron, white, green','तिरंगा — केसरिया, सफ़ेद, हरा'],
  ['🦚','National Bird','राष्ट्रीय पक्षी','Peacock','मोर'],
  ['🐯','National Animal','राष्ट्रीय पशु','Tiger','बाघ'],
  ['🪷','National Flower','राष्ट्रीय फूल','Lotus','कमल'],
  ['🥭','National Fruit','राष्ट्रीय फल','Mango','आम'],
  ['🌳','National Tree','राष्ट्रीय वृक्ष','Banyan','बरगद'],
  ['🐘','National Heritage Animal','राष्ट्रीय धरोहर पशु','Elephant','हाथी'],
  ['🐬','National Aquatic Animal','राष्ट्रीय जलीय जीव','Ganges Dolphin','गंगा डॉल्फ़िन'],
  ['🎶','National Anthem','राष्ट्रीय गान','Jana Gana Mana','जन गण मन'],
  ['🎵','National Song','राष्ट्रीय गीत','Vande Mataram','वंदे मातरम्'],
  ['📅','Republic Day','गणतंत्र दिवस','26 January','२६ जनवरी'],
  ['📅','Independence Day','स्वतंत्रता दिवस','15 August','१५ अगस्त'],
  ['🏛️','National Emblem','राष्ट्रीय चिन्ह','Ashoka Stambh','अशोक स्तंभ']
];
BUILDERS.nationalSymbols = (root) => {
  root.innerHTML = '';
  root.appendChild(header('National Symbols of India','भारत के राष्ट्रीय प्रतीक','Tap to learn','जानने के लिए टैप करें'));
  const grid = el('div', { class:'card-grid', style:'grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))' });
  NATIONAL_SYMBOLS.forEach(([em, t_en, t_hi, v_en, v_hi]) => {
    const card = el('div', { class:'card', style:'padding:14px;text-align:left' });
    card.innerHTML = `<div style="font-size:48px;text-align:center">${em}</div>
      <div style="color:#1976d2;font-weight:bold;font-size:14px;margin-top:6px">${T(t_en, t_hi)}</div>
      <div style="color:#ff4081;font-weight:bold;font-size:18px">${T(v_en, v_hi)}</div>`;
    card.onclick = () => speak(T(`${t_en} of India is ${v_en}`, `भारत का ${t_hi} ${v_hi} है`));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

const FAMOUS_PLACES = [
  ['🕌','Taj Mahal','ताज महल','Agra — symbol of love','आगरा — प्रेम का प्रतीक'],
  ['🚪','India Gate','इंडिया गेट','Delhi — war memorial','दिल्ली — युद्ध स्मारक'],
  ['🏰','Red Fort','लाल किला','Delhi — Mughal fort','दिल्ली — मुगल किला'],
  ['🏔️','Himalayas','हिमालय','Tallest mountains','सबसे ऊँचे पर्वत'],
  ['🌊','Ganga River','गंगा नदी','Holy river','पवित्र नदी'],
  ['🏛️','Qutub Minar','कुतुब मीनार','Delhi — tall minaret','दिल्ली — ऊँची मीनार'],
  ['🛕','Golden Temple','स्वर्ण मंदिर','Amritsar — Sikh shrine','अमृतसर — सिख तीर्थ'],
  ['🏖️','Goa Beach','गोवा बीच','Famous beaches','प्रसिद्ध समुद्री तट'],
  ['🐅','Sundarbans','सुंदरबन','Tiger forest, Bengal','बाघ का जंगल, बंगाल'],
  ['🛕','Konark Sun Temple','कोणार्क सूर्य मंदिर','Odisha','ओडिशा'],
  ['🌄','Kashmir','कश्मीर','Heaven on Earth','धरती का स्वर्ग'],
  ['🏞️','Kanyakumari','कन्याकुमारी','Southernmost tip','दक्षिणी छोर']
];
BUILDERS.famousPlaces = r => buildEmojiList(r, 'Famous Places of India','भारत के प्रसिद्ध स्थल',
  FAMOUS_PLACES.map(([em, en, hi]) => [em, en, hi]));

const FAMOUS_PEOPLE = [
  ['👴','Mahatma Gandhi','महात्मा गांधी','Father of the Nation','राष्ट्रपिता'],
  ['👨‍🚀','APJ Abdul Kalam','ए.पी.जे. अब्दुल कलाम','Missile Man, President','मिसाइल मैन, राष्ट्रपति'],
  ['👩','Mother Teresa','मदर टेरेसा','Helped poor, Nobel laureate','गरीबों की सेवा'],
  ['👨','Jawaharlal Nehru','जवाहरलाल नेहरू','First PM','पहले प्रधानमंत्री'],
  ['👩','Indira Gandhi','इंदिरा गांधी','First woman PM','पहली महिला प्रधानमंत्री'],
  ['🧘','Swami Vivekananda','स्वामी विवेकानंद','Spiritual leader','आध्यात्मिक गुरु'],
  ['📚','Rabindranath Tagore','रवींद्रनाथ टैगोर','Poet, wrote anthem','कवि, राष्ट्रगान लेखक'],
  ['⚔️','Bhagat Singh','भगत सिंह','Freedom fighter','स्वतंत्रता सेनानी'],
  ['👸','Rani Lakshmibai','रानी लक्ष्मीबाई','Queen of Jhansi','झाँसी की रानी'],
  ['👨‍🔬','C V Raman','सी.वी. रमन','Scientist, Nobel Prize','वैज्ञानिक, नोबेल पुरस्कार'],
  ['🏏','Sachin Tendulkar','सचिन तेंदुलकर','Cricket legend','क्रिकेट के दिग्गज'],
  ['👨‍🚀','Rakesh Sharma','राकेश शर्मा','First Indian in space','अंतरिक्ष जाने वाले पहले भारतीय']
];
BUILDERS.famousPeople = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Famous People','प्रसिद्ध लोग','Tap to learn','जानने के लिए टैप करें'));
  const grid = el('div', { class:'card-grid', style:'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))' });
  FAMOUS_PEOPLE.forEach(([em, n_en, n_hi, d_en, d_hi]) => {
    const card = el('div', { class:'card', style:'padding:14px;text-align:left' });
    card.innerHTML = `<div style="font-size:48px;text-align:center">${em}</div>
      <div style="font-weight:bold;color:#ff4081;font-size:16px;text-align:center;margin:6px 0">${T(n_en, n_hi)}</div>
      <div style="font-size:13px;color:#666;text-align:center">${T(d_en, d_hi)}</div>`;
    card.onclick = () => speak(T(`${n_en}. ${d_en}`, `${n_hi}। ${d_hi}`));
    grid.appendChild(card);
  });
  root.appendChild(grid);
};

// ---------- GENERAL KNOWLEDGE LISTS ----------
BUILDERS.solarSystem = r => buildEmojiList(r, 'Solar System','सौर मंडल', [
  ['☀️','Sun','सूरज'],['🌎','Earth','पृथ्वी'],['🌕','Moon','चाँद'],['⭐','Stars','तारे'],
  ['☿️','Mercury','बुध'],['♀️','Venus','शुक्र'],['♂️','Mars','मंगल'],['♃','Jupiter','बृहस्पति'],
  ['♄','Saturn','शनि'],['♅','Uranus','अरुण'],['♆','Neptune','वरुण'],['☄️','Comet','धूमकेतु'],
  ['🌌','Galaxy','आकाशगंगा'],['🚀','Rocket','रॉकेट'],['🛰️','Satellite','उपग्रह']
]);
BUILDERS.weather = r => buildEmojiList(r, 'Weather','मौसम', [
  ['☀️','Sunny','धूप'],['☁️','Cloudy','बादल'],['🌧️','Rainy','बारिश'],['⛈️','Stormy','तूफ़ान'],
  ['❄️','Snowy','बर्फ़'],['🌫️','Foggy','कोहरा'],['🌈','Rainbow','इंद्रधनुष'],['💨','Windy','हवादार'],
  ['🌪️','Tornado','बवंडर'],['🌡️','Hot','गरम'],['🥶','Cold','ठंड'],['☔','Umbrella','छाता']
]);
BUILDERS.helpers = r => buildEmojiList(r, 'Community Helpers','सहायक लोग', [
  ['👨‍⚕️','Doctor','डॉक्टर'],['👮','Police','पुलिस'],['🧑‍🏫','Teacher','शिक्षक'],
  ['👨‍🚒','Firefighter','दमकल कर्मी'],['📮','Postman','डाकिया'],['🧑‍🌾','Farmer','किसान'],
  ['🧑‍🍳','Chef','रसोइया'],['🚚','Driver','चालक'],['👷','Engineer','इंजीनियर'],
  ['💈','Barber','नाई'],['🧹','Cleaner','सफ़ाईकर्मी'],['👨‍🔧','Mechanic','मिस्त्री'],
  ['👩‍⚖️','Lawyer','वकील'],['👨‍✈️','Pilot','पायलट'],['🩺','Nurse','नर्स']
]);
BUILDERS.homeThings = r => buildEmojiList(r, 'Things at Home','घर की चीज़ें', [
  ['🛏️','Bed','बिस्तर'],['🪑','Chair','कुर्सी'],['🛋️','Sofa','सोफ़ा'],['🪞','Mirror','आईना'],
  ['🚪','Door','दरवाज़ा'],['🪟','Window','खिड़की'],['💡','Lamp','दीपक'],['📺','TV','टीवी'],
  ['🚿','Shower','फुहारा'],['🚽','Toilet','शौचालय'],['🧴','Soap','साबुन'],['🪒','Razor','उस्तरा'],
  ['🪥','Toothbrush','ब्रश'],['🍽️','Plate','थाली'],['🥄','Spoon','चम्मच'],['🍴','Fork','काँटा'],
  ['🥢','Chopsticks','चॉपस्टिक'],['🫖','Teapot','चायदानी'],['🧊','Fridge','फ्रिज'],['🔥','Stove','चूल्हा']
]);
BUILDERS.schoolThings = r => buildEmojiList(r, 'Things at School','स्कूल की चीज़ें', [
  ['🎒','Bag','बस्ता'],['📚','Books','किताबें'],['📓','Notebook','कॉपी'],['✏️','Pencil','पेंसिल'],
  ['🖊️','Pen','कलम'],['🧹','Eraser','रबर'],['📏','Ruler','रूल'],['🖌️','Brush','कूँची'],
  ['🎨','Color Box','रंग की डिब्बी'],['📐','Geometry','ज्यामिति'],['🧮','Abacus','गणक यंत्र'],
  ['🪑','Desk','मेज'],['📋','Clipboard','क्लिपबोर्ड'],['🗒️','Diary','डायरी'],['🖍️','Crayons','क्रेयॉन'],
  ['📎','Clip','क्लिप']
]);
BUILDERS.instruments = r => buildEmojiList(r, 'Musical Instruments','वाद्य यंत्र', [
  ['🎸','Guitar','गिटार'],['🥁','Drum','ढोल'],['🎺','Trumpet','तुरही'],['🎻','Violin','वायलिन'],
  ['🎹','Piano','पियानो'],['🎷','Saxophone','सैक्सोफोन'],['🎤','Microphone','माइक'],
  ['🪕','Tabla','तबला'],['🪘','Drum (Indian)','ढोलक'],['📯','Horn','हॉर्न'],['🔔','Bell','घंटी'],
  ['🎵','Music','संगीत']
]);
BUILDERS.sports = r => buildEmojiList(r, 'Sports & Games','खेल कूद', [
  ['🏏','Cricket','क्रिकेट'],['⚽','Football','फुटबॉल'],['🏑','Hockey','हॉकी'],['🏀','Basketball','बास्केटबॉल'],
  ['🎾','Tennis','टेनिस'],['🏸','Badminton','बैडमिंटन'],['🏐','Volleyball','वॉलीबॉल'],
  ['🥊','Boxing','मुक्केबाज़ी'],['🏊','Swimming','तैराकी'],['🏃','Running','दौड़'],['⛳','Golf','गोल्फ़'],
  ['🤼','Wrestling','कुश्ती'],['🚴','Cycling','साइकलिंग'],['⛸️','Skating','स्केटिंग'],
  ['🏋️','Weightlifting','भारोत्तोलन'],['🏓','Table Tennis','टेबल टेनिस']
]);
BUILDERS.indianFoods = r => buildEmojiList(r, 'Indian Foods','भारतीय भोजन', [
  ['🫓','Roti','रोटी'],['🍚','Rice','चावल'],['🥘','Dal','दाल'],['🍛','Curry','सब्ज़ी'],
  ['🥞','Dosa','डोसा'],['🍘','Idli','इडली'],['🥙','Samosa','समोसा'],['🍢','Vada','वड़ा'],
  ['🥧','Paratha','पराठा'],['🍮','Kheer','खीर'],['🧆','Pakoda','पकौड़ा'],['🍩','Jalebi','जलेबी'],
  ['🍯','Halwa','हलवा'],['🥛','Lassi','लस्सी'],['🍵','Chai','चाय'],['🥥','Nariyal','नारियल'],
  ['🍌','Banana','केला'],['🥭','Mango','आम'],['🌶️','Mirchi','मिर्च'],['🧅','Pyaaz','प्याज़']
]);
BUILDERS.clothes = r => buildEmojiList(r, 'Clothes','कपड़े', [
  ['👕','Shirt','कमीज़'],['👖','Pants','पतलून'],['👗','Dress','पोशाक'],['👚','Blouse','ब्लाउज़'],
  ['🩳','Shorts','हाफ़ पैंट'],['🧥','Coat','कोट'],['🧣','Scarf','स्कार्फ़'],['🧤','Gloves','दस्ताने'],
  ['🧦','Socks','मोज़े'],['👞','Shoes','जूते'],['👡','Sandals','चप्पल'],['👒','Hat','टोपी'],
  ['🎩','Top hat','बड़ी टोपी'],['👜','Bag','थैला'],['🎒','Backpack','बस्ता'],['👓','Glasses','चश्मा'],
  ['🥻','Saree','साड़ी'],['🧕','Dupatta','दुपट्टा']
]);

// ============================================================
// =================== GAMES & BRAIN =========================
// ============================================================

// MEMORY MATCH
BUILDERS.memMatch = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Memory Match','याद मिलान','Find pairs','जोड़े ढूंढो'));
  const wrap = el('div', { class:'game-area' });
  const pool = ['🍎','🍌','🐶','🐱','⭐','🚗','🌸','🦁'];
  const pairs = pool.slice(0, 6);
  const cards = shuffle(pairs.concat(pairs));
  let first = null, lock = false, matched = 0;
  const grid = el('div', { class:'memo-grid', style:'grid-template-columns: repeat(4, 1fr)' });
  cards.forEach((emoji, i) => {
    const c = el('div', { class:'memo-card' }, '?');
    c.dataset.emoji = emoji;
    c.onclick = () => {
      if (lock || c.classList.contains('matched') || c.classList.contains('flipped')) return;
      c.textContent = emoji; c.classList.add('flipped');
      if (!first) { first = c; return; }
      if (first.dataset.emoji === emoji) {
        first.classList.add('matched'); c.classList.add('matched');
        matched++; first = null; addStar(1);
        if (matched === pairs.length) {
          speak(T('Great job! All matched!','शाबाश! सब मिल गए!'));
          addStar(3);
        }
      } else {
        lock = true;
        setTimeout(() => {
          c.textContent = '?'; c.classList.remove('flipped');
          first.textContent = '?'; first.classList.remove('flipped');
          first = null; lock = false;
        }, 800);
      }
    };
    grid.appendChild(c);
  });
  wrap.appendChild(grid);
  const reset = el('button', { class:'btn blue' }, T('🔄 New Game','🔄 नया खेल'));
  reset.onclick = () => BUILDERS.memMatch(root);
  wrap.appendChild(el('div', { class:'btn-row' }, [reset]));
  root.appendChild(wrap);
};

// DRAG & DROP / SORTING
BUILDERS.dragSort = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Sort & Drop','छाँटो और रखो','Tap fruit/vegetable to sort','फल/सब्ज़ी पर टैप करके छाँटो'));
  const wrap = el('div', { class:'game-area' });
  const items = shuffle([
    ...['🍎','🍌','🍇','🍊','🥭','🍓'].map(e => ({ e, type:'fruit' })),
    ...['🥕','🥔','🍅','🌽','🥒','🥦'].map(e => ({ e, type:'veg' }))
  ]);
  const tray = el('div', { style:'background:#fff;border-radius:18px;padding:14px;margin:10px 0;text-align:center;min-height:90px' });
  items.forEach(it => {
    const sp = el('span', { class:'drag-item' }, it.e);
    sp.onclick = () => {
      sp.style.opacity = '0';
      setTimeout(() => sp.remove(), 300);
      const target = it.type === 'fruit' ? fruitBasket : vegBasket;
      const moved = el('span', { class:'drag-item' }, it.e);
      target.appendChild(moved); addStar(1);
      speak(it.type === 'fruit' ? T('Fruit!','फल!') : T('Vegetable!','सब्ज़ी!'));
      if (tray.querySelectorAll('.drag-item').length === 0) {
        speak(T('All sorted! Great!','सब छाँट दिए! शाबाश!'));
      }
    };
    tray.appendChild(sp);
  });
  wrap.appendChild(el('p', { style:'text-align:center;color:#666' }, T('Tap each item','हर चीज़ पर टैप करें')));
  wrap.appendChild(tray);
  const baskets = el('div', { style:'text-align:center' });
  const fruitBasket = el('div', { class:'basket' });
  fruitBasket.appendChild(el('h4', {}, '🧺 ' + T('Fruits','फल')));
  const vegBasket = el('div', { class:'basket' });
  vegBasket.appendChild(el('h4', {}, '🧺 ' + T('Vegetables','सब्ज़ी')));
  baskets.appendChild(fruitBasket); baskets.appendChild(vegBasket);
  wrap.appendChild(baskets);
  const reset = el('button', { class:'btn blue' }, T('🔄 New','🔄 फिर'));
  reset.onclick = () => BUILDERS.dragSort(root);
  wrap.appendChild(el('div', { class:'btn-row' }, [reset]));
  root.appendChild(wrap);
};

// SOUND QUIZ
BUILDERS.soundQuiz = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Sound Quiz','आवाज़ क्विज़','Listen and pick','सुनो और चुनो'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const target = rand(ANIMAL_SOUNDS);
    const opts = shuffle([target, rand(ANIMAL_SOUNDS), rand(ANIMAL_SOUNDS), rand(ANIMAL_SOUNDS)]);
    const playBtn = el('button', { class:'btn green', style:'font-size:24px;padding:18px 30px' },
      '🔊 ' + T('Play Sound','आवाज़ सुनें'));
    playBtn.onclick = () => speak(T(`The ${target[1]} says ${target[3]}`, `${target[2]} बोलती है ${target[4]}`));
    wrap.appendChild(playBtn);
    setTimeout(() => playBtn.click(), 400);
    wrap.appendChild(el('h3', { style:'margin:14px 0;color:#ff4081' }, T('Which animal makes this sound?','यह आवाज़ कौन निकालता है?')));
    const row = el('div', { class:'options' });
    opts.forEach(o => {
      const c = el('div', { class:'option-card', style:'font-size:48px' }, o[0]);
      c.onclick = () => {
        if (o[1] === target[1]) { c.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(newQ, 1100); }
        else { c.classList.add('wrong'); setTimeout(()=>c.classList.remove('wrong'), 500); }
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// COLORING PAGES
BUILDERS.coloring = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Coloring Pages','रंग भरना','Pick color, tap to fill','रंग चुनें, टैप करके भरें'));
  const wrap = el('div', { class:'game-area' });
  const pages = [
    `<svg class="coloring-svg" viewBox="0 0 200 200">
      <circle cx="100" cy="80" r="40" fill="#fff"/>
      <circle cx="85" cy="75" r="5" fill="#000"/><circle cx="115" cy="75" r="5" fill="#000"/>
      <path d="M85 95 Q100 110 115 95" stroke="#000" fill="none" stroke-width="3"/>
      <rect x="60" y="120" width="80" height="60" fill="#fff"/>
      <polygon points="60,120 100,90 140,120" fill="#fff"/>
    </svg>`,
    `<svg class="coloring-svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="60" fill="#fff"/>
      <polygon points="100,40 110,80 150,80 120,100 130,140 100,115 70,140 80,100 50,80 90,80" fill="#fff"/>
    </svg>`,
    `<svg class="coloring-svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="50" fill="#fff"/>
      <circle cx="100" cy="50" r="25" fill="#fff"/>
      <circle cx="60" cy="80" r="20" fill="#fff"/>
      <circle cx="140" cy="80" r="20" fill="#fff"/>
      <circle cx="60" cy="120" r="20" fill="#fff"/>
      <circle cx="140" cy="120" r="20" fill="#fff"/>
    </svg>`
  ];
  let pageIdx = 0;
  let activeColor = '#ef5350';
  const palette = el('div', { class:'color-palette' });
  ['#ef5350','#ff9800','#fdd835','#66bb6a','#26c6da','#42a5f5','#7e57c2','#ec407a','#8d6e63','#212121','#fff'].forEach(c => {
    const p = el('div', { class:'color-pick' });
    p.style.background = c;
    p.onclick = () => {
      activeColor = c;
      palette.querySelectorAll('.color-pick').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    };
    palette.appendChild(p);
  });
  palette.firstChild.classList.add('active');
  const svgWrap = el('div', { style:'text-align:center' });
  function loadPage(i) {
    svgWrap.innerHTML = pages[i];
    const svg = svgWrap.querySelector('svg');
    svg.querySelectorAll('circle, rect, path, polygon').forEach(s => {
      s.onclick = () => { s.setAttribute('fill', activeColor); addStar(0); };
    });
  }
  loadPage(0);
  const row = el('div', { class:'btn-row' });
  const prev = el('button', { class:'btn orange' }, T('◀ Prev','◀ पिछला'));
  prev.onclick = () => { pageIdx = (pageIdx - 1 + pages.length) % pages.length; loadPage(pageIdx); };
  const next = el('button', { class:'btn green' }, T('Next ▶','अगला ▶'));
  next.onclick = () => { pageIdx = (pageIdx + 1) % pages.length; loadPage(pageIdx); addStar(1); };
  row.appendChild(prev); row.appendChild(next);
  wrap.appendChild(palette);
  wrap.appendChild(svgWrap);
  wrap.appendChild(row);
  root.appendChild(wrap);
};

// TIMED CHALLENGE
BUILDERS.timedChallenge = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Timed Challenge','समय खेल','How many in 60s?','६० सेकंड में कितने सही?'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  let time = 60, score = 0, timer = null, qBox, opts, info;
  info = el('div', { style:'display:flex;justify-content:space-around;font-size:20px;font-weight:bold;color:#1976d2;margin:10px 0' });
  qBox = el('div', { class:'math-display' });
  opts = el('div', { class:'options' });
  function newQ() {
    const a = Math.floor(Math.random()*15)+1, b = Math.floor(Math.random()*10)+1;
    const op = Math.random()<0.5 ? '+' : '-';
    let A = a, B = b;
    if (op === '-' && B > A) [A, B] = [B, A];
    const ans = op === '+' ? A+B : A-B;
    qBox.textContent = `${A} ${op} ${B} = ?`;
    opts.innerHTML = '';
    [...new Set(shuffle([ans, ans+1, ans-1, ans+2]).filter(x=>x>=0))].slice(0,4).forEach(c => {
      const o = el('div', { class:'option-card' }, String(c));
      o.onclick = () => {
        if (c === ans) { o.classList.add('correct'); score++; setTimeout(newQ, 300); }
        else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),300); }
        info.innerHTML = `⏱️ ${time}s | ⭐ ${score}`;
      };
      opts.appendChild(o);
    });
  }
  function tick() {
    time--;
    info.innerHTML = `⏱️ ${time}s | ⭐ ${score}`;
    if (time <= 0) {
      clearInterval(timer);
      wrap.innerHTML = '';
      wrap.appendChild(el('h2', { style:'color:#ff4081;text-align:center' },
        T(`Time Up! Score: ${score} 🎉`,`समय समाप्त! स्कोर: ${score} 🎉`)));
      addStar(score);
      const again = el('button', { class:'btn green' }, T('Play Again','फिर खेलें'));
      again.onclick = () => BUILDERS.timedChallenge(root);
      wrap.appendChild(el('div', { class:'btn-row' }, [again]));
    }
  }
  wrap.appendChild(info); wrap.appendChild(qBox); wrap.appendChild(opts);
  info.innerHTML = `⏱️ ${time}s | ⭐ ${score}`;
  newQ();
  timer = setInterval(tick, 1000);
  root.appendChild(wrap);
};

// TRAFFIC LIGHT
BUILDERS.traffic = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Traffic Light','ट्रैफ़िक लाइट','Red=Stop, Yellow=Wait, Green=Go','लाल=रुको, पीला=रुको, हरा=जाओ'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  const box = el('div', { class:'traffic-box' });
  const red    = el('div', { class:'traffic-light', style:'background:#f44336;color:#f44336' });
  const yellow = el('div', { class:'traffic-light', style:'background:#ffeb3b;color:#ffeb3b' });
  const green  = el('div', { class:'traffic-light', style:'background:#4caf50;color:#4caf50' });
  box.appendChild(red); box.appendChild(yellow); box.appendChild(green);
  wrap.appendChild(box);
  const label = el('div', { style:'font-size:30px;font-weight:bold;margin:14px;color:#333' });
  wrap.appendChild(label);
  const states = [
    [red, T('STOP 🛑','रुको 🛑'), '#f44336'],
    [yellow, T('WAIT ⚠️','रुको ⚠️'), '#fbc02d'],
    [green, T('GO! 🚗','जाओ 🚗'), '#4caf50']
  ];
  let idx = 0;
  function show() {
    [red, yellow, green].forEach(l => l.classList.remove('on'));
    const [light, txt, color] = states[idx];
    light.classList.add('on');
    label.textContent = txt; label.style.color = color;
    speak(txt);
  }
  show();
  const btn = el('button', { class:'btn green' }, T('Next Light ▶','अगली लाइट ▶'));
  btn.onclick = () => { idx = (idx + 1) % 3; show(); addStar(1); };
  wrap.appendChild(el('div', { class:'btn-row' }, [btn]));
  root.appendChild(wrap);
};

// DICE GAME
BUILDERS.dice = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Dice Game','पासा खेल','Roll the dice!','पासा फेंको!'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  const FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  const dice = el('div', { class:'dice' }, '🎲');
  wrap.appendChild(dice);
  const result = el('div', { style:'font-size:32px;font-weight:bold;color:#1976d2;margin:14px' });
  wrap.appendChild(result);
  const roll = el('button', { class:'btn green', style:'font-size:22px;padding:16px 32px' }, T('🎲 Roll!','🎲 फेंको!'));
  roll.onclick = () => {
    dice.classList.add('rolling');
    let n = 0, count = 0;
    const interval = setInterval(() => {
      n = Math.floor(Math.random()*6); dice.textContent = FACES[n]; count++;
      if (count >= 8) {
        clearInterval(interval);
        dice.classList.remove('rolling');
        const num = n + 1;
        result.textContent = T(`You rolled ${num}!`, `आया ${numberToHindi(num)}!`);
        speak(T(`You rolled ${num}!`, `आया ${numberToHindi(num)}!`));
        addStar(1);
      }
    }, 80);
  };
  wrap.appendChild(roll);
  root.appendChild(wrap);
};

// PATTERN RECOGNITION
BUILDERS.pattern = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Pattern','पैटर्न','What comes next?','आगे क्या आएगा?'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const sets = [
      ['🔴','🔵','🔴','🔵','🔴','🔵'],
      ['⭐','🌙','⭐','🌙','⭐','🌙'],
      ['🍎','🍌','🍎','🍌','🍎','🍌'],
      ['🐶','🐱','🐶','🐱','🐶','🐱'],
      ['1','2','3','1','2','3'],
      ['A','B','A','B','A','B'],
      ['🟥','🟦','🟨','🟥','🟦','🟨'],
      ['⚽','🏀','⚽','🏀','⚽','🏀']
    ];
    const set = rand(sets);
    const ans = set[0]; // since pattern repeats
    const visible = set.slice(0, set.length - 1);
    wrap.appendChild(el('div', { style:'margin:20px' },
      visible.map(x => `<span class="pat-cell">${x}</span>`).join('') + '<span class="pat-cell" style="background:#fff3e0;color:#ff4081">?</span>'
    ));
    wrap.lastChild.innerHTML = visible.map(x => `<span class="pat-cell">${x}</span>`).join('') + '<span class="pat-cell" style="background:#fff3e0;color:#ff4081">?</span>';
    const opts = shuffle([ans, set[1], set[2]]);
    const row = el('div', { class:'options' });
    opts.forEach(o => {
      const c = el('div', { class:'option-card' }, o);
      c.onclick = () => {
        if (o === ans) { c.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(newQ, 1000); }
        else { c.classList.add('wrong'); setTimeout(()=>c.classList.remove('wrong'),500); }
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// SEQUENCE
BUILDERS.sequence = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Sequence','क्रम','Find missing number','छूटी संख्या ढूंढो'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const start = Math.floor(Math.random()*5)+1;
    const step = [1,2,5][Math.floor(Math.random()*3)];
    const seq = [start, start+step, start+2*step, start+3*step, start+4*step];
    const missingIdx = Math.floor(Math.random()*5);
    const display = seq.map((n, i) => i === missingIdx ? '?' : String(n));
    wrap.appendChild(el('div', { style:'font-size:36px;font-weight:bold;letter-spacing:14px;color:#1976d2;margin:20px;background:#fff;padding:20px;border-radius:18px' },
      display.join(' , ')));
    const ans = seq[missingIdx];
    const opts = shuffle([ans, ans+step, ans-step, ans+1].filter(x=>x>0));
    const row = el('div', { class:'options' });
    [...new Set(opts)].slice(0,4).forEach(o => {
      const c = el('div', { class:'option-card' }, String(o));
      c.onclick = () => {
        if (o === ans) { c.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(newQ, 1000); }
        else { c.classList.add('wrong'); setTimeout(()=>c.classList.remove('wrong'),500); }
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// SORT BY SIZE
BUILDERS.sortGame = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Sort by Size','आकार से क्रम','Tap from small to big','छोटे से बड़े तक टैप करो'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const sizes = shuffle([0.5, 0.7, 0.9, 1.1, 1.3]);
    const emoji = rand(['🍎','⭐','🐶','🌸','🚗','🎈']);
    const idx = sizes.map((_, i) => i);
    let nextSmall = sizes.indexOf(0.5);
    const sorted = [];
    sizes.slice().sort((a,b) => a-b).forEach(s => sorted.push(sizes.indexOf(s)));
    let pickedIdx = 0;
    const row = el('div', { style:'display:flex;justify-content:center;align-items:flex-end;gap:14px;margin:20px;flex-wrap:wrap' });
    const buttons = [];
    sizes.forEach((s, i) => {
      const b = el('div', { style:`font-size:${s*60}px;cursor:pointer;background:#fff;padding:14px;border-radius:18px;box-shadow:0 4px 0 #ddd` }, emoji);
      b.onclick = () => {
        if (i === sorted[pickedIdx]) {
          b.style.opacity = '0.3'; b.style.pointerEvents = 'none';
          b.style.borderTop = '4px solid #4caf50';
          pickedIdx++;
          if (pickedIdx === sizes.length) {
            speak(T('All sorted!','सब क्रम में!')); addStar(2);
            setTimeout(newQ, 1500);
          }
        } else {
          b.style.background = '#ffcdd2';
          setTimeout(()=> b.style.background = '#fff', 500);
        }
      };
      row.appendChild(b);
    });
    wrap.appendChild(el('p', {}, T('Tap from smallest to biggest','सबसे छोटे से सबसे बड़े को क्रम से टैप करो')));
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// ODD ONE OUT
BUILDERS.oddOne = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Odd One Out','अलग कौन','Find the different one','अलग वाला ढूंढो'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  const sets = [
    [['🍎','🍌','🍇','🚗'], '🚗', 'Vehicle, others are fruits','गाड़ी, बाकी फल हैं'],
    [['🐶','🐱','🐮','🌳'], '🌳', 'Tree, others are animals','पेड़, बाकी जानवर हैं'],
    [['☀️','🌙','⭐','📚'], '📚', 'Book, others are sky','किताब, बाकी आसमान में'],
    [['🚗','🚌','✈️','🍎'], '🍎', 'Apple, others are vehicles','सेब, बाकी वाहन हैं'],
    [['🥕','🥔','🍅','🦊'], '🦊', 'Fox, others are vegetables','लोमड़ी, बाकी सब्ज़ी हैं'],
    [['🔴','🔵','🟢','🐶'], '🐶', 'Dog, others are colors','कुत्ता, बाकी रंग हैं'],
    [['👁️','👂','👃','📱'], '📱', 'Phone, others are body parts','फ़ोन, बाकी शरीर के अंग']
  ];
  function newQ() {
    wrap.innerHTML = '';
    const [items, ans, exp_en, exp_hi] = rand(sets);
    const row = el('div', { class:'options' });
    shuffle(items).forEach(it => {
      const c = el('div', { class:'option-card', style:'font-size:54px' }, it);
      c.onclick = () => {
        if (it === ans) { c.classList.add('correct'); addStar(2); speak(T(exp_en, exp_hi)); setTimeout(newQ, 1500); }
        else { c.classList.add('wrong'); setTimeout(()=>c.classList.remove('wrong'),500); }
      };
      row.appendChild(c);
    });
    wrap.appendChild(el('h3', {}, T('Which one is different?','अलग कौन है?')));
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// COUNT OBJECTS
BUILDERS.countObj = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Count Objects','गिनो','How many?','कितने हैं?'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const max = scope().numMax >= 20 ? 15 : 10;
    const n = Math.floor(Math.random() * (max-1)) + 2;
    const em = rand(['🍎','⭐','🐶','🌸','🍌','🎈','🐱','🍓']);
    const grid = el('div', { style:'background:#fff;padding:20px;border-radius:20px;font-size:34px;letter-spacing:6px;line-height:1.6;margin:14px' });
    grid.innerHTML = (em + ' ').repeat(n);
    wrap.appendChild(grid);
    wrap.appendChild(el('h3', {}, T('How many?','कितने हैं?')));
    speak(T('Count the items','गिनो'));
    const opts = shuffle([n, n+1, n-1, n+2].filter(x=>x>0));
    const row = el('div', { class:'options' });
    [...new Set(opts)].slice(0,4).forEach(c => {
      const o = el('div', { class:'option-card' }, String(c));
      o.onclick = () => {
        if (c === n) { o.classList.add('correct'); addStar(1); speak(String(n)); setTimeout(newQ, 1000); }
        else { o.classList.add('wrong'); setTimeout(()=>o.classList.remove('wrong'),500); }
      };
      row.appendChild(o);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// SPOT THE DIFFERENCE (emoji)
BUILDERS.spotDiff = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Spot the Difference','फ़र्क ढूंढो','Find the different one','अलग वाला ढूंढो'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const base = rand(['😀','🐶','🍎','⭐','🌸','🚗','🎈']);
    const odd  = rand(['😎','🐱','🍌','🌙','🌻','🚌','🎂']);
    const total = 12;
    const diffIdx = Math.floor(Math.random() * total);
    const grid = el('div', { style:'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:380px;margin:14px auto' });
    for (let i = 0; i < total; i++) {
      const cell = el('div', { style:'background:#fff;border-radius:14px;padding:14px;font-size:38px;cursor:pointer;box-shadow:0 3px 0 #ddd' },
        i === diffIdx ? odd : base);
      cell.onclick = () => {
        if (i === diffIdx) { cell.style.background='#c8e6c9'; addStar(2); speak(T('Found it!','मिल गया!')); setTimeout(newQ, 1200); }
        else { cell.style.background='#ffcdd2'; setTimeout(()=>cell.style.background='#fff',400); }
      };
      grid.appendChild(cell);
    }
    wrap.appendChild(el('h3', {}, T('Find the different one','अलग वाला ढूंढो')));
    wrap.appendChild(grid);
  }
  root.appendChild(wrap);
  newQ();
};

// WHAT COMES NEXT (continue pattern)
BUILDERS.whatNext = (root) => {
  root.innerHTML = '';
  root.appendChild(header('What Comes Next','आगे क्या','Continue the pattern','पैटर्न आगे बढ़ाओ'));
  const wrap = el('div', { class:'game-area', style:'text-align:center' });
  function newQ() {
    wrap.innerHTML = '';
    const num = Math.random() < 0.5;
    let visible, ans, opts;
    if (num) {
      const start = Math.floor(Math.random()*5)+1;
      const step = [1,2,5,10][Math.floor(Math.random()*4)];
      visible = [start, start+step, start+2*step, start+3*step];
      ans = String(start + 4*step);
      opts = shuffle([ans, String(start+5*step), String(start+3*step), String(start+4*step+1)]);
    } else {
      const colors = shuffle(['🔴','🟡','🟢','🔵']).slice(0,3);
      visible = [colors[0], colors[1], colors[0], colors[1], colors[0]];
      ans = colors[1];
      opts = shuffle([colors[0], colors[1], colors[2]]);
    }
    wrap.appendChild(el('div', { style:'font-size:36px;font-weight:bold;letter-spacing:14px;background:#fff;padding:20px;border-radius:18px;margin:14px' },
      visible.join(' , ') + ' , ?'));
    const row = el('div', { class:'options' });
    [...new Set(opts)].forEach(o => {
      const c = el('div', { class:'option-card' }, String(o));
      c.onclick = () => {
        if (String(o) === String(ans)) { c.classList.add('correct'); addStar(1); speak(T('Correct!','सही!')); setTimeout(newQ, 1000); }
        else { c.classList.add('wrong'); setTimeout(()=>c.classList.remove('wrong'),500); }
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
  }
  root.appendChild(wrap);
  newQ();
};

// ============================================================
// =================== PROFILES SCREEN =======================
// ============================================================
BUILDERS.profiles = (root) => {
  root.innerHTML = '';
  root.appendChild(header('Kids Profiles','बच्चों की प्रोफ़ाइल','Switch or add child','बच्चा चुनें या जोड़ें'));
  const wrap = el('div', { class:'game-area' });
  let profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  if (profiles.length === 0) {
    profiles = [{ id: 'default', name: 'Kid 1', emoji: '🧒' }];
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }
  const active = localStorage.getItem('activeProfile') || 'default';

  profiles.forEach(p => {
    const stars = parseInt(localStorage.getItem(`p_${p.id}_stars`) || '0');
    const streak = parseInt(localStorage.getItem(`p_${p.id}_streak`) || '0');
    const row = el('div', { class: 'profile-row' + (p.id === active ? ' active' : '') });
    row.innerHTML = `<div class="avatar">${p.emoji}</div>
      <div style="flex:1">
        <div style="font-weight:bold;font-size:18px">${p.name}</div>
        <div style="color:#666;font-size:13px">⭐ ${stars} stars | 🔥 ${streak} streak</div>
      </div>`;
    const useBtn = el('button', { class: 'btn green' }, p.id === active ? '✓' : T('Use','चुनें'));
    useBtn.onclick = () => {
      localStorage.setItem('activeProfile', p.id);
      loadProfile();
      go('classSelect');
      showToast(T(`Welcome ${p.name}!`,`स्वागत ${p.name}!`));
    };
    row.appendChild(useBtn);
    if (profiles.length > 1) {
      const del = el('button', { class:'btn', style:'background:#fff;color:#f44336;box-shadow:0 4px 0 #ddd' }, '🗑️');
      del.onclick = () => {
        if (confirm(T(`Delete ${p.name}?`,`${p.name} हटाएँ?`))) {
          profiles = profiles.filter(x => x.id !== p.id);
          localStorage.setItem('profiles', JSON.stringify(profiles));
          if (active === p.id) localStorage.setItem('activeProfile', profiles[0].id);
          BUILDERS.profiles(root);
        }
      };
      row.appendChild(del);
    }
    wrap.appendChild(row);
  });

  const add = el('button', { class:'btn blue' }, '➕ ' + T('Add Child','नया बच्चा जोड़ें'));
  add.onclick = () => {
    const name = prompt(T("Child's name?","बच्चे का नाम?"));
    if (!name) return;
    const id = 'kid_' + Date.now();
    profiles.push({ id, name, emoji: '🧒' });
    localStorage.setItem('profiles', JSON.stringify(profiles));
    localStorage.setItem('activeProfile', id);
    loadProfile();
    go('avatarBuilder');
  };
  const changeAvatar = el('button', { class:'btn orange' }, '🎭 ' + T('Change Avatar','अवतार बदलें'));
  changeAvatar.onclick = () => go('avatarBuilder');
  wrap.appendChild(el('div', { class:'btn-row' }, [add, changeAvatar]));

  // Daily Surprise
  const surprise = el('div', { class:'rhyme-card' });
  surprise.appendChild(el('h3', {}, '🎁 ' + T('Daily Surprise','आज की सरप्राइज़')));
  const today = new Date().toDateString();
  const surprises_en = ['Read a rhyme today!','Try the Memory Match game!','Colour a picture!','Practice writing your name!','Count to 20!','Learn a new fruit name!'];
  const surprises_hi = ['आज एक कविता पढ़ो!','मेमोरी मैच खेलो!','कुछ रंग भरो!','अपना नाम लिखने का अभ्यास करो!','२० तक गिनो!','एक नया फल का नाम सीखो!'];
  const idx = today.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % surprises_en.length;
  surprise.appendChild(el('p', { style:'font-size:16px;color:#444' }, T(surprises_en[idx], surprises_hi[idx])));
  wrap.appendChild(surprise);

  // Settings
  const setBox = el('div', { class:'rhyme-card' });
  setBox.appendChild(el('h3', {}, '⚙️ ' + T('Settings','सेटिंग')));
  const darkBtn = el('button', { class:'btn' }, T(document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode',
                                                   document.body.classList.contains('dark') ? '☀️ रोशन मोड' : '🌙 रात मोड'));
  darkBtn.onclick = () => document.getElementById('darkBtn').click();
  const resetBtn = el('button', { class:'btn', style:'background:#fff;color:#d32f2f;box-shadow:0 4px 0 #ddd' }, T('🗑️ Reset All Data','🗑️ सब रीसेट'));
  resetBtn.onclick = () => {
    if (confirm(T('This will delete ALL progress for ALL kids. Sure?','सभी बच्चों का प्रोग्रेस मिट जाएगा। पक्का?'))) {
      localStorage.clear(); location.reload();
    }
  };
  setBox.appendChild(el('div', { class:'btn-row' }, [darkBtn, resetBtn]));
  wrap.appendChild(setBox);

  root.appendChild(wrap);
};

// ============================================================
// =================== ENHANCED REWARDS =====================
// ============================================================
BUILDERS.rewards = (root) => {
  root.innerHTML = '';
  root.appendChild(header('My Rewards','मेरे पुरस्कार','Stars, Pets, Garden, Stickers!','तारे, पालतू, बगीचा, स्टिकर!'));
  const wrap = el('div', { class:'game-area' });

  // Stars
  wrap.appendChild(el('div', { style:'text-align:center' }, [
    el('div', { style:'font-size:80px' }, '⭐'),
    el('div', { style:'font-size:32px;font-weight:bold;color:#ff4081' }, STATE.stars + T(' Stars',' तारे'))
  ]));

  // Streak
  const streak = parseInt(localStorage.getItem(profileKey('streak')) || '0');
  wrap.appendChild(el('div', { style:'text-align:center;margin:14px;background:linear-gradient(135deg,#ff5722,#ff9800);color:#fff;padding:14px;border-radius:18px;font-size:20px;font-weight:bold' },
    `🔥 ${streak} ${T('Day Streak','दिन की लगातार पढ़ाई')}`));

  // Badges
  const badges = el('div', { class:'rhyme-card' });
  badges.appendChild(el('h3', {}, '🏅 ' + T('Badges','बैज')));
  const tiers = [
    [10,'🥉','Beginner','शुरुआत'],
    [25,'🥈','Learner','शिक्षार्थी'],
    [50,'🥇','Smart Kid','होशियार'],
    [100,'🏆','Champion','चैंपियन'],
    [200,'👑','Genius','प्रतिभावान'],
    [500,'💎','Diamond','हीरा']
  ];
  const bg = el('div', { style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px' });
  tiers.forEach(([n, em, en, hi]) => {
    const got = STATE.stars >= n;
    bg.appendChild(el('div', { class:'card', style: got ? '' : 'opacity:.35;filter:grayscale(1)' }, [
      el('div', { class:'emoji', style:'font-size:42px' }, em),
      el('div', { class:'word', style:'font-size:13px' }, T(en, hi) + ' (' + n + ')')
    ]));
  });
  badges.appendChild(bg);
  wrap.appendChild(badges);

  // Pet collection
  const petBox = el('div', { class:'rhyme-card' });
  petBox.appendChild(el('h3', {}, '🐾 ' + T('Pet Collection','पालतू संग्रह')));
  const pets = [
    [50,'🐶','Puppy','पिल्ला'],
    [100,'🐱','Kitten','बिल्ली का बच्चा'],
    [150,'🐰','Bunny','खरगोश'],
    [200,'🐢','Turtle','कछुआ'],
    [300,'🦊','Fox','लोमड़ी'],
    [400,'🐼','Panda','पांडा'],
    [500,'🦁','Lion','शेर'],
    [700,'🐉','Dragon','ड्रैगन']
  ];
  const pg = el('div', { style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px' });
  pets.forEach(([n, em, en, hi]) => {
    const got = STATE.stars >= n;
    pg.appendChild(el('div', { class:'card', style: got ? '' : 'opacity:.3;filter:grayscale(1)' }, [
      el('div', { style:'font-size:42px' }, em),
      el('div', { style:'font-size:11px;color:#666' }, got ? T(en, hi) : `${n}⭐`)
    ]));
  });
  petBox.appendChild(pg);
  wrap.appendChild(petBox);

  // Sticker collection
  const stickBox = el('div', { class:'rhyme-card' });
  stickBox.appendChild(el('h3', {}, '🎁 ' + T('Sticker Book','स्टिकर बुक')));
  const stickers = ['⭐','🌟','💫','✨','🎉','🎊','🎀','🎈','🌈','🦄','💖','🍀','🌟','🥇','🏆','👑','💎','🪅','🎁','🍭'];
  const sg = el('div', { style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:6px' });
  stickers.forEach((em, i) => {
    const need = (i + 1) * 5;
    const got = STATE.stars >= need;
    sg.appendChild(el('div', { style:`background:#fff;border-radius:14px;padding:10px;text-align:center;font-size:28px;${got?'':'opacity:.25;filter:grayscale(1)'}` }, em));
  });
  stickBox.appendChild(sg);
  wrap.appendChild(stickBox);

  // Garden
  const gardenBox = el('div', { class:'rhyme-card' });
  gardenBox.appendChild(el('h3', {}, '🌳 ' + T('My Garden','मेरा बगीचा')));
  const flowers = ['🌱','🌿','🌷','🌸','🌹','🌻','🌼','🪷','🌳','🌴','🌵','🍄'];
  const garden = el('div', { style:'display:grid;grid-template-columns:repeat(6,1fr);gap:6px;background:#c8e6c9;padding:14px;border-radius:14px' });
  for (let i = 0; i < 12; i++) {
    const need = (i + 1) * 8;
    const got = STATE.stars >= need;
    garden.appendChild(el('div', { style:`text-align:center;font-size:32px;${got?'':'opacity:.2'}` }, got ? flowers[i] : '🟫'));
  }
  gardenBox.appendChild(garden);
  wrap.appendChild(gardenBox);

  // Birthday
  const dob = localStorage.getItem(profileKey('dob'));
  const today = new Date();
  const isBday = dob && (() => {
    const d = new Date(dob);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  })();
  const bdayBox = el('div', { class:'rhyme-card', style: isBday ? 'background:linear-gradient(135deg,#fff59d,#ffcc80);' : '' });
  bdayBox.appendChild(el('h3', {}, '🎂 ' + T('Birthday','जन्मदिन')));
  if (isBday) {
    bdayBox.appendChild(el('div', { style:'font-size:20px;font-weight:bold;color:#d84315;text-align:center' },
      '🎉 ' + T('HAPPY BIRTHDAY! 🎂🎁','जन्मदिन मुबारक! 🎂🎁') + ' 🎉'));
    speak(T('Happy Birthday to you!','जन्मदिन मुबारक हो!'));
  } else {
    const setBday = el('button', { class:'btn orange' }, dob ? T('Change DOB','जन्म तिथि बदलें') : T('Set DOB','जन्म तिथि सेट करें'));
    setBday.onclick = () => {
      const v = prompt(T('Enter DOB (YYYY-MM-DD):','जन्म तिथि (YYYY-MM-DD):'), dob || '');
      if (v) { localStorage.setItem(profileKey('dob'), v); BUILDERS.rewards(root); }
    };
    bdayBox.appendChild(el('div', { class:'btn-row' }, [setBday]));
    if (dob) bdayBox.appendChild(el('p', { style:'text-align:center;color:#666' }, T('DOB: ','जन्म तिथि: ') + dob));
  }
  wrap.appendChild(bdayBox);

  // Certificate
  if (STATE.stars >= 100) {
    const cert = el('div', { class:'rhyme-card', style:'background:linear-gradient(135deg,#fff3e0,#ffe0b2);border:4px solid #ffa726;text-align:center' });
    cert.innerHTML = `
      <div style="font-size:60px">🏅</div>
      <h2 style="color:#e65100;margin:10px 0">${T('CERTIFICATE','प्रमाण पत्र')}</h2>
      <p style="font-size:18px;color:#5d4037">${T('This certifies that','यह प्रमाणित करता है कि')}</p>
      <p style="font-size:24px;font-weight:bold;color:#bf360c">${(JSON.parse(localStorage.getItem('profiles')||'[]').find(p=>p.id===(localStorage.getItem('activeProfile')||'default')) || {name:'Champion'}).name}</p>
      <p style="font-size:16px;color:#5d4037">${T(`has earned ${STATE.stars} stars!`,`ने ${STATE.stars} तारे जीते!`)}</p>
      <p style="font-size:14px;color:#999;margin-top:10px">${new Date().toLocaleDateString()}</p>`;
    const print = el('button', { class:'btn green' }, '🖨️ ' + T('Print','छापें'));
    print.onclick = () => window.print();
    cert.appendChild(el('div', { class:'btn-row' }, [print]));
    wrap.appendChild(cert);
  } else {
    const lockedCert = el('div', { class:'rhyme-card', style:'opacity:.5;text-align:center' });
    lockedCert.innerHTML = `<div style="font-size:50px">🔒</div>
      <p>${T(`Earn 100 stars to unlock certificate (${STATE.stars}/100)`,`प्रमाण पत्र के लिए १०० तारे चाहिए (${STATE.stars}/100)`)}</p>`;
    wrap.appendChild(lockedCert);
  }

  // Reset
  const reset = el('button', { class:'btn', style:'background:#fff;color:#d32f2f;box-shadow:0 4px 0 #ddd' }, T('Reset Stars','तारे रीसेट करें'));
  reset.onclick = () => {
    if (confirm(T('Reset stars?','तारे रीसेट करें?'))) {
      STATE.stars = 0; localStorage.setItem(profileKey('stars'), 0); setStars(); BUILDERS.rewards(root);
    }
  };
  wrap.appendChild(el('div', { class:'btn-row' }, [reset]));
  root.appendChild(wrap);
};

// ============================================================
// =================== EXTENDED RHYMES & STORIES =============
// ============================================================
RHYMES_FULL.push(
  ['Wheels on the Bus',
`The wheels on the bus go round and round,
Round and round, round and round.
The wheels on the bus go round and round,
All through the town!`,
'बस के पहिए',
`बस के पहिए घूमें गोल गोल,
गोल गोल, गोल गोल।
बस के पहिए घूमें गोल गोल,
पूरे शहर में!`],
  ['Humpty Dumpty',
`Humpty Dumpty sat on a wall,
Humpty Dumpty had a great fall.
All the king's horses and all the king's men,
Couldn't put Humpty together again!`,
'हंप्टी डंप्टी',
`हंप्टी डंप्टी दीवार पे बैठा,
हंप्टी डंप्टी गिर गया रे।
राजा के सब घोड़े, सब सेना,
हंप्टी को न जोड़ सकी।`],
  ['Itsy Bitsy Spider',
`The itsy bitsy spider climbed up the water spout,
Down came the rain and washed the spider out,
Out came the sun and dried up all the rain,
And the itsy bitsy spider climbed up the spout again!`,
'छोटी मकड़ी',
`नन्ही मकड़ी पाइप पे चढ़ी,
बारिश आई, मकड़ी बही।
सूरज आया, बारिश सूख गई,
नन्ही मकड़ी फिर चढ़ गई!`],
  ['Aloo Kachaloo',
`Aloo kachaloo beta kahaan gaye the,
Bandi bagiya mein so rahe the,
Bandi bagiya mein dande pade,
Aloo kachaloo bhag-bhag gaye!`,
'आलू कचालू',
`आलू कचालू बेटा कहाँ गए थे,
बंदी बगिया में सो रहे थे।
बंदी बगिया में डंडे पड़े,
आलू कचालू भाग-भाग गए!`],
  ['Lakdi Ki Kathi',
`Lakdi ki kaathi, kaathi pe ghoda,
Ghode ki dum pe jo maara hathoda,
Daude ghoda, daude ghoda,
Dum hilaake!`,
'लकड़ी की काठी',
`लकड़ी की काठी, काठी पे घोड़ा,
घोड़े की दुम पे जो मारा हथौड़ा।
दौड़े घोड़ा, दौड़े घोड़ा,
दुम हिलाके!`]
);

STORIES.push(
  ['The Foolish Crocodile',
`A monkey lived on a fruit tree by a river. A crocodile became his friend. The crocodile took fruits home for his wife. His wife wanted to eat the monkey's heart. The crocodile invited the monkey to his home. On the way, he told the truth. The clever monkey said "I left my heart on the tree!" They returned, and the monkey climbed up and never came back.

Lesson: Be wise. Use your brain in trouble.`,
'मूर्ख मगरमच्छ',
`एक बंदर नदी किनारे फल के पेड़ पर रहता था। एक मगरमच्छ उसका दोस्त बन गया। मगरमच्छ फल अपनी पत्नी के लिए ले जाता। पत्नी को बंदर का दिल खाना था। मगरमच्छ बंदर को घर बुलाने लगा। रास्ते में सच बता दिया। चतुर बंदर बोला "मैं दिल पेड़ पर भूल गया!" वापस आए, बंदर पेड़ पर चढ़ गया, फिर कभी नहीं आया।

सीख: मुश्किल में दिमाग लगाओ।`],
  ['The Greedy Dog',
`A dog found a big bone. While crossing a bridge, he saw his reflection in water. He thought it was another dog with a bigger bone! He barked, and his bone fell into the water. He lost his bone because of greed.

Lesson: Don't be greedy.`,
'लालची कुत्ता',
`एक कुत्ते को बड़ी हड्डी मिली। पुल पार करते समय पानी में अपनी परछाई देखी। उसे लगा वहाँ दूसरा कुत्ता है, बड़ी हड्डी के साथ! वो भौंका, और हड्डी पानी में गिर गई। लालच में उसकी अपनी हड्डी भी गई।

सीख: लालच मत करो।`],
  ['Akbar and Birbal — The Crow Count',
`King Akbar asked Birbal: "How many crows are in our city?" Birbal thought, then said: "Exactly 21,253, Your Majesty." Akbar asked: "How do you know?" Birbal said: "If you find more, some have visitors. If less, some are visiting other cities!" Akbar laughed and gave him a reward.

Lesson: Quick thinking solves any problem.`,
'अकबर बीरबल — कौओं की गिनती',
`अकबर ने बीरबल से पूछा: "हमारे शहर में कितने कौए हैं?" बीरबल ने सोचा, फिर बोला: "बिल्कुल २१,२५३ हुज़ूर।" अकबर ने पूछा: "कैसे पता?" बीरबल बोला: "अगर ज़्यादा मिलें, तो कुछ के मेहमान आए हैं। अगर कम, तो कुछ दूसरे शहर गए हैं!" अकबर हँस दिए, इनाम दिया।

सीख: चतुर बुद्धि से कोई भी सवाल हल हो जाता है।`]
);

// ============================================================
// =================== INIT EXTRAS ============================
// ============================================================
loadProfile();
updateStreak();

// ---------- PWA ----------
// Only register service worker over http(s) — avoids file:// CORS errors.
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  // Show our custom install banner
  setTimeout(() => {
    const b = document.getElementById('installBanner');
    if (b && !localStorage.getItem('installDismissed')) b.classList.add('show');
  }, 5000);
});

// ============================================================
// ============== ROUND 2 — ALL FEATURES =====================
// ============================================================

// ---------- MULTI-LANGUAGE (7 languages) ----------
const LANG_LIST = ['en','hi','mr','ta','bn','gu','pa'];
const LANG_INFO = {
  en: { label:'EN',  name:'English',  flag:'🇬🇧' },
  hi: { label:'हि',  name:'हिन्दी',    flag:'🇮🇳' },
  mr: { label:'मरा', name:'मराठी',    flag:'🇮🇳' },
  ta: { label:'த',   name:'தமிழ்',    flag:'🇮🇳' },
  bn: { label:'বা',  name:'বাংলা',     flag:'🇮🇳' },
  gu: { label:'ગુ',   name:'ગુજરાતી',  flag:'🇮🇳' },
  pa: { label:'ਪੰ',  name:'ਪੰਜਾਬੀ',    flag:'🇮🇳' }
};
// Common UI strings translated to all 7 languages (mr/ta/bn/gu/pa)
const TR_MAP = {
  // ========== Welcome / Navigation ==========
  'Choose Your Class':       { mr:'तुमचा वर्ग निवडा', ta:'உங்கள் வகுப்பைத் தேர்ந்தெடுக்கவும்', bn:'আপনার ক্লাস বেছে নিন', gu:'તમારો વર્ગ પસંદ કરો', pa:'ਆਪਣੀ ਕਲਾਸ ਚੁਣੋ' },
  'Pick the right level for your child': { mr:'तुमच्या मुलासाठी योग्य स्तर निवडा', ta:'உங்கள் குழந்தைக்கு சரியான நிலையைத் தேர்ந்தெடுக்கவும்', bn:'আপনার সন্তানের জন্য সঠিক স্তর বেছে নিন', gu:'તમારા બાળક માટે યોગ્ય સ્તર પસંદ કરો', pa:'ਆਪਣੇ ਬੱਚੇ ਲਈ ਸਹੀ ਪੱਧਰ ਚੁਣੋ' },
  'Tap any tile to start':   { mr:'कोणत्याही टाइलवर टॅप करा', ta:'எந்த ஓட்டையும் தட்டவும்', bn:'যেকোনো টাইল আলতো চাপুন', gu:'કોઈપણ ટાઇલ ટેપ કરો', pa:'ਕਿਸੇ ਵੀ ਟਾਇਲ ਨੂੰ ਟੈਪ ਕਰੋ' },
  'Tap any topic to start':  { mr:'कोणत्याही विषयावर टॅप करा', ta:'எந்த தலைப்பையும் தட்டவும்', bn:'যেকোনো বিষয় আলতো চাপুন', gu:'કોઈપણ વિષય ટેપ કરો', pa:'ਕਿਸੇ ਵੀ ਵਿਸ਼ੇ ਨੂੰ ਟੈਪ ਕਰੋ' },
  'Pick a chapter to begin': { mr:'धडा निवडा', ta:'ஒரு அத்தியாயம் தேர்வு செய்யவும்', bn:'একটি অধ্যায় বেছে নিন', gu:'એક પ્રકરણ પસંદ કરો', pa:'ਅਧਿਆਇ ਚੁਣੋ' },
  "Today's Lesson":          { mr:'आजचा पाठ', ta:'இன்றைய பாடம்', bn:'আজকের পাঠ', gu:'આજનો પાઠ', pa:'ਅੱਜ ਦਾ ਪਾਠ' },
  'Continue Learning':       { mr:'सुरू ठेवा', ta:'தொடரவும்', bn:'চালিয়ে যান', gu:'ચાલુ રાખો', pa:'ਜਾਰੀ ਰੱਖੋ' },
  'Daily Challenge':         { mr:'दैनिक आव्हान', ta:'தினசரி சவால்', bn:'দৈনিক চ্যালেঞ্জ', gu:'દૈનિક પડકાર', pa:'ਰੋਜ਼ਾਨਾ ਚੁਣੌਤੀ' },
  '5 fun activities for today': { mr:'आजच्या ५ मजेदार क्रिया', ta:'இன்றைக்கு 5 வேடிக்கையான செயல்பாடுகள்', bn:'আজকের ৫টি মজার কার্যকলাপ', gu:'આજની ૫ મજાની પ્રવૃત્તિઓ', pa:'ਅੱਜ ਦੀਆਂ 5 ਮਜ਼ੇਦਾਰ ਗਤੀਵਿਧੀਆਂ' },
  '🔄 Change Class':          { mr:'🔄 वर्ग बदला', ta:'🔄 வகுப்பை மாற்று', bn:'🔄 ক্লাস পরিবর্তন', gu:'🔄 વર્ગ બદલો', pa:'🔄 ਕਲਾਸ ਬਦਲੋ' },

  // ========== Class names / Welcome ==========
  'Nursery Learning':        { mr:'नर्सरी अभ्यास', ta:'நர்சரி கற்றல்', bn:'নার্সারি শিক্ষা', gu:'નર્સરી શિક્ષણ', pa:'ਨਰਸਰੀ ਸਿੱਖਿਆ' },
  'KG 1 Learning':           { mr:'के.जी. १ अभ्यास', ta:'KG 1 கற்றல்', bn:'কেজি ১ শিক্ষা', gu:'KG ૧ શિક્ષણ', pa:'KG ੧ ਸਿੱਖਿਆ' },
  'KG 2 Learning':           { mr:'के.जी. २ अभ्यास', ta:'KG 2 கற்றல்', bn:'কেজি ২ শিক্ষা', gu:'KG ૨ શિક્ષણ', pa:'KG ੨ ਸਿੱਖਿਆ' },

  // ========== Chapter names ==========
  'English':                 { mr:'इंग्रजी', ta:'ஆங்கிலம்', bn:'ইংরেজি', gu:'અંગ્રેજી', pa:'ਅੰਗ੍ਰੇਜ਼ੀ' },
  'Hindi':                   { mr:'हिंदी', ta:'இந்தி', bn:'হিন্দি', gu:'હિન્દી', pa:'ਹਿੰਦੀ' },
  'Maths':                   { mr:'गणित', ta:'கணிதம்', bn:'গণিত', gu:'ગણિત', pa:'ਗਣਿਤ' },
  'World Around Us':         { mr:'आपले जग', ta:'நம்மைச் சுற்றியுள்ள உலகம்', bn:'আমাদের চারপাশের বিশ্ব', gu:'આપણી આસપાસનું વિશ્વ', pa:'ਸਾਡੇ ਆਲੇ-ਦੁਆਲੇ ਦੀ ਦੁਨੀਆ' },
  'Culture & GK':            { mr:'संस्कृती व GK', ta:'கலாச்சாரம் & GK', bn:'সংস্কৃতি ও GK', gu:'સંસ્કૃતિ અને GK', pa:'ਸੱਭਿਆਚਾਰ ਅਤੇ GK' },
  'Writing & Art':           { mr:'लेखन व कला', ta:'எழுத்து & கலை', bn:'লেখা ও শিল্প', gu:'લેખન અને કલા', pa:'ਲਿਖਾਈ ਅਤੇ ਕਲਾ' },
  'Stories & Rhymes':        { mr:'गोष्टी व कविता', ta:'கதைகள் & கவிதைகள்', bn:'গল্প ও কবিতা', gu:'વાર્તાઓ અને કવિતાઓ', pa:'ਕਹਾਣੀਆਂ ਅਤੇ ਕਵਿਤਾਵਾਂ' },
  'Sounds':                  { mr:'आवाज', ta:'ஒலிகள்', bn:'শব্দ', gu:'અવાજો', pa:'ਆਵਾਜ਼ਾਂ' },
  'Games & Puzzles':         { mr:'खेळ व कोडी', ta:'விளையாட்டுகள் & புதிர்கள்', bn:'খেলা ও ধাঁধা', gu:'રમતો અને કોયડા', pa:'ਖੇਡਾਂ ਅਤੇ ਬੁਝਾਰਤਾਂ' },
  'Voice Practice':          { mr:'आवाज सराव', ta:'குரல் பயிற்சி', bn:'কণ্ঠস্বর অনুশীলন', gu:'અવાજ પ્રેક્ટિસ', pa:'ਆਵਾਜ਼ ਅਭਿਆਸ' },
  'Smart Learning':          { mr:'स्मार्ट शिक्षण', ta:'புத்திசாலி கற்றல்', bn:'স্মার্ট শিক্ষা', gu:'સ્માર્ટ શિક્ષણ', pa:'ਸਮਾਰਟ ਸਿੱਖਿਆ' },
  'Rewards':                 { mr:'बक्षीस', ta:'வெகுமதிகள்', bn:'পুরস্কার', gu:'પુરસ્કાર', pa:'ਇਨਾਮ' },

  // ========== Common UI ==========
  'Stars':                   { mr:'तारे', ta:'நட்சத்திரங்கள்', bn:'তারা', gu:'તારા', pa:'ਤਾਰੇ' },
  'Streak':                  { mr:'सलग दिवस', ta:'தொடர்', bn:'ধারাবাহিক', gu:'સતત', pa:'ਸਟ੍ਰੀਕ' },
  'Correct!':                { mr:'बरोबर!', ta:'சரி!', bn:'সঠিক!', gu:'સાચું!', pa:'ਠੀਕ!' },
  'Try again':               { mr:'पुन्हा प्रयत्न करा', ta:'மீண்டும் முயற்சிக்கவும்', bn:'আবার চেষ্টা করুন', gu:'ફરી પ્રયાસ કરો', pa:'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' },
  'Well done!':              { mr:'छान केले!', ta:'நன்றாகச் செய்தீர்கள்!', bn:'ভালো করেছ!', gu:'સારું કર્યું!', pa:'ਵਧੀਆ ਕੀਤਾ!' },
  'Excellent!':              { mr:'खूप छान!', ta:'சிறப்பாக!', bn:'চমৎকার!', gu:'ઉત્તમ!', pa:'ਬਹੁਤ ਵਧੀਆ!' },
  'Score':                   { mr:'गुण', ta:'மதிப்பெண்', bn:'স্কোর', gu:'સ્કોર', pa:'ਸਕੋਰ' },
  'Skip':                    { mr:'वगळा', ta:'தவிர்', bn:'এড়িয়ে যান', gu:'છોડો', pa:'ਛੱਡੋ' },
  'Next':                    { mr:'पुढील', ta:'அடுத்து', bn:'পরবর্তী', gu:'આગળ', pa:'ਅੱਗੇ' },
  'Back':                    { mr:'परत', ta:'பின்', bn:'পিছনে', gu:'પાછળ', pa:'ਪਿੱਛੇ' },
  'Done ✓':                  { mr:'झाले ✓', ta:'முடிந்தது ✓', bn:'হয়ে গেছে ✓', gu:'પૂર્ણ ✓', pa:'ਪੂਰਾ ✓' },
  'Start':                   { mr:'सुरू', ta:'தொடங்கு', bn:'শুরু', gu:'શરૂ', pa:'ਸ਼ੁਰੂ' },
  'topics':                  { mr:'विषय', ta:'தலைப்புகள்', bn:'বিষয়', gu:'વિષય', pa:'ਵਿਸ਼ੇ' },

  // ========== Subject names (most visible) ==========
  'ABC':                     { mr:'इंग्रजी A-Z', ta:'ஆங்கிலம் A-Z', bn:'ইংরেজি A-Z', gu:'અંગ્રેજી A-Z', pa:'ਅੰਗ੍ਰੇਜ਼ੀ A-Z' },
  'A-Z Words':               { mr:'A-Z शब्द', ta:'A-Z சொற்கள்', bn:'A-Z শব্দ', gu:'A-Z શબ્દો', pa:'A-Z ਸ਼ਬਦ' },
  'Aa Bb Cc':                { mr:'मोठे-लहान', ta:'பெரிய-சிறிய', bn:'বড়-ছোট', gu:'મોટા-નાના', pa:'ਵੱਡੇ-ਛੋਟੇ' },
  'Phonics A-Z':             { mr:'फोनिक्स A-Z', ta:'ஒலிகள் A-Z', bn:'ধ্বনি A-Z', gu:'ધ્વનિ A-Z', pa:'ਫੋਨਿਕਸ A-Z' },
  'Numbers 1-10':            { mr:'संख्या १-१०', ta:'எண்கள் 1-10', bn:'সংখ্যা ১-১০', gu:'સંખ્યા ૧-૧૦', pa:'ਨੰਬਰ ੧-੧੦' },
  'Numbers 1-50':            { mr:'संख्या १-५०', ta:'எண்கள் 1-50', bn:'সংখ্যা ১-৫০', gu:'સંખ્યા ૧-૫૦', pa:'ਨੰਬਰ ੧-੫੦' },
  'Numbers 1-100':           { mr:'संख्या १-१००', ta:'எண்கள் 1-100', bn:'সংখ্যা ১-১০০', gu:'સંખ્યા ૧-૧૦૦', pa:'ਨੰਬਰ ੧-੧੦੦' },
  'Number Names':            { mr:'संख्यांची नावे', ta:'எண் பெயர்கள்', bn:'সংখ্যার নাম', gu:'સંખ્યાના નામ', pa:'ਸੰਖਿਆ ਨਾਮ' },
  'Addition':                { mr:'बेरीज', ta:'கூட்டல்', bn:'যোগ', gu:'સરવાળો', pa:'ਜੋੜ' },
  'Add & Subtract':          { mr:'बेरीज-वजाबाकी', ta:'கூட்டல்-கழித்தல்', bn:'যোগ-বিয়োগ', gu:'સરવાળો-બાદબાકી', pa:'ਜੋੜ-ਘਟਾਓ' },
  'Tables 2-10':             { mr:'पाढे २-१०', ta:'பெருக்கல் 2-10', bn:'নামতা ২-১০', gu:'ઘડિયા ૨-૧૦', pa:'ਪਹਾੜੇ ੨-੧੦' },
  'Skip Counting':           { mr:'उडी मोजणी', ta:'தவிர் எண்ணுதல்', bn:'এড়িয়ে গণনা', gu:'કૂદ ગણતરી', pa:'ਛੱਡ ਗਿਣਤੀ' },
  'Greater/Less':            { mr:'मोठे/लहान', ta:'பெரிய/சிறிய', bn:'বড়/ছোট', gu:'મોટું/નાનું', pa:'ਵੱਡਾ/ਛੋਟਾ' },
  'Measurement':             { mr:'मापन', ta:'அளவீடு', bn:'পরিমাপ', gu:'માપ', pa:'ਮਾਪ' },
  'Tell Time':               { mr:'वेळ सांगा', ta:'நேரம் சொல்லு', bn:'সময় বলো', gu:'સમય કહો', pa:'ਸਮਾਂ ਦੱਸੋ' },
  'Indian Money':            { mr:'भारतीय पैसा', ta:'இந்தியப் பணம்', bn:'ভারতীয় টাকা', gu:'ભારતીય પૈસા', pa:'ਭਾਰਤੀ ਪੈਸਾ' },
  'Word Problems':           { mr:'शब्द कोडी', ta:'சொல் கணக்கு', bn:'শব্দ অঙ্ক', gu:'શબ્દ સવાલ', pa:'ਸ਼ਬਦ ਸਵਾਲ' },
  'Big & Small':             { mr:'मोठे-लहान', ta:'பெரிய-சிறிய', bn:'বড়-ছোট', gu:'મોટું-નાનું', pa:'ਵੱਡਾ-ਛੋਟਾ' },
  'In/On/Under':             { mr:'आत/वर/खाली', ta:'உள்ளே/மேலே/கீழே', bn:'ভিতরে/উপরে/নিচে', gu:'અંદર/ઉપર/નીચે', pa:'ਅੰਦਰ/ਉੱਪਰ/ਹੇਠਾਂ' },
  'Today/Yest/Tom':          { mr:'आज/काल/उद्या', ta:'இன்று/நேற்று/நாளை', bn:'আজ/গতকাল/আগামীকাল', gu:'આજે/ગઈકાલે/આવતીકાલે', pa:'ਅੱਜ/ਕੱਲ੍ਹ/ਪਰਸੋਂ' },
  'Colors':                  { mr:'रंग', ta:'வண்ணங்கள்', bn:'রং', gu:'રંગ', pa:'ਰੰਗ' },
  'Shapes':                  { mr:'आकार', ta:'வடிவங்கள்', bn:'আকার', gu:'આકાર', pa:'ਸ਼ਕਲ' },
  'Animals':                 { mr:'प्राणी', ta:'விலங்குகள்', bn:'প্রাণী', gu:'પ્રાણીઓ', pa:'ਜਾਨਵਰ' },
  'Birds':                   { mr:'पक्षी', ta:'பறவைகள்', bn:'পাখি', gu:'પક્ષીઓ', pa:'ਪੰਛੀ' },
  'Fruits':                  { mr:'फळे', ta:'பழங்கள்', bn:'ফল', gu:'ફળ', pa:'ਫਲ' },
  'Vegetables':              { mr:'भाज्या', ta:'காய்கறிகள்', bn:'সবজি', gu:'શાકભાજી', pa:'ਸਬਜ਼ੀਆਂ' },
  'Body Parts':              { mr:'शरीराचे भाग', ta:'உடல் பாகங்கள்', bn:'শরীরের অংশ', gu:'શરીરના ભાગ', pa:'ਸਰੀਰ ਦੇ ਅੰਗ' },
  'Family':                  { mr:'कुटुंब', ta:'குடும்பம்', bn:'পরিবার', gu:'કુટુંબ', pa:'ਪਰਿਵਾਰ' },
  'Days':                    { mr:'दिवस', ta:'நாட்கள்', bn:'দিন', gu:'દિવસો', pa:'ਦਿਨ' },
  'Months':                  { mr:'महिने', ta:'மாதங்கள்', bn:'মাস', gu:'મહિના', pa:'ਮਹੀਨੇ' },
  'Seasons':                 { mr:'ऋतू', ta:'பருவங்கள்', bn:'ঋতু', gu:'ઋતુઓ', pa:'ਮੌਸਮ' },
  'Vehicles':                { mr:'वाहने', ta:'வாகனங்கள்', bn:'যানবাহন', gu:'વાહનો', pa:'ਵਾਹਨ' },
  'Opposites':               { mr:'विरुद्ध', ta:'எதிர்ச்சொற்கள்', bn:'বিপরীত', gu:'વિરુદ્ધ', pa:'ਉਲਟ' },
  'Good Habits':             { mr:'चांगल्या सवयी', ta:'நல்ல பழக்கங்கள்', bn:'ভালো অভ্যাস', gu:'સારી ટેવો', pa:'ਚੰਗੀਆਂ ਆਦਤਾਂ' },
  'Rhymes':                  { mr:'कविता', ta:'கவிதைகள்', bn:'কবিতা', gu:'કવિતાઓ', pa:'ਕਵਿਤਾਵਾਂ' },
  'Stories':                 { mr:'गोष्टी', ta:'கதைகள்', bn:'গল্প', gu:'વાર્તાઓ', pa:'ਕਹਾਣੀਆਂ' },
  'Animal Sounds':           { mr:'प्राण्यांचे आवाज', ta:'விலங்கு ஒலிகள்', bn:'প্রাণীর শব্দ', gu:'પ્રાણીઓના અવાજો', pa:'ਜਾਨਵਰਾਂ ਦੀਆਂ ਆਵਾਜ਼ਾਂ' },
  'Vehicle Sounds':          { mr:'वाहनांचे आवाज', ta:'வாகன ஒலிகள்', bn:'যানবাহনের শব্দ', gu:'વાહનોના અવાજો', pa:'ਵਾਹਨਾਂ ਦੀਆਂ ਆਵਾਜ਼ਾਂ' },
  'Nature Sounds':           { mr:'निसर्गाचे आवाज', ta:'இயற்கை ஒலிகள்', bn:'প্রকৃতির শব্দ', gu:'કુદરતના અવાજો', pa:'ਕੁਦਰਤ ਦੀਆਂ ਆਵਾਜ਼ਾਂ' },
  'Letter Writing':          { mr:'अक्षर लिहा', ta:'எழுத்து எழுது', bn:'অক্ষর লিখুন', gu:'અક્ષર લખો', pa:'ਅੱਖਰ ਲਿਖੋ' },
  'Number Writing':          { mr:'संख्या लिहा', ta:'எண் எழுது', bn:'সংখ্যা লিখুন', gu:'સંખ્યા લખો', pa:'ਨੰਬਰ ਲਿਖੋ' },
  'Coloring':                { mr:'रंग भरा', ta:'வண்ணம் தீட்டு', bn:'রং করো', gu:'રંગ ભરો', pa:'ਰੰਗ ਭਰੋ' },
  'Spelling':                { mr:'शब्दलेखन', ta:'எழுத்துக்கூட்டல்', bn:'বানান', gu:'જોડણી', pa:'ਸਪੈਲਿੰਗ' },
  'Cursive':                 { mr:'सुलेख', ta:'நெளிவெழுத்து', bn:'হস্তলিপি', gu:'સુલેખ', pa:'ਸੁਲੇਖ' },
  'Festivals':               { mr:'सण', ta:'திருவிழாக்கள்', bn:'উৎসব', gu:'તહેવારો', pa:'ਤਿਉਹਾਰ' },
  'Prayers':                 { mr:'प्रार्थना', ta:'பிரார்த்தனைகள்', bn:'প্রার্থনা', gu:'પ્રાર્થના', pa:'ਪ੍ਰਾਰਥਨਾ' },
  'National Symbols':        { mr:'राष्ट्रीय चिन्हे', ta:'தேசிய சின்னங்கள்', bn:'জাতীয় প্রতীক', gu:'રાષ્ટ્રીય પ્રતીકો', pa:'ਰਾਸ਼ਟਰੀ ਚਿੰਨ੍ਹ' },
  'Famous Places':           { mr:'प्रसिद्ध ठिकाणे', ta:'பிரபலமான இடங்கள்', bn:'বিখ্যাত স্থান', gu:'પ્રખ્યાત સ્થળો', pa:'ਮਸ਼ਹੂਰ ਥਾਵਾਂ' },
  'Famous People':           { mr:'प्रसिद्ध लोक', ta:'பிரபலமானவர்கள்', bn:'বিখ্যাত মানুষ', gu:'પ્રખ્યાત લોકો', pa:'ਮਸ਼ਹੂਰ ਲੋਕ' },
  'Solar System':            { mr:'सौरमाला', ta:'சூரிய மண்டலம்', bn:'সৌরজগৎ', gu:'સૌરમંડળ', pa:'ਸੌਰ ਮੰਡਲ' },
  'Weather':                 { mr:'हवामान', ta:'வானிலை', bn:'আবহাওয়া', gu:'હવામાન', pa:'ਮੌਸਮ' },
  'Helpers':                 { mr:'मदतनीस', ta:'உதவியாளர்கள்', bn:'সাহায্যকারী', gu:'મદદ કરનાર', pa:'ਮਦਦਗਾਰ' },
  'Home Things':             { mr:'घरातील वस्तू', ta:'வீட்டுப் பொருட்கள்', bn:'ঘরের জিনিস', gu:'ઘરની વસ્તુઓ', pa:'ਘਰ ਦੀਆਂ ਚੀਜ਼ਾਂ' },
  'School Things':           { mr:'शाळेतील वस्तू', ta:'பள்ளி பொருட்கள்', bn:'স্কুলের জিনিস', gu:'શાળાની વસ્તુઓ', pa:'ਸਕੂਲ ਦੀਆਂ ਚੀਜ਼ਾਂ' },
  'Instruments':             { mr:'वाद्ये', ta:'இசைக்கருவிகள்', bn:'বাদ্যযন্ত্র', gu:'સંગીત વાદ્યો', pa:'ਸਾਜ਼' },
  'Sports':                  { mr:'खेळ', ta:'விளையாட்டுகள்', bn:'খেলাধুলা', gu:'રમતગમત', pa:'ਖੇਡਾਂ' },
  'Indian Foods':            { mr:'भारतीय अन्न', ta:'இந்திய உணவுகள்', bn:'ভারতীয় খাবার', gu:'ભારતીય ખોરાક', pa:'ਭਾਰਤੀ ਭੋਜਨ' },
  'Clothes':                 { mr:'कपडे', ta:'ஆடைகள்', bn:'পোশাক', gu:'કપડાં', pa:'ਕੱਪੜੇ' },
  'Memory Match':            { mr:'स्मरण जुळवा', ta:'நினைவு பொருத்தம்', bn:'স্মৃতি মিল', gu:'યાદ મેળવો', pa:'ਯਾਦ ਮੇਲ' },
  'Sort & Drop':              { mr:'क्रम लावा', ta:'வரிசைப்படுத்து', bn:'বাছাই করুন', gu:'ગોઠવો', pa:'ਛਾਂਟੋ' },
  'Sound Quiz':              { mr:'आवाज प्रश्न', ta:'ஒலி வினா', bn:'শব্দ কুইজ', gu:'અવાજ ક્વિઝ', pa:'ਆਵਾਜ਼ ਕਵਿਜ਼' },
  'Timed Challenge':         { mr:'वेळेचे आव्हान', ta:'நேர சவால்', bn:'সময়ের চ্যালেঞ্জ', gu:'સમય પડકાર', pa:'ਸਮੇਂ ਦੀ ਚੁਣੌਤੀ' },
  'Traffic Light':           { mr:'ट्रॅफिक दिवा', ta:'போக்குவரத்து விளக்கு', bn:'ট্রাফিক লাইট', gu:'ટ્રાફિક લાઇટ', pa:'ਟ੍ਰੈਫਿਕ ਲਾਈਟ' },
  'Dice Game':               { mr:'फासे खेळ', ta:'பகடை விளையாட்டு', bn:'পাশা খেলা', gu:'ડાઇસ ગેમ', pa:'ਪਾਸਾ ਖੇਡ' },
  'Pattern':                 { mr:'पॅटर्न', ta:'வடிவம்', bn:'প্যাটার্ন', gu:'પેટર્ન', pa:'ਪੈਟਰਨ' },
  'Sequence':                { mr:'क्रम', ta:'வரிசை', bn:'ক্রম', gu:'ક્રમ', pa:'ਕ੍ਰਮ' },
  'Sort by Size':            { mr:'आकाराने क्रम', ta:'அளவு வரிசை', bn:'আকার ক্রম', gu:'કદ ક્રમ', pa:'ਆਕਾਰ ਕ੍ਰਮ' },
  'Odd One Out':             { mr:'वेगळे कोणते', ta:'வேறுபட்டது', bn:'অন্যরকম', gu:'અલગ કોણ', pa:'ਵੱਖਰਾ' },
  'Count Objects':           { mr:'मोजा', ta:'எண்ணு', bn:'গণনা', gu:'ગણો', pa:'ਗਿਣੋ' },
  'Spot Difference':         { mr:'फरक शोधा', ta:'வேறுபாட்டைக் கண்டறி', bn:'পার্থক্য খুঁজুন', gu:'ફરક શોધો', pa:'ਫਰਕ ਲੱਭੋ' },
  'What Comes Next':         { mr:'पुढे काय', ta:'அடுத்தது என்ன', bn:'পরবর্তী কী', gu:'આગળ શું', pa:'ਅੱਗੇ ਕੀ' },
  'Match Game':              { mr:'जुळवा खेळ', ta:'பொருத்தும் விளையாட்டு', bn:'মিল খেলা', gu:'મેળ રમત', pa:'ਮੇਲ ਖੇਡ' },
  'Word Builder':            { mr:'शब्द बनवा', ta:'சொல் உருவாக்கு', bn:'শব্দ তৈরি', gu:'શબ્દ બનાવો', pa:'ਸ਼ਬਦ ਬਣਾਓ' },
  'Games':                   { mr:'खेळ', ta:'விளையாட்டுகள்', bn:'খেলা', gu:'રમતો', pa:'ਖੇਡਾਂ' },
  'Quiz':                    { mr:'प्रश्नमंजुषा', ta:'வினாடி வினா', bn:'কুইজ', gu:'ક્વિઝ', pa:'ਕਵਿਜ਼' },
  'GK Quiz':                 { mr:'सामान्य ज्ञान', ta:'பொது அறிவு', bn:'সাধারণ জ্ঞান', gu:'સામાન્ય જ્ઞાન', pa:'ਆਮ ਗਿਆਨ' },
  'Memory Palace':           { mr:'स्मृती महल', ta:'நினைவு அரண்மனை', bn:'স্মৃতি প্রাসাদ', gu:'સ્મૃતિ મહેલ', pa:'ਯਾਦ ਮਹਿਲ' },
  'Maze':                    { mr:'भूलभुलैया', ta:'மர்மப்பாதை', bn:'গোলকধাঁধা', gu:'ભુલભુલૈયા', pa:'ਭੁੱਲਭੁਲਈਆ' },
  'Jigsaw':                  { mr:'कोडे', ta:'புதிர்', bn:'ধাঁধা', gu:'કોયડો', pa:'ਪਹੇਲੀ' },
  'Find Items':              { mr:'वस्तू शोधा', ta:'பொருட்களைக் கண்டுபிடி', bn:'জিনিস খুঁজুন', gu:'વસ્તુઓ શોધો', pa:'ਚੀਜ਼ਾਂ ਲੱਭੋ' },
  'Pronounce':               { mr:'उच्चार', ta:'உச்சரி', bn:'উচ্চারণ', gu:'ઉચ્ચાર', pa:'ਉਚਾਰਨ' },
  'Voice Quiz':              { mr:'आवाज प्रश्न', ta:'குரல் வினா', bn:'কণ্ঠস্বর কুইজ', gu:'અવાજ ક્વિઝ', pa:'ਆਵਾਜ਼ ਕਵਿਜ਼' },
  'Smart Practice':          { mr:'स्मार्ट सराव', ta:'புத்திசாலி பயிற்சி', bn:'স্মার্ট অনুশীলন', gu:'સ્માર્ટ પ્રેક્ટિસ', pa:'ਸਮਾਰਟ ਅਭਿਆਸ' },
  'Suggestions':             { mr:'सुचवा', ta:'பரிந்துரைகள்', bn:'প্রস্তাব', gu:'સૂચનો', pa:'ਸੁਝਾਅ' },
  'Ask Tutor':               { mr:'शिक्षकाला विचारा', ta:'ஆசிரியரிடம் கேள்', bn:'শিক্ষককে জিজ্ঞাসা', gu:'શિક્ષકને પૂછો', pa:'ਅਧਿਆਪਕ ਨੂੰ ਪੁੱਛੋ' },
  'Story Maker':             { mr:'गोष्ट बनवा', ta:'கதை உருவாக்கு', bn:'গল্প বানাও', gu:'વાર્તા બનાવો', pa:'ਕਹਾਣੀ ਬਣਾਓ' },
  'My Pet':                  { mr:'माझा पाळीव', ta:'என் செல்லப்பிராணி', bn:'আমার পোষা', gu:'મારો પાલતુ', pa:'ਮੇਰਾ ਪਾਲਤੂ' },
  'Garden':                  { mr:'बाग', ta:'தோட்டம்', bn:'বাগান', gu:'બગીચો', pa:'ਬਾਗ' },
  'Surprise':                { mr:'आश्चर्य', ta:'ஆச்சரியம்', bn:'বিস্ময়', gu:'આશ્ચર્ય', pa:'ਹੈਰਾਨੀ' },
  'Leaderboard':             { mr:'अग्रणी फलक', ta:'தலைமை பலகை', bn:'লিডারবোর্ড', gu:'લીડરબોર્ડ', pa:'ਲੀਡਰਬੋਰਡ' },
  'Special Week':            { mr:'खास आठवडा', ta:'சிறப்பு வாரம்', bn:'বিশেষ সপ্তাহ', gu:'ખાસ સપ્તાહ', pa:'ਖਾਸ ਹਫ਼ਤਾ' },
  'Schedule':                { mr:'वेळापत्रक', ta:'அட்டவணை', bn:'সময়সূচী', gu:'સમયપત્રક', pa:'ਸਮਾਂ-ਸਾਰਨੀ' },
  'Homework':                { mr:'गृहपाठ', ta:'வீட்டுப்பாடம்', bn:'বাড়ির কাজ', gu:'ઘરકામ', pa:'ਘਰ ਦਾ ਕੰਮ' },
  'Science':                 { mr:'विज्ञान', ta:'அறிவியல்', bn:'বিজ্ঞান', gu:'વિજ્ઞાન', pa:'ਵਿਗਿਆਨ' },
  'Yoga':                    { mr:'योग', ta:'யோகா', bn:'যোগ', gu:'યોગ', pa:'ਯੋਗ' },
  'Computer':                { mr:'संगणक', ta:'கணினி', bn:'কম্পিউটার', gu:'કમ્પ્યુટર', pa:'ਕੰਪਿਊਟਰ' },
  'Hindi स्वर':              { mr:'हिंदी स्वर', ta:'இந்தி உயிர்', bn:'হিন্দি স্বর', gu:'હિન્દી સ્વર', pa:'ਹਿੰਦੀ ਸਵਰ' },
  'Hindi अ-ज्ञ':             { mr:'हिंदी पूर्ण', ta:'இந்தி அ-ஞ', bn:'হিন্দি সম্পূর্ণ', gu:'હિન્દી પૂર્ણ', pa:'ਹਿੰਦੀ ਪੂਰਨ' },
  'Hindi १-१०':              { mr:'हिंदी १-१०', ta:'இந்தி 1-10', bn:'হিন্দি ১-১০', gu:'હિન્દી ૧-૧૦', pa:'ਹਿੰਦੀ ੧-੧੦' },
  'Hindi १-५०':              { mr:'हिंदी १-५०', ta:'இந்தி 1-50', bn:'হিন্দি ১-৫০', gu:'હિન્દી ૧-૫૦', pa:'ਹਿੰਦੀ ੧-੫੦' },
  'Hindi १-१००':             { mr:'हिंदी १-१००', ta:'இந்தி 1-100', bn:'হিন্দি ১-১০০', gu:'હિન્દી ૧-૧૦૦', pa:'ਹਿੰਦੀ ੧-੧੦੦' },
  'Hindi Words':             { mr:'हिंदी शब्द', ta:'இந்தி சொற்கள்', bn:'হিন্দি শব্দ', gu:'હિન્દી શબ્દો', pa:'ਹਿੰਦੀ ਸ਼ਬਦ' },
  'Vowels & Consonants':     { mr:'स्वर-व्यंजन', ta:'உயிர்-மெய்', bn:'স্বর-ব্যঞ্জন', gu:'સ્વર-વ્યંજન', pa:'ਸਵਰ-ਵਿਅੰਜਨ' },
  '3-Letter Words':          { mr:'३ अक्षरी शब्द', ta:'3 எழுத்து சொற்கள்', bn:'৩ অক্ষরের শব্দ', gu:'૩ અક્ષરના શબ્દો', pa:'੩ ਅੱਖਰਾਂ ਦੇ ਸ਼ਬਦ' },
  'Sight Words':             { mr:'दृष्टी शब्द', ta:'பார்வை சொற்கள்', bn:'দৃষ্টি শব্দ', gu:'દૃષ્ટિ શબ્દો', pa:'ਨਜ਼ਰ ਸ਼ਬਦ' },
  'Make Sentences':          { mr:'वाक्य बनवा', ta:'வாக்கியங்கள் அமை', bn:'বাক্য তৈরি', gu:'વાક્યો બનાવો', pa:'ਵਾਕ ਬਣਾਓ' },
  'Reading':                 { mr:'वाचन', ta:'வாசிப்பு', bn:'পড়া', gu:'વાંચન', pa:'ਪੜ੍ਹਾਈ' },

  // ========== Class names ==========
  'NURSERY':                 { mr:'नर्सरी', ta:'நர்சரி', bn:'নার্সারি', gu:'નર્સરી', pa:'ਨਰਸਰੀ' },
  'KG 1':                    { mr:'के.जी. १', ta:'KG 1', bn:'কেজি ১', gu:'KG ૧', pa:'KG ੧' },
  'KG 2':                    { mr:'के.जी. २', ta:'KG 2', bn:'কেজি ২', gu:'KG ૨', pa:'KG ੨' },
  'Age 3-4 years':           { mr:'वय ३-४ वर्षे', ta:'வயது 3-4 ஆண்டுகள்', bn:'বয়স ৩-৪ বছর', gu:'ઉંમર ૩-૪ વર્ષ', pa:'ਉਮਰ ੩-੪ ਸਾਲ' },
  'Age 4-5 years':           { mr:'वय ४-५ वर्षे', ta:'வயது 4-5 ஆண்டுகள்', bn:'বয়স ৪-৫ বছর', gu:'ઉંમર ૪-૫ વર્ષ', pa:'ਉਮਰ ੪-੫ ਸਾਲ' },
  'Age 5-6 years':           { mr:'वय ५-६ वर्षे', ta:'வயது 5-6 ஆண்டுகள்', bn:'বয়স ৫-৬ বছর', gu:'ઉંમર ૫-૬ વર્ષ', pa:'ਉਮਰ ੫-੬ ਸਾਲ' },
  'Basic ABC, 1-10, Colors, Shapes, Animals': { mr:'मूळ ABC, १-१०, रंग, आकार, प्राणी', ta:'அடிப்படை ABC, 1-10, வண்ணங்கள், வடிவங்கள், விலங்குகள்', bn:'বেসিক ABC, ১-১০, রং, আকার, প্রাণী', gu:'મૂળભૂત ABC, ૧-૧૦, રંગ, આકાર, પ્રાણીઓ', pa:'ਬੇਸਿਕ ABC, ੧-੧੦, ਰੰਗ, ਸ਼ਕਲ, ਜਾਨਵਰ' },

  // ========== Status / Buttons ==========
  'Listening…':              { mr:'ऐकत आहे…', ta:'கேட்கிறது…', bn:'শুনছে…', gu:'સાંભળે છે…', pa:'ਸੁਣ ਰਿਹਾ…' },
  'You said:':               { mr:'तुम्ही म्हणालात:', ta:'நீங்கள் சொன்னது:', bn:'আপনি বললেন:', gu:'તમે કહ્યું:', pa:'ਤੁਸੀਂ ਕਿਹਾ:' },
  'Excellent!':              { mr:'खूप छान!', ta:'சிறப்பு!', bn:'চমৎকার!', gu:'ઉત્તમ!', pa:'ਸ਼ਾਨਦਾਰ!' },
  'Good try!':               { mr:'चांगला प्रयत्न!', ta:'நல்ல முயற்சி!', bn:'ভালো চেষ্টা!', gu:'સારો પ્રયત્ન!', pa:'ਚੰਗੀ ਕੋਸ਼ਿਸ਼!' },
  'Perfect!':                { mr:'अप्रतिम!', ta:'பரிபூரணம்!', bn:'নিখুঁত!', gu:'સંપૂર્ણ!', pa:'ਪਰਫੈਕਟ!' },
  'You won!':                { mr:'तुम्ही जिंकलात!', ta:'நீங்கள் வென்றீர்கள்!', bn:'আপনি জিতেছেন!', gu:'તમે જીત્યા!', pa:'ਤੁਸੀਂ ਜਿੱਤੇ!' },
  'All found!':              { mr:'सर्व सापडले!', ta:'அனைத்தும் கண்டுபிடிக்கப்பட்டது!', bn:'সব পাওয়া গেছে!', gu:'બધું મળ્યું!', pa:'ਸਭ ਮਿਲ ਗਏ!' },
  'Now your turn!':          { mr:'आता तुमची पाळी!', ta:'இப்போது உங்கள் முறை!', bn:'এখন আপনার পালা!', gu:'હવે તમારો વારો!', pa:'ਹੁਣ ਤੁਹਾਡੀ ਵਾਰੀ!' },
  'Ready':                   { mr:'तयार', ta:'தயார்', bn:'প্রস্তুত', gu:'તૈયાર', pa:'ਤਿਆਰ' },
  'Profile':                 { mr:'प्रोफाइल', ta:'சுயவிவரம்', bn:'প্রোফাইল', gu:'પ્રોફાઇલ', pa:'ਪ੍ਰੋਫਾਈਲ' },
  'Settings':                { mr:'सेटिंग', ta:'அமைப்புகள்', bn:'সেটিংস', gu:'સેટિંગ્સ', pa:'ਸੈਟਿੰਗਾਂ' }
};
function TL(en) {
  if (STATE.lang === 'en') return en;
  const m = TR_MAP[en];
  if (m && m[STATE.lang]) return m[STATE.lang];
  if (STATE.lang === 'hi' && m) return m.hi || en;
  return en;
}

// Override lang button to cycle through all languages
document.getElementById('langBtn').onclick = () => {
  const idx = LANG_LIST.indexOf(STATE.lang);
  STATE.lang = LANG_LIST[(idx + 1) % LANG_LIST.length];
  localStorage.setItem('lang', STATE.lang);
  applyLang();
  document.getElementById('langBtn').textContent = LANG_INFO[STATE.lang].label;
  showToast(LANG_INFO[STATE.lang].flag + ' ' + LANG_INFO[STATE.lang].name);
  if (STATE.current !== 'classSelect') go(STATE.current);
};
document.getElementById('langBtn').textContent = LANG_INFO[STATE.lang]?.label || 'EN';

// ============================================================
// ============== ADAPTIVE LEARNING ==========================
// ============================================================
function recordAnswer(topic, correct) {
  if (!topic || _NON_LEARNING.has(topic)) return;
  const key = profileKey('topicStats');
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  if (!data[topic]) data[topic] = { c: 0, w: 0, lastTry: 0 };
  if (correct) data[topic].c++; else data[topic].w++;
  data[topic].lastTry = Date.now();
  localStorage.setItem(key, JSON.stringify(data));
}
function topicMastery(topic) {
  const data = JSON.parse(localStorage.getItem(profileKey('topicStats')) || '{}');
  const t = data[topic];
  if (!t) return 0;
  const total = t.c + t.w;
  if (total < 3) return 1;
  const m = t.c / total;
  if (m >= 0.9) return 4;
  if (m >= 0.75) return 3;
  if (m >= 0.5) return 2;
  return 1;
}
function getWeakTopics() {
  const data = JSON.parse(localStorage.getItem(profileKey('topicStats')) || '{}');
  const list = [];
  Object.keys(data).forEach(t => {
    const total = data[t].c + data[t].w;
    if (total >= 3 && data[t].c / total < 0.6) list.push({ topic: t, ratio: data[t].c / total });
  });
  return list.sort((a, b) => a.ratio - b.ratio);
}

// Wrap addStar to also record correct
const _addStarR2 = addStar;
addStar = function(n=1) {
  _addStarR2(n);
  if (n > 0 && STATE.current && !_NON_LEARNING.has(STATE.current)) {
    recordAnswer(STATE.current, true);
  }
};
// Helper for wrong answers
function recordWrong() {
  if (STATE.current && !_NON_LEARNING.has(STATE.current)) {
    recordAnswer(STATE.current, false);
  }
}

// ============================================================
// ============== VOICE FEATURES (Web Speech API) ============
// ============================================================
const _SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function recognize(lang, onResult, onError) {
  if (!_SR) {
    if (onError) onError('not supported');
    return null;
  }
  const r = new _SR();
  r.lang = lang || (STATE.lang === 'hi' ? 'hi-IN' : 'en-US');
  r.interimResults = false;
  r.maxAlternatives = 3;
  r.onresult = (e) => {
    const alts = [];
    for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
    onResult(alts);
  };
  r.onerror = (e) => { if (onError) onError(e.error); };
  try { r.start(); } catch(e) { if (onError) onError('start failed'); }
  return r;
}
function pronunciationScore(target, said) {
  if (!target || !said) return 0;
  const t = target.toLowerCase().replace(/[^a-zA-Z]/g, '');
  const s = said.toLowerCase().replace(/[^a-zA-Z]/g, '');
  if (t === s) return 100;
  // Levenshtein-lite
  const m = Math.max(t.length, s.length);
  if (!m) return 0;
  let same = 0;
  for (let i = 0; i < Math.min(t.length, s.length); i++) if (t[i] === s[i]) same++;
  return Math.round((same / m) * 100);
}

BUILDERS.voicePractice = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🎤 Pronunciation Practice','🎤 उच्चारण अभ्यास',
    'Tap mic & say the word','माइक दबाओ और शब्द बोलो'));
  const wrap = el('div', { class:'game-area' });
  if (!_SR) {
    wrap.appendChild(el('div', { style:'text-align:center;padding:24px' }, [
      el('div', { style:'font-size:60px' }, '😞'),
      el('h3', {}, T('Voice not supported','आवाज़ सपोर्ट नहीं है')),
      el('p', {}, T('Use Chrome or Edge browser','Chrome या Edge में खोलें'))
    ]));
    root.appendChild(wrap);
    return;
  }
  const pool = ALPHABET.slice(0, 15).concat([
    ['','Apple','सेब','🍎'],['','Cat','बिल्ली','🐈'],['','Dog','कुत्ता','🐕'],
    ['','Sun','सूरज','☀️'],['','Tree','पेड़','🌳'],['','Star','तारा','⭐'],['','Moon','चाँद','🌙']
  ]);
  let item = pool[Math.floor(Math.random() * pool.length)];
  const display = el('div', { style:'text-align:center;font-size:32px;font-weight:bold;color:var(--primary);margin:14px' });
  const emoji = el('div', { style:'text-align:center;font-size:80px' });
  const meter = el('div', { class:'score-meter' }, [el('div', { style:'width:0%' }), el('span', {}, '—')]);
  const result = el('div', { style:'text-align:center;color:#666;font-size:14px;min-height:24px' });
  const mic = el('div', { class:'voice-mic' }, '🎤');
  function newWord() {
    item = pool[Math.floor(Math.random() * pool.length)];
    display.textContent = item[1];
    emoji.textContent = item[3];
    meter.firstChild.style.width = '0%';
    meter.lastChild.textContent = '—';
    result.textContent = '';
    speak(item[1]);
  }
  mic.onclick = () => {
    mic.classList.add('recording');
    result.textContent = T('Listening…','सुन रहा है…');
    recognize('en-US', (alts) => {
      mic.classList.remove('recording');
      const best = alts[0] || '';
      const score = Math.max(...alts.map(a => pronunciationScore(item[1], a)));
      meter.firstChild.style.width = score + '%';
      meter.lastChild.textContent = score + '%';
      result.innerHTML = `${T('You said:','आपने कहा:')} <b>${best}</b>`;
      if (score >= 80) { addStar(2); fireConfetti(50); speak(T('Excellent!','बहुत बढ़िया!')); setTimeout(newWord, 1500); }
      else if (score >= 50) { addStar(1); speak(T('Good try!','अच्छा प्रयास!')); }
      else { speak(T('Try again','फिर से')); recordWrong(); }
    }, (err) => {
      mic.classList.remove('recording');
      result.textContent = T('Tap mic again','फिर माइक दबाओ');
    });
  };
  wrap.appendChild(emoji);
  wrap.appendChild(display);
  wrap.appendChild(mic);
  wrap.appendChild(meter);
  wrap.appendChild(result);
  const next = el('button', { class:'btn blue' }, '⏭️ ' + T('Next','अगला'));
  next.onclick = newWord;
  wrap.appendChild(el('div', { class:'btn-row' }, [next]));
  root.appendChild(wrap);
  newWord();
};

BUILDERS.voiceQuiz = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🎙️ Voice Quiz','🎙️ आवाज़ क्विज़',
    'Speak the answer','उत्तर बोलें'));
  const wrap = el('div', { class:'game-area' });
  if (!_SR) {
    wrap.appendChild(el('div', { style:'text-align:center;padding:24px' }, [
      el('div', { style:'font-size:60px' }, '😞'),
      el('h3', {}, T('Voice not supported','आवाज़ सपोर्ट नहीं है'))
    ]));
    root.appendChild(wrap); return;
  }
  let q = null, score = 0, total = 0;
  const qBox = el('div', { style:'text-align:center;font-size:22px;margin:14px;color:var(--primary);font-weight:bold' });
  const ansBox = el('div', { style:'text-align:center;color:#666;font-size:14px;min-height:30px' });
  const mic = el('div', { class:'voice-mic' }, '🎤');
  const scoreBox = el('div', { style:'text-align:center;font-size:18px;font-weight:bold' });
  function newQ() {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    q = { question: `${a} + ${b} = ?`, answer: String(a + b), spoken: a + b };
    qBox.textContent = q.question;
    ansBox.textContent = '';
    speak(`${a} plus ${b}`);
  }
  mic.onclick = () => {
    mic.classList.add('recording');
    ansBox.textContent = T('Listening…','सुन रहा है…');
    recognize('en-US', (alts) => {
      mic.classList.remove('recording');
      const said = alts[0] || '';
      const num = parseInt(said.replace(/[^0-9]/g, ''));
      total++;
      ansBox.innerHTML = `${T('You said:','आपने कहा:')} <b>${said}</b>`;
      if (num === q.spoken || said.toLowerCase().includes(numToWord(q.spoken))) {
        score++; addStar(2); fireConfetti(40);
        speak(T('Correct!','सही!'));
        setTimeout(newQ, 1500);
      } else {
        recordWrong();
        speak(T(`No, answer is ${q.answer}`,`नहीं, जवाब ${q.answer} है`));
        setTimeout(newQ, 2000);
      }
      scoreBox.textContent = `${T('Score','स्कोर')}: ${score}/${total}`;
    }, () => mic.classList.remove('recording'));
  };
  wrap.appendChild(qBox);
  wrap.appendChild(mic);
  wrap.appendChild(ansBox);
  wrap.appendChild(scoreBox);
  root.appendChild(wrap);
  newQ();
};
function numToWord(n) {
  const w = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
    'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  return w[n] || String(n);
}

// ============================================================
// ============== ADAPTIVE STUDY (Weak Topics) ===============
// ============================================================
BUILDERS.adaptiveStudy = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🎯 Smart Practice','🎯 स्मार्ट अभ्यास',
    'Practice topics that need more work','कमज़ोर विषयों पर अभ्यास'));
  const wrap = el('div', { class:'game-area' });
  const weak = getWeakTopics();
  const menu = CLASS_MENU[STATE.klass] || [];

  // Heatmap of all topics
  const hm = el('div', { class:'rhyme-card' });
  hm.appendChild(el('h3', {}, '🌡️ ' + T('Mastery Map','मास्टरी मैप')));
  hm.appendChild(el('p', { style:'font-size:12px;color:#666;margin-bottom:8px' },
    T('🟢 Strong · 🟡 Medium · 🔴 Weak · ⚪ New','🟢 मज़बूत · 🟡 मध्यम · 🔴 कमज़ोर · ⚪ नया')));
  const grid = el('div', { class:'heatmap-grid' });
  menu.forEach(item => {
    const m = topicMastery(item.s);
    const cell = el('div', { class:'heatmap-cell h' + m }, [
      el('span', { class:'e' }, item.ico),
      el('div', {}, T(item.en, item.hi))
    ]);
    cell.onclick = () => go(item.s);
    grid.appendChild(cell);
  });
  hm.appendChild(grid);
  wrap.appendChild(hm);

  // Weak topics list
  const wbox = el('div', { class:'rhyme-card' });
  wbox.appendChild(el('h3', {}, '💪 ' + T('Practice These','इन पर अभ्यास')));
  if (weak.length === 0) {
    wbox.appendChild(el('p', { style:'text-align:center;padding:20px' }, [
      el('div', { style:'font-size:60px' }, '🎉'),
      el('div', {}, T('No weak topics! Great job!','कोई कमज़ोर विषय नहीं! शाबाश!'))
    ]));
  } else {
    weak.slice(0, 6).forEach(({ topic, ratio }) => {
      const m = menu.find(x => x.s === topic);
      if (!m) return;
      const card = el('div', { class:'suggest-card weak' }, [
        el('div', { style:'display:flex;align-items:center;gap:12px' }, [
          el('div', { style:'font-size:40px' }, m.ico),
          el('div', { style:'flex:1' }, [
            el('h4', { style:'color:#c62828' }, T(m.en, m.hi)),
            el('div', { style:'font-size:12px;color:#666' }, `${Math.round(ratio * 100)}% ${T('mastered','सीखा')}`)
          ]),
          el('button', { class:'btn green', style:'padding:10px 16px' }, '▶️')
        ])
      ]);
      card.onclick = () => go(topic);
      wbox.appendChild(card);
    });
  }
  wrap.appendChild(wbox);
  root.appendChild(wrap);
};

// ============================================================
// ============== MEMORY PALACE GAME =========================
// ============================================================
BUILDERS.memoryPalace = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🧠 Memory Palace','🧠 स्मृति महल',
    'Watch, then tap in order','देखो, फिर क्रम से दबाओ'));
  const wrap = el('div', { class:'game-area' });
  let level = 3, sequence = [], userIdx = 0, isShowing = false;
  const status = el('div', { style:'text-align:center;font-size:18px;font-weight:bold;color:var(--primary);margin:10px' });
  const grid = el('div', { class:'mp-grid' });
  const tiles = [];
  const emojis = ['🍎','🦋','⭐','🌈','🎈','🚗','🐶','🌸','🎁','🧸','🏀','🍦','⚽','🌻','🚂','🦄'];
  for (let i = 0; i < 16; i++) {
    const t = el('div', { class:'mp-tile' }, emojis[i]);
    t.onclick = () => userTap(i);
    tiles.push(t);
    grid.appendChild(t);
  }
  function start() {
    sequence = [];
    for (let i = 0; i < level; i++) sequence.push(Math.floor(Math.random() * 16));
    userIdx = 0;
    showSequence();
  }
  function showSequence() {
    isShowing = true;
    status.textContent = T(`Watch carefully (Level ${level})`,`ध्यान से देखो (स्तर ${level})`);
    let i = 0;
    const tick = () => {
      if (i > 0) tiles[sequence[i - 1]].classList.remove('show');
      if (i >= sequence.length) {
        isShowing = false;
        status.textContent = T('Now your turn!','अब आपकी बारी!');
        return;
      }
      tiles[sequence[i]].classList.add('show');
      tone(440 + i * 80, 0.3);
      i++;
      setTimeout(tick, 700);
    };
    tick();
  }
  function userTap(i) {
    if (isShowing) return;
    if (sequence[userIdx] === i) {
      tiles[i].classList.add('user');
      tone(660, 0.2);
      userIdx++;
      setTimeout(() => tiles[i].classList.remove('user'), 400);
      if (userIdx >= sequence.length) {
        addStar(level);
        fireConfetti(60);
        speak(T('Excellent!','बहुत बढ़िया!'));
        level = Math.min(level + 1, 8);
        setTimeout(start, 1500);
      }
    } else {
      tiles[i].classList.add('wrong');
      recordWrong();
      tone(150, 0.4, 'sawtooth');
      speak(T('Oops, try again','फिर से कोशिश करो'));
      setTimeout(() => { tiles[i].classList.remove('wrong'); start(); }, 1500);
    }
  }
  wrap.appendChild(status);
  wrap.appendChild(grid);
  const startBtn = el('button', { class:'big-play' }, '▶️ ' + T('Start','शुरू'));
  startBtn.onclick = start;
  wrap.appendChild(el('div', { class:'btn-row' }, [startBtn]));
  root.appendChild(wrap);
};

// ============================================================
// ============== MAZE GAME ==================================
// ============================================================
BUILDERS.mazeGame = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🌀 Maze Game','🌀 भूल भुलैया',
    'Reach the star!','तारे तक पहुँचो!'));
  const wrap = el('div', { class:'game-area' });
  const SIZE = 7;
  let player = { x: 0, y: 0 };
  let goal = { x: SIZE - 1, y: SIZE - 1 };
  let walls = [];
  const board = el('div', { class:'maze-board', style:`grid-template-columns:repeat(${SIZE},1fr)` });
  function buildMaze() {
    walls = [];
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if ((x === 0 && y === 0) || (x === SIZE - 1 && y === SIZE - 1)) continue;
        if (Math.random() < 0.25) walls.push(`${x},${y}`);
      }
    player = { x: 0, y: 0 };
  }
  function render() {
    board.innerHTML = '';
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        let cls = 'maze-cell';
        let txt = '';
        if (player.x === x && player.y === y) { cls += ' player'; txt = '🧒'; }
        else if (goal.x === x && goal.y === y) { cls += ' goal'; txt = '⭐'; }
        else if (walls.includes(`${x},${y}`)) cls += ' wall';
        board.appendChild(el('div', { class: cls }, txt));
      }
  }
  function move(dx, dy) {
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) return;
    if (walls.includes(`${nx},${ny}`)) { tone(150, 0.2, 'sawtooth'); return; }
    player = { x: nx, y: ny };
    tone(440, 0.1);
    render();
    if (player.x === goal.x && player.y === goal.y) {
      addStar(3); fireConfetti(80);
      speak(T('You won!','आप जीत गए!'));
      setTimeout(() => { buildMaze(); render(); }, 1500);
    }
  }
  buildMaze(); render();
  wrap.appendChild(board);
  const ctrl = el('div', { class:'maze-controls' }, [
    el('button', { class:'maze-btn empty' }),
    el('button', { class:'maze-btn', onclick: () => move(0, -1) }, '⬆️'),
    el('button', { class:'maze-btn empty' }),
    el('button', { class:'maze-btn', onclick: () => move(-1, 0) }, '⬅️'),
    el('button', { class:'maze-btn', onclick: () => { buildMaze(); render(); } }, '🔄'),
    el('button', { class:'maze-btn', onclick: () => move(1, 0) }, '➡️'),
    el('button', { class:'maze-btn empty' }),
    el('button', { class:'maze-btn', onclick: () => move(0, 1) }, '⬇️'),
    el('button', { class:'maze-btn empty' })
  ]);
  wrap.appendChild(ctrl);
  // Keyboard support
  const keyHandler = (e) => {
    if (STATE.current !== 'mazeGame') return;
    if (e.key === 'ArrowUp') move(0, -1);
    if (e.key === 'ArrowDown') move(0, 1);
    if (e.key === 'ArrowLeft') move(-1, 0);
    if (e.key === 'ArrowRight') move(1, 0);
  };
  document.addEventListener('keydown', keyHandler);
  root.appendChild(wrap);
};

// ============================================================
// ============== JIGSAW PUZZLE ==============================
// ============================================================
BUILDERS.jigsawPuzzle = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🧩 Jigsaw Puzzle','🧩 पहेली',
    'Drop pieces to complete picture','चित्र पूरा करें'));
  const wrap = el('div', { class:'game-area' });
  const themes = [
    { cols:2, rows:2, parts:['🌸','🌼','🌺','🌻'] },
    { cols:3, rows:2, parts:['🐶','🐱','🐰','🦊','🐻','🐼'] },
    { cols:3, rows:3, parts:['🍎','🍌','🍓','🍇','🍊','🍉','🥝','🍑','🍒'] }
  ];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const target = theme.parts.slice();
  const stage = el('div', { class:'jigsaw-stage', style:`grid-template-columns:repeat(${theme.cols},1fr);grid-template-rows:repeat(${theme.rows},1fr)` });
  const slots = [];
  for (let i = 0; i < target.length; i++) {
    const slot = el('div', { class:'jigsaw-piece' }, '');
    slot.dataset.idx = i;
    slot.dataset.want = target[i];
    slot.ondragover = (e) => e.preventDefault();
    slot.ondrop = (e) => {
      const dropped = e.dataTransfer.getData('text/plain');
      if (dropped === slot.dataset.want) {
        slot.textContent = dropped;
        slot.classList.add('placed');
        const tray = document.querySelector(`[data-piece="${dropped}"]`);
        if (tray) tray.style.display = 'none';
        tone(660, 0.15);
        addStar(1);
        if (document.querySelectorAll('.jigsaw-piece.placed').length === target.length) {
          fireConfetti(120); speak(T('Perfect!','बहुत बढ़िया!'));
          setTimeout(() => BUILDERS.jigsawPuzzle(root), 2000);
        }
      } else {
        recordWrong(); tone(150, 0.2, 'sawtooth');
      }
    };
    slots.push(slot);
    stage.appendChild(slot);
  }
  const tray = el('div', { class:'jigsaw-tray' });
  shuffle(target.slice()).forEach(p => {
    const piece = el('div', { class:'jigsaw-piece', draggable: 'true' }, p);
    piece.dataset.piece = p;
    piece.ondragstart = (e) => e.dataTransfer.setData('text/plain', p);
    // Touch fallback: tap to place in next empty slot
    piece.onclick = () => {
      const empty = slots.find(s => !s.classList.contains('placed'));
      if (empty && empty.dataset.want === p) {
        empty.textContent = p; empty.classList.add('placed');
        piece.style.display = 'none';
        tone(660, 0.15); addStar(1);
        if (document.querySelectorAll('.jigsaw-piece.placed').length === target.length) {
          fireConfetti(120); speak(T('Perfect!','बहुत बढ़िया!'));
          setTimeout(() => BUILDERS.jigsawPuzzle(root), 2000);
        }
      } else {
        // Try the matching slot
        const want = slots.find(s => !s.classList.contains('placed') && s.dataset.want === p);
        if (want) {
          want.textContent = p; want.classList.add('placed');
          piece.style.display = 'none';
          tone(660, 0.15); addStar(1);
          if (document.querySelectorAll('.jigsaw-piece.placed').length === target.length) {
            fireConfetti(120); speak(T('Perfect!','बहुत बढ़िया!'));
            setTimeout(() => BUILDERS.jigsawPuzzle(root), 2000);
          }
        } else {
          recordWrong();
          tone(150, 0.2, 'sawtooth');
        }
      }
    };
    tray.appendChild(piece);
  });
  wrap.appendChild(stage);
  wrap.appendChild(tray);
  root.appendChild(wrap);
};

// ============================================================
// ============== HIDDEN OBJECT ==============================
// ============================================================
BUILDERS.hiddenObject = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🔍 Find the Items','🔍 चीज़ें ढूंढो',
    'Tap the objects in the picture','चित्र में चीज़ें टैप करो'));
  const wrap = el('div', { class:'game-area' });
  const targets = ['🐱','🦋','⭐','🍎','🌸'];
  const distractors = ['🌳','🌿','🪨','🏠','🌻','🌺','🍄','🪵','🌾','🐦','☁️','🪺','🍃','🌷','🌹'];
  const stage = el('div', { class:'ho-stage' });
  const status = el('div', { style:'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:10px' });
  const found = new Set();
  function placeItem(em, isTarget) {
    const node = el('div', { class:'ho-item' }, em);
    node.style.left = (5 + Math.random() * 85) + '%';
    node.style.top = (5 + Math.random() * 85) + '%';
    if (isTarget) {
      node.dataset.target = em;
      node.onclick = () => {
        if (found.has(em)) return;
        node.classList.add('found');
        found.add(em);
        addStar(1); tone(660, 0.15);
        const badge = status.querySelector(`[data-find="${em}"]`);
        if (badge) badge.style.opacity = 0.3;
        if (found.size === targets.length) {
          addStar(3); fireConfetti(80); speak(T('All found!','सब मिल गए!'));
          setTimeout(() => BUILDERS.hiddenObject(root), 2000);
        }
      };
    } else {
      node.onclick = () => { recordWrong(); tone(180, 0.2, 'sawtooth'); };
    }
    stage.appendChild(node);
  }
  // Build status badges
  targets.forEach(t => {
    status.appendChild(el('div', { 'data-find': t, style:'background:#fff;padding:6px 10px;border-radius:14px;font-size:22px;box-shadow:0 2px 6px rgba(0,0,0,.1)' }, t));
  });
  // Place items (mix targets + distractors)
  shuffle(targets).forEach(t => placeItem(t, true));
  shuffle(distractors).slice(0, 12).forEach(d => placeItem(d, false));
  wrap.appendChild(status);
  wrap.appendChild(stage);
  root.appendChild(wrap);
};

// ============================================================
// ============== CURSIVE WRITING ============================
// ============================================================
BUILDERS.cursive = (root) => {
  root.innerHTML = '';
  root.appendChild(header('✍️ Cursive Writing','✍️ सुलेख',
    'Trace the cursive letters','सुलेख अक्षर ट्रेस करें'));
  const wrap = el('div', { class:'game-area' });
  let idx = 0;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const display = el('div', { class:'cursive-display' });
  const canvas = document.createElement('canvas');
  canvas.id = 'traceCanvas';
  canvas.width = 360; canvas.height = 220;
  const ctx = canvas.getContext('2d');
  let drawing = false, lastX = 0, lastY = 0;
  function startDraw(x, y) { drawing = true; lastX = x; lastY = y; }
  function draw(x, y) {
    if (!drawing) return;
    ctx.strokeStyle = '#ff4081'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
    lastX = x; lastY = y;
  }
  function getXY(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
  }
  canvas.addEventListener('mousedown', (e) => { const p = getXY(e); startDraw(p.x, p.y); });
  canvas.addEventListener('mousemove', (e) => { const p = getXY(e); draw(p.x, p.y); });
  canvas.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const p = getXY(e); startDraw(p.x, p.y); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const p = getXY(e); draw(p.x, p.y); });
  canvas.addEventListener('touchend', () => drawing = false);
  function showLetter() {
    display.textContent = letters[idx] + ' ' + letters[idx].toLowerCase();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Faint guide
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.font = '180px Brush Script MT, cursive';
    ctx.textAlign = 'center';
    ctx.fillText(letters[idx], canvas.width / 2, canvas.height / 2 + 50);
    speak(letters[idx]);
  }
  wrap.appendChild(display);
  wrap.appendChild(canvas);
  const row = el('div', { class:'btn-row' }, [
    el('button', { class:'btn', onclick: () => { idx = (idx - 1 + letters.length) % letters.length; showLetter(); } }, '◀ Prev'),
    el('button', { class:'btn green', onclick: () => { addStar(1); idx = (idx + 1) % letters.length; showLetter(); } }, T('Done ✓','हो गया')),
    el('button', { class:'btn orange', onclick: () => showLetter() }, '🗑️ Clear')
  ]);
  wrap.appendChild(row);
  root.appendChild(wrap);
  showLetter();
};

// ============================================================
// ============== SCIENCE BASICS =============================
// ============================================================
const SCIENCE_TOPICS = [
  ['🧲','Magnets','चुंबक','Magnets pull metal things like iron and steel. They have two ends — North and South. Same ends push apart, opposite ends stick together!','चुंबक लोहा खींचता है। उसके दो सिरे होते हैं — उत्तर और दक्षिण। एक जैसे सिरे दूर भागते हैं, अलग सिरे चिपक जाते हैं!'],
  ['🌍','Gravity','गुरुत्वाकर्षण','Gravity pulls everything down to the ground. When you jump, gravity brings you back. The Earth pulls us — that\'s why we don\'t float!','गुरुत्वाकर्षण सब कुछ नीचे खींचता है। जब हम कूदते हैं, यह हमें वापस लाता है। पृथ्वी हमें खींचती है इसलिए हम तैरते नहीं!'],
  ['🌱','Plants','पौधे','Plants need sun, water, soil, and air to grow. They make their own food using sunlight. They give us oxygen to breathe!','पौधों को बढ़ने के लिए धूप, पानी, मिट्टी और हवा चाहिए। वे सूरज से खाना बनाते हैं। हमें ऑक्सीजन देते हैं!'],
  ['💧','Water Cycle','जल चक्र','Sun heats water → it goes up as steam → makes clouds → rain falls → goes to rivers → back to sea. Around and around!','सूरज पानी को गर्म करता है → भाप ऊपर जाती है → बादल बनते हैं → बारिश होती है → नदी में जाती है → समुद्र में। चक्र चलता रहता है!'],
  ['🌞','Day & Night','दिन और रात','Earth spins every 24 hours. When our side faces the Sun, it\'s day. When it turns away, it\'s night. The Sun doesn\'t move — we do!','पृथ्वी 24 घंटे में घूमती है। जब हमारा हिस्सा सूरज के सामने होता है, दिन होता है। जब दूर होता है, रात। सूरज नहीं हिलता — हम हिलते हैं!'],
  ['🫁','Body Parts','शरीर के अंग','Heart pumps blood. Lungs breathe air. Stomach digests food. Brain thinks. Eyes see. Ears hear. Each part does important work!','दिल खून पंप करता है। फेफड़े साँस लेते हैं। पेट खाना पचाता है। दिमाग सोचता है। हर अंग अहम काम करता है!'],
  ['🔥','Hot & Cold','गर्म और ठंडा','Sun and fire are HOT. Ice and snow are COLD. Water can be both — boil it for hot tea, freeze it for cold ice cream!','सूरज और आग गर्म हैं। बर्फ़ ठंडी है। पानी दोनों हो सकता है — गर्म चाय और ठंडी आइसक्रीम!'],
  ['🌈','Rainbow','इंद्रधनुष','When sunlight passes through rain drops, it splits into 7 colors: Red, Orange, Yellow, Green, Blue, Indigo, Violet (VIBGYOR)!','जब सूरज की रोशनी बारिश में जाती है, 7 रंग बनते हैं: लाल, नारंगी, पीला, हरा, नीला, जामुनी, बैंगनी!']
];
BUILDERS.science = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🔬 Science','🔬 विज्ञान','Learn how the world works','दुनिया कैसे काम करती है'));
  const wrap = el('div', { class:'game-area' });
  let viewing = null;
  function showList() {
    wrap.innerHTML = '';
    SCIENCE_TOPICS.forEach((t, i) => {
      const card = el('div', { class:'topic-card' }, [
        el('div', { class:'te' }, t[0]),
        el('div', { class:'tt' }, [
          el('h3', {}, T(t[1], t[2])),
          el('p', {}, T(t[3].slice(0, 60) + '…', t[4].slice(0, 60) + '…'))
        ])
      ]);
      card.onclick = () => { viewing = i; showDetail(); };
      wrap.appendChild(card);
    });
  }
  function showDetail() {
    wrap.innerHTML = '';
    const t = SCIENCE_TOPICS[viewing];
    const back = el('button', { class:'btn' }, '⬅️ ' + T('Back','वापस'));
    back.onclick = () => { viewing = null; showList(); };
    wrap.appendChild(el('div', { class:'btn-row' }, [back]));
    wrap.appendChild(el('div', { style:'text-align:center;font-size:120px;line-height:1' }, t[0]));
    wrap.appendChild(el('h2', { style:'text-align:center;color:var(--primary)' }, T(t[1], t[2])));
    wrap.appendChild(el('div', { class:'rhyme-card' }, [
      el('p', { style:'font-size:18px;line-height:1.7' }, T(t[3], t[4]))
    ]));
    const speak1 = el('button', { class:'btn green' }, '🔊 ' + T('Read Aloud','पढ़ो'));
    speak1.onclick = () => { speak(T(t[3], t[4])); addStar(1); };
    wrap.appendChild(el('div', { class:'btn-row' }, [speak1]));
  }
  showList();
  root.appendChild(wrap);
};

// ============================================================
// ============== YOGA FOR KIDS ==============================
// ============================================================
const YOGA_POSES = [
  ['🧍','Mountain Pose','पर्वत आसन','Stand tall like a mountain. Feet together, hands at sides. Breathe deep!','पहाड़ की तरह सीधे खड़े हों। पैर साथ, हाथ बगल में। गहरी साँस लें!'],
  ['🌳','Tree Pose','वृक्षासन','Stand on one foot, other foot on inner thigh, hands together up high.','एक पैर पर खड़े हों, दूसरा अंदरूनी जांघ पर, हाथ ऊपर मिलाएँ।'],
  ['🦋','Butterfly Pose','तितली आसन','Sit, soles together, gently flap knees up and down like butterfly wings.','बैठें, पैरों के तलवे साथ, घुटनों को तितली के पंखों की तरह हिलाएँ।'],
  ['🐱','Cat-Cow','मार्जरी आसन','On hands & knees. Arch back up like cat. Then drop belly down like cow!','हाथ-घुटनों पर। पीठ ऊपर बिल्ली की तरह। फिर गाय की तरह नीचे!'],
  ['🐍','Cobra Pose','भुजंगासन','Lie on belly. Push up with hands. Look up like a snake!','पेट के बल लेटें। हाथों से ऊपर उठें। साँप की तरह ऊपर देखें!'],
  ['🐶','Downward Dog','अधोमुख श्वान','Make an upside-down V. Hands & feet on floor, hips up high!','उल्टा V बनाएँ। हाथ-पैर ज़मीन पर, कूल्हे ऊपर!'],
  ['🪷','Lotus Sit','पद्मासन','Sit cross-legged. Hands on knees. Close eyes. Breathe slowly.','पैर मोड़कर बैठें। हाथ घुटनों पर। आँखें बंद। धीरे साँस लें।'],
  ['🧎','Child Pose','बालासन','Sit on heels. Bend forward, arms stretched out. Rest!','एड़ियों पर बैठें। आगे झुकें, हाथ फैलाएँ। आराम!']
];
BUILDERS.yoga = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🧘 Yoga for Kids','🧘 बच्चों का योग',
    'Stretch and breathe!','खिंचाव और साँस!'));
  const wrap = el('div', { class:'game-area' });
  let idx = 0;
  const pose = el('div', { class:'yoga-pose' });
  function show() {
    pose.innerHTML = '';
    const p = YOGA_POSES[idx];
    pose.appendChild(el('div', { class:'yoga-emoji' }, p[0]));
    pose.appendChild(el('h2', { style:'color:var(--primary);margin:10px' }, T(p[1], p[2])));
    pose.appendChild(el('p', { style:'font-size:16px;color:#555;line-height:1.5' }, T(p[3], p[4])));
    speak(T(p[1] + '. ' + p[3], p[2] + '. ' + p[4]));
  }
  wrap.appendChild(pose);
  const row = el('div', { class:'btn-row' }, [
    el('button', { class:'btn', onclick: () => { idx = (idx - 1 + YOGA_POSES.length) % YOGA_POSES.length; show(); } }, '◀'),
    el('button', { class:'btn green', onclick: () => { addStar(1); idx = (idx + 1) % YOGA_POSES.length; show(); } }, T('Done ✓','हो गया')),
    el('button', { class:'btn orange', onclick: () => show() }, '🔊 Repeat')
  ]);
  wrap.appendChild(row);
  root.appendChild(wrap);
  show();
};

// ============================================================
// ============== COMPUTER BASICS ============================
// ============================================================
BUILDERS.computerBasics = (root) => {
  root.innerHTML = '';
  root.appendChild(header('💻 Computer Basics','💻 कंप्यूटर बेसिक',
    'Learn keyboard, mouse, coding','कीबोर्ड, माउस, कोडिंग सीखें'));
  const wrap = el('div', { class:'game-area' });

  // Keyboard intro
  const kb = el('div', { class:'rhyme-card' });
  kb.appendChild(el('h3', {}, '⌨️ ' + T('Keyboard','कीबोर्ड')));
  kb.appendChild(el('p', { style:'color:#666;margin-bottom:10px' }, T('Tap any key to hear it','कोई भी कुंजी दबाओ')));
  ['1234567890','QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach(row => {
    const r = el('div', { class:'kb-row' });
    row.split('').forEach(k => {
      const key = el('div', { class:'kb-key' }, k);
      key.onclick = () => {
        key.classList.add('pressed');
        speak(k);
        addStar(0);
        setTimeout(() => key.classList.remove('pressed'), 200);
      };
      r.appendChild(key);
    });
    kb.appendChild(r);
  });
  // Space bar row
  const spaceRow = el('div', { class:'kb-row' });
  const sb = el('div', { class:'kb-key', style:'min-width:200px' }, 'SPACE');
  sb.onclick = () => { sb.classList.add('pressed'); speak('Space'); setTimeout(() => sb.classList.remove('pressed'), 200); };
  spaceRow.appendChild(sb);
  kb.appendChild(spaceRow);
  wrap.appendChild(kb);

  // Mouse parts
  const mb = el('div', { class:'rhyme-card' });
  mb.appendChild(el('h3', {}, '🖱️ ' + T('Mouse','माउस')));
  mb.appendChild(el('div', { style:'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center' }, [
    el('div', { class:'topic-card', style:'flex-direction:column;text-align:center' }, [
      el('div', { class:'te' }, '👆'),
      el('div', { class:'tt' }, [el('h3', {}, T('Click','क्लिक')), el('p', {}, T('Press once','एक बार दबाएँ'))])
    ]),
    el('div', { class:'topic-card', style:'flex-direction:column;text-align:center' }, [
      el('div', { class:'te' }, '👆👆'),
      el('div', { class:'tt' }, [el('h3', {}, T('Double Click','डबल क्लिक')), el('p', {}, T('Press twice','दो बार दबाएँ'))])
    ]),
    el('div', { class:'topic-card', style:'flex-direction:column;text-align:center' }, [
      el('div', { class:'te' }, '🤏'),
      el('div', { class:'tt' }, [el('h3', {}, T('Drag','खींचें')), el('p', {}, T('Hold and move','दबाकर हिलाएँ'))])
    ])
  ]));
  wrap.appendChild(mb);

  // Simple coding blocks
  const cb = el('div', { class:'rhyme-card' });
  cb.appendChild(el('h3', {}, '🧩 ' + T('Tap to make code','कोड बनाओ')));
  const stack = el('div', { class:'code-stack' });
  const blocks = [
    ['🚶 Walk', '#42a5f5', 'Walking'],
    ['🛑 Stop', '#f44336', 'Stopping'],
    ['🔄 Repeat 3 times', '#ff9800', 'Repeating 3 times'],
    ['🎵 Sing', '#9c27b0', 'Singing'],
    ['😄 Smile', '#4caf50', 'Smiling']
  ];
  blocks.forEach(b => {
    const blk = el('div', { class:'code-block', style:'--c:' + b[1] }, b[0]);
    blk.onclick = () => {
      const placed = el('div', { class:'code-block', style:'--c:' + b[1] + ';display:block;margin:4px 0' }, b[0]);
      stack.appendChild(placed);
      speak(b[2]);
      addStar(0);
    };
    cb.appendChild(blk);
  });
  cb.appendChild(stack);
  const run = el('button', { class:'btn green' }, '▶️ ' + T('Run Code','कोड चलाओ'));
  run.onclick = () => {
    const codes = stack.querySelectorAll('.code-block');
    if (!codes.length) return;
    addStar(2); fireConfetti(40);
    speak(T('Running your code!','आपका कोड चल रहा है!'));
  };
  cb.appendChild(el('div', { class:'btn-row' }, [run,
    el('button', { class:'btn', onclick: () => stack.innerHTML = '' }, '🗑️ Clear')]));
  wrap.appendChild(cb);

  root.appendChild(wrap);
};

// ============================================================
// ============== CUSTOM LESSON PLAN =========================
// ============================================================
BUILDERS.customLesson = (root) => {
  root.innerHTML = '';
  root.appendChild(header('📋 Custom Lesson','📋 कस्टम पाठ',
    'Pick topics for the child','बच्चे के लिए विषय चुनें'));
  const wrap = el('div', { class:'game-area' });
  const menu = CLASS_MENU[STATE.klass] || [];
  const picked = new Set(JSON.parse(localStorage.getItem(profileKey('customPicks')) || '[]'));
  menu.forEach(item => {
    const row = el('div', { class:'lesson-pick' + (picked.has(item.s) ? ' picked' : '') }, [
      el('div', { class:'ck' }, '✓'),
      el('div', { style:'font-size:32px' }, item.ico),
      el('div', { style:'flex:1;font-weight:bold' }, T(item.en, item.hi))
    ]);
    row.onclick = () => {
      if (picked.has(item.s)) picked.delete(item.s);
      else picked.add(item.s);
      localStorage.setItem(profileKey('customPicks'), JSON.stringify([...picked]));
      BUILDERS.customLesson(root);
    };
    wrap.appendChild(row);
  });
  const note = el('p', { style:'text-align:center;color:#666;margin:14px;font-size:13px' },
    T(`${picked.size} picked — kid will see these in My Lessons`,
      `${picked.size} चुने — बच्चा "मेरा पाठ" में देखेगा`));
  wrap.appendChild(note);
  root.appendChild(wrap);
};

// ============================================================
// ============== HOMEWORK MODE ==============================
// ============================================================
BUILDERS.homework = (root) => {
  root.innerHTML = '';
  root.appendChild(header('📝 My Homework','📝 मेरा होमवर्क',
    'Complete all to earn bonus stars!','सब पूरा करो और बोनस तारे पाओ!'));
  const wrap = el('div', { class:'game-area' });
  const picks = JSON.parse(localStorage.getItem(profileKey('customPicks')) || '[]');
  const today = new Date().toDateString();
  const doneKey = profileKey('hwDone_' + today);
  const done = new Set(JSON.parse(localStorage.getItem(doneKey) || '[]'));
  const menu = CLASS_MENU[STATE.klass] || [];
  if (picks.length === 0) {
    wrap.appendChild(el('div', { style:'text-align:center;padding:30px' }, [
      el('div', { style:'font-size:60px' }, '📭'),
      el('h3', {}, T('No homework yet','अभी कोई होमवर्क नहीं')),
      el('p', { style:'color:#666' }, T('Parent can set lessons in Parent Zone','पैरेंट ज़ोन से सेट करें'))
    ]));
  } else {
    picks.forEach(s => {
      const item = menu.find(x => x.s === s);
      if (!item) return;
      const isDone = done.has(s);
      const row = el('div', { class:'lesson-pick' + (isDone ? ' picked' : '') }, [
        el('div', { class:'ck' }, '✓'),
        el('div', { style:'font-size:32px' }, item.ico),
        el('div', { style:'flex:1;font-weight:bold' }, T(item.en, item.hi)),
        el('button', { class:'btn green', style:'padding:8px 14px' }, isDone ? '✓' : '▶️')
      ]);
      row.onclick = () => {
        if (!isDone) go(item.s);
      };
      wrap.appendChild(row);
    });
    if (done.size === picks.length && picks.length > 0) {
      wrap.appendChild(el('div', { style:'text-align:center;padding:20px' }, [
        el('div', { style:'font-size:60px' }, '🏆'),
        el('h3', { style:'color:#ff6f00' }, T('All homework done!','सब होमवर्क हो गया!'))
      ]));
    }
  }
  // Auto-mark done when activity gets stars
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  picks.forEach(s => {
    if (visited[s] && !done.has(s)) {
      done.add(s);
      localStorage.setItem(doneKey, JSON.stringify([...done]));
    }
  });
  root.appendChild(wrap);
};

// ============================================================
// ============== WEEKLY SCHEDULE ============================
// ============================================================
const WEEKLY_PLAN = {
  0: ['rhymes','stories','rewards'],
  1: ['alphabetBasic','alphabet','phonics','math','numbers'],
  2: ['hindiSwar','hindi','hindiNumbers','wordBuilder'],
  3: ['math','tables','numbers','wordProblems','dailyChallenge'],
  4: ['animals','fruits','body','colors','shapes'],
  5: ['festivals','solarSystem','weather','science','yoga'],
  6: ['games','memMatch','jigsawPuzzle','memoryPalace','mazeGame']
};
const DAY_NAMES = [
  ['Sunday','रविवार'],['Monday','सोमवार'],['Tuesday','मंगलवार'],
  ['Wednesday','बुधवार'],['Thursday','गुरुवार'],['Friday','शुक्रवार'],['Saturday','शनिवार']
];
BUILDERS.weeklySchedule = (root) => {
  root.innerHTML = '';
  root.appendChild(header('📅 Weekly Schedule','📅 साप्ताहिक योजना',
    'Different topics each day','हर दिन अलग विषय'));
  const wrap = el('div', { class:'game-area' });
  const today = new Date().getDay();
  const menu = CLASS_MENU[STATE.klass] || [];
  for (let d = 0; d < 7; d++) {
    const isToday = d === today;
    const card = el('div', { class:'rhyme-card', style: isToday ? 'border:4px solid var(--primary);' : '' });
    card.appendChild(el('h3', { style: isToday ? 'color:var(--primary)' : '' },
      (isToday ? '⭐ ' : '') + T(DAY_NAMES[d][0], DAY_NAMES[d][1])));
    const subjects = (WEEKLY_PLAN[d] || []).map(s => menu.find(x => x.s === s)).filter(Boolean);
    const sg = el('div', { style:'display:flex;flex-wrap:wrap;gap:8px' });
    subjects.forEach(item => {
      const t = el('div', { class:'tile', style:`--c:${item.c};padding:10px;font-size:13px` }, [
        el('div', { class:'ico', style:'font-size:30px' }, item.ico),
        el('span', { style:'font-size:11px' }, T(item.en, item.hi))
      ]);
      t.onclick = () => go(item.s);
      sg.appendChild(t);
    });
    card.appendChild(sg);
    wrap.appendChild(card);
  }
  root.appendChild(wrap);
};

// ============================================================
// ============== PET COMPANION v2 ===========================
// ============================================================
const PET_TYPES = [
  { em:'🐶', en:'Puppy', hi:'पिल्ला', cost:0 },
  { em:'🐱', en:'Kitten', hi:'बिल्ली', cost:30 },
  { em:'🐰', en:'Bunny', hi:'खरगोश', cost:60 },
  { em:'🦊', en:'Fox', hi:'लोमड़ी', cost:100 },
  { em:'🐼', en:'Panda', hi:'पांडा', cost:150 },
  { em:'🦁', en:'Lion', hi:'शेर', cost:200 },
  { em:'🐉', en:'Dragon', hi:'ड्रैगन', cost:300 }
];
function getPetState() {
  return JSON.parse(localStorage.getItem(profileKey('petState')) || JSON.stringify({
    type: '🐶', hunger: 50, happy: 50, lastFed: 0, owned: ['🐶']
  }));
}
function savePetState(p) { localStorage.setItem(profileKey('petState'), JSON.stringify(p)); }
function tickPet() {
  const p = getPetState();
  const elapsed = (Date.now() - (p.lastFed || Date.now())) / (1000 * 60 * 60); // hours
  p.hunger = Math.max(0, p.hunger - Math.floor(elapsed * 5));
  p.happy = Math.max(0, p.happy - Math.floor(elapsed * 3));
  savePetState(p);
}
BUILDERS.petInteractive = (root) => {
  tickPet();
  root.innerHTML = '';
  root.appendChild(header('🐾 My Pet','🐾 मेरा पालतू',
    'Feed and play with your pet','अपने पालतू के साथ खेलो'));
  const wrap = el('div', { class:'game-area' });
  const p = getPetState();
  const stage = el('div', { class:'pet-stage' });
  const pet = el('div', { class:'pet-emoji' + (p.hunger < 30 ? ' sad' : '') }, p.type);
  pet.onclick = () => { speak(T('Hello!','नमस्ते!')); tone(660, 0.2); pet.style.transform = 'scale(1.1)'; setTimeout(() => pet.style.transform = '', 300); };
  stage.appendChild(pet);
  // Stats
  stage.appendChild(el('div', { class:'pet-stats' }, [
    el('div', { class:'pet-stat' }, [
      '🍖 ' + T('Hunger','भूख'),
      el('div', { class:'pet-bar' }, [el('i', { style:`width:${p.hunger}%` })])
    ]),
    el('div', { class:'pet-stat' }, [
      '😄 ' + T('Happy','खुशी'),
      el('div', { class:'pet-bar' }, [el('i', { style:`width:${p.happy}%` })])
    ])
  ]));
  // Action buttons
  const actions = el('div', { class:'btn-row' }, [
    el('button', { class:'btn green', onclick: () => {
      if (STATE.stars < 1) { showToast(T('Need 1 star to feed','खिलाने के लिए 1 तारा चाहिए')); return; }
      STATE.stars -= 1; localStorage.setItem(profileKey('stars'), STATE.stars); setStars();
      const ps = getPetState(); ps.hunger = Math.min(100, ps.hunger + 25); ps.lastFed = Date.now(); savePetState(ps);
      speak(T('Yum yum!','मम्म!'));  fireConfetti(20); BUILDERS.petInteractive(root);
    } }, '🍖 ' + T('Feed (-1⭐)','खाना (-1⭐)')),
    el('button', { class:'btn orange', onclick: () => {
      if (STATE.stars < 1) { showToast(T('Need 1 star to play','खेलने के लिए 1 तारा चाहिए')); return; }
      STATE.stars -= 1; localStorage.setItem(profileKey('stars'), STATE.stars); setStars();
      const ps = getPetState(); ps.happy = Math.min(100, ps.happy + 25); savePetState(ps);
      speak(T('Wheee!','मज़ा आया!')); fireConfetti(20); BUILDERS.petInteractive(root);
    } }, '🎾 ' + T('Play (-1⭐)','खेलो (-1⭐)'))
  ]);
  stage.appendChild(actions);
  wrap.appendChild(stage);
  // Pet shop
  const shop = el('div', { class:'rhyme-card' });
  shop.appendChild(el('h3', {}, '🏪 ' + T('Pet Shop','पालतू दुकान')));
  const sg = el('div', { style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px' });
  PET_TYPES.forEach(pt => {
    const owned = (p.owned || []).includes(pt.em);
    const card = el('div', { class:'card', style: owned ? 'border:3px solid #4caf50' : '' }, [
      el('div', { style:'font-size:46px' }, pt.em),
      el('div', { style:'font-size:11px' }, T(pt.en, pt.hi)),
      el('div', { style:'font-size:11px;color:#666' }, owned ? '✓' : (pt.cost + '⭐'))
    ]);
    card.onclick = () => {
      if (!owned) {
        if (STATE.stars < pt.cost) { showToast(T('Not enough stars','तारे कम हैं')); return; }
        STATE.stars -= pt.cost; localStorage.setItem(profileKey('stars'), STATE.stars); setStars();
        const ps = getPetState();
        ps.owned = [...(ps.owned || []), pt.em];
        ps.type = pt.em; savePetState(ps);
        fireConfetti(60); speak(T('New pet!','नया पालतू!'));
      } else {
        const ps = getPetState(); ps.type = pt.em; savePetState(ps);
      }
      BUILDERS.petInteractive(root);
    };
    sg.appendChild(card);
  });
  shop.appendChild(sg);
  wrap.appendChild(shop);
  root.appendChild(wrap);
};

// ============================================================
// ============== GARDEN v2 INTERACTIVE ======================
// ============================================================
const PLANT_STAGES = ['🟫','🌱','🌿','🌷'];
const PLANT_FLOWERS = ['🌷','🌸','🌹','🌻','🌼','🪷','🌺','🪻'];
function getGardenState() {
  return JSON.parse(localStorage.getItem(profileKey('garden')) || JSON.stringify({ plots: Array(12).fill({ stage: 0, type: 0, water: 0, ts: 0 }) }));
}
function saveGarden(g) { localStorage.setItem(profileKey('garden'), JSON.stringify(g)); }
BUILDERS.gardenInteractive = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🌷 My Garden','🌷 मेरा बगीचा',
    'Plant, water, watch grow!','लगाओ, पानी दो, उगाओ!'));
  const wrap = el('div', { class:'game-area' });
  const g = getGardenState();
  if (!Array.isArray(g.plots)) g.plots = Array(12).fill({ stage: 0, type: 0, water: 0 });
  const stage = el('div', { class:'garden-stage' });
  const grid = el('div', { class:'garden-grid' });
  g.plots.forEach((plot, i) => {
    const p = plot || { stage: 0, type: 0, water: 0 };
    const cell = el('div', { class:'garden-plot' });
    if (p.stage === 0) cell.textContent = '🟫';
    else if (p.stage === 1) cell.textContent = '🌱';
    else if (p.stage === 2) cell.textContent = '🌿';
    else cell.textContent = PLANT_FLOWERS[p.type % PLANT_FLOWERS.length];
    cell.onclick = () => {
      const cur = g.plots[i] || { stage: 0, type: 0, water: 0 };
      if (cur.stage === 0) {
        // Plant — costs 1 star
        if (STATE.stars < 1) { showToast(T('Need 1 star','1 तारा चाहिए')); return; }
        STATE.stars -= 1; localStorage.setItem(profileKey('stars'), STATE.stars); setStars();
        g.plots[i] = { stage: 1, type: Math.floor(Math.random() * PLANT_FLOWERS.length), water: 1, ts: Date.now() };
        speak(T('Planted!','लगाया!'));
      } else if (cur.stage < 3) {
        // Water — costs 1 star, advances stage
        if (STATE.stars < 1) { showToast(T('Need 1 star','1 तारा चाहिए')); return; }
        STATE.stars -= 1; localStorage.setItem(profileKey('stars'), STATE.stars); setStars();
        g.plots[i] = { ...cur, stage: cur.stage + 1, water: cur.water + 1 };
        speak(T('Watered!','पानी दिया!'));
        if (g.plots[i].stage === 3) { fireConfetti(50); addStar(3); }
      } else {
        // Harvest — get 2 stars back
        addStar(2);
        g.plots[i] = { stage: 0, type: 0, water: 0 };
        speak(T('Harvested! +2 stars','फसल! +2 तारे'));
      }
      saveGarden(g);
      BUILDERS.gardenInteractive(root);
    };
    grid.appendChild(cell);
  });
  stage.appendChild(grid);
  wrap.appendChild(stage);
  wrap.appendChild(el('p', { style:'text-align:center;color:#555;margin:12px;font-size:14px' },
    T('Tap empty plot to plant (1⭐) · Water 2x (1⭐ each) → bloom! Harvest = +2⭐',
      'खाली प्लॉट पर टैप करके पौधा (1⭐) · 2 बार पानी (1⭐) → फूल! हार्वेस्ट = +2⭐')));
  root.appendChild(wrap);
};

// ============================================================
// ============== SURPRISE BOX (every 50 stars) ==============
// ============================================================
function checkSurpriseBox() {
  const claimed = parseInt(localStorage.getItem(profileKey('surpriseClaimed')) || '0');
  const eligible = Math.floor(STATE.stars / 50);
  if (eligible > claimed) {
    setTimeout(() => showSurprise(), 600);
  }
}
function showSurprise() {
  const surprises = [
    { ic:'🎁', en:'Mystery Gift!', hi:'रहस्य उपहार!', subEn:'+5 bonus stars', subHi:'+5 बोनस तारे', action: () => addStar(5) },
    { ic:'🌟', en:'Star Burst!', hi:'तारा विस्फोट!', subEn:'+3 stars', subHi:'+3 तारे', action: () => addStar(3) },
    { ic:'🎨', en:'Theme Unlocked!', hi:'थीम अनलॉक!', subEn:'Try a new theme', subHi:'नई थीम खोलें', action: () => go('themesScreen') },
    { ic:'🐾', en:'Pet Visit!', hi:'पालतू मुलाकात!', subEn:'Meet your pet', subHi:'पालतू से मिलो', action: () => go('petInteractive') },
    { ic:'📖', en:'Story Time!', hi:'कहानी समय!', subEn:'New story unlocked', subHi:'नई कहानी', action: () => go('stories') }
  ];
  const s = surprises[Math.floor(Math.random() * surprises.length)];
  document.getElementById('surpriseIcon').textContent = s.ic;
  document.getElementById('surpriseTitle').textContent = T(s.en, s.hi);
  document.getElementById('surpriseSub').textContent = T(s.subEn, s.subHi);
  document.getElementById('surprisePop').classList.add('show');
  fireConfetti(150);
  speak(T(s.en, s.hi));
  document.getElementById('surpriseClose').onclick = () => {
    document.getElementById('surprisePop').classList.remove('show');
    s.action && s.action();
    const c = parseInt(localStorage.getItem(profileKey('surpriseClaimed')) || '0');
    localStorage.setItem(profileKey('surpriseClaimed'), c + 1);
  };
}
// Hook into addStar via stars total check (every render)
const _addStarR3 = addStar;
addStar = function(n) {
  _addStarR3(n);
  checkSurpriseBox();
};

BUILDERS.surpriseBox = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🎁 Surprise Boxes','🎁 आश्चर्य बॉक्स',
    'Earn 50 stars to unlock!','50 तारे जीतकर खोलें!'));
  const wrap = el('div', { class:'game-area' });
  const claimed = parseInt(localStorage.getItem(profileKey('surpriseClaimed')) || '0');
  const next = (claimed + 1) * 50;
  wrap.appendChild(el('div', { style:'text-align:center' }, [
    el('div', { style:'font-size:80px' }, '🎁'),
    el('h2', {}, `${claimed}/${Math.floor(STATE.stars / 50) + 1}`),
    el('p', {}, T(`Next box at ${next} stars · You have ${STATE.stars}`, `अगला ${next} पर · आपके पास ${STATE.stars}`))
  ]));
  const meter = el('div', { class:'score-meter' }, [
    el('div', { style:`width:${Math.min(100, (STATE.stars % 50) * 2)}%` }),
    el('span', {}, `${STATE.stars % 50}/50`)
  ]);
  wrap.appendChild(meter);
  const open = el('button', { class:'big-play' }, '🎁 ' + T('Open if Ready','तैयार हो तो खोलें'));
  open.onclick = () => {
    if (Math.floor(STATE.stars / 50) > claimed) showSurprise();
    else showToast(T('Earn more stars!','और तारे जीतो!'));
  };
  wrap.appendChild(el('div', { class:'btn-row' }, [open]));
  root.appendChild(wrap);
};

// ============================================================
// ============== LEADERBOARD (multi-profile) ================
// ============================================================
BUILDERS.leaderboard = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🏆 Leaderboard','🏆 लीडरबोर्ड',
    'Family ranking','परिवार की रैंकिंग'));
  const wrap = el('div', { class:'game-area' });
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const ranked = profiles.map(p => ({
    ...p,
    stars: parseInt(localStorage.getItem(`p_${p.id}_stars`) || '0'),
    streak: parseInt(localStorage.getItem(`p_${p.id}_streak`) || '0')
  })).sort((a, b) => b.stars - a.stars);
  if (ranked.length < 2) {
    wrap.appendChild(el('div', { style:'text-align:center;padding:30px' }, [
      el('div', { style:'font-size:60px' }, '👨‍👩‍👧'),
      el('p', {}, T('Add more kids to see ranking','और बच्चे जोड़ें')),
      el('button', { class:'btn blue', onclick: () => go('profiles') }, '➕ ' + T('Add Kid','बच्चा जोड़ें'))
    ]));
  } else {
    ranked.forEach((p, i) => {
      const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const row = el('div', { class:'lb-row ' + cls }, [
        el('div', { class:'lb-rank' }, String(i + 1)),
        el('div', { style:'font-size:36px' }, p.emoji),
        el('div', { style:'flex:1' }, [
          el('div', { style:'font-weight:bold' }, p.name),
          el('div', { style:'font-size:12px;color:#666' }, `🔥 ${p.streak}`)
        ]),
        el('div', { style:'font-weight:bold;font-size:18px;color:var(--primary)' }, '⭐ ' + p.stars)
      ]);
      wrap.appendChild(row);
    });
  }
  root.appendChild(wrap);
};

// ============================================================
// ============== MINI EVENTS (themed weeks) =================
// ============================================================
const MINI_EVENTS = [
  { id:'animal', en:'Animal Week', hi:'जानवर सप्ताह', em:'🐘', subEn:'Double stars on animal topics!', subHi:'जानवर विषयों पर डबल तारे!', topics:['animals','animalSounds','birds'] },
  { id:'number', en:'Number Week', hi:'संख्या सप्ताह', em:'🔢', subEn:'Double stars on math!', subHi:'गणित पर डबल तारे!', topics:['numbers','math','tables','wordProblems'] },
  { id:'story', en:'Story Week', hi:'कहानी सप्ताह', em:'📖', subEn:'Bonus stars for stories!', subHi:'कहानियों पर बोनस तारे!', topics:['rhymes','stories'] },
  { id:'art', en:'Art Week', hi:'कला सप्ताह', em:'🎨', subEn:'Color and create!', subHi:'रंग भरो, बनाओ!', topics:['coloring','tracing','cursive'] }
];
function currentMiniEvent() {
  // Rotate weekly based on week of year
  const now = new Date();
  const week = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 86400000));
  return MINI_EVENTS[week % MINI_EVENTS.length];
}
BUILDERS.miniEvent = (root) => {
  root.innerHTML = '';
  const ev = currentMiniEvent();
  root.appendChild(header(ev.em + ' ' + ev.en, ev.em + ' ' + ev.hi, ev.subEn, ev.subHi));
  const wrap = el('div', { class:'game-area' });
  const menu = CLASS_MENU[STATE.klass] || [];
  const list = ev.topics.map(t => menu.find(x => x.s === t)).filter(Boolean);
  const grid = el('div', { class:'menu-grid' });
  list.forEach(item => {
    const tile = el('div', { class:'tile', style:`--c:${item.c}` }, [
      el('div', { class:'ico' }, item.ico),
      el('span', {}, T(item.en, item.hi))
    ]);
    tile.onclick = () => go(item.s);
    grid.appendChild(tile);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
};

// ============================================================
// ============== AI TUTOR (template Q&A) ====================
// ============================================================
const TUTOR_QA = [
  { q:['hello','hi','hey','namaste','नमस्ते'], a_en:"Hi friend! 👋 I'm here to help. Ask me about letters, numbers, colors, animals, or anything you're learning!", a_hi:"नमस्ते दोस्त! 👋 मैं मदद के लिए हूँ। अक्षर, संख्या, रंग, जानवर — कुछ भी पूछो!" },
  { q:['who are you','what are you','तुम कौन','आप कौन'], a_en:"I'm your friendly learning helper! 🤖 I know lots about ABC, 123, animals, and more!", a_hi:"मैं तुम्हारा मददगार हूँ! 🤖 ABC, 123, जानवर — सब कुछ जानता हूँ!" },
  { q:['what is a','what are','क्या है','क्या होते'], a_en:"Great question! Try the chapter for that topic in the home screen — you\'ll find pictures, sounds, and games!", a_hi:"अच्छा सवाल! होम स्क्रीन से वो अध्याय खोलो — चित्र, आवाज़, और खेल मिलेंगे!" },
  { q:['alphabet','abc','letter','अक्षर','letters'], a_en:"The English alphabet has 26 letters: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z. Tap 'English' chapter to learn each one!", a_hi:"अंग्रेज़ी में 26 अक्षर हैं: A से Z तक। 'English' अध्याय में हर एक सीखो!" },
  { q:['number','count','गिनती','math','add'], a_en:"Numbers are fun! 1, 2, 3... Try the Maths chapter for counting, addition, and times tables!", a_hi:"गिनती मज़ेदार है! 1, 2, 3... गणित अध्याय खोलो!" },
  { q:['hindi','हिंदी','अ','swar'], a_en:"Hindi has 13 vowels (स्वर) and 33 consonants (व्यंजन). Try the Hindi chapter!", a_hi:"हिंदी में 13 स्वर और 33 व्यंजन हैं। हिंदी अध्याय खोलो!" },
  { q:['color','colour','रंग'], a_en:"Colors are everywhere! 🌈 Red, blue, green, yellow, pink, orange, purple. Tap Colors topic!", a_hi:"रंग हर जगह हैं! 🌈 लाल, नीला, हरा, पीला। रंग विषय खोलो!" },
  { q:['animal','जानवर','pet'], a_en:"Animals are amazing! 🐘🦁🐶🐱🐰 Tap Animals topic to see and hear them all!", a_hi:"जानवर अद्भुत हैं! 🐘🦁🐶🐱 जानवर विषय खोलो!" },
  { q:['why','क्यों'], a_en:"Curious mind! 🤔 Asking 'why' helps you learn. Keep asking — that's how smart kids grow!", a_hi:"जिज्ञासु दिमाग! 🤔 'क्यों' पूछना सीखने का तरीका है। पूछते रहो!" },
  { q:['help','मदद'], a_en:"I'm here to help! Ask about ABC, numbers, animals, colors, or any topic in the chapters above.", a_hi:"मैं मदद के लिए हूँ! ABC, संख्या, जानवर — कुछ भी पूछो।" },
  { q:['bye','byebye','अलविदा','tata'], a_en:"Bye-bye! 👋 Come back anytime. Keep learning, stay smart! 🌟", a_hi:"अलविदा! 👋 कभी भी आना। पढ़ते रहो! 🌟" },
  { q:['thanks','thank','धन्यवाद','शुक्रिया'], a_en:"You're welcome, smart kid! 😊 Keep up the great work!", a_hi:"स्वागत है, होशियार बच्चे! 😊 पढ़ते रहो!" }
];
BUILDERS.aiTutor = (root) => {
  root.innerHTML = '';
  root.appendChild(header('🤖 Ask Me Anything','🤖 कुछ भी पूछो',
    'Your AI learning friend','तुम्हारा सीखने का दोस्त'));
  const wrap = el('div', { class:'chat-area' });
  const msgs = el('div', { class:'chat-msgs' });
  function bot(text) { msgs.appendChild(el('div', { class:'chat-bubble bot' }, text)); msgs.scrollTop = msgs.scrollHeight; speak(text); }
  function me(text) { msgs.appendChild(el('div', { class:'chat-bubble me' }, text)); msgs.scrollTop = msgs.scrollHeight; }
  function reply(input) {
    const lower = input.toLowerCase();
    let found = TUTOR_QA.find(qa => qa.q.some(k => lower.includes(k.toLowerCase())));
    if (!found) {
      bot(T("That's interesting! Try one of these chapters in the home screen — you'll find lots of fun activities!",
        "दिलचस्प! होम स्क्रीन से कोई अध्याय खोलो — मज़ेदार गतिविधियाँ मिलेंगी!"));
    } else {
      bot(T(found.a_en, found.a_hi));
    }
  }
  wrap.appendChild(msgs);
  // Quick suggestion pills
  const quick = el('div', { class:'chat-quick' });
  ['Hello','Alphabet','Numbers','Colors','Animals','Help'].forEach(q => {
    const p = el('div', { class:'chat-q-pill' }, q);
    p.onclick = () => { me(q); reply(q); };
    quick.appendChild(p);
  });
  wrap.appendChild(quick);
  // Input
  const input = el('input', { type:'text', placeholder: T('Type your question…','सवाल लिखें…') });
  const send = el('button', {}, '➤');
  const inputRow = el('div', { class:'chat-input' });
  inputRow.appendChild(input);
  inputRow.appendChild(send);
  function sendMsg() {
    const v = input.value.trim();
    if (!v) return;
    me(v); input.value = '';
    setTimeout(() => reply(v), 400);
  }
  send.onclick = sendMsg;
  input.onkeydown = (e) => { if (e.key === 'Enter') sendMsg(); };
  wrap.appendChild(inputRow);
  root.appendChild(wrap);
  setTimeout(() => bot(T("Hi! I'm your learning helper. Ask me anything!","नमस्ते! कुछ भी पूछो!")), 300);
};

// ============================================================
// ============== STORY GENERATOR (template) =================
// ============================================================
const STORY_TEMPLATES = [
  { en:`Once upon a time, in a magical {place}, there lived a brave kid named {name}. {name} had a special pet {animal} who could do amazing tricks. One sunny day, they found a {object} that sparkled like gold. They followed it through the {place} and discovered a hidden treasure full of {treasure}! The whole family celebrated. {name} learned that being curious leads to wonderful adventures.`,
    hi:`एक बार की बात है, जादुई {place} में, एक बहादुर बच्चा रहता था जिसका नाम {name} था। {name} के पास एक खास {animal} था जो शानदार करतब करता था। एक धूप वाले दिन उन्हें एक {object} मिली जो सोने की तरह चमकती थी। वे {place} में उसे ढूँढते गए और छिपा खज़ाना मिला जिसमें {treasure} था! सब खुश हो गए। {name} ने सीखा कि जिज्ञासा अद्भुत रोमांच लाती है।` },
  { en:`{name} was playing in the {place} when a friendly {animal} appeared. "Will you help me?" said the {animal}. "I lost my {object}!" {name} agreed and they searched together. They found {treasure} hidden behind a tree. The {animal} was so happy! From that day on, {name} and the {animal} were best friends forever.`,
    hi:`{name} {place} में खेल रहा था कि एक प्यारा {animal} आया। "क्या मेरी मदद करोगे?" {animal} बोला। "मेरी {object} खो गई!" {name} ने हाँ कहा और साथ ढूँढने लगे। पेड़ के पीछे {treasure} मिला। {animal} बहुत खुश हुआ! उस दिन से वो दोस्त बन गए।` },
  { en:`In a {place} far away, {name} discovered a magic {object}. When {name} touched it, a wise {animal} appeared. "Three wishes!" said the {animal}. {name} wished for {treasure}, then for happiness, and finally for everyone in the world to be kind. The {animal} smiled and said, "You have a beautiful heart, {name}." All wishes came true!`,
    hi:`दूर एक {place} में, {name} ने एक जादुई {object} खोजी। छूते ही एक बुद्धिमान {animal} प्रकट हुआ। "तीन इच्छाएँ!" {animal} बोला। {name} ने {treasure}, खुशी, और सबकी दया मांगी। {animal} मुस्कुराया, "तुम्हारा दिल सुंदर है।" सब पूरा हो गया!` }
];
const STORY_FILLS = {
  place: { en:['forest','castle','ocean','mountain','garden','island'], hi:['जंगल','महल','समुद्र','पहाड़','बगीचा','द्वीप'] },
  animal: { en:['puppy','kitten','rabbit','elephant','dragon','unicorn'], hi:['पिल्ला','बिल्ली','खरगोश','हाथी','ड्रैगन','यूनिकॉर्न'] },
  object: { en:['key','book','crystal','ring','feather','star'], hi:['चाबी','किताब','क्रिस्टल','अंगूठी','पंख','तारा'] },
  treasure: { en:['gold coins','colorful gems','sweet candies','rainbow toys','shiny stickers'], hi:['सोने के सिक्के','रंगीन रत्न','मिठाइयाँ','खिलौने','स्टिकर'] }
};
BUILDERS.storyGenerator = (root) => {
  root.innerHTML = '';
  root.appendChild(header('📖 Story Generator','📖 कहानी जनरेटर',
    'Create a story with your name!','अपने नाम से कहानी बनाओ!'));
  const wrap = el('div', { class:'game-area' });
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const active = localStorage.getItem('activeProfile') || 'default';
  const me = profiles.find(p => p.id === active) || { name: 'Kiddo' };

  const nameInput = el('input', { type:'text', value: me.name });
  const animalSelect = el('select');
  const placeSelect = el('select');
  ['Auto','puppy','kitten','rabbit','elephant','dragon','unicorn'].forEach(a => {
    const o = el('option', { value: a }, a);
    animalSelect.appendChild(o);
  });
  ['Auto','forest','castle','ocean','mountain','garden','island'].forEach(p => {
    const o = el('option', { value: p }, p);
    placeSelect.appendChild(o);
  });

  wrap.appendChild(el('div', { class:'form-row' }, [el('label', {}, T('Name:','नाम:')), nameInput]));
  wrap.appendChild(el('div', { class:'form-row' }, [el('label', {}, T('Pet:','पालतू:')), animalSelect]));
  wrap.appendChild(el('div', { class:'form-row' }, [el('label', {}, T('Place:','जगह:')), placeSelect]));

  const out = el('div', { class:'story-output' }, T('Click "Generate Story" to begin!','"कहानी बनाओ" दबाओ!'));
  wrap.appendChild(out);
  const gen = el('button', { class:'big-play' }, '✨ ' + T('Generate Story','कहानी बनाओ'));
  gen.onclick = () => {
    const tmpl = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
    const langKey = STATE.lang === 'hi' ? 'hi' : 'en';
    let story = tmpl[langKey];
    const pickedAnimal = animalSelect.value !== 'Auto' ? animalSelect.value : null;
    const pickedPlace = placeSelect.value !== 'Auto' ? placeSelect.value : null;
    const fillsLang = langKey === 'hi' ? 'hi' : 'en';
    const fillRand = (cat) => STORY_FILLS[cat][fillsLang][Math.floor(Math.random() * STORY_FILLS[cat][fillsLang].length)];
    story = story.replace(/{name}/g, nameInput.value || me.name);
    story = story.replace(/{place}/g, pickedPlace || fillRand('place'));
    story = story.replace(/{animal}/g, pickedAnimal || fillRand('animal'));
    story = story.replace(/{object}/g, fillRand('object'));
    story = story.replace(/{treasure}/g, fillRand('treasure'));
    out.textContent = story;
    addStar(2); fireConfetti(40);
    speak(story);
  };
  wrap.appendChild(el('div', { class:'btn-row' }, [gen]));
  root.appendChild(wrap);
};

// ============================================================
// ============== LESSON SUGGESTER ===========================
// ============================================================
BUILDERS.lessonSuggester = (root) => {
  root.innerHTML = '';
  root.appendChild(header('💡 Smart Suggestions','💡 स्मार्ट सुझाव',
    'Recommended for you','तुम्हारे लिए सुझाव'));
  const wrap = el('div', { class:'game-area' });
  const menu = CLASS_MENU[STATE.klass] || [];
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  const weak = getWeakTopics();

  // Section 1: weak topics
  if (weak.length > 0) {
    wrap.appendChild(el('h3', { style:'margin:14px 0 8px' }, '🎯 ' + T('Practice More','और अभ्यास')));
    weak.slice(0, 3).forEach(({ topic }) => {
      const m = menu.find(x => x.s === topic); if (!m) return;
      const c = el('div', { class:'suggest-card weak' }, [
        el('div', { style:'display:flex;gap:12px;align-items:center' }, [
          el('div', { style:'font-size:42px' }, m.ico),
          el('div', { style:'flex:1' }, [
            el('h4', {}, T(m.en, m.hi)),
            el('div', { style:'font-size:12px;color:#666' }, T('Needs more practice','और अभ्यास चाहिए'))
          ]),
          el('button', { class:'btn green', style:'padding:10px 14px' }, '▶️')
        ])
      ]);
      c.onclick = () => go(topic);
      wrap.appendChild(c);
    });
  }

  // Section 2: not yet tried
  const untried = menu.filter(m => !visited[m.s]).slice(0, 4);
  if (untried.length > 0) {
    wrap.appendChild(el('h3', { style:'margin:14px 0 8px' }, '✨ ' + T('Try Something New','कुछ नया आज़माओ')));
    untried.forEach(m => {
      const c = el('div', { class:'suggest-card' }, [
        el('div', { style:'display:flex;gap:12px;align-items:center' }, [
          el('div', { style:'font-size:42px' }, m.ico),
          el('div', { style:'flex:1' }, [
            el('h4', {}, T(m.en, m.hi)),
            el('div', { style:'font-size:12px;color:#666' }, T('New topic for you','तुम्हारे लिए नया'))
          ]),
          el('button', { class:'btn blue', style:'padding:10px 14px' }, '▶️')
        ])
      ]);
      c.onclick = () => go(m.s);
      wrap.appendChild(c);
    });
  }

  // Section 3: strengths
  const strong = menu.filter(m => topicMastery(m.s) >= 3).slice(0, 3);
  if (strong.length > 0) {
    wrap.appendChild(el('h3', { style:'margin:14px 0 8px' }, '💪 ' + T('Your Strengths','तुम्हारी ताकत')));
    strong.forEach(m => {
      const c = el('div', { class:'suggest-card' }, [
        el('div', { style:'display:flex;gap:12px;align-items:center' }, [
          el('div', { style:'font-size:42px' }, m.ico),
          el('div', { style:'flex:1' }, [
            el('h4', {}, T(m.en, m.hi)),
            el('div', { style:'font-size:12px;color:#666' }, T('Mastered! 🌟','उत्तम! 🌟'))
          ])
        ])
      ]);
      wrap.appendChild(c);
    });
  }
  root.appendChild(wrap);
};

// ============================================================
// ============== DAILY LOGIN BONUS ==========================
// ============================================================
function checkDailyLoginBonus() {
  const today = new Date().toDateString();
  const lastBonus = localStorage.getItem(profileKey('lastBonus'));
  if (lastBonus === today) return;
  let streak = parseInt(localStorage.getItem(profileKey('bonusStreak')) || '0');
  const yest = new Date(Date.now() - 86400000).toDateString();
  if (lastBonus === yest) streak++;
  else streak = 1;
  if (streak > 7) streak = 1;
  localStorage.setItem(profileKey('lastBonus'), today);
  localStorage.setItem(profileKey('bonusStreak'), streak);
  // Show modal
  setTimeout(() => {
    const bonusVals = [1, 2, 3, 4, 5, 7, 10];
    const todayBonus = bonusVals[streak - 1] || 1;
    document.getElementById('bonusTitle').textContent = T(`Day ${streak} Bonus!`, `दिन ${streak} बोनस!`);
    document.getElementById('bonusSub').textContent = T(`+${todayBonus} stars for logging in!`, `+${todayBonus} तारे!`);
    const strip = document.getElementById('bonusStreak');
    strip.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const d = el('div', { class:'bonus-day' + (i < streak ? ' claimed' : '') + (i === streak ? ' today claimed' : '') }, [
        el('div', { style:'font-size:14px' }, '⭐'),
        el('div', {}, '+' + bonusVals[i - 1])
      ]);
      strip.appendChild(d);
    }
    document.getElementById('loginBonus').classList.add('show');
    document.getElementById('bonusClose').onclick = () => {
      addStar(todayBonus);
      document.getElementById('loginBonus').classList.remove('show');
      fireConfetti(80);
    };
  }, 1500);
}

// ============================================================
// ============== BIRTHDAY MODE ==============================
// ============================================================
function checkBirthdayMode() {
  const dob = localStorage.getItem(profileKey('dob'));
  if (!dob) return;
  const d = new Date(dob);
  const t = new Date();
  if (d.getDate() === t.getDate() && d.getMonth() === t.getMonth()) {
    document.body.classList.add('birthday');
    const seenKey = profileKey('bdaySeen_' + t.getFullYear());
    if (!localStorage.getItem(seenKey)) {
      setTimeout(() => {
        const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
        const me = profiles.find(p => p.id === (localStorage.getItem('activeProfile') || 'default'));
        document.getElementById('bdaySub').textContent = T(`Happy Birthday ${me?.name || ''}!`, `जन्मदिन मुबारक ${me?.name || ''}!`);
        document.getElementById('birthdayPop').classList.add('show');
        fireConfetti(200);
        speak(T(`Happy Birthday!`, `जन्मदिन मुबारक!`));
        emojiRain(['🎂','🎈','🎁','🎉','🎊','🌟']);
        localStorage.setItem(seenKey, '1');
      }, 2000);
    }
  }
}
document.getElementById('bdayClose').onclick = () => {
  document.getElementById('birthdayPop').classList.remove('show');
  addStar(20);
};
function emojiRain(emojis) {
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const e = document.createElement('div');
      e.className = 'emoji-rain';
      e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      e.style.left = Math.random() * 100 + 'vw';
      e.style.top = '-30px';
      e.style.animationDuration = (3 + Math.random() * 3) + 's';
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 7000);
    }, i * 100);
  }
}

// ============================================================
// ============== PARTICLE TRAILS ============================
// ============================================================
const _trailCanvas = document.getElementById('particleTrail');
const _trailCtx = _trailCanvas.getContext('2d');
const _trailParticles = [];
let _trailEnabled = localStorage.getItem('trails') !== '0';
function resizeTrailCanvas() {
  _trailCanvas.width = window.innerWidth;
  _trailCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeTrailCanvas);
resizeTrailCanvas();
function spawnTrail(x, y) {
  if (!_trailEnabled) return;
  const colors = ['#ff4081','#42a5f5','#ffa726','#66bb6a','#ab47bc'];
  for (let i = 0; i < 3; i++) {
    _trailParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 1,
      life: 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 4
    });
  }
}
function trailLoop() {
  _trailCtx.clearRect(0, 0, _trailCanvas.width, _trailCanvas.height);
  for (let i = _trailParticles.length - 1; i >= 0; i--) {
    const p = _trailParticles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
    if (p.life <= 0) { _trailParticles.splice(i, 1); continue; }
    _trailCtx.fillStyle = p.color;
    _trailCtx.globalAlpha = p.life / 25;
    _trailCtx.beginPath();
    _trailCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    _trailCtx.fill();
  }
  _trailCtx.globalAlpha = 1;
  requestAnimationFrame(trailLoop);
}
trailLoop();
document.addEventListener('click', (e) => spawnTrail(e.clientX, e.clientY));
document.addEventListener('touchmove', (e) => {
  for (let i = 0; i < e.touches.length; i++) spawnTrail(e.touches[i].clientX, e.touches[i].clientY);
});

// ============================================================
// ============== KID MODE LOCK ==============================
// ============================================================
function enableKidLock() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  localStorage.setItem('kidLocked', '1');
  showToast(T('🔒 Kid Mode ON','🔒 किड मोड चालू'));
}
function checkKidLockOnExit() {
  // We don't truly prevent exit, but show prompt before back/leave
  if (localStorage.getItem('kidLocked') === '1') {
    return true;
  }
  return false;
}
document.getElementById('kidLockUnlock').onclick = () => {
  const v = document.getElementById('kidLockPin').value;
  if (v === getParentPin()) {
    localStorage.removeItem('kidLocked');
    document.getElementById('kidLock').classList.remove('show');
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    showToast(T('Unlocked','अनलॉक'));
  } else {
    showToast(T('Wrong PIN','गलत PIN'));
  }
  document.getElementById('kidLockPin').value = '';
};

// ============================================================
// ============== AUTO SYNC (local) ==========================
// ============================================================
function autoSync() {
  try {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data[k] = localStorage.getItem(k);
    }
    localStorage.setItem('_autoBackup', JSON.stringify({ ts: Date.now(), data: JSON.stringify(data) }));
  } catch(e) {}
}
setInterval(autoSync, 5 * 60 * 1000); // every 5 min

// ============================================================
// ============== INSTALL PROMPT BANNER ======================
// ============================================================
document.getElementById('installAccept')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installBanner').classList.remove('show');
      localStorage.setItem('installDismissed', '1');
    }
    deferredPrompt = null;
  }
});
document.getElementById('installDismiss')?.addEventListener('click', () => {
  document.getElementById('installBanner').classList.remove('show');
  localStorage.setItem('installDismissed', '1');
});

// ============================================================
// ============== OFFLINE INDICATOR ==========================
// ============================================================
function updateOfflineStatus() {
  const bar = document.getElementById('offlineBar');
  if (!navigator.onLine) bar.classList.add('show');
  else bar.classList.remove('show');
}
window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);
updateOfflineStatus();

// ============================================================
// ============== DAILY REMINDER (browser notification) ======
// ============================================================
function setupReminder() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    // Ask politely after some time
    setTimeout(() => {
      if (localStorage.getItem('notifAsked') !== '1') {
        if (confirm(T('Get daily learning reminder?','रोज़ की पढ़ाई के लिए रिमाइंडर?'))) {
          Notification.requestPermission();
        }
        localStorage.setItem('notifAsked', '1');
      }
    }, 30000);
  }
  // Schedule a reminder check (when app is open)
  setInterval(() => {
    if (Notification.permission === 'granted') {
      const today = new Date().toDateString();
      const lastNotif = localStorage.getItem('lastNotif');
      const hour = new Date().getHours();
      if (lastNotif !== today && hour >= 16 && hour <= 19) {
        const lastActive = localStorage.getItem(profileKey('lastActive'));
        if (lastActive !== today) {
          new Notification('🌟 Kids Learning', {
            body: T("Today's lesson is waiting! 5 fun activities ready.","आज का पाठ तैयार है! 5 गतिविधियाँ।"),
            icon: 'icon.svg'
          });
          localStorage.setItem('lastNotif', today);
        }
      }
    }
  }, 60000);
}
setupReminder();

// ============================================================
// ============== WEEKLY PDF REPORT (jsPDF lazy load) ========
// ============================================================
async function generateWeeklyPDF() {
  // Lazy-load jsPDF from CDN if not already loaded
  if (typeof window.jspdf === 'undefined') {
    showToast(T('Loading PDF generator…','PDF लोड हो रहा है…'));
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => null);
  }
  if (typeof window.jspdf === 'undefined') {
    // Fallback: use window.print() with styled HTML
    printableReport();
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const active = localStorage.getItem('activeProfile') || 'default';
  const me = profiles.find(p => p.id === active) || { name:'Kid' };
  doc.setFontSize(22); doc.setTextColor(255, 64, 129);
  doc.text('Kids Learning Report', 105, 20, { align:'center' });
  doc.setFontSize(14); doc.setTextColor(50);
  doc.text(`Name: ${me.name}`, 20, 40);
  doc.text(`Class: ${STATE.klass || '—'}`, 20, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
  doc.setFontSize(12);
  const stars = parseInt(localStorage.getItem(profileKey('stars')) || '0');
  const streak = parseInt(localStorage.getItem(profileKey('streak')) || '0');
  doc.text(`⭐ Total Stars: ${stars}`, 20, 80);
  doc.text(`🔥 Day Streak: ${streak}`, 20, 90);
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  doc.text(`📚 Topics Explored: ${Object.keys(visited).length}`, 20, 100);
  // Topics list
  doc.setFontSize(14); doc.setTextColor(255, 64, 129);
  doc.text('Topics Explored:', 20, 120);
  doc.setFontSize(11); doc.setTextColor(50);
  const menu = CLASS_MENU[STATE.klass] || [];
  let y = 130;
  Object.keys(visited).slice(0, 30).forEach(s => {
    const m = menu.find(x => x.s === s);
    if (m) {
      doc.text(`• ${m.en}`, 20, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    }
  });
  doc.setFontSize(10); doc.setTextColor(150);
  doc.text('Generated by Kids Learning App', 105, 285, { align:'center' });
  doc.save(`report-${me.name}-${Date.now()}.pdf`);
  showToast(T('Report downloaded!','रिपोर्ट डाउनलोड!'));
}
function printableReport() {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  const active = localStorage.getItem('activeProfile') || 'default';
  const me = profiles.find(p => p.id === active) || { name:'Kid' };
  const w = window.open('', '_blank');
  const stars = parseInt(localStorage.getItem(profileKey('stars')) || '0');
  const visited = JSON.parse(localStorage.getItem(profileKey('visited')) || '{}');
  w.document.write(`<html><head><title>Report</title><style>body{font-family:sans-serif;max-width:600px;margin:30px auto;padding:20px}h1{color:#ff4081}</style></head><body>
    <h1>Kids Learning Report</h1>
    <p><b>Name:</b> ${me.name}</p>
    <p><b>Class:</b> ${STATE.klass}</p>
    <p><b>Stars:</b> ⭐ ${stars}</p>
    <p><b>Topics:</b> ${Object.keys(visited).length}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <button onclick="window.print()">🖨️ Print</button>
  </body></html>`);
}

// ============================================================
// ============== EXTEND PARENT DASHBOARD ====================
// ============================================================
const _origPDash = BUILDERS.parentDashboard;
BUILDERS.parentDashboard = (root) => {
  _origPDash(root);
  const wrap = root.querySelector('.game-area');
  if (!wrap) return;

  // Round 2 additions
  const r2box = el('div', { class:'rhyme-card' });
  r2box.appendChild(el('h3', {}, '📊 ' + T('Reports & Plans','रिपोर्ट व योजना')));
  const reportBtn = el('button', { class:'btn green', onclick: generateWeeklyPDF }, '📄 ' + T('Weekly PDF','साप्ताहिक PDF'));
  const planBtn = el('button', { class:'btn blue', onclick: () => go('customLesson') }, '📋 ' + T('Custom Lesson','कस्टम पाठ'));
  const printBtn = el('button', { class:'btn orange', onclick: () => printWorksheet() }, '🖨️ ' + T('Worksheet','वर्कशीट'));
  r2box.appendChild(el('div', { class:'btn-row' }, [reportBtn, planBtn, printBtn]));
  wrap.appendChild(r2box);

  // Adaptive learning summary
  const weak = getWeakTopics();
  if (weak.length > 0) {
    const wbox = el('div', { class:'rhyme-card' });
    wbox.appendChild(el('h3', {}, '🎯 ' + T('Needs Practice','अभ्यास चाहिए')));
    weak.slice(0, 5).forEach(({ topic, ratio }) => {
      const m = (CLASS_MENU[STATE.klass] || []).find(x => x.s === topic);
      if (m) {
        wbox.appendChild(el('div', { style:'display:flex;align-items:center;gap:10px;padding:8px;background:#ffebee;border-radius:12px;margin:4px 0' }, [
          el('span', { style:'font-size:24px' }, m.ico),
          el('span', { style:'flex:1' }, T(m.en, m.hi)),
          el('span', { style:'font-weight:bold;color:#c62828' }, Math.round(ratio * 100) + '%')
        ]));
      }
    });
    wrap.appendChild(wbox);
  }

  // Kid mode lock toggle
  const lockBox = el('div', { class:'rhyme-card' });
  lockBox.appendChild(el('h3', {}, '🔒 ' + T('Kid Mode Lock','किड मोड लॉक')));
  lockBox.appendChild(el('p', { style:'font-size:13px;color:#666;margin-bottom:8px' },
    T('Fullscreen mode — child cannot exit without PIN','फुलस्क्रीन मोड — बिना PIN एग्ज़िट नहीं')));
  const lockBtn = el('button', { class:'btn orange' }, '🔒 ' + T('Enable Kid Lock','किड लॉक चालू'));
  lockBtn.onclick = () => { enableKidLock(); go('classHome'); };
  lockBox.appendChild(el('div', { class:'btn-row' }, [lockBtn]));
  wrap.appendChild(lockBox);
};

function printWorksheet() {
  const w = window.open('', '_blank');
  const items = ALPHABET.slice(0, 10);
  let html = `<html><head><title>Worksheet</title><style>
    @page { size: A4; }
    body { font-family: sans-serif; padding: 30px; }
    h1 { color: #ff4081; text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .item { border: 2px dashed #ccc; padding: 20px; text-align: center; border-radius: 10px; }
    .letter { font-size: 80px; color: #eee; font-family: cursive; }
    .lines { border-bottom: 1px solid #ccc; height: 30px; margin: 8px 0; }
  </style></head><body>
    <h1>Practice Worksheet</h1>
    <p>Name: ____________________ &nbsp;&nbsp; Date: __________</p>
    <div class="grid">`;
  items.forEach(([l, en, hi, em]) => {
    html += `<div class="item"><div class="letter">${l}</div><div>${em} ${en}</div><div class="lines"></div><div class="lines"></div></div>`;
  });
  html += `</div><button onclick="window.print()" style="margin:20px auto;display:block;padding:10px 30px">🖨️ Print</button></body></html>`;
  w.document.write(html);
}

// ============================================================
// ============== CHAPTERS — ADD ROUND 2 TILES ===============
// ============================================================
// Helper to add tiles to a class menu
function addToMenu(klass, items) {
  if (CLASS_MENU[klass]) {
    items.forEach(it => {
      if (!CLASS_MENU[klass].find(x => x.s === it.s)) {
        CLASS_MENU[klass].push(it);
      }
    });
  }
}
const ROUND2_TILES = {
  voice: [
    { s:'voicePractice', en:'Pronounce', hi:'उच्चारण', ico:'🎤', c:'#e91e63' },
    { s:'voiceQuiz',     en:'Voice Quiz', hi:'आवाज़ क्विज़', ico:'🎙️', c:'#ad1457' }
  ],
  smart: [
    { s:'adaptiveStudy', en:'Smart Practice', hi:'स्मार्ट अभ्यास', ico:'🎯', c:'#00897b' },
    { s:'lessonSuggester', en:'Suggestions', hi:'सुझाव', ico:'💡', c:'#43a047' },
    { s:'aiTutor',         en:'Ask Tutor', hi:'टूटर से पूछो', ico:'🤖', c:'#5e35b1' }
  ],
  games: [
    { s:'memoryPalace',  en:'Memory Palace', hi:'स्मृति महल', ico:'🧠', c:'#9575cd' },
    { s:'mazeGame',      en:'Maze', hi:'भूल भुलैया', ico:'🌀', c:'#3f51b5' },
    { s:'jigsawPuzzle',  en:'Jigsaw', hi:'पहेली', ico:'🧩', c:'#7e57c2' },
    { s:'hiddenObject',  en:'Find Items', hi:'चीज़ें ढूंढो', ico:'🔍', c:'#bf360c' }
  ],
  content: [
    { s:'cursive',        en:'Cursive', hi:'सुलेख', ico:'✍️', c:'#ad1457' },
    { s:'science',        en:'Science', hi:'विज्ञान', ico:'🔬', c:'#0277bd' },
    { s:'yoga',           en:'Yoga', hi:'योग', ico:'🧘', c:'#7cb342' },
    { s:'computerBasics', en:'Computer', hi:'कंप्यूटर', ico:'💻', c:'#455a64' }
  ],
  fun: [
    { s:'storyGenerator', en:'Story Maker', hi:'कहानी बनाओ', ico:'📖', c:'#ff8a65' },
    { s:'petInteractive', en:'My Pet', hi:'मेरा पालतू', ico:'🐾', c:'#8d6e63' },
    { s:'gardenInteractive', en:'Garden', hi:'बगीचा', ico:'🌷', c:'#43a047' },
    { s:'surpriseBox',    en:'Surprise', hi:'आश्चर्य', ico:'🎁', c:'#ec407a' },
    { s:'leaderboard',    en:'Leaderboard', hi:'लीडरबोर्ड', ico:'🏆', c:'#fbc02d' },
    { s:'miniEvent',      en:'Special Week', hi:'खास सप्ताह', ico:'🎪', c:'#ab47bc' },
    { s:'weeklySchedule', en:'Schedule', hi:'योजना', ico:'📅', c:'#1976d2' },
    { s:'homework',       en:'Homework', hi:'होमवर्क', ico:'📝', c:'#f57c00' }
  ]
};
['nursery','kg1','kg2'].forEach(k => {
  addToMenu(k, ROUND2_TILES.voice);
  addToMenu(k, ROUND2_TILES.smart);
  addToMenu(k, ROUND2_TILES.games);
  addToMenu(k, ROUND2_TILES.fun);
  // Content (cursive/science/yoga/computer): mostly KG2, yoga & computer for KG1, all for nursery limited
  if (k === 'kg1' || k === 'kg2') addToMenu(k, [ROUND2_TILES.content[0]]); // cursive
  if (k === 'kg2') addToMenu(k, [ROUND2_TILES.content[1]]); // science
  addToMenu(k, [ROUND2_TILES.content[2]]); // yoga (all)
  if (k === 'kg1' || k === 'kg2') addToMenu(k, [ROUND2_TILES.content[3]]); // computer
});

// Extend CHAPTERS
CHAPTERS.push(
  { id:'voice',   en:'Voice Practice',   hi:'आवाज़ अभ्यास',  ico:'🎤', c:'#e91e63',
    items: ROUND2_TILES.voice.map(x => x.s) },
  { id:'smart',   en:'Smart Learning',   hi:'स्मार्ट सीखना', ico:'🎯', c:'#00897b',
    items: ROUND2_TILES.smart.map(x => x.s) }
);
// Add new games to existing 'games' chapter
const gamesCh = CHAPTERS.find(c => c.id === 'games');
if (gamesCh) ROUND2_TILES.games.forEach(g => { if (!gamesCh.items.includes(g.s)) gamesCh.items.push(g.s); });
// Add new content to existing chapters
const writingCh = CHAPTERS.find(c => c.id === 'writing');
if (writingCh && !writingCh.items.includes('cursive')) writingCh.items.push('cursive');
const cultureCh = CHAPTERS.find(c => c.id === 'culture');
if (cultureCh) {
  if (!cultureCh.items.includes('science')) cultureCh.items.push('science');
  if (!cultureCh.items.includes('yoga')) cultureCh.items.push('yoga');
  if (!cultureCh.items.includes('computerBasics')) cultureCh.items.push('computerBasics');
}
const storiesCh = CHAPTERS.find(c => c.id === 'stories');
if (storiesCh && !storiesCh.items.includes('storyGenerator')) storiesCh.items.push('storyGenerator');
// Add fun ones to rewards chapter
const rewardsCh = CHAPTERS.find(c => c.id === 'rewards');
if (rewardsCh) ['petInteractive','gardenInteractive','surpriseBox','leaderboard','miniEvent','weeklySchedule','homework']
  .forEach(s => { if (!rewardsCh.items.includes(s)) rewardsCh.items.push(s); });

// ============================================================
// ============== ON-LOAD HOOKS ==============================
// ============================================================
setTimeout(() => {
  if (STATE.klass) {
    checkDailyLoginBonus();
    checkBirthdayMode();
  }
}, 1000);

// Re-route certain screen ids to update non-learning set
['voicePractice','voiceQuiz','adaptiveStudy','lessonSuggester','aiTutor','memoryPalace','mazeGame',
 'jigsawPuzzle','hiddenObject','cursive','science','yoga','computerBasics','storyGenerator',
 'petInteractive','gardenInteractive','surpriseBox','leaderboard','miniEvent','weeklySchedule','homework',
 'customLesson'].forEach(id => {
  // these ARE learning screens (except utility ones below)
});
// Mark these as non-learning (utility):
['customLesson','leaderboard','surpriseBox','weeklySchedule'].forEach(s => _NON_LEARNING.add(s));

// Final touch: hide install banner if already installed (standalone mode)
if (window.matchMedia('(display-mode: standalone)').matches) {
  localStorage.setItem('installDismissed', '1');
}

// Re-apply language now that TR_MAP is fully defined
// (fixes TDZ issue where applyLang ran before TR_MAP was initialized)
try {
  applyLang();
  if (STATE.klass && STATE.current && STATE.current !== 'classSelect') {
    go(STATE.current);
  }
} catch(e) {}
