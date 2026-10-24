/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Interactive "MoonStorm Time Capsule (2010 - 2026)" Museum, Original Source Gallery,
 * Dynamic Production/Lore Timeline, Team Showcase & Easter Egg Hunter (src/ui/TimeCapsuleMuseum.ts)
 */

import { RoomId } from '../scenarios/WorldData';

export interface ArchiveArtifactItem {
  id: string;
  title: string;
  date: string;
  author: string;
  category: 'characters' | 'scenes' | 'ui_oop' | 'demos';
  src: string;
  badge: string;
  description: string;
  quote?: string;
}

export interface FounderProfile {
  id: string;
  name: string;
  handle: string;
  role2010: string;
  subteam: 'Black Hole Sun (Design & Art)' | 'Ecstasy of Gold (Engine & Tech)';
  avatarSrc: string;
  bio: string;
  quotes: string[];
  contributions: string[];
  featuredArtifactIds: string[];
  jumpRoom?: RoomId;
}

export interface TimelineNode {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  teamTag: string;
  imgSrc: string;
  summary: string;
  quotes: string[];
  artifacts: string[];
}

export interface LoreTimelineNode {
  year: string;
  title: string;
  summary: string;
  highlight: string;
  imgSrc: string;
}

export interface BeforeAfterComparison {
  id: string;
  title: string;
  subtitle: string;
  beforeLabel: string;
  beforeSrc: string;
  afterLabel: string;
  afterSrc: string;
  notes: string;
  roomJump?: RoomId;
}

export interface EasterEggEntry {
  id: string;
  title: string;
  origin2010: string;
  whereToFind: string;
  room: RoomId;
  iconSrc: string;
}

export const ARCHIVE_ARTIFACTS_2010: ArchiveArtifactItem[] = [
  // CHARACTERS (14)
  {
    id: 'stache004',
    title: 'Dr. Morgan Stache (Concepto Original #1)',
    date: '24 Mayo 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/stache004.png',
    badge: 'MAYO 2010 - DR. STACHE',
    description:
      'El primer boceto enviado por correo de Dr. Morgan Stache con sombrero de copa, monocolo y su legendario bigote dorado para el plataformero original "The Odd-yssey of Dr. Stache".',
    quote: '"Un juego 2D parecido a Megaman donde cada bigote historico le da un poder distinto."',
  },
  {
    id: 'stache004d',
    title: 'Dr. Stache vs Variantes Temporales',
    date: '25 Mayo 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/stache004d.PNG',
    badge: 'MAYO 2010 - VARIANTES',
    description:
      'Variaciones de color y expresion de Dr. Stache exploradas al dia siguiente mientras el equipo discutia poderes como la barba vikinga y el bigote Pai Mei.',
  },
  {
    id: 'smoothface003',
    title: 'Rupert "Mr. Smoothface" Stache (Cut-Out #003)',
    date: '22 Junio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/smoothface003.png',
    badge: 'JUNIO 2010 - PROTAGONISTA',
    description:
      'El diseño definitivo de Rupert Stache envuelto en su abrigo oscuro de cuello alto para ocultar su barbilla lampiña. Nace el protagonista de Smoothface\'s Epic.',
    quote: '"Lampiño y Bigotes son nombres clave / la internet no es un lugar seguro." - Alex',
  },
  {
    id: 'capdread001',
    title: 'Captain Dread (Lord de Sardonia)',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/capdread001.png',
    badge: 'JULIO 2010 - CAPTAIN DREAD',
    description:
      'Hijo de la realeza de Sardonia en el Mediterraneo cuya coronacion fue interrumpida por las tropas de Il Douche. Cristian Morales lo bautizo al instante como "Napoleon + Mr. T + Egon".',
    quote: '"Quest secundario: encontrar un item misterioso adentro del dread." - Cristian Morales',
  },
  {
    id: 'ababy001',
    title: 'A Baby (Ex-Facepuncher, 2.5m / 300 lbs)',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/ababy001.png',
    badge: 'JULIO 2010 - A BABY',
    description:
      'Antiguo maton de la Liga del Terror conocido como Facepuncher hasta que cayo de cabeza peleando contra su archienemigo El Chulethal. Ama sus dulces y le tiene terror a los enanos.',
  },
  {
    id: 'ventrilo',
    title: 'Janus Vertrolikwoski (The Ventriloquist & Rapoleon)',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/ventrilo.png',
    badge: 'JULIO 2010 - VENTRILOQUIST',
    description:
      'Paciente mental escapado con personalidades multiples: Clash McTrevor (leñador irlandes), Rapoleon (rapero en prosa francesa medieval) y una sirena de ambulancia que no se calla. El unico capaz de pronunciar MGWDBTTGPnP.',
  },
  {
    id: 'lord_goat',
    title: 'Lord Goat & Mocus en el Throne of Horrors',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/lord_goat.png',
    badge: 'JULIO 2010 - LORD GOAT',
    description:
      'El misterioso bovino que ya estaba sentado en el Trono de los Horrores cuando Rominic DuVile fundo la base en Blackspit Island. Habla a traves de su fiel interprete jorobado Mocus.',
  },
  {
    id: 'hightower001',
    title: 'Hightower (Jefe de la Midget Security Agency)',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/hightower001.png',
    badge: 'JULIO 2010 - HIGHTOWER',
    description:
      'Jefe de seguridad del Artificial Thundercano Hideout. Extremadamente violento cuando las cosas no salen como quiere; lidera la huelga tras el memo falsificado de estatura minima.',
  },
  {
    id: 'spooch001',
    title: 'Spooch (Guardia del Artificial Thundercano)',
    date: '15 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/spooch001.png',
    badge: 'JULIO 2010 - SPOOCH',
    description:
      'Guardia principal de la entrada del volcan artificial Thundercano que solo obedece anuncios enviados por los tubos neumaticos oficiales.',
  },
  {
    id: 'bruiseli001',
    title: 'Bruise Li (Profesor de Kung FOOM! - GIF Animado)',
    date: '5 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/BruiseLi001.gif',
    badge: 'AGOSTO 2010 - GIF ANIMADO',
    description:
      'Ex-luchador contra el crimen junto a Jude O\'Chop, incriminado por el capo Dragonballs. Colgo su cinturon vacio (void-belt) y da clases de Kung FOOM! en Evil Deeds College.',
    quote: '"Excuse me sir please bacFOOM FOOM FOOM FOOM FOOM!" (Spin-off material right here dudes!)',
  },
  {
    id: 'mcgreen001',
    title: 'Cutter McGreen (Profesor de Maniacal Laughter 101)',
    date: '5 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/mcgreen001.gif',
    badge: 'AGOSTO 2010 - GIF ANIMADO',
    description:
      'Profesor de "Maniacal Laughter and Advanced Villainous Speech Basics 101" en Evil Deeds College, con garfio y tentaculos.',
  },
  {
    id: 'mechalomaniac002',
    title: 'The Mech-alomaniac (Diabolic Machines 101)',
    date: '5 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/mech-alomaniac002.gif',
    badge: 'AGOSTO 2010 - GIF ANIMADO',
    description:
      'Herrero expulsado de la World Blacksmith School por saquear ciudades con sus inventos mecanicos. Hace reparaciones a medias en el Thundercano para cobrar extra.',
  },
  {
    id: 'rector001',
    title: 'The Rector (Rector de Evil Deeds College)',
    date: '5 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/rector001.gif',
    badge: 'AGOSTO 2010 - GIF ANIMADO',
    description:
      'Rector de Evil Deeds College que despotrica sobre su matrimonio cuando Rupert se disfraza del abogado de divorcios de su esposa para conseguir su firma en el diploma.',
  },
  {
    id: 'mariachi002',
    title: 'The Mariachi Commando (Placeholder Town)',
    date: '5 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'characters',
    src: 'art/archive_2010/mariachi_commando002.gif',
    badge: 'AGOSTO 2010 - GIF ANIMADO',
    description:
      'Comando armado con sombrero de mariachi y sarape tactico que patrulla Placeholder Town / Cirque du SoLame en el Level-Macro.',
  },

  // SCENES & PSDS (9)
  {
    id: 'psd_test_cutout',
    title: 'test-cutout.psd (La Primera Prueba del Estilo Cut-Out)',
    date: '22 Junio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/psd_test_cutout.jpg',
    badge: '22 JUNIO 2010 - ORIGEN CUT-OUT',
    description:
      'El archivo Photoshop historico donde Jose David Aguilar probo por primera vez el estilo de recortes de papel con bordes blancos y sombras proyectadas.',
    quote: '"WE GOT ART STYLE imo" - Jose David Aguilar, Junio 2010',
  },
  {
    id: 'psd_smoothface_cutout',
    title: 'smoothface-cutout003.psd (Despiece en Capas de Smoothface)',
    date: '22 Junio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/psd_smoothface_cutout003.jpg',
    badge: '22 JUNIO 2010 - PSD CAPAS',
    description:
      'El PSD original de Smoothface separado en capas (cabeza, torso, piernas, ojos) que inspiro todo el sistema de marionetas articuladas de 2026.',
  },
  {
    id: 'psd_spook_castle',
    title: 'test-spook_castle.psd ("Spooky Shit Haunted Castle")',
    date: '23 Junio 2010',
    author: 'Cristian Morales & Jose David Aguilar',
    category: 'scenes',
    src: 'art/archive_2010/psd_spook_castle.jpg',
    badge: '23 JUNIO 2010 - PALETA MORALES',
    description:
      'Cristian Morales tomo la prueba cut-out de Aguilar y definio las paletas tematicas por escenario. Fue enviado en 5 correos ("1/5 ... 2/4 ... 3/b ... Ω/太") y se convirtio en el escenario de LolDemo1.',
    quote: '"Lo que transmite Kirby Yarn de cute, podria transmitirlo Dr. Stache de ras-pichudo."',
  },
  {
    id: 'psd_desert',
    title: 'test-desert_foreign_legion.psd ("Hot Shit Foreign Legion Desert")',
    date: '23 Junio 2010',
    author: 'Cristian Morales & Jose David Aguilar',
    category: 'scenes',
    src: 'art/archive_2010/psd_desert_foreign_legion.jpg',
    badge: '23 JUNIO 2010 - PALETA DESIERTO',
    description:
      'Segunda prueba de paleta tematica de Cristian Morales y Aguilar con fuerte de la Legion Extranjera, palmeras recortadas y sol abrasador.',
  },
  {
    id: 'psd_scenery_template',
    title: 'scenery_template.psd (Plantilla de Escenarios con Smoothface a Escala)',
    date: '18 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/psd_scenery_template.jpg',
    badge: '18 AGOSTO 2010 - TEMPLATE',
    description:
      'Plantilla base de Photoshop creada por Aguilar con guias de perspectiva y a Mr. Smoothface como referencia de altura humana para todos los cuartos del Substampede.',
  },
  {
    id: 'z1s1_2010',
    title: 'Z1S1-substampede_machineroom.psd (Sala de Maquinas del Submarino)',
    date: '19-20 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/Z1S1_machineroom_2010.png',
    badge: 'AGOSTO 2010 - Z1S1 PSD',
    description:
      'Escenario original en capas de la Sala de Maquinas del Substampede: 4 estaciones de pedales de bicicleta, escalera de hierro y trinchera frontal llena de barriles, tostadora rota, sacos de papas y rata.',
  },
  {
    id: 'z1s2_2010',
    title: 'Z1S2-substampede_lobby.png (Lobby / VIP Lounge del Submarino)',
    date: '20 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/Z1S2_lobby_2010.png',
    badge: 'AGOSTO 2010 - Z1S2 SKETCH',
    description:
      'Boceto conceptual del Lobby intermedio del Substampede con el sofa capitoneado, poster samurai, katanas, jarrones con juncos, telefono rotatorio y caja misteriosa con ojos.',
  },
  {
    id: 'z1s3_2010',
    title: 'Z1S3-substampede_captainroom.psd (Camarote del Capitan Dread)',
    date: '18-20 Agosto 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/Z1S3_captainroom_2010.png',
    badge: 'AGOSTO 2010 - Z1S3 SKETCH',
    description:
      'El camarote del Capitan Dread con el sarcofago egipcio, escritorio con goma, caballete del retrato, bolsa de martillos, ropa sucia, busto de payaso, muñeco vudu y barco en botella.',
  },
  {
    id: 'z1s3_wip_2010',
    title: 'Z1S3-substampede_captainroom-WIP.psd (Cut-Out a Color en Progreso)',
    date: '26 Octubre 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'scenes',
    src: 'art/archive_2010/Z1S3_captainroom_WIP.jpg',
    badge: '26 OCT 2010 - Z1S3 WIP PSD',
    description:
      'El ultimo PSD de escenario enviado en octubre de 2010 (35 capas), donde Aguilar ya habia coloreado en estilo cut-out el piso de madera, las paredes remachadas, el sarcofago, la cama y la mesa.',
  },

  // UI, MAPS & OOP ARCHITECTURE (5)
  {
    id: 'guimu003',
    title: 'GUImu003.jpg (Mockup de Interfaz Fallout-1 RMB + Inventario Superior)',
    date: '15 Octubre 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'ui_oop',
    src: 'art/archive_2010/GUImu003.jpg',
    badge: '15 OCT 2010 - GUI MOCKUP',
    description:
      'Dibujo en cuaderno cuadriculado que definio toda la interfaz del juego: barra superior de inventario con el Timon, Soporte de Retrato y Bolsa de Martillos, menu vertical con click derecho (Grab, Inspect, Talk) al estilo Fallout 1, y caja de dialogo inferior.',
  },
  {
    id: 'island_map_2010',
    title: 'Sparkle - Main Island Map (Mapa Oficial de Blackspit Island)',
    date: '7 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'ui_oop',
    src: 'art/archive_2010/Sparkle_Main_Island_map.png',
    badge: '7 JULIO 2010 - MAPA ISLA',
    description:
      'El mapa original de Blackspit Island mostrando Port Machete, Ice Cream Peaks, Lake of Water (Previously of Fire), Main City Hub, Evil Deeds College, el Artificial Thundercano Hideout y el submarino acercandose.',
  },
  {
    id: 'oop_diagram_juancho',
    title: 'Diseño de Clases OOP (Diagrama de Arquitectura de Juancho)',
    date: '25 Agosto 2010',
    author: 'Juan Vicente Garcia (Juancho)',
    category: 'ui_oop',
    src: 'art/archive_2010/Diseno_de_clases_jvgarcia.png',
    badge: '25 AGOSTO 2010 - ARQUITECTURA OOP',
    description:
      'El diagrama de clases diseñado por Juan Vicente Garcia para el motor de aventura: Object -> Character -> MovableCharacter (-moveTo(point)) -> PlayerCharacter (has a Inventory, Dialog System, Interaction System).',
  },
  {
    id: 'demo_test_ss',
    title: 'Prototipo 3D Gamestudio / Lite-C ("Magic Beards")',
    date: '12 Julio 2010',
    author: 'Juan Vicente Garcia (Juancho)',
    category: 'ui_oop',
    src: 'art/archive_2010/demo_test_ss.jpg',
    badge: '12 JULIO 2010 - ENGINE TEST',
    description:
      'Captura de pantalla enviada por Juancho probando dialogos y puntero en Gamestudio Lite-C con la linea inmortal: "Me? I don\'t know anything about magic beards."',
  },
  {
    id: 'torque2d_dep',
    title: 'Fix de Crash-to-Desktop (DEP) para Torque Game Builder en Windows 7',
    date: 'Julio 2010',
    author: 'Equipo Ecstasy of Gold',
    category: 'ui_oop',
    src: 'art/archive_2010/torque2d_CTD_DEP.png',
    badge: 'JULIO 2010 - TORQUE 2D DEP',
    description:
      'Instruccion compartida entre los programadores para evitar que Windows Data Execution Prevention cerrara TorqueGameBuilder (junto al Fallout Script Extender y Steam).',
  },

  // DEMOS, SPLASH SCREENS & TEAM LOGOS (7)
  {
    id: 'moon_splash',
    title: 'moonSplash.png (Logo Oficial de MoonStorm Studios en LolDemo1)',
    date: '29 Junio 2010',
    author: 'Luis F. Ledezma (Ledezman)',
    category: 'demos',
    src: 'art/archive_2010/moonSplash.png',
    badge: '29 JUNIO 2010 - LOLDEMO1',
    description:
      'Pantalla de arranque de MoonStorm Studios incluida en LolDemo1 ("Splash screens for the lulz").',
  },
  {
    id: 'nvidia_lol_splash',
    title: 'nvidiaLolSplash.png ("NVIDIA: The Way It\'s Meant To Be Lulzed")',
    date: '29 Junio 2010',
    author: 'Luis F. Ledezma (Ledezman)',
    category: 'demos',
    src: 'art/archive_2010/nvidiaLolSplash.png',
    badge: '29 JUNIO 2010 - SPLASH PARODY',
    description:
      'Segunda pantalla splash parodia creada por Ledezman para LolDemo1 en Torque 2D.',
  },
  {
    id: 'alex_spam_troll',
    title: 'alexSpam.png (El Troll de la Puerta del Castillo en LolDemo1)',
    date: '29 Junio 2010',
    author: 'Luis F. Ledezma (Ledezman)',
    category: 'demos',
    src: 'art/archive_2010/alexSpam.png',
    badge: '29 JUNIO 2010 - TROLL OWNEADOR',
    description:
      'En LolDemo1 final (Point-and-Click), hacer click en la puerta del castillo encantado hacia aparecer este troll ("un troll que los owneara") con el logro GOSU!',
  },
  {
    id: 'smooth_splash_visionaire',
    title: 'smoothSplash.png (Pantalla Titulo de LolGame1 en Visionaire)',
    date: 'Julio 2010',
    author: 'Equipo Ecstasy of Gold',
    category: 'demos',
    src: 'art/archive_2010/smoothSplash.png',
    badge: 'JULIO 2010 - VISIONAIRE DEMO',
    description:
      'Pantalla de menu creada para LolGame1 durante la evaluacion del motor Visionaire Studio con musica "14 Start the game.mp3".',
  },
  {
    id: 'substampede_test1_bg',
    title: 'SubstampedeTest1 (Prototipo de Colision de Pies en Torque 2D)',
    date: '29 Octubre 2010',
    author: 'Luis F. Ledezma (Ledezman)',
    category: 'demos',
    src: 'art/archive_2010/substampede_test1_bg.png',
    badge: '29 OCT 2010 - SUBSTAMPEDETEST1',
    description:
      'Fondo exportado del proyecto Torque 2D de Ledezman donde Smoothface caminaba por el camarote Z1S3 usando colision unicamente en los pies para no chocar con la cabeza.',
  },
  {
    id: 'ecstasy_of_gold_logo',
    title: 'Logo del Sub-Equipo "Ecstasy of Gold" (Tech & Engine Team)',
    date: '1 Julio 2010',
    author: 'Jose David Aguilar (Xygvot)',
    category: 'demos',
    src: 'art/archive_2010/Ecstasy_of_Gold.png',
    badge: '1 JULIO 2010 - SUB-EQUIPO TECH',
    description:
      'Emblema oficial del equipo de tecnologia e ingenieria (Juancho, Ledezman y BooT): el Spy de Team Fortress 2 comiendo una pepita de oro gigante.',
  },
  {
    id: 'seal_of_approval',
    title: 'MoonStorm Seal of Approval',
    date: 'Julio 2010',
    author: 'MoonStorm Studios',
    category: 'demos',
    src: 'art/archive_2010/seal_of_approval.jpg',
    badge: '2010 - SEAL OF APPROVAL',
    description:
      'El sello oficial de aprobacion enviado en los hilos de correo de MoonStorm cuando un diseño de personaje o documento quedaba listo.',
  },
];

