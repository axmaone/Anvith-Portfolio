// ─────────────────────────────────────────────────────────────
//  EDIT ME. Almost all the words on the home page live here.
//  Anything marked TODO is a placeholder waiting for your input.
// ─────────────────────────────────────────────────────────────

export const person = {
  name: 'Anvith M Acharya',
  firstName: 'Anvith',
  role: 'Learning & Experience Designer',
  roleLine: 'Learning design · Experience design · Psychology',
  location: 'Bengaluru, India',
  now: 'Instructional Designer at UNext Learning',
  email: 'anvithma@gmail.com',
  cv: '/Anvith-M-Acharya-CV.pdf',
  // Profile links. Leave '' to hide a link.
  links: {
    linkedin: 'https://www.linkedin.com/in/anvith-m-acharya/',
    instagram: 'https://www.instagram.com/anvith.ma/',
    behance: '',
  },
};

export const hero = {
  lines: ['I design', 'how people', 'learn.'],
  intro:
    'A psychologist who designs learning and experiences across fields: finance, semiconductors, cloud tech, leadership and behavioural skills. Workshops, e-learning, motion explainers and the systems behind them.',
};

// Frameworks shown under "My method".
export const frameworks = [
  { name: 'ADDIE', text: 'Analyse, Design, Develop, Implement, Evaluate. The project spine.' },
  { name: "Bloom's Taxonomy", text: 'Objectives that climb from remembering to creating, and assessments that match.' },
  { name: "Kirkpatrick's Model", text: 'Reaction, learning, behaviour, results. Proof the training worked.' },
];

// The four ICAD stages. The whole site is laid out as one ICAD session.
export const icad = [
  { key: 'Interest', verb: 'Hook', icon: 'spark', text: 'Open with a question, a contrast or a small disaster that makes the brain lean in.' },
  { key: 'Concept', verb: 'Frame', icon: 'bulb', text: 'Give the model or idea that turns that curiosity into structure.' },
  { key: 'Application', verb: 'Try', icon: 'hand', text: 'Let people decide, build, role-play or fail safely with the idea in their hands.' },
  { key: 'Debrief', verb: 'Reflect', icon: 'mirror', text: 'Make the learning explicit so it travels back to the job.' },
];

export const about = {
  lead: 'I studied the mind, then started designing for it.',
  paragraphs: [
    'I hold an MSc in Psychology from Surana College and have worked across counselling, research, facilitation, instructional design, learning design and experience design. That mix is the point: I care about what people actually do after a session, not just what they saw in it.',
    'Today I design digital, blended and classroom programmes at UNext Learning, from SME interviews to storyboards, scripts, visual assets and motion explainers. I have built learning on banking, semiconductor manufacturing and cloud virtualisation, and before that I led experiential learning for enterprise teams and facilitated for thousands of freshers and professionals.',
    'I take full ownership of my work and treat mistakes as signals to fix the system, so they do not happen twice.',
  ],
  numbers: [
    { value: '1500+', label: 'freshers facilitated' },
    { value: '1000+', label: 'corporate professionals trained' },
    { value: '50+', label: 'corporates reached through Buoyancee' },
    { value: '7+', label: 'MNCs facilitated for at AXMA' },
  ],
  offDuty: [
    { title: 'Chess', text: '7 years. First place at school, PU, UG and PG. Think you can beat me?', cta: 'Challenge AXMA1 on chess.com ↗', href: 'https://www.chess.com/member/AXMA1' },
    { title: 'Trekking', text: 'Trek Lead with Bengaluru Trekkers. I get groups up the hill and, more importantly, back down.' },
    { title: 'Cricket', text: '8 years of professional cricket; team captain in PU and UG.' },
  ],
};

export type Role = {
  when: string;
  title: string;
  org: string;
  note?: string;
  points: string[];
};

