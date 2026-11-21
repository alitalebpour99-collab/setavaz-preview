/* Setavaz: the catalogue and every text on the site, in Persian and English.
   BPM, drop and section times are measured from the masters (round-1120,
   round-1126, single-setareh-code). Key and mode are the colour each song
   was made in. */
window.SV = window.SV || {};
SV.SONGS = [
  {
    id: 'kahkeshan', title: 'Kahkeshan', fa: 'کهکشان', group: 'prelude', world: 'sky', n: 12, acc: '#cdd6ff',
    kindFa: 'پیش‌درآمد', kindEn: 'Prelude', placeFa: 'آسمان کویر', placeEn: 'The desert sky',
    genreFa: 'افروهاوس ایرانی', genreEn: 'Persian afro house', bpm: 119.75, len: 153,
    keyFa: 'ر مینور', keyEn: 'D minor', modeFa: 'شور', modeEn: 'Shur',
    instFa: ['کمانچه', 'تحریر صدای زن', 'جواب گروه «اوه اوه»', 'دف', 'تنبک', 'ساب‌بیس'],
    instEn: ['Kamancheh', 'Female tahrir', 'Group answer “oh-oh”', 'Daf', 'Tombak', 'Sub bass'],
    jobsFa: [['کمانچه', 'نقشهٔ ستاره را خط به خط در آسمان می‌کشد'], ['کیک', 'ضربان آسمان؛ هر ضربه یک حلقهٔ نور'], ['گروه', 'ستاره‌های دیگر که جواب می‌دهند'], ['تحریر', 'نسیم شب کویر']],
    jobsEn: [['Kamancheh', 'draws the star map, line by line'], ['Kick', 'the pulse of the sky, one ring of light each'], ['The group', 'the other stars, answering'], ['Tahrir', 'the night wind over the desert']],
    lineFa: 'شب کویر. ستارهٔ ما هنوز در آسمان است، روشن‌تر از بقیه.',
    lineEn: 'A desert night. Our star is still in the sky, brighter than the rest.',
    storyFa: [
      'همه‌چیز از آسمان شروع می‌شود. شب کویر صاف است و کهکشان از این سر تا آن سر آسمان کشیده شده.',
      'یک ستاره از بقیه طلایی‌تر است. کمانچه دورش نقشه‌ای دوازده‌پر می‌کشد و ستاره‌های دیگر با صدای گروه جواب می‌دهند.',
      'وقتی ضرب می‌آید، ستاره دیگر نمی‌تواند بماند. از جایش جدا می‌شود و رو به زمین می‌رود. سفر از همین‌جا شروع می‌شود.'
    ],
    storyEn: [
      'Everything begins in the sky. The desert night is clear and the Milky Way runs from one end of it to the other.',
      'One star is more golden than the rest. The kamancheh draws a twelve-petal map around it, and the other stars answer in the voice of the group.',
      'When the beat arrives, the star cannot stay. It breaks away and falls toward the earth. This is where the journey starts.'
    ],
    mapT: [0, 16, 96, 120, 146],
    mapFa: ['نقشه در آسمان کشیده می‌شود', 'ضرب می‌آید و آسمان می‌تپد', 'آسمان ساکت می‌شود', 'ستاره از جایش جدا می‌شود', 'رو به زمین، رو به کویر'],
    mapEn: ['The map is drawn in the sky', 'The beat comes and the sky pulses', 'The sky falls quiet', 'The star breaks away', 'Down toward the desert']
  },
  {
    id: 'mehr', title: 'Mehr', fa: 'مهر', group: 'chapter', ch: 1, world: 'desert', n: 12, acc: '#f2a65c',
    kindFa: 'فصل یکم', kindEn: 'Chapter one', placeFa: 'کویر لوت', placeEn: 'The Lut desert',
    genreFa: 'افروهاوس ایرانی', genreEn: 'Persian afro house', bpm: 119.75, len: 155,
    keyFa: 'می مینور', keyEn: 'E minor', modeFa: 'شور', modeEn: 'Shur',
    instFa: ['کمانچه', 'جواب گروه «اوه اوه، هِی!»', 'دف', 'کنگا و طبل‌های قبیله‌ای', 'پد طلایی', 'ساب‌بیس'],
    instEn: ['Kamancheh', 'Group answer “oh-oh, hey!”', 'Daf', 'Congas and tribal toms', 'Golden pads', 'Sub bass'],
    jobsFa: [['کمانچه', 'خط طلایی راه'], ['کیک', 'قدم‌های ستاره روی شن'], ['گروه «هِی!»', 'فانوس‌های کاروان'], ['تحریر', 'باد شن و پرنده‌ها']],
    jobsEn: [['Kamancheh', 'the gold line of the road'], ['Kick', 'the star’s steps in the sand'], ['Group “hey!”', 'the caravan’s lanterns'], ['Tahrir', 'the sand wind and the birds']],
    lineFa: 'شب کویر لوت. ستاره به زمین می‌آید و با یک کاروان تا طلوع راه می‌رود.',
    lineEn: 'Night in the Lut desert. The star comes down and walks with a caravan until sunrise.',
    storyFa: [
      'ستاره روی تپه‌ای در کویر لوت فرود می‌آید. در دوردست یک آتشکدهٔ چهارطاقی خاموش پیداست.',
      'راه می‌افتد و هر قدمش ردی از نور روی شن می‌گذارد. کاروانی با فانوس‌هایش به او می‌پیوندد.',
      'توفان شن ردش را پاک می‌کند. ستاره نقشه‌اش را در آسمان می‌بیند و دوباره راه را پیدا می‌کند.',
      'در تاریک‌ترین ساعت به آتشکده می‌رسد، کم‌نور و خسته. کاروانیان نور فانوس‌هایشان را به او می‌دهند. ستاره آتشدان را روشن می‌کند و همان لحظه خورشید، یعنی «مهر»، از پشت طاق‌ها بالا می‌آید.',
      'ردپاهای کل راه از بالا یک گرهٔ دوازده‌پر می‌سازند: همان خورشید. ستاره خداحافظی می‌کند و به سمت پلی می‌رود که در مه پیداست.'
    ],
    storyEn: [
      'The star lands on a dune in the Lut desert. Far away stands a dark fire temple with four arches.',
      'It sets off, and every step leaves a trace of light in the sand. A caravan with lanterns joins it.',
      'A sandstorm wipes its trail away. The star finds its map in the sky and finds the road again.',
      'In the darkest hour it reaches the temple, dim and tired. The travellers give it the light of their lanterns. The star lights the fire, and at that moment the sun, Mehr, rises behind the arches.',
      'Seen from above, all its footprints make a twelve-petal girih: the sun itself. The star says goodbye and walks toward a bridge in the mist.'
    ],
    mapT: [0, 16, 48, 64, 96, 112, 136],
    mapFa: ['آسمان و ستاره', 'راه افتادن', 'توفان', 'دنبال نقشه', 'تاریک‌ترین ساعت', 'مهر، طلوع', 'خداحافظی'],
    mapEn: ['The sky and the star', 'Setting off', 'The storm', 'Following the map', 'The darkest hour', 'Mehr, the sunrise', 'Farewell']
  },
  {
    id: 'si-o-se-pol', title: 'Si-o-se-pol', fa: 'سی‌وسه‌پل', group: 'chapter', ch: 2, world: 'bridge', n: 11, acc: '#eda15e',
    kindFa: 'فصل دوم', kindEn: 'Chapter two', placeFa: 'پل اصفهان، شب', placeEn: 'The Isfahan bridge at night',
    genreFa: 'ملودیک هاوس', genreEn: 'Melodic house', bpm: 120.05, len: 157,
    keyFa: 'فا مینور', keyEn: 'F minor', modeFa: 'همایون', modeEn: 'Homayoun',
    instFa: ['کمانچه', 'تحریر صدای آلتوی زن', 'تنبک', 'پد زهی تیره', 'آرپژ آرام', 'بیس ملودیک'],
    instEn: ['Kamancheh', 'Alto female tahrir', 'Tombak', 'Dark string pads', 'Slow arpeggio', 'Melodic bass'],
    jobsFa: [['کمانچه', 'راه ستاره روی پل'], ['کیک', 'قدم‌ها روی سنگ'], ['تحریر', 'نسیم روی رودخانه'], ['آرپژ', 'نور طاق‌ها در آب']],
    jobsEn: [['Kamancheh', 'the star’s way across'], ['Kick', 'steps on the stones'], ['Tahrir', 'the breeze on the river'], ['Arpeggio', 'the arches’ light in the water']],
    lineFa: 'شب روی رودخانه. ستاره از روی پل رد می‌شود و سی‌وسه طاق یکی‌یکی روشن می‌شوند.',
    lineEn: 'Night over the river. The star crosses the bridge and its thirty-three arches light up one by one.',
    storyFa: [
      'مه کویر پشت سر مانده. ستاره به اصفهان می‌رسد، به پلی که سی‌وسه طاق دارد و همه خاموش‌اند.',
      'پایش را که روی پل می‌گذارد، اولین طاق روشن می‌شود. با هر قدم یک طاق دیگر، و عکس هر کدام در آب می‌لرزد.',
      'وسط پل می‌ایستد. صدای زنی از طبقهٔ بالای پل می‌آید و رودخانه آرام می‌شود.',
      'وقتی به سر دیگر پل می‌رسد، هر سی‌وسه طاق روشن‌اند و پل در آب کامل شده. ستاره راهش را به سوی جنگل‌های شمال ادامه می‌دهد.'
    ],
    storyEn: [
      'The desert mist is behind it. The star reaches Isfahan, and a bridge of thirty-three arches, all of them dark.',
      'When it steps on the bridge, the first arch lights up. One more with each step, and each one trembles in the water.',
      'In the middle it stops. A woman’s voice comes from the upper gallery and the river grows still.',
      'When it reaches the far end, all thirty-three arches are lit and the bridge is whole in the water. The star walks on toward the northern forests.'
    ],
    mapT: [0, 16, 46, 112, 136],
    mapFa: ['پل خاموش', 'طاق‌ها روشن می‌شوند', 'مکث وسط پل', 'سی‌وسه طاق روشن', 'به سوی جنگل'],
    mapEn: ['The dark bridge', 'The arches light up', 'A pause mid-bridge', 'All thirty-three lit', 'On toward the forest']
  },
  {
    id: 'jangal', title: 'Jangal', fa: 'جنگل', group: 'chapter', ch: 3, world: 'forest', n: 10, acc: '#d4ea78',
    kindFa: 'فصل سوم', kindEn: 'Chapter three', placeFa: 'جنگل هیرکانی', placeEn: 'The Hyrcanian forest',
    genreFa: 'هاوس آرام ارگانیک', genreEn: 'Organic downtempo house', bpm: 110.1, len: 154,
    keyFa: 'لا مینور', keyEn: 'A minor', modeFa: 'اصفهان', modeEn: 'Esfahan',
    instFa: ['سنتور', 'نی', 'دف آرام', 'دست‌کوبه‌های نرم', 'صدای پرنده و نسیم', 'بی‌کلام'],
    instEn: ['Santur', 'Ney', 'Soft daf', 'Soft hand drums', 'Birds and breeze', 'Instrumental'],
    jobsFa: [['سنتور', 'شب‌تاب‌ها'], ['نی', 'مهی که میان درخت‌ها راه می‌رود'], ['کیک', 'چشمک هم‌زمان شب‌تاب‌ها'], ['پرنده‌ها', 'سپیده‌ای که نزدیک است']],
    jobsEn: [['Santur', 'the fireflies'], ['Ney', 'the mist walking between trees'], ['Kick', 'the fireflies blinking together'], ['Birds', 'the dawn coming close']],
    lineFa: 'شب در جنگل مه‌آلود. شب‌تاب‌ها دور ستاره جمع می‌شوند و با هم نقشه را می‌کشند.',
    lineEn: 'Night in the misty forest. Fireflies gather round the star and draw the map together.',
    storyFa: [
      'جنگل کنار دریای خزر تاریک و خیس است. مه میان درخت‌های بلند راه می‌رود و ستاره راه را گم می‌کند.',
      'یک شب‌تاب پیدا می‌شود، بعد ده تا، بعد صدها. هر کدام با صدای سنتور چشمک می‌زند.',
      'شب‌تاب‌ها دور ستاره جمع می‌شوند و کم‌کم با هم چشمک می‌زنند. از نورشان یک گرهٔ ده‌پر در هوا ساخته می‌شود.',
      'نقشه کامل است. پرنده‌ها بیدار می‌شوند و ستاره از میان مه، رو به صدای دریا می‌رود.'
    ],
    storyEn: [
      'The forest by the Caspian is dark and wet. Mist walks between the tall trees and the star loses its way.',
      'One firefly appears, then ten, then hundreds. Each one blinks with the santur.',
      'They gather round the star and slowly blink as one. Their light builds a ten-petal girih in the air.',
      'The map is whole. The birds wake, and the star walks out of the mist toward the sound of the sea.'
    ],
    mapT: [0, 16, 53, 105, 132],
    mapFa: ['گم شدن در مه', 'شب‌تاب‌ها می‌آیند', 'چشمک با هم', 'گرهٔ ده‌پر', 'رو به دریا'],
    mapEn: ['Lost in the mist', 'The fireflies come', 'Blinking as one', 'The ten-petal girih', 'Toward the sea']
  },
  {
    id: 'lenj', title: 'Lenj', fa: 'لنج', group: 'chapter', ch: 4, world: 'sea', n: 8, acc: '#6fc0c8',
    kindFa: 'فصل چهارم', kindEn: 'Chapter four', placeFa: 'خلیج فارس', placeEn: 'The Persian Gulf',
    genreFa: 'آماپیانوی ایرانی', genreEn: 'Persian amapiano', bpm: 114.85, len: 148,
    keyFa: 'سل مینور', keyEn: 'G minor', modeFa: 'بیات ترک', modeEn: 'Bayat-e Tork',
    instFa: ['بربط', 'جواب گروه مردانه «اوه»', 'لاگ‌درام آماپیانو', 'تنبک', 'کلاویهٔ نرم', 'پد گرم'],
    instEn: ['Barbat', 'Low male group “oh”', 'Amapiano log drum', 'Tombak', 'Soft keys', 'Warm pad'],
    jobsFa: [['بربط', 'راه لنج روی آب'], ['لاگ‌درام', 'پاروها و موج'], ['گروه', 'ملوان‌ها'], ['کیک', 'فانوس دکل']],
    jobsEn: [['Barbat', 'the dhow’s course on the water'], ['Log drum', 'the oars and the swell'], ['The group', 'the sailors'], ['Kick', 'the mast lantern']],
    lineFa: 'غروب روی دریا. لنج راهش را می‌جوید و ستاره بالای دکل، قطب‌نمای او می‌شود.',
    lineEn: 'Sunset at sea. The dhow looks for its way, and the star becomes its compass on the mast.',
    storyFa: [
      'جنگل به ساحل می‌رسد و ساحل به خلیج فارس. یک لنج چوبی در غروب به سوی خانه برمی‌گردد.',
      'ملوان‌ها آواز می‌خوانند و بربط راه را روی آب می‌کشد. ولی شب زود می‌رسد و ساحل دیگر پیدا نیست.',
      'ستاره بالای دکل می‌نشیند. قطب‌نمای هشت‌پر در آسمان دور خودش می‌چرخد تا آرام می‌گیرد و راه را نشان می‌دهد.',
      'لنج به خانه می‌رسد. ستاره هنوز آن بالاست. سفر ادامه دارد.'
    ],
    storyEn: [
      'The forest meets the shore and the shore meets the Persian Gulf. A wooden lenj sails home in the sunset.',
      'The sailors sing and the barbat draws the course on the water. But night comes early and the shore is gone.',
      'The star settles on the mast. An eight-point compass turns in the sky until it is still, and shows the way.',
      'The dhow reaches home. The star is still up there. The journey goes on.'
    ],
    mapT: [0, 17, 82, 111, 127],
    mapFa: ['غروب و بادبان', 'ملوان‌ها می‌خوانند', 'شب و گم شدن ساحل', 'قطب‌نما آرام می‌گیرد', 'رسیدن به خانه'],
    mapEn: ['Sunset and sail', 'The sailors sing', 'Night, the shore is lost', 'The compass settles', 'Home']
  },
  {
    id: 'bazaar', title: 'Bazaar', fa: 'بازار', group: 'single', world: 'bazaar', n: 9, acc: '#f2b545',
    kindFa: 'تک‌آهنگ', kindEn: 'Single', placeFa: 'بازار کهنه، عصر', placeEn: 'The old bazaar at golden hour',
    genreFa: 'افروهاوس آفتابی', genreEn: 'Sunny afro house', bpm: 119.7, len: 156,
    keyFa: 'ر دورین', keyEn: 'D Dorian', modeFa: 'رنگ روشن، نزدیک دشتی', modeEn: 'Bright, close to Dashti',
    instFa: ['سوت', 'جواب جمعیت «اوه اوه اوه»', 'تنبک', 'کنگا', 'دست‌زدن', 'زخمه‌های گیتارگونه'],
    instEn: ['Whistle', 'Crowd answer “oh-oh-oh”', 'Tombak', 'Congas', 'Handclaps', 'Guitar-like plucks'],
    jobsFa: [['سوت', 'پرنده‌ای که زیر طاق‌ها می‌چرخد'], ['جمعیت', 'نور روزن‌ها'], ['کیک', 'قدم‌ها در راستهٔ بازار'], ['دست‌زدن', 'فانوس‌های آویزان']],
    jobsEn: [['Whistle', 'a bird circling under the vaults'], ['The crowd', 'the light of the skylights'], ['Kick', 'steps down the bazaar lane'], ['Claps', 'the hanging lanterns']],
    lineFa: 'عصر در بازار کهنه. نور از روزن سقف‌ها می‌ریزد و جمعیت با سوت هم‌صدا می‌شود.',
    lineEn: 'Late afternoon in the old bazaar. Light pours through the skylights and the crowd sings with the whistle.',
    storyFa: [
      'یک روز در میان راه. ستاره به بازاری کهنه می‌رسد که سقفش پر از روزن است.',
      'نور عصر از هر روزن یک ستون طلایی روی زمین می‌اندازد. کسی سوت می‌زند و جمعیت با «اوه اوه» جوابش را می‌دهد.',
      'ستاره راستهٔ بازار را تا ته می‌رود. فانوس‌ها با هر دست‌زدن تکان می‌خورند و پرنده‌ای زیر طاق‌ها می‌چرخد.'
    ],
    storyEn: [
      'A day on the way. The star reaches an old bazaar whose roof is full of skylights.',
      'The late sun drops a gold column on the floor through each one. Someone whistles and the crowd answers “oh-oh”.',
      'The star walks the lane to its end. The lanterns swing with every clap and a bird circles under the vaults.'
    ],
    mapT: [0, 8, 64, 100, 148],
    mapFa: ['سوت در راسته', 'جمعیت جواب می‌دهد', 'سایهٔ طاق‌ها', 'همه با هم', 'بازار بسته می‌شود'],
    mapEn: ['A whistle in the lane', 'The crowd answers', 'In the shade of the vaults', 'Everyone together', 'The bazaar closes']
  },
  {
    id: 'setareh-code', title: 'Setareh Code', fa: 'رمز ستاره', group: 'single', world: 'code', n: 16, acc: '#a9c8ff',
    kindFa: 'تک‌آهنگ', kindEn: 'Single', placeFa: 'نقشهٔ ستاره', placeEn: 'The star’s map',
    genreFa: 'افروهاوس', genreEn: 'Afro house', bpm: 127.65, len: 174,
    keyFa: 'ر مینور', keyEn: 'D minor', modeFa: 'رنگ ایرانی', modeEn: 'Persian colour',
    instFa: ['تحریر صدای زن', 'نی', 'جواب گروه', 'دف', 'تنبک', 'ساب‌بیس سنگین'],
    instEn: ['Female tahrir', 'Ney', 'Group chant', 'Daf', 'Tombak', 'Heavy sub bass'],
    jobsFa: [['تحریر', 'خطی که ستاره می‌نویسد'], ['کیک', 'هر ضربه یک خانهٔ روشن'], ['گروه', 'ستاره‌های خاتم که جواب می‌دهند'], ['نی', 'نسیمی که نقشه را تکان می‌دهد']],
    jobsEn: [['Tahrir', 'the line the star writes'], ['Kick', 'one tile lit with each hit'], ['The group', 'the khatam stars, answering'], ['Ney', 'the breeze that stirs the map']],
    lineFa: 'اولین آهنگ ستاواز. ستاره رمز خودش را روی نقش خاتم می‌نویسد.',
    lineEn: 'The first Setavaz song. The star writes its own code across a khatam pattern.',
    storyFa: [
      'پیش از همهٔ سفرها، یک آهنگ بود. ستاره رمز خودش را روی یک نقش خاتم نوشت.',
      'هر ضربه یک ستارهٔ هشت‌پر را روشن می‌کند. صدای زن خط را می‌کشد و گروه جوابش را می‌دهد.',
      'آخر آهنگ، همهٔ خانه‌ها روشن‌اند و از دور یک ستاره پیداست: همان ستارهٔ لوگوی ستاواز.'
    ],
    storyEn: [
      'Before any journey, there was one song. The star wrote its own code across a khatam pattern.',
      'Every beat lights one eight-point star. The woman’s voice draws the line and the group answers.',
      'At the end every tile is lit, and from far away you see one star: the star of the Setavaz logo.'
    ],
    mapT: [0, 52, 84, 116, 146],
    mapFa: ['نقش خاموش', 'گروه می‌آید', 'نی و مکث', 'بزرگ‌ترین ضرب', 'ستارهٔ کامل'],
    mapEn: ['The dark pattern', 'The group arrives', 'Ney and a pause', 'The biggest beat', 'The whole star']
  }
];
SV.BY = Object.fromEntries(SV.SONGS.map((s, i) => [s.id, Object.assign(s, { i })]));
SV.JOURNEY = ['mehr', 'si-o-se-pol', 'jangal', 'lenj'];
SV.ORDER = ['kahkeshan', 'mehr', 'si-o-se-pol', 'jangal', 'lenj', 'bazaar', 'setareh-code'];
