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
    name: 'Elisângela Silva',
    role: 'Secretária da Mulher',
    status: 'Confirmada',
    initials: 'EL',
    image: speakerElizangela,
  },
  {
    name: 'Carlla Patrícia',
    role: 'Professora e integrante da Sala do Empreendedor',
    status: 'Confirmada',
    initials: 'CP',
    image: speakerCarla,
  },
  {
    name: 'Kelciodione Alves',
    role: 'Alfa Consultorias e Secretário da Cultura',
    status: 'Confirmado',
    initials: 'KE',
    image: speakerKelciodiones,
  },
];

export const schedule = [
  {
    time: '19h00 – 19h15',
    title: 'Abertura Oficial do Evento',
    details: [
      'Recepção do público',
      'Apresentação inicial da equipe Entre Nós',
      'Boas-vindas e apresentação do propósito do evento',
    ],
  },
  { time: '19h15 – 20h15', title: 'Ciclo de Palestras' },
  { time: '20h15 – 20h25', title: 'Anúncio Oficial da Nova Temporada do Entre Nós Podcast' },
  { time: '20h25 – 20h45', title: 'Lançamento Oficial do Aplicativo Entre Nós' },
  { time: '20h45 – 21h00', title: 'Encerramento e Agradecimentos' },
];