export const journey: Role[] = [
  {
    when: "Sept '25 – Now",
    title: 'Assistant Manager, Instructional Design',
    org: 'UNext Learning · Manipal Academy of BFSI',
    points: [
      'Lead end-to-end delivery of learning solutions for BFSI clients across several accounts.',
      'Design digital, blended and classroom programmes with SMEs.',
      'Write storyboards and scripts; build visual assets and motion explainers.',
      'Push gamified, scenario-based and microlearning formats.',
    ],
  },
  {
    when: "Feb '25 – Aug '25",
    title: 'L&D Team Lead',
    org: 'AXMA Learning',
    note: 'Unpaid',
    points: [
      'Led an 8-member team across design, facilitation, research and client operations.',
      'Designed experiential modules on the ICAD framework for enterprise clients.',
      'Facilitated workshops and simulations for managers and educators at 7+ MNCs.',
      'Ran diagnostics and ethnographic research to find learning gaps.',
    ],
  },
  {
    when: "Jul '24 – Feb '25",
    title: 'L&D Associate',
    org: 'Unbox Experience',
    points: [
      'Researched and built learning journeys, coaching formats and OD tools.',
      'Led R&D on client-specific modules; built decks and collaterals.',
      'Used ethnographic research to shape design decisions.',
    ],
  },
  {
    when: "Jan '24 – Jul '24",
    title: 'Assistant Trainer & Facilitator',
    org: 'Buoyancee',
    note: 'Pro bono',
    points: [
      'Facilitated for 1500+ freshers and 1000+ professionals across 50+ corporates.',
      'Designed workshops on communication, emotional intelligence and personality development.',
      'Project Director for Resurge India, a life-skills programme for youth aged 10–21.',
    ],
  },
  {
    when: "Oct '23 – Jan '24",
    title: 'Intern, Child Life Services',
    org: 'Aster CMI',
    points: [
      'Play, art and talk therapy with paediatric patients; parental counselling.',
      'Led a team of four; ran psychological assessments with adolescents.',
    ],
  },
  {
    when: "Apr '22 – Apr '25",
    title: 'Founder, solo practice',
    org: 'Acharya Consultancy',
    points: [
      'Counselling with CBT, narrative and expressive techniques.',
      'Custom learning content for students, institutions and organisations.',
    ],
  },
  {
    when: '2022 – 2024',
    title: 'MSc Psychology',
    org: 'Surana College (Autonomous)',
    points: [
      'Research on coping, mobile-phone addiction, social loafing and workplace aesthetics.',
      "Lead organiser of 'Synod of Psychologists 2.0': 9 core members, 20 volunteers, 5 teams.",
    ],
  },
];

export const skills = [
  {
    group: 'Design',
    items: ['Instructional design', 'Learning experience design', 'ADDIE', "Bloom's Taxonomy", "Kirkpatrick's model", 'ICAD', 'Storyboarding & scripting', 'Gamification', 'Scenario-based learning', 'Microlearning', 'Systems & design thinking'],
  },
  {
    group: 'Mind',
    items: ['Psychological research', 'Psychometric tools', 'SPSS', 'Ethnographic research', 'Training needs analysis', 'Counselling (CBT, narrative, expressive)'],
  },
  {
    group: 'Room',
    items: ['Facilitation', "ILTs & VILTs", 'Experiential activities', 'Programme & project management', 'Stakeholder & client management', 'LMS & CMS'],
  },
  {
    group: 'Tools',
    items: ['Articulate 360 & Storyline', 'After Effects', 'EffectCraft', 'Claude Code', 'Canva', 'MS Office 365'],
  },
];

export const research = [
  { title: 'Cope and Resilience', text: 'Mapping the actions people take under stress, not how well they work.' },
  { title: 'Mobile Phone Addiction Scale', text: 'Measuring prevalence across teen and adult groups.' },
  { title: 'Social Loafing Psychometric Tool', text: 'Measuring individual effort inside a team.' },
  { title: 'Aesthetics and Work Motivation', text: 'How the look of a workplace moves the people in it.' },
];

// Card backs for the research deck (what each paper set out to do).
export const researchBacks = [
  'Explores individual stress-coping mechanisms through specific statements. It focuses on what people actually do under stress, not on how effective it is, to get insight into coping behaviour.',
  'A scale to understand how common mobile-phone addiction is among teenagers and adults.',
  'A psychometric tool for understanding individual contribution and effort in team settings, where some people quietly do less.',
  'Research into how organisational aesthetics, the look and feel of a workplace, affects employees\' motivation to work.',
];

