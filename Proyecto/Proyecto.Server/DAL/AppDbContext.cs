using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
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

    public virtual DbSet<FaseEliminacion> FaseEliminacions { get; set; }

    public virtual DbSet<Goles> Goles { get; set; }

    public virtual DbSet<Grupos> Grupos { get; set; }

    public virtual DbSet<Inscripcion> Inscripcions { get; set; }

    public virtual DbSet<Jornada> Jornada { get; set; }

    public virtual DbSet<Jugador> Jugadors { get; set; }

    public virtual DbSet<Partido> Partidos { get; set; }

    public virtual DbSet<PosicionJugador> PosicionJugadors { get; set; }

    public virtual DbSet<ResultadoPartido> ResultadoPartidos { get; set; }

    public virtual DbSet<SubTorneo> SubTorneos { get; set; }

    public virtual DbSet<Tarjeta> Tarjeta { get; set; }

    public virtual DbSet<Torneo> Torneos { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var configuration = new  ConfigurationBuilder()
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

        modelBuilder.Entity<FaseEliminacion>(entity =>
        {
            entity.HasKey(e => e.FaseId);

            entity.ToTable("Fase_Eliminacion");

            entity.Property(e => e.FaseId).HasColumnName("Fase_ID");
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<Goles>(entity =>
        {
            entity.HasKey(e => e.GolId);

            entity.Property(e => e.GolId).HasColumnName("Gol_ID");
            entity.Property(e => e.EsTiempoExtra).HasColumnName("Es_Tiempo_Extra");
            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.MinutoGol).HasColumnName("Minuto_Gol");
            entity.Property(e => e.OrdenPenal).HasColumnName("Orden_Penal");
            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.TipoGol)
                .HasMaxLength(50)
                .HasColumnName("Tipo_Gol");
        });

        modelBuilder.Entity<Grupos>(entity =>
        {
            entity.HasKey(e => e.GrupoId);

            entity.Property(e => e.GrupoId).HasColumnName("Grupo_ID");
            entity.Property(e => e.NombreGrupo)
                .HasMaxLength(10)
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

        modelBuilder.Entity<Jornada>(entity =>
        {
            entity.HasKey(e => e.JornadaId);

            entity.Property(e => e.JornadaId).HasColumnName("Jornada_ID");
            entity.Property(e => e.NumeroJornada).HasColumnName("Numero_Jornada");
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
            entity.Property(e => e.Cancha).HasMaxLength(10);
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FaseId).HasColumnName("Fase_ID");
            entity.Property(e => e.FechaPartido)
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Partido");
            entity.Property(e => e.HoraPartido).HasColumnName("Hora_Partido");
            entity.Property(e => e.JornadaId).HasColumnName("Jornada_ID");
        });

        modelBuilder.Entity<PosicionJugador>(entity =>
        {
            entity.HasKey(e => e.PosicionId);

            entity.ToTable("Posicion_Jugador");

            entity.Property(e => e.PosicionId).HasColumnName("Posicion_ID");
            entity.Property(e => e.Nombre).HasMaxLength(50);
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

            entity.HasOne(d => d.Torneo).WithMany(p => p.SubTorneos)
                .HasForeignKey(d => d.TorneoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubTorneo_Torneo");
        });

        modelBuilder.Entity<Tarjeta>(entity =>
        {
            entity.HasKey(e => e.TarjetaId);

            entity.Property(e => e.TarjetaId).HasColumnName("Tarjeta_ID");
            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.MinutoTarjeta).HasColumnName("Minuto_Tarjeta");
            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.TipoTarjeta)
                .HasMaxLength(15)
                .HasColumnName("Tipo_Tarjeta");
        });

        modelBuilder.Entity<Torneo>(entity =>
        {
            entity.ToTable("Torneo");

            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");
            entity.Property(e => e.BasesTorneo).HasColumnName("Bases_Torneo");
            entity.Property(e => e.CantidadParticipantes).HasColumnName("Cantidad_Participantes");
            entity.Property(e => e.EquipoMax).HasColumnName("Equipo_Max");
            entity.Property(e => e.EquipoMin).HasColumnName("Equipo_Min");
            entity.Property(e => e.FechaFin).HasColumnName("Fecha_Fin");
            entity.Property(e => e.FechaFinInscripcion).HasColumnName("Fecha_Fin_Inscripcion");
            entity.Property(e => e.FechaInicio).HasColumnName("Fecha_Inicio");
            entity.Property(e => e.FechaInicioInscripcion).HasColumnName("Fecha_Inicio_Inscripcion");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Torneos)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Torneo_Usuario");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuario");

            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");
            entity.Property(e => e.Apellido).HasMaxLength(50);
            entity.Property(e => e.Contrasenia).HasMaxLength(255);
            entity.Property(e => e.CorreoElectronico)
                .HasMaxLength(100)
                .HasColumnName("Correo_Electronico");
            entity.Property(e => e.Estado).HasMaxLength(25);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Creacion");
            entity.Property(e => e.Nombre).HasMaxLength(50);
            entity.Property(e => e.TipoRol)
                .HasMaxLength(50)
                .HasColumnName("Tipo_Rol");
            entity.Property(e => e.UsuarioCreo).HasColumnName("Usuario_Creo");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
