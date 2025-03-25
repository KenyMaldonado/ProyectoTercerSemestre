using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.Models;

namespace Proyecto.Server.DAL;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CarreraSemestre> CarreraSemestres { get; set; }

    public virtual DbSet<Equipo> Equipos { get; set; }

    public virtual DbSet<Facultad> Facultads { get; set; }

    public virtual DbSet<Grupos> Grupos { get; set; }

    public virtual DbSet<Inscripcion> Inscripcions { get; set; }

    public virtual DbSet<Jugador> Jugadors { get; set; }

    public virtual DbSet<Partido> Partidos { get; set; }

    public virtual DbSet<ResultadoPartido> ResultadoPartidos { get; set; }

    public virtual DbSet<SubTorneo> SubTorneos { get; set; }

    public virtual DbSet<Torneo> Torneos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) 
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true) 
                .Build();

            optionsBuilder.UseSqlServer(configuration.GetConnectionString("MiConexion"));
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CarreraSemestre>(entity =>
        {
            entity.HasKey(e => e.CarreraId);

            entity.ToTable("Carrera_Semestre");

            entity.Property(e => e.CarreraId).HasColumnName("CarreraID");
            entity.Property(e => e.CodigoCarrera)
                .HasMaxLength(20)
                .HasColumnName("Codigo_Carrera");
            entity.Property(e => e.FacultadId).HasColumnName("Facultad_ID");
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Seccion).HasMaxLength(10);
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.ToTable("Equipo");

            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.ColorUniforme)
                .HasMaxLength(100)
                .HasColumnName("Color_Uniforme");
            entity.Property(e => e.ColorUniformeSecundario)
                .HasMaxLength(100)
                .HasColumnName("Color_Uniforme_Secundario");
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FacultadId).HasColumnName("Facultad_ID");
            entity.Property(e => e.GrupoId).HasColumnName("Grupo_ID");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");
        });

        modelBuilder.Entity<Facultad>(entity =>
        {
            entity.ToTable("Facultad");

            entity.Property(e => e.FacultadId).HasColumnName("Facultad_ID");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Grupos>(entity =>
        {
            entity.Property(e => e.GrupoId).HasColumnName("Grupo_ID");
            entity.Property(e => e.NombreGrupo)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Nombre_Grupo");
        });

        modelBuilder.Entity<Inscripcion>(entity =>
        {
            entity.ToTable("Inscripcion");

            entity.Property(e => e.InscripcionId).HasColumnName("Inscripcion_ID");
            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaInscripcion)
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Inscripcion");
            entity.Property(e => e.SubTorneoId).HasColumnName("Sub_Torneo_ID");
        });

        modelBuilder.Entity<Jugador>(entity =>
        {
            entity.ToTable("Jugador");

            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.Apellido).HasMaxLength(100);
            entity.Property(e => e.CarreraId).HasColumnName("CarreraID");
            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.Estado).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.PosicionId).HasColumnName("Posicion_ID");
        });

        modelBuilder.Entity<Partido>(entity =>
        {
            entity.ToTable("Partido");

            entity.Property(e => e.PartidoId).HasColumnName("Partido_ID");
            entity.Property(e => e.Cancha)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FaseId).HasColumnName("Fase_ID");
            entity.Property(e => e.FechaPartido)
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Partido");
            entity.Property(e => e.HoraPartido).HasColumnName("Hora_Partido");
            entity.Property(e => e.JornadaId).HasColumnName("Jornada_ID");
        });

        modelBuilder.Entity<ResultadoPartido>(entity =>
        {
            entity.ToTable("Resultado_Partido");

            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.GolesEquipo1).HasColumnName("Goles_Equipo1");
            entity.Property(e => e.GolesEquipo2).HasColumnName("Goles_Equipo2");
            entity.Property(e => e.PartidoId).HasColumnName("Partido_ID");
        });

        modelBuilder.Entity<SubTorneo>(entity =>
        {
            entity.ToTable("Sub_Torneo");

            entity.Property(e => e.SubTorneoId).HasColumnName("Sub_Torneo_ID");
            entity.Property(e => e.Categoria).HasMaxLength(50);
            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");
        });

        modelBuilder.Entity<Torneo>(entity =>
        {
            entity.ToTable("Torneo");

            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");
            entity.Property(e => e.BasesTorneo).HasColumnName("Bases_Torneo");
            entity.Property(e => e.CantidadParticipantes).HasColumnName("Cantidad_Participantes");
            entity.Property(e => e.FechaFin).HasColumnName("Fecha_Fin");
            entity.Property(e => e.FechaFinInscripcion).HasColumnName("Fecha_Fin_Inscripcion");
            entity.Property(e => e.FechaInicio).HasColumnName("Fecha_Inicio");
            entity.Property(e => e.FechaInicioInscripcion).HasColumnName("Fecha_Inicio_Inscripcion");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
