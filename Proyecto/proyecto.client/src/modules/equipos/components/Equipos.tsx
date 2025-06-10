import React, { useState, useEffect } from 'react';
import {
  Calendar,
  momentLocalizer,
  Views,
  Event,
  View,
  NavigateAction,
  Formats,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface Equipo {
  equipoId: number;
  nombre: string;
  nameFacultad: string;
  imagenEquipo: string;
}

interface Partido {
  partidoId: number;
  fechaPartido: string;
  horaPartido: string;
  equipo1: Equipo;
  equipo2: Equipo;
  estado: string;
  jornada: number;
  faseId: number;
  nameArbitro: string;
  nameCancha: string;
}

interface Jornada {
  numeroJornada: number;
  partidos: Partido[];
}

interface EventoCalendario extends Event {
  id: number;
  resource: Partido;
}

const Calendario: React.FC = () => {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchPartidos() {
      try {
        const res = await fetch(
          'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/MatchesControllers/subtorneo/3/partidosPorJornada'
        );
        const data: Jornada[] = await res.json();

        const eventosMapeados: EventoCalendario[] = data.flatMap(jornada =>
          jornada.partidos.map(partido => {
            const fecha = moment(partido.fechaPartido);
            const hora = partido.horaPartido || '12:00';
            const [h, m] = hora.split(':');

            const inicio = fecha.clone().hour(parseInt(h, 10)).minute(parseInt(m, 10));
            const fin = inicio.clone().add(1, 'hour');

            return {
              id: partido.partidoId,
              title: `${partido.equipo1.nombre} vs ${partido.equipo2.nombre}`,
              start: inicio.toDate(),
              end: fin.toDate(),
              resource: partido,
            };
          })
        );

        setEventos(eventosMapeados);
      } catch (error) {
        console.error('Error cargando partidos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartidos();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status" aria-label="Cargando partidos...">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const formats: Formats = {
    weekdayFormat: (date: Date) => moment(date).format('dddd'), // sin culture ni uso de variable
    monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY'),
    dayHeaderFormat: (date: Date) => moment(date).format('dddd, D [de] MMMM [de] YYYY'),
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format('D MMM YYYY')} – ${moment(end).format('D MMM YYYY')}`,
  };

  // SweetAlert para mostrar evento
  const handleSelectEvent = (event: EventoCalendario) => {
    const p = event.resource;
    Swal.fire({
      title: `<strong>${p.equipo1.nombre} vs ${p.equipo2.nombre}</strong>`,
      html:
        `<p><b>Jornada:</b> ${p.jornada}</p>` +
        `<p><b>Fase:</b> ${p.faseId}</p>` +
        `<p><b>Árbitro:</b> ${p.nameArbitro}</p>` +
        `<p><b>Cancha:</b> ${p.nameCancha}</p>` +
        `<p><b>Estado:</b> ${p.estado}</p>` +
        `<p><b>Fecha:</b> ${moment(p.fechaPartido).format('LL')}</p>` +
        `<p><b>Hora:</b> ${p.horaPartido}</p>`,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      customClass: {
        popup: 'shadow-lg rounded-3',
      },
    });
  };

  const handleNavigate = (newDate: Date, _view: View, _action: NavigateAction) => {
    setDate(newDate);
  };

  return (
    <div className="p-4">
      <h2 className="text-center mb-4">Calendario de Partidos</h2>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        view={view}
        onView={newView => setView(newView)}
        date={date}
        onNavigate={handleNavigate}
        popup={true}
        formats={formats}
        messages={{
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Partido',
          noEventsInRange: 'No hay partidos en este rango.',
          allDay: 'Todo el día',
        }}
        tooltipAccessor={event => {
          const p = (event as EventoCalendario).resource;
          return `Jornada ${p.jornada}\nFase: ${p.faseId}\nÁrbitro: ${p.nameArbitro}\nCancha: ${p.nameCancha}\nEstado: ${p.estado}`;
        }}
        onSelectEvent={handleSelectEvent}
      />
      <div className="text-center mt-4 d-print-none">
        <button onClick={() => window.print()} className="btn btn-primary">
          Imprimir Calendario
        </button>
      </div>
    </div>
  );
};

export default Calendario;
