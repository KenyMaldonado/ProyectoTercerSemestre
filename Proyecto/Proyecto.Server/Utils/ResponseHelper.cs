using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.Utils;

public static class ResponseHelper
{
    public static IActionResult Success(string message, object data = null)
    {
        var response = new
        {
            success = true,
            message,
            data
        };
        return new OkObjectResult(response);
    }

    public static IActionResult Created(string message, object data = null)
    {
        var response = new
        {
            success = true,
            message,
            data
        };
        return new ObjectResult(response) { StatusCode = 201 };
    }


    public static IActionResult HandleCustomException(CustomException ex)
    {
        var errorResponse = new
        {
            success = false,
            message = ex.Message
        };

        return ex.ErrorCode switch
        {
            404 => new NotFoundObjectResult(errorResponse),
            401 => new UnauthorizedObjectResult(errorResponse),
            409 => new ConflictObjectResult(errorResponse),
            400 => new BadRequestObjectResult(errorResponse),
            _ => new BadRequestObjectResult(errorResponse)
        };
    }

    public static IActionResult HandleGeneralException(Exception ex)
    {
        var errorResponse = new
        {
            success = false,
            message = "Error inesperado: " + ex.Message
        };

        return new ObjectResult(errorResponse)
        {
            StatusCode = 500
        };
    }
}