export const FOUNDERS_2010: FounderProfile[] = [
  {
    id: 'alex',
    name: 'Alexander Barquero',
    handle: 'Psytech',
    role2010: 'Project Lead, Productor, Co-Escritor de Lore & Metodologia PFG',
    subteam: 'Black Hole Sun (Design & Art)',
    avatarSrc: 'characters/smoothface/portrait.png',
    bio: 'Fundador e impulsor de MoonStorm Studios ("Trabajo = Diversion"). Escribio la cronologia oficial de 26 años de Rupert y Morgan Stache, lidero The Initiative y el Executive Summary, propuso que Smoothface fuera "gosu" en habilidades callejeras, y desarrollo su Proyecto Final de Graduacion (PFG Beta 1.0, 2011) creando una metodologia agil de gestion de videojuegos especificamente para MoonStorm.',
    quotes: [
      '"Lampiño y Bigotes son nombres clave / la internet no es un lugar seguro."',
      '"Todo everywhere" (Decision de escribir todo el juego en ingles)',
      '"Me dio risa la idea de que Smoothface fuera gosu en hacer mierdas que hacen en la calle, como vender varas o anunciar el fin del mundo."',
      '"1. Vamos los 5... 5. Mostramos el prototipo, y ganamos el evento. 6. Profit."',
    ],
    contributions: [
      'Autor de "Smoothface\'s Epic aka Sparkle - Timeline" (Year 0 a Year 26)',
      'Autor de "The Initiative", "MSS Executive Summary" y "PFG Beta 1.0 (2011)"',
      'Co-creador del chiste del hermano gemelo ("PERO YO SOY TU HERMANO! - si guevon, obviamente") y del jefe bebe vikingo en Dr. Stache',
      'Arquitecto de la resurreccion completa del proyecto en 2026',
    ],
    featuredArtifactIds: ['smoothface003', 'island_map_2010', 'alex_spam_troll'],
    jumpRoom: 'LOLDEMO',
  },
  {
    id: 'aguilar',
    name: 'Jose David Aguilar',
    handle: 'Knife_Fighting_Monkey / Xygvot',
    role2010: 'Director de Arte, Creador del Universo Dr. Stache / Sparkle & Estilo Cut-Out',
    subteam: 'Black Hole Sun (Design & Art)',
    avatarSrc: 'art/archive_2010/stache004.png',
    bio: 'Team Leader de Black Hole Sun y mente creativa detras de "The Odd-yssey of Dr. Stache" y "Smoothface\'s Epic". Bautizo el proyecto con el codename "Sparkle" (descartando "Chicspa"), invento el estilo visual Cut-Out el 22 de junio de 2010, dibujo los 14 personajes originales, diseño las 6 zonas de Blackspit Island en el Level-Macro, armo los PSDs multicapa del Substampede y dibujo el mockup GUImu003.jpg.',
    quotes: [
      '"usemos Sparkle para saber que hablamos de lo mismo, kek... le iba a poner Chicspa pero no tiene tanto oomph"',
      '"WE GOT ART STYLE imo"',
      '"Lo que transmite Kirby Yarn de cute, podria transmitirlo Dr. Stache de ras-pichudo."',
      '"El nuestro, viniendo de unos noobs totales, me parece un mejor puzzle." (Tras jugar Ghost Pirates of Vooju Island)',
    ],
    contributions: [
      'Creador de "Sparkle - Story", "Sparkle - Characters" y "Sparkle - Level-Macro (6 Zonas)"',
      'Autor de los 14 bocetos y GIFs animados de personajes + el mapa de Blackspit Island',
      'Autor de los PSDs de Z1S1, Z1S2, Z1S3 y del diseño de interfaz GUImu003.jpg',
    ],
    featuredArtifactIds: ['psd_test_cutout', 'z1s3_wip_2010', 'guimu003', 'bruiseli001'],
    jumpRoom: 'Z1S3',
  },
  {
    id: 'juancho',
    name: 'Juan Vicente Garcia',
    handle: 'Juancho',
    role2010: 'Lead Engine Architect, Diseño de Clases OOP & Evaluacion Tecnica',
    subteam: 'Ecstasy of Gold (Engine & Tech)',
    avatarSrc: 'art/archive_2010/Diseno_de_clases_jvgarcia.png',
    bio: 'Team Leader del equipo tecnico Ecstasy of Gold. Lidero la matriz comparativa de motores (Torque 2D, Visionaire, Wintermute, AGS, UDK, Unity, descartando Flash), construyo el primer prototipo de dialogos sobre "magic beards" en julio de 2010, definio los requerimientos de ingenieria del demo y diseño la jerarquia orientada a objetos del motor (Object -> Character -> MovableCharacter -> PlayerCharacter).',
    quotes: [
      '"Flash yo diria mejor no."',
      '"No se puede click secundario, FAIL" (Probando el primer build WASD de LolDemo1)',
      '"The really hairy father didn\'t have that much of a problem with him... he remarries this lady with a beard, and then he fathers Stache."',
      '"Me? I don\'t know anything about magic beards." (Prototipo Gamestudio, 12 Julio 2010)',
    ],
    contributions: [
      'Autor del Diagrama de Clases OOP (25 Agosto 2010) y requerimientos del Demo',
      'Lider de "Engine Review.xlsx" y pruebas de arquitectura en Torque 2D / Lite-C',
      'Co-autor del giro de origen del padre de Rupert y la dama barbuda',
    ],
    featuredArtifactIds: ['oop_diagram_juancho', 'demo_test_ss', 'ecstasy_of_gold_logo'],
    jumpRoom: 'Z1S2',
  },
  {
    id: 'ledezma',
    name: 'Luis F. Ledezma',
    handle: 'Ledezman',
    role2010: 'Lead Torque 2D Programmer, LolDemo1, SubstampedeTest1 & Foot-Collision',
    subteam: 'Ecstasy of Gold (Engine & Tech)',
    avatarSrc: 'art/archive_2010/moonSplash.png',
    bio: 'El mago que convirtio los PSDs del equipo en demos ejecutables reales en 2010. Programo LolDemo1 v1 (WASD, 28 junio 2010) y en menos de 24 horas lo transformo en LolDemo1 Final Point-and-Click (29 junio 2010) con cursores dinamicos, soundtrack minimalista (stuff2.ogg) y el troll de la puerta. En octubre de 2010 construyo SubstampedeTest1 con el cuarto Z1S3 en capas y colision exclusiva en los pies de Smoothface.',
    quotes: [
      '"Hacer click en la puerta del castillo saca un troll que los owneara."',
      '"Splash screens for the lulz + lol soundtrack minimalista."',
      '"Smoothface camina dentro de los limites de la escena usando colision solo en los pies."',
    ],
    contributions: [
      'Creador de LolDemo1 v1 (WASD) y LolDemo1 Final (Point-and-Click, Junio 2010)',
      'Creador de SubstampedeTest1 en Torque Game Builder (29 Octubre 2010)',
      'Autor de las pantallas splash moonSplash.png y nvidiaLolSplash.png',
    ],
    featuredArtifactIds: ['moon_splash', 'nvidia_lol_splash', 'substampede_test1_bg', 'alex_spam_troll'],
    jumpRoom: 'Z1S1',
  },
  {
    id: 'morales',
    name: 'Cristian Morales',
    handle: 'c0pp3r',
    role2010: 'Cut-Out Art Refinement, Paletas de Color, Marketing Dept. & Twistoria',
    subteam: 'Black Hole Sun (Design & Art)',
    avatarSrc: 'art/archive_2010/psd_spook_castle.jpg',
    bio: 'Refino el estilo Cut-Out el 23 de junio de 2010 creando las paletas tematicas por escena ("Spooky shit haunted castle" y "Hot shit foreign legion desert") y enviando el PSD partido en 5 correos epicos ("1/5 ... Ω/太"). Luego fundo el Departamento de Marketing de MoonStorm Studios para su tesis de licenciatura y en 2011 propuso el libro interactivo "Twistoria".',
    quotes: [
      '"/unsign Art Dept. /sign Marketing Dept. [Achievement Unlocked!] Congratulations! Created a New Moonstorm Department!"',
      '"test-spook castle 1/5 ... 2/4 ... 3/b ... Ω/太"',
      '"Captain Dread = Napoleon + Mr. T + Egon"',
      '"7. Burst into dance." (Plan para ganar Startup Weekend Costa Rica 2011)',
    ],
    contributions: [
      'Co-autor de test-spook_castle.psd y test-desert_foreign_legion.psd (Junio 2010)',
      'Definicion de las paletas de color expresivas por zona y sombreado Cut-Out',
      'Estrategia de Marketing de MoonStorm Studios y pitch de "Twistoria" (2011)',
    ],
    featuredArtifactIds: ['psd_spook_castle', 'psd_desert', 'capdread001'],
    jumpRoom: 'LOLDEMO',
  },
  {
    id: 'boot',
    name: 'Brian',
    handle: 'BooT',
    role2010: 'Co-Fundador, Lore Original, Evaluacion UDK / Visionaire & Worldbuilding',
    subteam: 'Ecstasy of Gold (Engine & Tech)',
    avatarSrc: 'art/archive_2010/Ecstasy_of_Gold.png',
    bio: 'Co-fundador de MoonStorm Studios e integrante del equipo tecnico Ecstasy of Gold. Impulso la exploracion inicial de motores 3D como Unreal Development Kit (UDK) para Dr. Stache, participo en las sesiones de diseño donde se decidio hacer primero la precuela Point-and-Click de 4 a 6 meses, y colaboro en las pruebas de Visionaire Studio (LolGame1).',
    quotes: [
      '"UDK FTW!" (Durante los debates de motor en Ecstasy of Gold)',
      '"Hagamos primero una aventura grafica corta de la historia pre-Dr. Stache para aprender el oficio."',
    ],
    contributions: [
      'Co-fundador en las reuniones fundacionales de Abril-Junio 2010',
      'Evaluacion de UDK y Visionaire Studio (LolGame1) en el equipo Ecstasy of Gold',
      'Aportes al worldbuilding inicial de Dr. Stache y Blackspit Island',
    ],
    featuredArtifactIds: ['smooth_splash_visionaire', 'ecstasy_of_gold_logo', 'seal_of_approval'],
    jumpRoom: 'Z1S3',
  },
];

