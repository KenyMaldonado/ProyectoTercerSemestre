namespace Proyecto.Server.Utils
{
    public class CustomException : Exception
    {
        public int ErrorCode { get; set; }

        public CustomException(string message) : base(message) { }

        public CustomException(string message, int errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}