// Your own writing. Edit freely.
export const writing = {
  poems: [
    {
      title: 'Paradox',
      lines: ['To understand is to know,', 'And to know is to know not.'],
    },
  ],
  oneLiner: {
    text: 'I finally understood the meaning of life. Unfortunately, life was unavailable for comment.',
    tag: 'Dark humour',
  },
  essays: [
    {
      title: 'Being present is a lie',
      blurb: 'An argument against the "be here now" industry: you cannot leave the present, so you cannot be sent back to it.',
      status: 'Draft essay',
    },
    {
      title: 'From thought to words',
      blurb: 'How raw fragments become poems through human–AI iteration, while the voice stays mine.',
      status: 'Process note',
    },
  ],
  quote: { text: 'The only difference between a mob and a trained army is organization.', by: 'Calvin Coolidge' },
};

// Lines the little "me" sticker says as you scroll into each section.
export const companionLines: Record<string, string> = {
  interest: 'Psst. Pull the red thread. And hover the old-English headings: 7 easter eggs hide in them.',
  concept: 'Psychology first, design second.',
  method: 'This is how I build every session. Then try it below.',
  person: 'The human behind the slides. Spot the chess challenge.',
  lab: 'Go on, try the experiment. I won\'t tell anyone what you missed.',
  journey: 'Every role taught me a different room.',
  application: 'Different fields, same brain. Watch one!',
  skills: 'Head, heart, room, tools.',
  research: 'Tap a card to read the summary.',
  debrief: 'Now the reflective part. My favourite.',
  game: 'Fair warning: I play chess. My memory is annoying.',
  contact: 'Coffee is on whoever lost.',
};

// Rotating sign-offs in the footer.
export const signOffs = [
  'I design with psychology, philosophy, and a questionable faith in humanity.',
  'I design with cognitive biases and an existential crisis.',
  'I design with Nietzsche in mind and Freud under suspicion.',
  'I design with an understanding of human behaviour. The behaviour itself remains debatable.',
];

// The memory game. Beat my level and I buy the coffee.
export const memoryGame = { myLevel: 13 };

// Section headings in old English. Hover one to translate it, and you find an easter egg:
// each carries an icon for one of my interests. 7 in total.
export const headings: Record<string, { line: string; source: string; meaning: string; plain: string; icon: string; egg: string }> = {
  concept: {
    line: 'And gladly wolde he lerne and gladly teche',
    source: 'Chaucer, The Canterbury Tales (c. 1400)',
    meaning: 'He would gladly learn, and gladly teach.',
    plain: 'How I think', icon: 'book',
    egg: 'Egg: literature. Old English, because modern English felt too easy.',
  },
  journey: {
    line: "All the world's a stage, and all the men and women merely players",
    source: 'Shakespeare, As You Like It (1599)',
    meaning: 'We each play many roles over one life.',
    plain: 'Experience', icon: 'mountain',
    egg: 'Egg: trekking. I am a Trek Lead with Bengaluru Trekkers.',
  },
  work: {
    line: 'The lyf so short, the craft so long to lerne',
    source: 'Chaucer, The Parliament of Fowls (c. 1380)',
    meaning: 'Life is short; mastering a craft takes long.',
    plain: 'Sample work across fields', icon: 'ball',
    egg: 'Egg: cricket. 8 years, captain in PU and UG.',
  },
  toolkit: {
    line: 'Our remedies oft in ourselves do lie',
    source: "Shakespeare, All's Well That Ends Well (c. 1605)",
    meaning: 'The fix we need is often already within us.',
    plain: 'The toolkit', icon: 'knight',
    egg: 'Egg: chess. First place at school, PU, UG and PG. Challenge AXMA1.',
  },
  research: {
    line: 'Wyrd bið ful āræd',
    source: 'The Wanderer, Old English (10th century)',
    meaning: 'Fate goes ever as it must.',
    plain: 'Research', icon: 'brain',
    egg: 'Egg: psychology. MSc, four studies, endless curiosity.',
  },
  debrief: {
    line: 'Þæs ofereode, þisses swa mæg',
    source: 'Deor, Old English (10th century)',
    meaning: 'That passed away; so may this.',
    plain: 'Ideas & writing', icon: 'quill',
    egg: 'Egg: philosophy. My paradox poem is right below.',
  },
  wager: {
    line: "The game's afoot",
    source: 'Shakespeare, Henry V (1599)',
    meaning: 'The challenge has begun.',
    plain: 'A small wager', icon: 'coffee',
    egg: 'Egg: coffee. The stakes of my memory game. Black, no sugar.',
  },
};