export const PRODUCTION_TIMELINE_NODES: TimelineNode[] = [
  {
    id: 'tl_may_2010',
    date: 'Abril - Mayo 2010',
    title: 'Fundacion de MoonStorm Studios y Nacimiento de "Dr. Stache"',
    subtitle: 'El plataformero 2D estilo Mega Man con bigotes magicos historicos',
    teamTag: 'MoonStorm Studios (Fundacion)',
    imgSrc: 'art/archive_2010/stache004.png',
    summary:
      'Se funda MoonStorm Studios en Costa Rica (moonstorm@googlegroups.com y mssmn@googlegroups.com "MSS Management Overlords"). Jose David Aguilar presenta "The Odd-yssey of Dr. Stache": un plataformero de 8 niveles donde el villano Dr. Smoothface viaja en el tiempo para reclutar a sus versiones pasadas y futuras (incluyendo a un bebe vikingo y a un abuelo en motocicleta) y robar la coleccion de bigotes magicos de Dr. Stache.',
    quotes: [
      '"Lo que transmite Kirby Yarn de cute, podria transmitirlo Dr. Stache de ras-pichudo." - Aguilar',
      '"El bigote de vikingo se lo roba el Smoothface bebe, entonces seria un vikingo bebe con todos los poderes, a lo Yoda." - Alex',
    ],
    artifacts: ['stache004', 'stache004d'],
  },
  {
    id: 'tl_jun_22_2010',
    date: '22 - 23 Junio 2010',
    title: 'El Giro a Point & Click y el Descubrimiento del Estilo "Cut-Out"',
    subtitle: 'Aguilar crea test-cutout.psd y Morales define las paletas tematicas',
    teamTag: 'Aguilar & Morales',
    imgSrc: 'art/archive_2010/psd_spook_castle.jpg',
    summary:
      'El equipo decide crear primero una aventura Point-and-Click de 4 a 6 meses contando la precuela de como Rupert Stache se convirtio en Mr. Smoothface. El 22 de junio Aguilar envia test-cutout.psd y smoothface-cutout003.psd ("WE GOT ART STYLE imo"). Al dia siguiente, Cristian Morales envia test-spook_castle.psd y test-desert_foreign_legion.psd con paletas de color tematicas.',
    quotes: [
      '"WE GOT ART STYLE imo" - Jose David Aguilar (22 Junio 2010)',
      '"test-spook castle 1/5 ... 2/4 ... 3/b ... Ω/太" - Cristian Morales enviando el PSD por partes',
    ],
    artifacts: ['psd_test_cutout', 'psd_smoothface_cutout', 'psd_spook_castle', 'psd_desert'],
  },
  {
    id: 'tl_jun_29_2010',
    date: '28 - 29 Junio 2010',
    title: 'LolDemo1: De WASD a Point-and-Click en 24 Horas',
    subtitle: 'Ledezman programa el primer demo jugable con el Troll de la Puerta',
    teamTag: 'Ledezman & Juancho',
    imgSrc: 'art/archive_2010/moonSplash.png',
    summary:
      'El 28 de junio Ledezman sube LolDemo1 v1 con movimiento WASD. Juancho responde "No se puede click secundario, FAIL". Al dia siguiente (29 de junio), Ledezman lanza LolDemo1 Final: un Point-and-Click completo en Torque 2D con cursores de mano, pantallas splash parodia (moonSplash y nvidiaLolSplash), musica stuff2.ogg y un troll que sale al tocar la puerta del castillo.',
    quotes: [
      '"No se puede click secundario, FAIL" - Juancho (28 Junio 2010)',
      '"Hacer click en la puerta saca un troll que los owneara + lol soundtrack minimalista" - Ledezman (29 Junio 2010)',
    ],
    artifacts: ['moon_splash', 'nvidia_lol_splash', 'alex_spam_troll'],
  },
  {
    id: 'tl_jul_07_2010',
    date: '1 - 7 Julio 2010',
    title: 'Nace el Codename "Sparkle", los 2 Sub-Equipos y Blackspit Island',
    subtitle: 'Black Hole Sun vs Ecstasy of Gold, "The Initiative" y "Todo Everywhere"',
    teamTag: 'Black Hole Sun & Ecstasy of Gold',
    imgSrc: 'art/archive_2010/Sparkle_Main_Island_map.png',
    summary:
      'El equipo se organiza en dos escuadrones: "Black Hole Sun" (Arte e Historia: Aguilar TL, Alex, Morales) y "Ecstasy of Gold" (Motor y Tecnologia: Juancho TL, Ledezman, BooT). En un chat con Alex, Aguilar propone el codename "Sparkle" ("le iba a poner Chicspa pero no tiene tanto oomph"). Se decide escribir todo el juego en ingles ("todo everywhere") y el 7 de julio se crean "Sparkle - Story" y el mapa de Blackspit Island.',
    quotes: [
      '"usemos Sparkle para saber que hablamos de lo mismo, kek" - Knife_Fighting_Monkey (Aguilar)',
      '"Ser la empresa mas relevante en creacion de videojuegos en Latinoamerica y el Caribe. Objetivo: Trabajo = Diversion." - The Initiative',
    ],
    artifacts: ['island_map_2010', 'ecstasy_of_gold_logo', 'seal_of_approval'],
  },
  {
    id: 'tl_jul_15_2010',
    date: '12 - 16 Julio 2010',
    title: 'Explosion de Personajes, Prototipo "Magic Beards" y Reporte del 95%',
    subtitle: 'Captain Dread, A Baby, Ventriloquist, Lord Goat, Hightower y Spooch',
    teamTag: 'Aguilar & Juancho',
    imgSrc: 'art/archive_2010/capdread001.png',
    summary:
      'El 12 de julio Juancho muestra su prueba de motor con "Me? I don\'t know anything about magic beards" y el equipo evalua Visionaire Studio (LolGame1). El 15 de julio Aguilar envia la primera tanda de personajes de Blackspit Island (Captain Dread, A Baby, The Ventriloquist, Lord Goat, Hightower y Spooch). El reporte de Black Hole Sun del 16 de julio anuncia: Backstory 100%, Plot 95%, Characters 85%.',
    quotes: [
      '"OPEN YOUR MIND! OPEN THAT BLACK HOLE SUN! GENTLEMEN... IT\'S ON!"',
      '"Napoleon + Mr. T + Egon" - Cristian Morales sobre Captain Dread',
    ],
    artifacts: ['capdread001', 'ababy001', 'ventrilo', 'lord_goat', 'demo_test_ss', 'smooth_splash_visionaire'],
  },
  {
    id: 'tl_aug_2010',
    date: '5 - 25 Agosto 2010',
    title: 'El Submarino Substampede (Z1S1-Z1S3), GIFs Animados y Diseño OOP',
    subtitle: 'Level-Macro de 6 Zonas, PSDs del Submarino y Diagrama de Clases de Juancho',
    teamTag: 'Aguilar & Juancho',
    imgSrc: 'art/archive_2010/Z1S1_machineroom_2010.png',
    summary:
      'El 5 de agosto Aguilar envia 5 GIFs animados (Bruise Li, Cutter McGreen, Mech-alomaniac, Rector y Mariachi Commando). Entre el 18 y 20 de agosto crea scenery_template.psd y los escenarios Z1S1 (Machine Room), Z1S2 (Lobby) y Z1S3 (Captain\'s Room), junto con las 6 diapositivas de "Sparkle - Level-Macro". El 25 de agosto Juancho publica el Diagrama de Clases OOP y la lista de requerimientos del demo.',
    quotes: [
      '"Excuse me sir please bacFOOM FOOM FOOM FOOM FOOM! (spin off material right here dudes!)" - Bruise Li bio',
      '"Object -> Character -> MovableCharacter (-moveTo) -> PlayerCharacter" - Diagrama de Juancho',
    ],
    artifacts: ['bruiseli001', 'z1s1_2010', 'z1s2_2010', 'z1s3_2010', 'oop_diagram_juancho'],
  },
  {
    id: 'tl_oct_2010',
    date: '15 - 29 Octubre 2010',
    title: 'GUImu003.jpg, Z1S3 Cut-Out WIP y SubstampedeTest1 en Torque 2D',
    subtitle: 'El menu RMB estilo Fallout 1 y la colision de pies en el camarote del capitan',
    teamTag: 'Aguilar & Ledezman',
    imgSrc: 'art/archive_2010/GUImu003.jpg',
    summary:
      'El 15 de octubre Aguilar sube GUImu003.jpg definiendo la barra de inventario superior y el menu vertical con click derecho (Grab, Inspect, Talk). El 26 de octubre sube Z1S3-substampede_captainroom-WIP.psd con 35 capas pintadas en estilo cut-out. Tres dias despues (29 de octubre), Ledezman entrega SubstampedeTest1 en Torque 2D donde Smoothface camina por el camarote Z1S3 sorteando muebles con colision en los pies.',
    quotes: [
      '"Holding RMB shows menu; move cursor over an icon, release RMB to select." - GUImu003.jpg',
      '"Smoothface camina dentro de los limites usando colision solo en los pies." - SubstampedeTest1',
    ],
    artifacts: ['guimu003', 'z1s3_wip_2010', 'substampede_test1_bg'],
  },
  {
    id: 'tl_2011',
    date: 'Enero - Mayo 2011',
    title: 'Startup Weekend, Desafio Intel, PFG Beta 1.0 de Alex y Nuevos Pitches',
    subtitle: 'Executive Summary ($180k / Steam), DDLM, Space Wolves y Twistoria',
    teamTag: 'Todo el Equipo MoonStorm',
    imgSrc: 'art/archive_2010/seal_of_approval.jpg',
    summary:
      'En 2011 el equipo prepara su participacion en Startup Weekend Costa Rica y Desafio Intel, redacta el Executive Summary proyectando 30,000 copias en Steam a $8, y explora ideas paralelas como "El Dia de los Muertos (DDLM)", "Space Wolves: Howlin\' Stars" y "Twistoria". Alexander completa su tesis de graduacion (ABarquero_PFG_Beta_1.0) documentando la metodologia de gestion de proyectos para MoonStorm Studios.',
    quotes: [
      '"5. Mostramos el prototipo, y ganamos el evento. 6. Profit." - Alex / "7. Burst into dance." - Cristian',
      '"/unsign Art Dept. /sign Marketing Dept. [Achievement Unlocked!]" - Cristian Morales',
    ],
    artifacts: ['seal_of_approval', 'mariachi002', 'rector001'],
  },
  {
    id: 'tl_2026',
    date: 'Octubre 2026',
    title: 'El Renacimiento de MoonStorm: Smoothface\'s Epic (Cut-Out Engine 2026)',
    subtitle: 'Recuperacion arqueologica de 79 hilos de correo, 9 PSDs, 3 builds y motor web 60 FPS',
    teamTag: 'MoonStorm 2010 -> 2026',
    imgSrc: 'art/approved/z1s3/z1s3.prop.easel_portrait.png',
    summary:
      'Dieciseis años despues, se recuperan intactos los documentos de Google Drive, 79 hilos de Gmail y Gtalk, los 9 archivos PSD con sus 107 capas y los 3 builds de 2010. Siguiendo al pie de la letra el diagrama OOP de Juancho, el mockup GUImu003.jpg de Aguilar, la colision de pies de Ledezman y las paletas Cut-Out de Morales, el Acto I completo a bordo del Substampede (Z1S3, Z1S2, Z1S1) y el castillo LolDemo1 (Z0) cobran vida a 60 FPS.',
    quotes: [
      '"GENTLEMEN... IT\'S ON! LET\'S MAKE SOME GAEMS, MM\'KAY?" - MoonStorm Studios (2010 - 2026)',
    ],
    artifacts: ['z1s3_wip_2010', 'guimu003', 'oop_diagram_juancho', 'moon_splash'],
  },
];

