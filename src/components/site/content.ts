/**
 * Contenido editable del sitio público de JCM Radio.
 * Para cambiar textos, horarios o noticias basta con editar este archivo.
 */
import programVivo from '../../assets/images/program-vivo.webp';
import programJoven from '../../assets/images/program-joven.webp';
import programClasicos from '../../assets/images/program-clasicos.webp';
import programEspeciales from '../../assets/images/program-especiales.webp';

export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'programacion', label: 'Programación' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'contacto', label: 'Contacto' },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]['id'];

export type FeatureTone = 'purple' | 'blue' | 'cyan' | 'red';
export type FeatureIcon = 'music' | 'mic' | 'news' | 'heart';

export const FEATURES: { icon: FeatureIcon; tone: FeatureTone; title: string; text: string }[] = [
  { icon: 'music', tone: 'purple', title: 'Música', text: 'Todos los géneros' },
  { icon: 'mic', tone: 'blue', title: 'Entretenimiento', text: 'Programas únicos' },
  { icon: 'news', tone: 'cyan', title: 'Información', text: 'Lo que pasa cerca de ti' },
  { icon: 'heart', tone: 'red', title: 'Comunidad', text: 'Más que una radio' },
];

export interface Program {
  id: string;
  title: string;
  /** Hora de inicio (0–23) en horario de Lima. */
  start: number;
  /** Hora de fin (1–24) en horario de Lima; 24 = medianoche. */
  end: number;
  description: string;
  /** Los programas destacados se muestran como tarjetas con imagen. */
  featured: boolean;
  image?: string;
  imagePosition?: string;
}

export const PROGRAMS: Program[] = [
  {
    id: 'madrugada',
    title: 'Música sin pausa',
    start: 0,
    end: 8,
    description: 'La mejor selección musical de JCM Radio te acompaña toda la madrugada.',
    featured: false,
  },
  {
    id: 'jcm-en-vivo',
    title: 'JCM en Vivo',
    start: 8,
    end: 12,
    description: 'Música, saludos y buena energía para empezar el día.',
    featured: true,
    image: programVivo,
    imagePosition: '50% 38%',
  },
  {
    id: 'zona-joven',
    title: 'Zona Joven',
    start: 12,
    end: 16,
    description: 'Lo mejor de la música actual, trends y más.',
    featured: true,
    image: programJoven,
    imagePosition: '50% 42%',
  },
  {
    id: 'clasicos-inolvidables',
    title: 'Clásicos Inolvidables',
    start: 16,
    end: 20,
    description: 'Los grandes éxitos que nunca pasan de moda.',
    featured: true,
    image: programClasicos,
    imagePosition: '62% 45%',
  },
  {
    id: 'momentos-especiales',
    title: 'Momentos Especiales',
    start: 20,
    end: 24,
    description: 'Baladas, dedicatorias y música para el alma.',
    featured: true,
    image: programEspeciales,
    imagePosition: '50% 42%',
  },
];

/** Lima (Perú) usa UTC−5 todo el año, sin horario de verano. */
const STATION_UTC_OFFSET_HOURS = -5;

/** Hora decimal actual en Lima (por ejemplo 13.5 = 13:30), sin importar dónde esté el oyente. */
export function stationHour(date = new Date()): number {
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + STATION_UTC_OFFSET_HOURS * 60;
  return (((minutes % 1440) + 1440) % 1440) / 60;
}

export function getLiveProgram(date = new Date()): Program | undefined {
  const hour = stationHour(date);
  return PROGRAMS.find((program) => hour >= program.start && hour < program.end);
}

export function formatHour(hour: number): string {
  return `${String(hour % 24).padStart(2, '0')}:00`;
}

export type NewsIconName = 'heart' | 'radio' | 'calendar';

/**
 * Novedades de la radio (contenido de ejemplo, editable).
 * Reemplázalas por noticias reales de la emisora.
 */
export const NEWS: { id: string; tag: string; title: string; text: string; icon: NewsIconName; tone: FeatureTone }[] = [
  {
    id: 'pedidos',
    tag: 'Comunidad',
    title: 'Pide tu canción favorita',
    text: 'Dedica un tema a esa persona especial y envíanos tus saludos. Tus pedidos también hacen la radio.',
    icon: 'heart',
    tone: 'red',
  },
  {
    id: 'donde-estes',
    tag: 'En vivo',
    title: 'Escúchanos donde estés',
    text: 'Transmitimos las 24 horas por internet: entra desde tu celular, tablet o computadora y llévanos contigo.',
    icon: 'radio',
    tone: 'cyan',
  },
  {
    id: 'programacion',
    tag: 'Programación',
    title: 'Una radio para cada momento',
    text: 'Clásicos inolvidables, la música de hoy y espacios en vivo para acompañarte de la mañana a la medianoche.',
    icon: 'calendar',
    tone: 'purple',
  },
];
