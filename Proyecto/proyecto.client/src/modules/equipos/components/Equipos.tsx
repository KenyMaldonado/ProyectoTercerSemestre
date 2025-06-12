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

import { getTorneos, getSubtorneos } from '../../admin/services/api';

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

interface Torneo {
  torneoId: number;
  nombre: string;
}

interface Subtorneo {
  subTorneoId: number;
  categoria: string;
}

const Calendario: React.FC = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [subtorneos, setSubtorneos] = useState<Subtorneo[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<number | null>(null);
  const [subtorneoSeleccionado, setSubtorneoSeleccionado] = useState<number | null>(null);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchTorneos() {
      try {
        const data = await getTorneos();
        setTorneos(data);
      } catch (error) {
        console.error('Error cargando torneos:', error);
      }
    }
    fetchTorneos();
  }, []);

  useEffect(() => {
    if (torneoSeleccionado === null) {
      setSubtorneos([]);
      setSubtorneoSeleccionado(null);
      setEventos([]);
      return;
    }

    async function fetchSubtorneos() {
      try {
        const data = await getSubtorneos(torneoSeleccionado!);
        setSubtorneos(data);
        setSubtorneoSeleccionado(null);
        setEventos([]);
      } catch (error) {
        console.error('Error cargando subtorneos:', error);
      }
    }

    fetchSubtorneos();
  }, [torneoSeleccionado]);

  useEffect(() => {
    if (subtorneoSeleccionado === null) {
      setEventos([]);
      return;
    }

    async function fetchPartidos() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/MatchesControllers/subtorneo/${subtorneoSeleccionado}/partidosPorJornada`
        );
        const data: Jornada[] = await res.json();

        const eventosMapeados: EventoCalendario[] = data.flatMap(jornada =>
          jornada.partidos.map(partido => {
            const fecha = moment(partido.fechaPartido);
            const hora = partido.horaPartido || '12:00';
            const [h, m] = hora.split(':');
            const inicio = fecha.clone().hour(parseInt(h)).minute(parseInt(m));
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
  }, [subtorneoSeleccionado]);

  const formats: Formats = {
    weekdayFormat: (date: Date) => moment(date).format('dddd'),
    monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY'),
    dayHeaderFormat: (date: Date) => moment(date).format('dddd, D [de] MMMM [de] YYYY'),
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format('D MMM YYYY')} – ${moment(end).format('D MMM YYYY')}`,
  };

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

      <div className="mb-4 d-flex justify-content-center align-items-center flex-wrap gap-3">
        <div className="form-group">
          <select
            className="form-select"
            value={torneoSeleccionado ?? ''}
            onChange={e => setTorneoSeleccionado(Number(e.target.value))}
          >
            <option value="" disabled>Seleccione un torneo</option>
            {torneos.map(t => (
              <option key={t.torneoId} value={t.torneoId}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            className="form-select"
            value={subtorneoSeleccionado ?? ''}
            onChange={e => setSubtorneoSeleccionado(Number(e.target.value))}
            disabled={!torneoSeleccionado || subtorneos.length === 0}
          >
            <option value="" disabled>Seleccione un subtorneo</option>
            {subtorneos.map(st => (
              <option key={st.subTorneoId} value={st.subTorneoId}>{st.categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : eventos.length === 0 ? (
        <p className="text-center">No hay partidos para el subtorneo seleccionado.</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          view={view}
          onView={setView}
          date={date}
          onNavigate={handleNavigate}
          popup
          formats={formats}
          onSelectEvent={handleSelectEvent} 
          culture="es"
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
          components={{
            event: ({ event }) => {
              const p = (event as EventoCalendario).resource;
              return (
                <div style={{ fontSize: '0.8rem', whiteSpace: 'normal' }}>
                  <strong>{p.equipo1.nombre} vs {p.equipo2.nombre}</strong>
                  <div>{p.horaPartido} - {p.nameCancha}</div>
                </div>
              );
            }
          }}
        />
      )}

      <div className="text-center mt-4 d-print-none">
        <button onClick={() => window.print()} className="btn btn-primary">
          Imprimir Calendario
        </button>
      </div>
    </div>
  );
};

export default Calendario;