export const LORE_TIMELINE_NODES: LoreTimelineNode[] = [
  {
    year: 'YEAR 0',
    title: 'El Nacimiento de los Gemelos Stache',
    summary:
      'Nacen los gemelos Morgan y Rupert Stache. Morgan sale del vientre materno con una cantidad impresionante de vello facial; Rupert nace completamente lampiño, sin una sola ceja ni barba.',
    highlight: '"PERO YO SOY TU HERMANO!" - "Si guevon, obviamente."',
    imgSrc: 'art/archive_2010/stache004.png',
  },
  {
    year: 'YEAR 1 - 11',
    title: 'El Incidente de Mutton Chops y el Exilio Familiar',
    summary:
      'Al año de edad, Morgan afeita mientras duerme al mayordomo de la mansion, Mutton Chops. Mientras Morgan es el orgullo de la dinastia barbera, Rupert es marginado por su falta de vello facial y comienza a odiar a "the hairy kind".',
    highlight: 'Sin bigote propio, las leyes ancestrales le prohiben ejercer el arte de la barberia.',
    imgSrc: 'art/archive_2010/stache004d.PNG',
  },
  {
    year: 'YEAR 12 - 18',
    title: 'WoBAca y los Años "Gosu" en las Calles del Mundo',
    summary:
      'A los 12 años Morgan ingresa a la World Barber Academy (WoBAca) y Rupert huye del castillo familiar (su familia cree que es solo una etapa juvenil). Durante 6 años en las calles, Rupert se vuelve experto en magia callejera, malabares, regateo, cruzar calles, dar direcciones y anunciar el fin del mundo.',
    highlight: '"Jack-of-all-trades, master of none, proficient in street crossing and world dooming."',
    imgSrc: 'art/archive_2010/smoothface003.png',
  },
  {
    year: 'YEAR 19',
    title: 'Dr. Figaro Excelsior y el Nacimiento de Mr. Smoothface',
    summary:
      'Morgan alcanza el grado supremo de "Doctor Barber Grand Master Extraordinaire", ostentado antes solo por el fundador de WoBAca, Dr. Figaro Excelsior (quien ademas tenia una tienda de herraduras). Lleno de furia, Rupert rompe para siempre con su familia y adopta el alias criminal de Mr. Smoothface.',
    highlight: '"If I cannot grow a moustache, then NOBODY SHALL!"',
    imgSrc: 'characters/smoothface/portrait.png',
  },
  {
    year: 'YEAR 20',
    title: 'El Submarino Substampede Rumbo a Blackspit Island (Smoothface\'s Epic)',
    summary:
      'Para escalar posiciones en la organizacion Malefic Gentlemen Who Do Bad Things To Good People & Pigeons (MGWDBTTGPnP, subsidiaria de la League of Terror), Rupert paga 2 centavos para viajar en el submarino de pedales Substampede hacia Blackspit Island.',
    highlight: 'Aqui ocurre toda la aventura de Smoothface\'s Epic: el pedal roto, A Baby, Evil Deeds College y el Thundercano.',
    imgSrc: 'art/archive_2010/Sparkle_Main_Island_map.png',
  },
  {
    year: 'YEAR 21 - 26',
    title: 'Amo del Trono de los Horrores y La Venganza Temporal (Dr. Stache)',
    summary:
      'El plan de Captain Dread para derrocar a Lord Goat usando los dulces de A Baby sale al reves y Rupert es proclamado "Owner of the Evil Seat" en el tercer destello del verano. En el Año 26, Mr. Smoothface construye su maquina del tiempo para robar los bigotes magicos de su hermano Morgan.',
    highlight: 'Conecta directamente el final de Smoothface\'s Epic con el inicio de The Odd-yssey of Dr. Stache.',
    imgSrc: 'art/archive_2010/lord_goat.png',
  },
];

