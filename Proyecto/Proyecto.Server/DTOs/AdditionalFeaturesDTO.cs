namespace Proyecto.Server.DTOs
{
    public class AdditionalFeaturesDTO
    {

        public class NewsDTO
        {
            public int NewsId { get; set; }
            public string Title { get; set; } = null!;
            public string Content { get; set; } = null!;
            public string? ImageUrl { get; set; }   
            public bool? Published { get; set; }
            public DateTime? CreationDate { get; set; }
            public int CreateByUserID { get; set; }
        }

        public class GetNewsDTO
        {
            public int NewsId { get; set; }
            public string Title { get; set; } = null!;
            public string Content { get; set; } = null!;
            public string? ImageUrl { get; set; }
            public bool? Published { get; set; }
            public DateTime? CreationDate { get; set; }
            public int CreateByUserID { get; set; }
            public string NameUsuario { get; set; }
        }
    }
}
