using Proyecto.Server.Models;
using System;
using System.Collections.Generic;

namespace Proyecto.Server.Models;

public partial class Noticia
{
    public int IdNoticia { get; set; }

    public string Titulo { get; set; } = null!;

    public string Contenido { get; set; } = null!;

    public string? ImagenUrl { get; set; }

    public bool? Publicado { get; set; }

    public DateTime? FechaCreacion { get; set; }

    public int UsuarioId { get; set; }

    public bool? Estado { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