export const BEFORE_AFTER_COMPARISONS: BeforeAfterComparison[] = [
  {
    id: 'cmp_z1s3',
    title: 'Z1S3: Camarote del Capitan Dread',
    subtitle: 'PSD WIP de 35 capas (Octubre 2010) vs Escenario Modular de 37 Piezas Cut-Out (2026)',
    beforeLabel: '2010 Original (Z1S3-WIP.psd - Aguilar)',
    beforeSrc: 'art/archive_2010/Z1S3_captainroom_WIP.jpg',
    afterLabel: '2026 Cut-Out 37 Piezas (En Vivo)',
    afterSrc: 'art/approved/z1s3/z1s3.prop.desk.png',
    notes:
      'Cada objeto del boceto de 2010 (sarcofago, escritorio, TV, pecera, goma, caballete, ropa sucia, bolsa de martillos, cama, mesa de cartas con barco en botella y baul con payaso y muñeco vudu) existe ahora como un objeto RGBA independiente con parallax y ordenamiento Y.',
    roomJump: 'Z1S3',
  },
  {
    id: 'cmp_z1s2',
    title: 'Z1S2: Lobby / VIP Lounge del Submarino',
    subtitle: 'Boceto de Linea (20 Agosto 2010) vs Escenario Cut-Out con Boveda Musical "Funky Town"',
    beforeLabel: '2010 Original (Z1S2-substampede_lobby.png)',
    beforeSrc: 'art/archive_2010/Z1S2_lobby_2010.png',
    afterLabel: '2026 Cut-Out (Sofa, Boveda & Teclado)',
    afterSrc: 'art/approved/z1s2/z1s2.prop.candy_vault.png',
    notes:
      'Conserva el sofa capitoneado, el poster samurai, el estante de katanas, los jarrones con juncos, la caja misteriosa con ojos brillantes y el telefono en primer plano, integrando la boveda de dulces de A Baby.',
    roomJump: 'Z1S2',
  },
  {
    id: 'cmp_z1s1',
    title: 'Z1S1: Sala de Maquinas del Substampede',
    subtitle: 'PSD Multicapa (19 Agosto 2010) vs 4 Estaciones de Pedales y Maquina de Da Vinci',
    beforeLabel: '2010 Original (Z1S1-machineroom.psd)',
    beforeSrc: 'art/archive_2010/Z1S1_machineroom_2010.png',
    afterLabel: '2026 Maquina de Movimiento Perpetuo',
    afterSrc: 'art/approved/z1s1/z1s1.prop.perpetual_machine_installed.png',
    notes:
      'Reconstruye las 4 bicicletas estaticas conectadas al eje del submarino y toda la trinchera frontal de basura (barriles toxicos, tostadora rota, rata y sacos de papas) mas la Maquina de Movimiento Perpetuo de Leonardo da Vinci.',
    roomJump: 'Z1S1',
  },
  {
    id: 'cmp_z0',
    title: 'Z0: Spooky Paper Castle (Tributo a LolDemo1)',
    subtitle: 'test-spook_castle.psd (23 Junio 2010) vs Escenario Jugable con Troll Articulado',
    beforeLabel: '2010 Original (Morales & Aguilar PSD)',
    beforeSrc: 'art/archive_2010/psd_spook_castle.jpg',
    afterLabel: '2026 Castillo & Sol de Dos Caras',
    afterSrc: 'art/approved/z0/z0.prop.spooky_castle.png',
    notes:
      'Homenaje directo al primer demo Point-and-Click de MoonStorm (29 Junio 2010), con el sol de dos caras balanceandose, las colinas de papel y el Troll de la puerta reconstruido en 6 piezas.',
    roomJump: 'LOLDEMO',
  },
  {
    id: 'cmp_smoothface',
    title: 'Rupert "Mr. Smoothface" Stache',
    subtitle: 'smoothface-cutout003.psd (Junio 2010) vs Marioneta Articulada de 27 Piezas',
    beforeLabel: '2010 Original (smoothface-cutout003.psd)',
    beforeSrc: 'art/archive_2010/psd_smoothface_cutout003.jpg',
    afterLabel: '2026 Rig 27 Piezas + Expresiones',
    afterSrc: 'characters/smoothface/portrait.png',
    notes:
      'Mantiene la silueta triangular de cuello alto, ojos expresivos y manos enguantadas del PSD de junio de 2010, añadiendo 9 poses e iconos flotantes de emocion en carton.',
  },
  {
    id: 'cmp_capdread',
    title: 'Captain Dread (Comandante del Substampede)',
    subtitle: 'Boceto capdread001.png (15 Julio 2010) vs Marioneta Articulada de 22 Piezas',
    beforeLabel: '2010 Original (capdread001.png)',
    beforeSrc: 'art/archive_2010/capdread001.png',
    afterLabel: '2026 Rig 22 Piezas ("Napoleon + Mr. T + Egon")',
    afterSrc: 'characters/capdread/portrait.png',
    notes:
      'Fiel al diseño de Aguilar con su enorme cabellera rizada oscura, sombrero pirata con calavera, abrigo de capitan y pipa.',
  },
  {
    id: 'cmp_ababy',
    title: 'A Baby (Ex-Facepuncher)',
    subtitle: 'Boceto ababy001.png (15 Julio 2010) vs Rig Cut-Out Canonico de 8 Piezas',
    beforeLabel: '2010 Original (ababy001.png)',
    beforeSrc: 'art/archive_2010/ababy001.png',
    afterLabel: '2026 Rig Cut-Out Canonico',
    afterSrc: 'characters/ababy/portrait.png',
    notes:
      'Respeta las proporciones de gorila de 2.5 metros y 300 libras en pañal con imperdible gigante y paleta de caramelo como puro.',
  },
  {
    id: 'cmp_ventrilo',
    title: 'The Ventriloquist & Rapoleon (Clash McTrevor)',
    subtitle: 'Boceto ventrilo.png (15 Julio 2010) vs Rig Cut-Out Canonico de 8 Piezas',
    beforeLabel: '2010 Original (ventrilo.png)',
    beforeSrc: 'art/archive_2010/ventrilo.png',
    afterLabel: '2026 Rig Cut-Out Canonico',
    afterSrc: 'characters/ventriloquist/portrait.png',
    notes:
      'Janus Vertrolikwoski con su traje de rayas, ojos hipnoticos desiguales, el muñeco Rapoleon con bicornio napoleonico y la sirena de ambulancia.',
  },
  {
    id: 'cmp_gui',
    title: 'HUD & Menu Contextual RMB (Estilo Fallout 1)',
    subtitle: 'Mockup en Cuaderno GUImu003.jpg (15 Octubre 2010) vs HUD Superior + Menu RMB',
    beforeLabel: '2010 Original (GUImu003.jpg - Aguilar)',
    beforeSrc: 'art/archive_2010/GUImu003.jpg',
    afterLabel: '2026 Icono de Timon e Inventario',
    afterSrc: 'art/approved/z1s2/z1s2.item.wooden_helm.png',
    notes:
      'Implementa exactamente los 3 primeros items dibujados por Aguilar en la barra superior (Timon, Soporte de Retrato y Bolsa de Martillos), los botones Select/Inspect y el menu vertical de acciones.',
  },
];

export const EASTER_EGG_CHECKLIST: EasterEggEntry[] = [
  {
    id: 'ee_poster_mss',
    title: '1. Poster Oficial de MoonStorm Studios y "TODO EVERYWHERE"',
    origin2010: 'Decision del equipo en Julio 2010 de escribir todo en ingles + nombres clave "Lampiño y Bigotes".',
    whereToFind: 'Camarote del Capitan (Z1S3) -> Haz click en el Poster de MoonStorm Studios en la pared central.',
    room: 'Z1S3',
    iconSrc: 'art/approved/z1s3/z1s3.wall.poster.png',
  },
  {
    id: 'ee_voodoo_stache',
    title: '2. El Muñeco Vudu con Alfileres en el Bigote y "Serious Business"',
    origin2010: 'La pandilla de payasos "Serious Business" del Cirque du SoLame y el odio de Rupert hacia el bigote de su hermano Morgan.',
    whereToFind: 'Camarote del Capitan (Z1S3) -> Inspecciona el Busto de Payaso y Muñeco Vudu sobre el baul derecho.',
    room: 'Z1S3',
    iconSrc: 'art/approved/z1s3/z1s3.fg.voodoo_doll.png',
  },
  {
    id: 'ee_pigeons_1720',
    title: '3. La Guerra contra las Palomas de 1720 e "Il Douche"',
    origin2010: 'Sparkle - Story.md: "all pigeons in the island have gone missing since 1720 (when war was declared on the stupid birds)" + la invasion de Sardonia por Il Douche.',
    whereToFind: 'Camarote del Capitan (Z1S3) -> Habla con Captain Dread y preguntale por la Liga del Terror y las palomas.',
    room: 'Z1S3',
    iconSrc: 'characters/capdread/portrait.png',
  },
  {
    id: 'ee_mgwdbttgpnp',
    title: '4. El Reto de Pronunciar MGWDBTTGPnP y la Sirena de Ambulancia',
    origin2010: 'Sparkle - Characters.md: Solo el Ventrilocuo puede pronunciar "Malefic Gentlemen Who Do Bad Things To Good People & Pigeons" + su personalidad de sirena que "won\'t STFU".',
    whereToFind: 'VIP Lounge (Z1S2) -> Habla con The Ventriloquist & Rapoleon y pidele pronunciar MGWDBTTGPnP o activar la sirena.',
    room: 'Z1S2',
    iconSrc: 'characters/ventriloquist/portrait.png',
  },
  {
    id: 'ee_ababy_chulethal',
    title: '5. A Baby (Ex-Facepuncher), El Chulethal y el Miedo a Hightower',
    origin2010: 'Sparkle - Story.md: A Baby cayo de cabeza peleando contra El Chulethal y le teme a los guardias de la Midget Security Agency.',
    whereToFind: 'VIP Lounge (Z1S2) -> Habla con A Baby junto a su Boveda de Dulces.',
    room: 'Z1S2',
    iconSrc: 'characters/ababy/portrait.png',
  },
  {
    id: 'ee_funky_town',
    title: '6. El Teclado Manchado de Chocolate con la Melodia de "Funky Town"',
    origin2010: 'Sparkle - Level-Macro.pptx (Slide 5): Tres teclas manchadas de chocolate que tocan "Funky Town" (DO - DO - TIb - DO).',
    whereToFind: 'VIP Lounge (Z1S2) -> Haz click en la Boveda de Dulces de A Baby y toca C5 - C5 - Bb4 - C5.',
    room: 'Z1S2',
    iconSrc: 'art/approved/z1s2/z1s2.prop.funky_keypad.png',
  },
  {
    id: 'ee_samurai_anime',
    title: '7. El Rincon Samurai de Nihongo Nohondes',
    origin2010: 'Boceto Z1S2 de Aguilar con katanas y poster samurai para el capitan/ingeniero del submarino.',
    whereToFind: 'VIP Lounge (Z1S2) -> Inspecciona el Poster Samurai y el Estante de Katanas.',
    room: 'Z1S2',
    iconSrc: 'art/approved/z1s2/z1s2.wall.samurai_poster.png',
  },
  {
    id: 'ee_evil_deeds_books',
    title: '8. Catalogo de Evil Deeds College ("Kung FOOM!", DDLM & Space Wolves)',
    origin2010: 'Las 3 clases de Evil Deeds College (Cutter McGreen, Mech-alomaniac, Bruise Li) + los otros juegos de MoonStorm (DDLM y Space Wolves: Howlin\' Stars).',
    whereToFind: 'Sala de Maquinas (Z1S1) -> Inspecciona el Estante de Libros (Book Shelf) en la pared superior.',
    room: 'Z1S1',
    iconSrc: 'art/approved/z1s1/z1s1.wall.book_shelf.png',
  },
  {
    id: 'ee_two_pennies_sub',
    title: '9. El Pasaje de 2 Centavos ("Family Pack on Summer! Call Now!")',
    origin2010: 'Sparkle - Story.md: "Its only destination is the dreaded Blackspit Island and costs 2 pennies (also offers a family pack on summer! call now!)".',
    whereToFind: 'Sala de Maquinas (Z1S1) -> Habla con Nihongo Nohondes o inspecciona las estaciones de pedales.',
    room: 'Z1S1',
    iconSrc: 'characters/nihongo/portrait.png',
  },
  {
    id: 'ee_troll_gosu',
    title: '10. El Troll de la Puerta del Castillo ("Achievement Unlocked: GOSU!")',
    origin2010: 'LolDemo1 (29 Junio 2010) de Ledezman: tocar la puerta del castillo invoca a alexSpam.png con el texto GOSU!',
    whereToFind: 'Spooky Paper Castle (Z0 / LolDemo1) -> Haz click en la puerta de madera del castillo.',
    room: 'LOLDEMO',
    iconSrc: 'art/approved/z0/z0.prop.troll.png',
  },
  {
    id: 'ee_foot_collision',
    title: '11. Colision Exclusiva en los Pies (Torque 2D) & "No se puede click secundario, FAIL"',
    origin2010: 'SubstampedeTest1 de Ledezman (29 Octubre 2010) + el famoso comentario de Juancho sobre LolDemo1 v1.',
    whereToFind: 'Spooky Paper Castle (Z0 / LolDemo1) -> Inspecciona el Arbol Seco Recortado a la izquierda del castillo.',
    room: 'LOLDEMO',
    iconSrc: 'art/approved/z0/z0.prop.dead_tree.png',
  },
  {
    id: 'ee_sketch_mode_2010',
    title: '12. Modo "Boceto Original 2010" en Tiempo Real (Tecla K)',
    origin2010: 'Superpone en vivo los bocetos originales de Agosto/Junio 2010 de Aguilar y Morales detras de las marionetas 2026.',
    whereToFind: 'Cualquier habitacion -> Presiona la tecla K o el boton "2010 Sketch" en la barra superior.',
    room: 'Z1S3',
    iconSrc: 'art/archive_2010/Z1S3_captainroom_2010.png',
  },
];

