using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.Models;

namespace Proyecto.Server.DAL;
/// <summary>
/// 
/// </summary>
public partial class AppDbContext : DbContext
{
    /// <summary>
    /// 
    /// </summary>
    public AppDbContext()
    {
    }
    /// <summary>
    /// 
    /// </summary>
    /// <param name="options"></param>
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public virtual DbSet<Cambio> Cambios { get; set; }
    public virtual DbSet<Cancha> Canchas { get; set; }
    public virtual DbSet<Capitan> Capitans { get; set; }
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
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            optionsBuilder.UseMySql(
                configuration.GetConnectionString("MiConexion"),
                ServerVersion.AutoDetect(configuration.GetConnectionString("MiConexion"))
            );
        }
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cambio>(entity =>
        {
            entity.HasKey(e => e.CambioId).HasName("PRIMARY");

            entity.ToTable("cambio");

            entity.HasIndex(e => e.JugadorEntrada, "IX_Relationship47");

            entity.HasIndex(e => e.JugadorSalida, "IX_Relationship48");

            entity.HasIndex(e => e.EquipoId, "IX_Relationship49");

            entity.HasIndex(e => e.PartidoId, "Relationship46");

            entity.Property(e => e.CambioId).HasColumnName("Cambio_ID");
            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.JugadorEntrada).HasColumnName("Jugador_Entrada");
            entity.Property(e => e.JugadorSalida).HasColumnName("Jugador_Salida");
            entity.Property(e => e.PartidoId).HasColumnName("Partido_ID");

            entity.HasOne(d => d.Equipo).WithMany(p => p.Cambios)
                .HasForeignKey(d => d.EquipoId)
                .HasConstraintName("Relationship49");

            entity.HasOne(d => d.JugadorEntradaNavigation).WithMany(p => p.Cambios)
                .HasForeignKey(d => d.JugadorEntrada)
                .HasConstraintName("Relationship47");

            entity.HasOne(d => d.Partido).WithMany(p => p.Cambios)
                .HasForeignKey(d => d.PartidoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship46");
        });

        modelBuilder.Entity<Cancha>(entity =>
        {
            entity.HasKey(e => e.CanchaId).HasName("PRIMARY");

            entity.ToTable("cancha");

            entity.Property(e => e.CanchaId).HasColumnName("Cancha_ID");
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<Capitan>(entity =>
        {
            entity.HasKey(e => e.CapitanId).HasName("PRIMARY");

            entity.ToTable("capitan");

            entity.HasIndex(e => e.JugadorId, "FK_Capitan_Jugador");

            entity.Property(e => e.CapitanId).HasColumnName("Capitan_ID");
            entity.Property(e => e.CorreoElectronico)
                .HasMaxLength(100)
                .HasColumnName("Correo_Electronico");
            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.Telefono)
                .HasMaxLength(8)
                .IsFixedLength();

            entity.HasOne(d => d.Jugador).WithMany(p => p.Capitans)
                .HasForeignKey(d => d.JugadorId)
                .HasConstraintName("FK_Capitan_Jugador");
        });

        modelBuilder.Entity<CarreraSemestre>(entity =>
        {
            entity.HasKey(e => e.CarreraId).HasName("PRIMARY");

            entity.ToTable("carrera_semestre");

            entity.HasIndex(e => e.FacultadId, "Relationship15");

            entity.Property(e => e.CarreraId).HasColumnName("CarreraID");
            entity.Property(e => e.CodigoCarrera)
                .HasMaxLength(20)
                .HasColumnName("Codigo_Carrera");
            entity.Property(e => e.FacultadId).HasColumnName("Facultad_ID");
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Seccion).HasMaxLength(10);

            entity.HasOne(d => d.Facultad).WithMany(p => p.CarreraSemestres)
                .HasForeignKey(d => d.FacultadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship15");
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.HasKey(e => e.EquipoId).HasName("PRIMARY");

            entity.ToTable("equipo");

            entity.HasIndex(e => e.GrupoId, "Relationship10");

            entity.HasIndex(e => e.FacultadId, "Relationship16");

            entity.HasIndex(e => e.TorneoId, "Relationship3");

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

            entity.HasOne(d => d.Facultad).WithMany(p => p.Equipos)
                .HasForeignKey(d => d.FacultadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship16");

            entity.HasOne(d => d.Grupo).WithMany(p => p.Equipos)
                .HasForeignKey(d => d.GrupoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship10");

            entity.HasOne(d => d.Torneo).WithMany(p => p.Equipos)
                .HasForeignKey(d => d.TorneoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship3");
        });

        modelBuilder.Entity<Facultad>(entity =>
        {
            entity.HasKey(e => e.FacultadId).HasName("PRIMARY");

            entity.ToTable("facultad");

            entity.Property(e => e.FacultadId).HasColumnName("Facultad_ID");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<FaseEliminacion>(entity =>
        {
            entity.HasKey(e => e.FaseId).HasName("PRIMARY");

            entity.ToTable("fase_eliminacion");

            entity.Property(e => e.FaseId).HasColumnName("Fase_ID");
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<Goles>(entity =>
        {
            entity.HasKey(e => e.GolId).HasName("PRIMARY");

            entity.ToTable("goles");

            entity.HasIndex(e => e.ResultadoPartidoId, "Relationship37");

            entity.HasIndex(e => e.JugadorId, "Relationship39");

            entity.HasIndex(e => e.TipoGolId, "Relationship43");

            entity.Property(e => e.GolId).HasColumnName("Gol_ID");
            entity.Property(e => e.EsTiempoExtra).HasColumnName("Es_Tiempo_Extra");
            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.MinutoGol).HasColumnName("Minuto_Gol");
            entity.Property(e => e.OrdenPenal).HasColumnName("Orden_Penal");
            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.TipoGolId).HasColumnName("Tipo_Gol_ID");

            entity.HasOne(d => d.Jugador).WithMany(p => p.Goles)
                .HasForeignKey(d => d.JugadorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship39");

            entity.HasOne(d => d.ResultadoPartido).WithMany(p => p.Goles)
                .HasForeignKey(d => d.ResultadoPartidoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship37");

            entity.HasOne(d => d.TipoGol).WithMany(p => p.Goles)
                .HasForeignKey(d => d.TipoGolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship43");
        });

        modelBuilder.Entity<Grupos>(entity =>
        {
            entity.HasKey(e => e.GrupoId).HasName("PRIMARY");

            entity.ToTable("grupos");

            entity.Property(e => e.GrupoId).HasColumnName("Grupo_ID");
            entity.Property(e => e.NombreGrupo)
                .HasMaxLength(1)
                .IsFixedLength()
                .HasColumnName("Nombre_Grupo");
        });

        modelBuilder.Entity<Inscripcion>(entity =>
        {
            entity.HasKey(e => e.InscripcionId).HasName("PRIMARY");

            entity.ToTable("inscripcion");

            entity.HasIndex(e => e.SubTorneoId, "Relationship18");

            entity.HasIndex(e => e.EquipoId, "Relationship6");

            entity.Property(e => e.InscripcionId).HasColumnName("Inscripcion_ID");
            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaInscripcion)
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Inscripcion");
            entity.Property(e => e.SubTorneoId).HasColumnName("Sub_Torneo_ID");

            entity.HasOne(d => d.Equipo).WithMany(p => p.Inscripcions)
                .HasForeignKey(d => d.EquipoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship6");

            entity.HasOne(d => d.SubTorneo).WithMany(p => p.Inscripcions)
                .HasForeignKey(d => d.SubTorneoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship18");
        });

        modelBuilder.Entity<Jornada>(entity =>
        {
            entity.HasKey(e => e.JornadaId).HasName("PRIMARY");

            entity.ToTable("jornada");

            entity.Property(e => e.JornadaId).HasColumnName("Jornada_ID");
            entity.Property(e => e.NumeroJornada).HasColumnName("Numero_Jornada");
        });

        modelBuilder.Entity<Jugador>(entity =>
        {
            entity.HasKey(e => e.JugadorId).HasName("PRIMARY");

            entity.ToTable("jugador");

            entity.HasIndex(e => e.EquipoId, "Relationship1");

            entity.HasIndex(e => e.PosicionId, "Relationship35");

            entity.HasIndex(e => e.CarreraId, "Relationship4");

            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.Apellido).HasMaxLength(100);
            entity.Property(e => e.CarreraId).HasColumnName("CarreraID");
            entity.Property(e => e.EquipoId).HasColumnName("Equipo_ID");
            entity.Property(e => e.Estado).HasMaxLength(100);
            entity.Property(e => e.Fotografia).HasColumnType("text");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.PosicionId).HasColumnName("Posicion_ID");

            entity.HasOne(d => d.Carrera).WithMany(p => p.Jugadors)
                .HasForeignKey(d => d.CarreraId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship4");

            entity.HasOne(d => d.Equipo).WithMany(p => p.Jugadors)
                .HasForeignKey(d => d.EquipoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship1");

            entity.HasOne(d => d.Posicion).WithMany(p => p.Jugadors)
                .HasForeignKey(d => d.PosicionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship35");
        });

        modelBuilder.Entity<Partido>(entity =>
        {
            entity.HasKey(e => e.PartidoId).HasName("PRIMARY");

            entity.ToTable("partido");

            entity.HasIndex(e => e.Equipo2, "Relationship22");

            entity.HasIndex(e => e.JornadaId, "Relationship31");

            entity.HasIndex(e => e.UsuarioId, "Relationship42");

            entity.Property(e => e.PartidoId).HasColumnName("Partido_ID");
            entity.Property(e => e.Cancha)
                .HasMaxLength(1)
                .IsFixedLength();
            entity.Property(e => e.CanchaId).HasColumnName("Cancha_ID");
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FaseId).HasColumnName("Fase_ID");
            entity.Property(e => e.FechaPartido)
                .HasColumnType("datetime")
                .HasColumnName("Fecha_Partido");
            entity.Property(e => e.HoraPartido)
                .HasColumnType("time")
                .HasColumnName("Hora_Partido");
            entity.Property(e => e.JornadaId).HasColumnName("Jornada_ID");
            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");

            entity.HasOne(d => d.Equipo2Navigation).WithMany(p => p.Partidos)
                .HasForeignKey(d => d.Equipo2)
                .HasConstraintName("Relationship22");

            entity.HasOne(d => d.Jornada).WithMany(p => p.Partidos)
                .HasForeignKey(d => d.JornadaId)
                .HasConstraintName("Relationship31");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Partidos)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship42");
        });

        modelBuilder.Entity<PosicionJugador>(entity =>
        {
            entity.HasKey(e => e.PosicionId).HasName("PRIMARY");

            entity.ToTable("posicion_jugador");

            entity.Property(e => e.PosicionId).HasColumnName("Posicion_ID");
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<ResultadoPartido>(entity =>
        {
            entity.HasKey(e => e.ResultadoPartidoId).HasName("PRIMARY");

            entity.ToTable("resultado_partido");

            entity.HasIndex(e => e.PartidoId, "Relationship23");

            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.GolesEquipo1).HasColumnName("Goles_Equipo1");
            entity.Property(e => e.GolesEquipo2).HasColumnName("Goles_Equipo2");
            entity.Property(e => e.PartidoId).HasColumnName("Partido_ID");

            entity.HasOne(d => d.Partido).WithMany(p => p.ResultadoPartidos)
                .HasForeignKey(d => d.PartidoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship23");
        });

        modelBuilder.Entity<SubTorneo>(entity =>
        {
            entity.HasKey(e => e.SubTorneoId).HasName("PRIMARY");

            entity.ToTable("sub_torneo");

            entity.HasIndex(e => e.TorneoId, "Relationship17");

            entity.Property(e => e.SubTorneoId).HasColumnName("Sub_Torneo_ID");
            entity.Property(e => e.Categoria).HasMaxLength(50);
            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");

            entity.HasOne(d => d.Torneo).WithMany(p => p.SubTorneos)
                .HasForeignKey(d => d.TorneoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship17");
        });

        modelBuilder.Entity<Tarjeta>(entity =>
        {
            entity.HasKey(e => e.TarjetaId).HasName("PRIMARY");

            entity.ToTable("tarjeta");

            entity.HasIndex(e => e.ResultadoPartidoId, "Relationship33");

            entity.HasIndex(e => e.JugadorId, "Relationship34");

            entity.Property(e => e.TarjetaId).HasColumnName("Tarjeta_ID");
            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.JugadorId).HasColumnName("Jugador_ID");
            entity.Property(e => e.MinutoTarjeta).HasColumnName("Minuto_Tarjeta");
            entity.Property(e => e.ResultadoPartidoId).HasColumnName("Resultado_Partido_ID");
            entity.Property(e => e.TipoTarjeta)
                .HasMaxLength(15)
                .HasColumnName("Tipo_Tarjeta");

            entity.HasOne(d => d.Jugador).WithMany(p => p.Tarjeta)
                .HasForeignKey(d => d.JugadorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship34");

            entity.HasOne(d => d.ResultadoPartido).WithMany(p => p.Tarjeta)
                .HasForeignKey(d => d.ResultadoPartidoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship33");
        });

        modelBuilder.Entity<TipoGol>(entity =>
        {
            entity.HasKey(e => e.TipoGolId).HasName("PRIMARY");

            entity.ToTable("tipo_gol");

            entity.Property(e => e.TipoGolId).HasColumnName("Tipo_Gol_ID");
            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TipoRol>(entity =>
        {
            entity.HasKey(e => e.RolId).HasName("PRIMARY");

            entity.ToTable("tipo_rol");

            entity.Property(e => e.RolId).HasColumnName("Rol_ID");
            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TipoTorneo>(entity =>
        {
            entity.HasKey(e => e.TipoTorneoId).HasName("PRIMARY");

            entity.ToTable("tipo_torneo");

            entity.Property(e => e.TipoTorneoId).HasColumnName("Tipo_Torneo_ID");
            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Torneo>(entity =>
        {
            entity.HasKey(e => e.TorneoId).HasName("PRIMARY");

            entity.ToTable("torneo");

            entity.HasIndex(e => e.UsuarioId, "Relationship30");

            entity.HasIndex(e => e.TipoTorneoId, "Relationship41");

            entity.Property(e => e.TorneoId).HasColumnName("Torneo_ID");
            entity.Property(e => e.BasesTorneo)
                .HasColumnType("text")
                .HasColumnName("Bases_Torneo");
            entity.Property(e => e.CantidadParticipantes).HasColumnName("Cantidad_Participantes");
            entity.Property(e => e.Descripcion).HasColumnType("text");
            entity.Property(e => e.FechaFin)
                .HasColumnType("date")
                .HasColumnName("Fecha_Fin");
            entity.Property(e => e.FechaFinInscripcion)
                .HasColumnType("date")
                .HasColumnName("Fecha_Fin_Inscripcion");
            entity.Property(e => e.FechaInicio)
                .HasColumnType("date")
                .HasColumnName("Fecha_Inicio");
            entity.Property(e => e.FechaInicioInscripcion)
                .HasColumnType("date")
                .HasColumnName("Fecha_Inicio_Inscripcion");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.TipoTorneoId).HasColumnName("Tipo_Torneo_ID");
            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");

            entity.HasOne(d => d.TipoTorneo).WithMany(p => p.Torneos)
                .HasForeignKey(d => d.TipoTorneoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship41");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Torneos)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship30");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("PRIMARY");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.RolId, "Relationship40");

            entity.Property(e => e.UsuarioId).HasColumnName("Usuario_ID");
            entity.Property(e => e.Apellido).HasMaxLength(50);
            entity.Property(e => e.CorreoElectronico)
                .HasMaxLength(100)
                .HasColumnName("Correo_Electronico");
            entity.Property(e => e.Estado).HasMaxLength(25);
            entity.Property(e => e.Nombre).HasMaxLength(50);
            entity.Property(e => e.PasswordUser)
                .HasMaxLength(300)
                .HasColumnName("Password_User");
            entity.Property(e => e.RolId).HasColumnName("Rol_ID");
            entity.Property(e => e.UsuarioCreo)
                .HasMaxLength(100)
                .HasColumnName("Usuario_Creo");

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Relationship40");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
