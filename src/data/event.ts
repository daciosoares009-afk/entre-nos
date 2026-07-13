import { CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react';
import speakerCarla from '../assets/speaker-carla.jpeg';
import speakerElizangela from '../assets/speaker-elizangela.jpeg';
import speakerKelciodiones from '../assets/speaker-kelciodiones.jpeg';

export const eventInfo = {
  name: 'Entre Nós Experience',
  date: '22 de agosto',
  time: '19h',
  location: 'A definir',
  description:
    'Um encontro para conectar mulheres, empreendedores, especialistas e marcas em uma noite de conteúdo, networking e novos lançamentos do Entre Nós.',
};

export const eventCards = [
  { title: 'Data', value: eventInfo.date, description: 'Reserve a noite para viver essa experiência.', icon: CalendarDays },
  { title: 'Horário', value: eventInfo.time, description: 'Chegue cedo para se conectar e se ambientar.', icon: Clock },
  { title: 'Local', value: eventInfo.location, description: 'O endereço será divulgado em breve nos canais oficiais.', icon: MapPin },
  { title: 'Sobre', value: 'Conteúdo e conexões', description: 'Palestras, anúncios oficiais e networking em uma só noite.', icon: Sparkles },
];

export const speakers = [
  {
    name: 'Elisângela',
    role: 'Secretária da Mulher',
    status: 'Confirmada',
    initials: 'EL',
    image: speakerElizangela,
  },
  {
    name: 'Carla Patrícia',
    role: 'Professora e integrante da Sala do Empreendedor',
    status: 'Confirmada',
    initials: 'CP',
    image: speakerCarla,
  },
  {
    name: 'Kelciodiones',
    role: 'Alfa Consultorias e Secretário da Cultura',
    status: 'Confirmado',
    initials: 'KE',
    image: speakerKelciodiones,
  },
];

export const schedule = [
  { time: '19h', title: 'Abertura do evento' },
  { time: '19h15 às 20h30', title: 'Palestras com os especialistas' },
  { time: '20h30', title: 'Anúncio do lançamento da plataforma oficial do Entre Nós' },
  { time: '20h45', title: 'Anúncio da segunda temporada do Entre Nós Podcast' },
  { time: '21h', title: 'Encerramento e networking' },
];