export interface TimeCapsuleHost {
  switchRoom: (room: RoomId) => void;
  enterGameplay: (room: RoomId) => void;
  toggleSketchMode2010: () => void;
  playUiClick: (freq?: number) => void;
  playArchiveTrack: (trackFile: 'stuff2.ogg' | 'start_the_game.mp3') => void;
  stopArchiveTrack: () => void;
}

export class TimeCapsuleMuseum {
  private host: TimeCapsuleHost;
  private activeTab: 'team' | 'timeline' | 'gallery' | 'compare' | 'docs' = 'team';
  private timelineMode: 'production' | 'lore' = 'production';
  private selectedMilestoneId: string = PRODUCTION_TIMELINE_NODES[0].id;
  private galleryFilter: 'all' | 'characters' | 'scenes' | 'ui_oop' | 'demos' = 'all';
  private selectedDocId: 'story' | 'characters' | 'macro' | 'initiative' | 'pitches' = 'story';
  private currentTrack: 'stuff2.ogg' | 'start_the_game.mp3' | null = null;

  constructor(host: TimeCapsuleHost) {
    this.host = host;
    this.bindEvents();
  }

  private bindEvents(): void {
    document.getElementById('btn-close-archive')?.addEventListener('click', () => {
      this.host.playUiClick(480);
      this.close();
    });

    document.getElementById('btn-close-lightbox')?.addEventListener('click', () => {
      this.host.playUiClick(480);
      this.closeLightbox();
    });

    document.getElementById('archive-lightbox-overlay')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'archive-lightbox-overlay') {
        this.closeLightbox();
      }
    });

    document.querySelectorAll('.archive-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as
          | 'team'
          | 'timeline'
          | 'gallery'
          | 'compare'
          | 'docs';
        if (tab) {
          this.host.playUiClick(540);
          this.setTab(tab);
        }
      });
    });

    document.getElementById('btn-jukebox-stuff2')?.addEventListener('click', () => {
      this.toggleJukebox('stuff2.ogg');
    });
    document.getElementById('btn-jukebox-visionaire')?.addEventListener('click', () => {
      this.toggleJukebox('start_the_game.mp3');
    });
  }

  private toggleJukebox(track: 'stuff2.ogg' | 'start_the_game.mp3'): void {
    if (this.currentTrack === track) {
      this.currentTrack = null;
      this.host.stopArchiveTrack();
    } else {
      this.currentTrack = track;
      this.host.playArchiveTrack(track);
    }
    this.updateJukeboxButtons();
  }

  private updateJukeboxButtons(): void {
    const b1 = document.getElementById('btn-jukebox-stuff2');
    const b2 = document.getElementById('btn-jukebox-visionaire');
    if (b1) {
      b1.classList.toggle('active-track', this.currentTrack === 'stuff2.ogg');
      b1.textContent =
        this.currentTrack === 'stuff2.ogg'
          ? '⏸ Pausar LolDemo1 (stuff2.ogg)'
          : '♫ LolDemo1 2010 (stuff2.ogg)';
    }
    if (b2) {
      b2.classList.toggle('active-track', this.currentTrack === 'start_the_game.mp3');
      b2.textContent =
        this.currentTrack === 'start_the_game.mp3'
          ? '⏸ Pausar LolGame1 (start_the_game.mp3)'
          : '♫ Visionaire 2010 (start_the_game.mp3)';
    }
  }

  public open(initialTab: 'team' | 'timeline' | 'gallery' | 'compare' | 'docs' = 'team'): void {
    const modal = document.getElementById('archive-museum-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    this.setTab(initialTab);
    this.updateJukeboxButtons();
  }

  public close(): void {
    const modal = document.getElementById('archive-museum-modal');
    if (modal) modal.style.display = 'none';
    this.closeLightbox();
  }

  public setTab(tab: 'team' | 'timeline' | 'gallery' | 'compare' | 'docs'): void {
    this.activeTab = tab;
    document.querySelectorAll('.archive-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tab);
    });
    this.renderBody();
  }

  public openLightbox(artifactIdOrSrc: string): void {
    const item =
      ARCHIVE_ARTIFACTS_2010.find((a) => a.id === artifactIdOrSrc) ||
      ARCHIVE_ARTIFACTS_2010.find((a) => a.src === artifactIdOrSrc);
    const overlay = document.getElementById('archive-lightbox-overlay');
    const img = document.getElementById('lightbox-img') as HTMLImageElement | null;
    const title = document.getElementById('lightbox-title');
    const meta = document.getElementById('lightbox-meta');
    const desc = document.getElementById('lightbox-desc');
    const quote = document.getElementById('lightbox-quote');

    if (!overlay || !img || !title || !meta || !desc || !quote) return;

    if (item) {
      img.src = item.src;
      title.textContent = item.title;
      meta.textContent = `${item.date}  •  Autor: ${item.author}  •  [${item.badge}]`;
      desc.textContent = item.description;
      if (item.quote) {
        quote.style.display = 'block';
        quote.textContent = item.quote;
      } else {
        quote.style.display = 'none';
      }
    } else {
      img.src = artifactIdOrSrc;
      title.textContent = 'Artefacto Original MoonStorm Studios (2010)';
      meta.textContent = 'Archivo Recuperado 2010 - 2026';
      desc.textContent = 'Imagen original recuperada de los correos y archivos de MoonStorm Studios.';
      quote.style.display = 'none';
    }

    overlay.style.display = 'flex';
  }

  public closeLightbox(): void {
    const overlay = document.getElementById('archive-lightbox-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  private renderBody(): void {
    const container = document.getElementById('archive-museum-body');
    if (!container) return;

    if (this.activeTab === 'team') {
      this.renderTeamTab(container);
    } else if (this.activeTab === 'timeline') {
      this.renderTimelineTab(container);
    } else if (this.activeTab === 'gallery') {
      this.renderGalleryTab(container);
    } else if (this.activeTab === 'compare') {
      this.renderCompareTab(container);
    } else if (this.activeTab === 'docs') {
      this.renderDocsTab(container);
    }
  }

  private renderTeamTab(container: HTMLElement): void {
    container.innerHTML = `
      <div class="archive-intro-banner">
        <div>
          <h4>MOONSTORM STUDIOS (COSTA RICA, 2010 - 2026) - "TRABAJO = DIVERSION"</h4>
          <p>
            Fundado en abril de 2010 por seis amigos en Costa Rica (<code>moonstorm@googlegroups.com</code> y <code>mssmn@googlegroups.com</code> "MSS Management Overlords"),
            divididos en dos escuadrones legendarios: <strong>Black Hole Sun</strong> (Arte, Historia &amp; Diseño) y <strong>Ecstasy of Gold</strong> (Motor, OOP &amp; Programacion).
            Haz click en cualquier artefacto de cada fundador para inspeccionar su trabajo original de 2010.
          </p>
        </div>
        <div class="archive-subteam-pills">
          <span class="subteam-pill bhs">☀ Black Hole Sun: Xygvot, Psytech, c0pp3r</span>
          <span class="subteam-pill eog">🪙 Ecstasy of Gold: Juancho, Ledezman, BooT</span>
        </div>
      </div>

      <div class="founders-grid">
        ${FOUNDERS_2010.map((f) => {
          const isBhs = f.subteam.includes('Black Hole Sun');
          const artButtons = f.featuredArtifactIds
            .map((aid) => {
              const art = ARCHIVE_ARTIFACTS_2010.find((a) => a.id === aid);
              if (!art) return '';
              return `<button class="founder-art-chip" data-artifact="${art.id}" title="Ver ${art.title}">🔍 ${art.title.split('(')[0].trim()}</button>`;
            })
            .join('');

          return `
            <article class="founder-card">
              <div class="founder-card-top">
                <img src="${f.avatarSrc}" alt="${f.name}" class="founder-avatar" data-lightbox-src="${f.avatarSrc}" title="Click para ampliar" />
                <div class="founder-title-col">
                  <div class="founder-name-row">
                    <h4>${f.name}</h4>
                    <span class="founder-handle">@${f.handle}</span>
                  </div>
                  <div class="founder-role">${f.role2010}</div>
                  <span class="founder-team-badge ${isBhs ? 'bhs' : 'eog'}">${f.subteam}</span>
                </div>
              </div>
              <p class="founder-bio">${f.bio}</p>
              <div class="founder-quotes-box">
                ${f.quotes.map((q) => `<div class="founder-quote-line">${q}</div>`).join('')}
              </div>
              <ul class="founder-contrib-list">
                ${f.contributions.map((c) => `<li>${c}</li>`).join('')}
              </ul>
              <div class="founder-actions-row">
                ${artButtons}
                ${
                  f.jumpRoom
                    ? `<button class="founder-room-btn" data-jump-room="${f.jumpRoom}">▶ Ir a Escena (${f.jumpRoom})</button>`
                    : ''
                }
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.founder-art-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.artifact;
        if (id) {
          this.host.playUiClick(560);
          this.openLightbox(id);
        }
      });
    });

    container.querySelectorAll('.founder-avatar').forEach((img) => {
      img.addEventListener('click', () => {
        const src = (img as HTMLElement).dataset.lightboxSrc;
        if (src) {
          this.host.playUiClick(560);
          this.openLightbox(src);
        }
      });
    });

    container.querySelectorAll('.founder-room-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const room = (btn as HTMLElement).dataset.jumpRoom as RoomId;
        if (room) {
          this.host.playUiClick(600);
          this.close();
          this.host.enterGameplay(room);
        }
      });
    });
  }

  private renderTimelineTab(container: HTMLElement): void {
    const selectedNode =
      PRODUCTION_TIMELINE_NODES.find((n) => n.id === this.selectedMilestoneId) ||
      PRODUCTION_TIMELINE_NODES[0];

    container.innerHTML = `
      <div class="timeline-mode-bar">
        <button class="timeline-mode-btn ${this.timelineMode === 'production' ? 'active' : ''}" data-tmode="production">
          🛠 Historia de Produccion de MoonStorm (2010 - 2011 &rarr; 2026)
        </button>
        <button class="timeline-mode-btn ${this.timelineMode === 'lore' ? 'active' : ''}" data-tmode="lore">
          📜 Cronologia Canonica de los Gemelos Stache (Year 0 a Year 26)
        </button>
      </div>

      ${
        this.timelineMode === 'production'
          ? `
        <div class="timeline-interactive-layout">
          <div class="timeline-rail-list">
            ${PRODUCTION_TIMELINE_NODES.map(
              (n, idx) => `
              <button class="timeline-node-btn ${n.id === selectedNode.id ? 'active' : ''}" data-node-id="${n.id}">
                <span class="tl-step-num">${idx + 1}</span>
                <div class="tl-node-meta">
                  <span class="tl-node-date">${n.date}</span>
                  <strong>${n.title}</strong>
                </div>
              </button>
            `
            ).join('')}
          </div>

          <div class="timeline-detail-card">
            <div class="tl-detail-header">
              <div>
                <span class="tl-detail-date-badge">${selectedNode.date}</span>
                <span class="tl-detail-team-badge">${selectedNode.teamTag}</span>
                <h3>${selectedNode.title}</h3>
                <p class="tl-detail-sub">${selectedNode.subtitle}</p>
              </div>
            </div>

            <div class="tl-detail-content-split">
              <div class="tl-detail-left">
                <p class="tl-detail-summary">${selectedNode.summary}</p>
                <div class="tl-quotes-panel">
                  <h5>Citas Verbatim de los Correos y Chats (2010):</h5>
                  ${selectedNode.quotes.map((q) => `<blockquote>${q}</blockquote>`).join('')}
                </div>
                <div class="tl-artifacts-row">
                  <h5>Artefactos de este Hito (Click para ampliar):</h5>
                  <div class="tl-artifact-chips">
                    ${selectedNode.artifacts
                      .map((aid) => {
                        const art = ARCHIVE_ARTIFACTS_2010.find((a) => a.id === aid);
                        if (!art) return '';
                        return `
                          <button class="tl-art-thumb-btn" data-artifact="${art.id}">
                            <img src="${art.src}" alt="${art.title}" />
                            <span>${art.title.split('(')[0].trim()}</span>
                          </button>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              </div>

              <div class="tl-detail-right">
                <div class="tl-hero-img-wrap" data-lightbox-src="${selectedNode.imgSrc}" title="Click para abrir en pantalla completa">
                  <img src="${selectedNode.imgSrc}" alt="${selectedNode.title}" />
                  <span class="tl-zoom-hint">🔍 Click para ampliar original</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
          : `
        <div class="lore-timeline-grid">
          ${LORE_TIMELINE_NODES.map(
            (ln) => `
            <div class="lore-node-card">
              <div class="lore-node-img-wrap" data-lightbox-src="${ln.imgSrc}">
                <img src="${ln.imgSrc}" alt="${ln.title}" />
                <span class="lore-year-pill">${ln.year}</span>
              </div>
              <div class="lore-node-body">
                <h4>${ln.title}</h4>
                <p>${ln.summary}</p>
                <div class="lore-highlight-box">${ln.highlight}</div>
              </div>
            </div>
          `
          ).join('')}
        </div>
      `
      }
    `;

    container.querySelectorAll('.timeline-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.tmode as 'production' | 'lore';
        if (mode) {
          this.host.playUiClick(520);
          this.timelineMode = mode;
          this.renderTimelineTab(container);
        }
      });
    });

    container.querySelectorAll('.timeline-node-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.nodeId;
        if (id) {
          this.host.playUiClick(540);
          this.selectedMilestoneId = id;
          this.renderTimelineTab(container);
        }
      });
    });

    container.querySelectorAll('.tl-art-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.artifact;
        if (id) {
          this.host.playUiClick(560);
          this.openLightbox(id);
        }
      });
    });

    container.querySelectorAll('[data-lightbox-src]').forEach((el) => {
      el.addEventListener('click', () => {
        const src = (el as HTMLElement).dataset.lightboxSrc;
        if (src) {
          this.host.playUiClick(560);
          this.openLightbox(src);
        }
      });
    });
  }

  private renderGalleryTab(container: HTMLElement): void {
    const filtered =
      this.galleryFilter === 'all'
        ? ARCHIVE_ARTIFACTS_2010
        : ARCHIVE_ARTIFACTS_2010.filter((a) => a.category === this.galleryFilter);

    const counts = {
      all: ARCHIVE_ARTIFACTS_2010.length,
      characters: ARCHIVE_ARTIFACTS_2010.filter((a) => a.category === 'characters').length,
      scenes: ARCHIVE_ARTIFACTS_2010.filter((a) => a.category === 'scenes').length,
      ui_oop: ARCHIVE_ARTIFACTS_2010.filter((a) => a.category === 'ui_oop').length,
      demos: ARCHIVE_ARTIFACTS_2010.filter((a) => a.category === 'demos').length,
    };

    container.innerHTML = `
      <div class="gallery-filter-bar">
        <button class="gallery-filter-btn ${this.galleryFilter === 'all' ? 'active' : ''}" data-gfilter="all">
          Todos los Originales 2010 (${counts.all})
        </button>
        <button class="gallery-filter-btn ${this.galleryFilter === 'characters' ? 'active' : ''}" data-gfilter="characters">
          🎭 Personajes &amp; GIFs (${counts.characters})
        </button>
        <button class="gallery-filter-btn ${this.galleryFilter === 'scenes' ? 'active' : ''}" data-gfilter="scenes">
          ⚓ Escenarios &amp; PSDs (${counts.scenes})
        </button>
        <button class="gallery-filter-btn ${this.galleryFilter === 'ui_oop' ? 'active' : ''}" data-gfilter="ui_oop">
          📐 GUI, Mapa &amp; Diagrama OOP (${counts.ui_oop})
        </button>
        <button class="gallery-filter-btn ${this.galleryFilter === 'demos' ? 'active' : ''}" data-gfilter="demos">
          🕹 Demos 2010 &amp; Logos (${counts.demos})
        </button>
      </div>

      <div class="archive-gallery-grid">
        ${filtered
          .map(
            (item) => `
          <div class="gallery-item-card" data-artifact="${item.id}">
            <div class="gallery-thumb-frame">
              <img src="${item.src}" alt="${item.title}" loading="lazy" />
              <span class="gallery-badge">${item.badge}</span>
            </div>
            <div class="gallery-item-info">
              <h4>${item.title}</h4>
              <div class="gallery-item-meta">${item.date} &bull; ${item.author}</div>
              <p>${item.description}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = (btn as HTMLElement).dataset.gfilter as
          | 'all'
          | 'characters'
          | 'scenes'
          | 'ui_oop'
          | 'demos';
        if (f) {
          this.host.playUiClick(520);
          this.galleryFilter = f;
          this.renderGalleryTab(container);
        }
      });
    });

    container.querySelectorAll('.gallery-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.artifact;
        if (id) {
          this.host.playUiClick(560);
          this.openLightbox(id);
        }
      });
    });
  }

  private renderCompareTab(container: HTMLElement): void {
    container.innerHTML = `
      <div class="archive-intro-banner">
        <div>
          <h4>DEL BOCETO DE 2010 AL MOTOR DE MARIONETAS CUT-OUT DE 2026</h4>
          <p>
            Compara lado a lado los bocetos a lapiz y archivos PSD de Jose David Aguilar y Cristian Morales (2010) con las piezas y marionetas reconstruidas en el juego actual.
            Tambien puedes activar el <strong>Modo Boceto 2010 en Vivo (Tecla K)</strong> dentro de cualquier cuarto del submarino.
          </p>
        </div>
        <button id="btn-compare-live-sketch" class="founder-room-btn">
          ✏ Probar "Modo Boceto 2010" en Vivo (Tecla K)
        </button>
      </div>

      <div class="compare-cards-grid">
        ${BEFORE_AFTER_COMPARISONS.map(
          (c) => `
          <div class="compare-card">
            <div class="compare-card-header">
              <div>
                <h4>${c.title}</h4>
                <span>${c.subtitle}</span>
              </div>
              ${
                c.roomJump
                  ? `<button class="founder-room-btn" data-jump-room="${c.roomJump}">▶ Visitar ${c.roomJump}</button>`
                  : ''
              }
            </div>
            <div class="compare-pair-row">
              <div class="compare-pane" data-lightbox-src="${c.beforeSrc}">
                <span class="compare-tag tag-2010">${c.beforeLabel}</span>
                <img src="${c.beforeSrc}" alt="${c.beforeLabel}" />
              </div>
              <div class="compare-pane" data-lightbox-src="${c.afterSrc}">
                <span class="compare-tag tag-2026">${c.afterLabel}</span>
                <img src="${c.afterSrc}" alt="${c.afterLabel}" />
              </div>
            </div>
            <p class="compare-notes">${c.notes}</p>
          </div>
        `
        ).join('')}
      </div>
    `;

    document.getElementById('btn-compare-live-sketch')?.addEventListener('click', () => {
      this.host.playUiClick(600);
      this.close();
      this.host.enterGameplay('Z1S3');
      this.host.toggleSketchMode2010();
    });

    container.querySelectorAll('[data-jump-room]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const room = (btn as HTMLElement).dataset.jumpRoom as RoomId;
        if (room) {
          this.host.playUiClick(600);
          this.close();
          this.host.enterGameplay(room);
        }
      });
    });

    container.querySelectorAll('[data-lightbox-src]').forEach((el) => {
      el.addEventListener('click', () => {
        const src = (el as HTMLElement).dataset.lightboxSrc;
        if (src) {
          this.host.playUiClick(560);
          this.openLightbox(src);
        }
      });
    });
  }

  private renderDocsTab(container: HTMLElement): void {
    const docContents: Record<string, { title: string; meta: string; html: string }> = {
      story: {
        title: 'Sparkle - Story.md (7 Julio 2010)',
        meta: 'Creado el 2010-07-07 por Jose David Aguilar & Alexander Barquero en Google Docs',
        html: `
          <p><strong>Premisa Oficial:</strong> Rupert Stache llega a <strong>Blackspit Island</strong>, un conocido refugio para organizaciones malvadas de segunda y tercera categoria alrededor del globo.</p>
          <ol class="doc-clean-list">
            <li>Viaja en el <strong>Substampede</strong>, <em>"a mysterious and ghostly old submarine whose passengers must pedal for the propulsion to work. Its only destination is the dreaded Blackspit Island and costs 2 pennies (also offers a family pack on summer! call now!)"</em>.</li>
            <li>Desembarca en Port Machete y visita los restos del <strong>Cirque du SoLame</strong>, varado hace años despues de que <em>"a deranged parrot set fire to their cargo ships"</em>:
              <ul>
                <li>Los <strong>Mimos</strong> formaron una banda llamada <strong>The Air Guitars</strong>, y nadie les presta atencion.</li>
                <li>Los <strong>Payasos</strong> formaron una pandilla criminal, <strong>Serious Business</strong>, pero nadie teme sus asaltos porque usan pistolas de agua.</li>
                <li>El <strong>Ventrilocuo</strong> se convirtio en el anunciador del <strong>Artificial Thundercano Hideout</strong>.</li>
                <li>Los <strong>Enanos (Midget Security Agency)</strong> se volvieron los guardaespaldas del volcan.</li>
                <li>La <strong>Mujer Barbuda (Joanna Spitzbart)</strong> es la portera de Chimichanga's Souvenir Shop.</li>
              </ul>
            </li>
            <li>Rupert conoce a <strong>Captain Dread</strong>, quien le ofrece unirlo a la <strong>League of Terror</strong> (que esta inactiva porque todos en la isla son malos y no queda nadie bueno a quien hacerle maldades) si cumple dos encargos:
              <ul>
                <li><strong>Job 1:</strong> Robarle sus dulces a <strong>"A Baby"</strong> (antes conocido como <em>Facepuncher</em>, 2.5m y 300 lbs, quien balbucea como bebe desde que cayo de cabeza peleando contra <strong>El Chulethal</strong>).</li>
                <li><strong>Job 2:</strong> Hacer que los enanos entren en huelga entregandole al Ventrilocuo un memo falsificado con un requisito de "estatura minima".</li>
              </ul>
            </li>
            <li>Para escalar en la jerarquia necesita un titulo universitario de <strong>Evil Deeds College</strong> cursando: <em>"Maniacal Laughter and Advanced Villainous Speech Basics 101"</em>, <em>"Diabolic Machines of Destruction"</em> y <em>"Kung FOOM!"</em>, falsificando su diploma con una maquina Rube Goldberg que explota y nivela medio campus.</li>
            <li><strong>Climax en el Thundercano:</strong> A Baby irrumpe exigiendo sus dulces; Dread culpa a <strong>Lord Goat</strong> tras esconder los dulces en el <strong>Throne of Horrors</strong>. En un giro ridiculo, eligen a <strong>Mr. Smoothface</strong> como Maestro de los <strong>MGWDBTTGPnP</strong> (<em>Malefic Gentlemen Who Do Bad Things To Good People &amp; Pigeons</em>).</li>
            <li><strong>Ultima linea inconclusa del documento de 2010:</strong> <em>"...since all pigeons in the island have gone missing since 1720 (when war was declared on the stupid birds) and"</em>.</li>
          </ol>
        `,
      },
      characters: {
        title: 'Sparkle - Characters.md (Julio 2010 - Febrero 2011)',
        meta: 'Biblia de los 18 Personajes de Blackspit Island + Las 108 Estrellas del Destino',
        html: `
          <ul class="doc-clean-list">
            <li><strong>Rupert Stache (Mr. Smoothface):</strong> El gemelo lampiño, maestro de habilidades callejeras absurdas.</li>
            <li><strong>Dr. Morgan Stache:</strong> Su hermano gemelo prodigio cuyo bigote vuelve a crecer en una hora. Heredero de la coleccion de barbas magicas historicas.</li>
            <li><strong>Nihongo Nohondes:</strong> Capitan/ingeniero del submarino de pedales Substampede.</li>
            <li><strong>Captain Dread:</strong> Principe exiliado de Sardonia tras la invasion de <strong>Il Douche</strong>.</li>
            <li><strong>Janus Vertrolikwoski (The Ventriloquist):</strong> Paciente escapado con 3 personalidades (<strong>Clash McTrevor</strong>, <strong>Rapoleon</strong> en prosa francesa medieval, y una <strong>Sirena de Ambulancia</strong>). El unico humano capaz de pronunciar <strong>MGWDBTTGPnP</strong>.</li>
            <li><strong>A Baby (Ex-Facepuncher):</strong> Mole de 300 libras con mente de bebe tras pelear con El Chulethal. Protege su boveda de dulces con la melodia de <em>"Funky Town"</em>.</li>
            <li><strong>Lord Goat &amp; Mocus:</strong> Una cabra misteriosa sentada en el Trono de los Horrores y su leal interprete jorobado de voz chillona.</li>
            <li><strong>Bruise Li:</strong> Ex-heroe junto a <em>Jude O'Chop</em>, incriminado por <em>Dragonballs</em>. Maestro del <strong>Kung FOOM!</strong> (<em>"Excuse me sir please bacFOOM FOOM FOOM!"</em>).</li>
            <li><strong>Cutter McGreen, The Mech-alomaniac &amp; The Rector:</strong> El claustro academico de Evil Deeds College.</li>
          </ul>
        `,
      },
      macro: {
        title: 'Sparkle - Level-Macro.pptx (Las 6 Zonas de Blackspit Island)',
        meta: 'Presentacion de 6 Diapositivas de Diseño de Niveles y Cadenas de Puzzles (Agosto 2010)',
        html: `
          <ul class="doc-clean-list">
            <li><strong>Zona 1 - Substampede (Jugable Ahora!):</strong> <em>Machine Room (Z1S1)</em>, <em>Lobby (Z1S2)</em> y <em>Captain's Room (Z1S3)</em>. El pedal se rompe (BAM!); Rupert recoge el plano de la Maquina de Movimiento Perpetuo de Leonardo da Vinci y combina el Timon, el Soporte de Retrato, la Bolsa de Martillos y la Goma para que el submarino viaje a velocidad supersonica y choque contra Port Machete sin frenos.</li>
            <li><strong>Zona 2 - Port Machete:</strong> <em>Muelle</em> y <em>Chimichanga's Monkey Laundry</em> (custodiado por la Mujer Barbuda Joanna Spitzbart, maestra del arte marcial "Monkey-steals-the-Peach").</li>
            <li><strong>Zona 3 - Placeholder Town / Cirque du SoLame:</strong> Kiosko central con Captain Dread, The Mariachi Commando, The Air Guitars y Serious Business.</li>
            <li><strong>Zona 4 - A Baby's Shack:</strong> Patio de chatarra donde Rupert construye una excavadora casera que perfora el tanque septico y lo lanza sobre el felpudo "UNWELCOME" (donde estaba la llave todo el tiempo), seguido por el escaner de ADN y el teclado con chocolate de <em>"Funky Town"</em>.</li>
            <li><strong>Zona 5 - Evil Deeds College:</strong> Las 3 aulas donde Rupert roba piezas de mimeografo (tambor, tinta, moldes) e intenta detener la maquina copiadora de diplomas a golpes de Kung FOOM! hasta que explota medio campus.</li>
            <li><strong>Zona 6 - Artificial Thundercano Hideout:</strong> Entrada custodiada por Spooch y Hightower, cabina de anuncios con tubos neumaticos del Ventrilocuo (con la nota famosa: <em>"FALTA RAPOLEON - como convencerlo de grabar MGWDBTTGPnP"</em>) y el Salon del Trono de los Horrores de Lord Goat.</li>
          </ul>
        `,
      },
      initiative: {
        title: 'The Initiative, Executive Summary & PFG Beta 1.0 (2010 - 2011)',
        meta: 'Vision Empresarial de MoonStorm Studios y Tesis de Ingenieria de Alexander Barquero',
        html: `
          <ul class="doc-clean-list">
            <li><strong>Vision ("The Initiative"):</strong> <em>"Ser la empresa mas relevante en creacion de videojuegos en Latinoamerica y el Caribe."</em></li>
            <li><strong>Objetivo Fundamental:</strong> <strong>Trabajo = Diversion</strong>. Crear juegos originales con humor propio y calidad de exportacion desde Costa Rica.</li>
            <li><strong>MSS Executive Summary (Final_FINAL):</strong> Plan financiero para un equipo de 5 personas durante 24 meses ($180,000), con precio de venta de $8 USD en distribucion digital (Steam) y meta de 30,000 unidades en el primer año.</li>
            <li><strong>ABarquero_PFG_Beta_1.0 (2011):</strong> Proyecto Final de Graduacion de Alexander Barquero que formalizo la metodologia agil de pre-produccion, produccion y post-produccion diseñada a partir de la experiencia real construyendo <em>Sparkle</em> en MoonStorm Studios.</li>
          </ul>
        `,
      },
      pitches: {
        title: 'Los Otros Juegos de MoonStorm: Dr. Stache, DDLM, Space Wolves & Twistoria',
        meta: 'Conceptos y Modificaciones Creados por el Equipo entre 2010 y 2011',
        html: `
          <ul class="doc-clean-list">
            <li><strong>The Odd-yssey of Dr. Stache (Mayo 2010):</strong> Plataformero de accion de 8 mundos. Incluye el Mundo de Fuego (<em>"Beard: Diabolecci / World Style: Steampunk Fascist"</em>) con enemigos inolvidables: <em>"Bears with Lasers, Laser Equipped 1800-British African Animal Hunters, Gentlemen wielding laser umbrellas as swords, Robo-Barbershop seats"</em>.</li>
            <li><strong>El Dia de los Muertos - DDLM v1.00 (2010):</strong> Campaña cooperativa para <em>Left 4 Dead 2</em> ambientada en Mexico con 4 sobrevivientes memorables encabezados por Manolo "El Mariachi" Gonzalez.</li>
            <li><strong>Space Wolves: Howlin' Stars (2010):</strong> Juego de mercenarios espaciales (<em>Mass Effect + Cowboy Bebop + GTA</em>) a bordo de la nave <em>The Howler</em> y el camion <em>Blood Claw</em> (un camion cisterna septico decomisado), donde el cocinero da pesimos datos de inteligencia y un cargamento de "armas alienigenas" resulta ser ropa sucia.</li>
            <li><strong>Twistoria (Mayo 2011):</strong> Propuesta de Cristian Morales para un libro infantil interactivo lleno de humor y ramificaciones.</li>
          </ul>
        `,
      },
    };

    const curDoc = docContents[this.selectedDocId] || docContents.story;

    container.innerHTML = `
      <div class="docs-and-eggs-split">
        <div class="docs-reader-col">
          <h4>📚 BIBLIA DE DISEÑO ORIGINAL (2010 - 2011)</h4>
          <div class="docs-selector-tabs">
            <button class="doc-tab-pill ${this.selectedDocId === 'story' ? 'active' : ''}" data-doc="story">Sparkle - Story</button>
            <button class="doc-tab-pill ${this.selectedDocId === 'characters' ? 'active' : ''}" data-doc="characters">Characters (18)</button>
            <button class="doc-tab-pill ${this.selectedDocId === 'macro' ? 'active' : ''}" data-doc="macro">Level-Macro (6 Zonas)</button>
            <button class="doc-tab-pill ${this.selectedDocId === 'initiative' ? 'active' : ''}" data-doc="initiative">The Initiative &amp; PFG</button>
            <button class="doc-tab-pill ${this.selectedDocId === 'pitches' ? 'active' : ''}" data-doc="pitches">Dr. Stache, DDLM &amp; Mas</button>
          </div>
          <div class="doc-sheet-card">
            <h3>${curDoc.title}</h3>
            <div class="doc-sheet-meta">${curDoc.meta}</div>
            <div class="doc-sheet-body">${curDoc.html}</div>
          </div>
        </div>

        <div class="easter-eggs-col">
          <h4>🥚 CAZADOR DE EASTER EGGS E INSIDE JOKES (12 JUGABLES)</h4>
          <p class="ee-subtitle">Todos estos chistes internos de 2010 estan activos dentro del juego. Haz click en <strong>"Ir ahi"</strong> para probarlos:</p>
          <div class="easter-eggs-list">
            ${EASTER_EGG_CHECKLIST.map(
              (ee) => `
              <div class="ee-item-card">
                <img src="${ee.iconSrc}" alt="${ee.title}" class="ee-item-icon" />
                <div class="ee-item-body">
                  <h5>${ee.title}</h5>
                  <div class="ee-origin"><strong>Origen 2010:</strong> ${ee.origin2010}</div>
                  <div class="ee-where"><strong>Como activarlo:</strong> ${ee.whereToFind}</div>
                </div>
                <button class="ee-jump-btn" data-jump-room="${ee.room}">▶ Ir ahi (${ee.room})</button>
              </div>
            `
            ).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.doc-tab-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = (btn as HTMLElement).dataset.doc as
          | 'story'
          | 'characters'
          | 'macro'
          | 'initiative'
          | 'pitches';
        if (d) {
          this.host.playUiClick(520);
          this.selectedDocId = d;
          this.renderDocsTab(container);
        }
      });
    });

    container.querySelectorAll('.ee-jump-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const room = (btn as HTMLElement).dataset.jumpRoom as RoomId;
        if (room) {
          this.host.playUiClick(600);
          this.close();
          this.host.enterGameplay(room);
        }
      });
    });
  }
}
