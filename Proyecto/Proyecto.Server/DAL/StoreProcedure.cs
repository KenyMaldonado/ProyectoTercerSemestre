using System.Data;
using Microsoft.Data.SqlClient;

namespace Proyecto.Server.DAL
{
    public class StoreProcedure
    {

        private readonly string _conexionString;

        // Constructor que recibe IConfiguration
        public StoreProcedure(IConfiguration configuration)
        {
            _conexionString = configuration.GetConnectionString("MiConexion");
        }

        //Crear metodo para ejecutar un procedimiento almacenado
        public object EjecutarProcedimientoAlmacenado(string nombreSP, CommandType tipoComando, Dictionary<string, object> parametrosEntrada, List<SqlParameter> parametrosSalida = null)
        {
            using (SqlConnection conexion = new SqlConnection(_conexionString))
            {
                conexion.Open();
                using (SqlCommand cmd = new SqlCommand(nombreSP, conexion))
                {
                    cmd.CommandType = tipoComando;

                    // Agregar parámetros de entrada
                    if (parametrosEntrada != null)
                    {
                        foreach (var param in parametrosEntrada)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value);
                        }
                    }

                    // Agregar parámetros de salida
                    if (parametrosSalida != null)
                    {
                        cmd.Parameters.AddRange(parametrosSalida.ToArray());
                    }

                    // Ejecutar y retornar según el tipo de comando
                    if (tipoComando == CommandType.StoredProcedure)
                    {
                        using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            adapter.Fill(dt); // Llenar el DataTable con los resultados
                            return dt; // Retornar el DataTable
                        }
                    }
                    else if (tipoComando == CommandType.Text)
                    {
                        using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            adapter.Fill(dt);
                            return dt; // Comando de texto que devuelve un DataTable
                        }
                    }
                    else
                    {
                        return cmd.ExecuteNonQuery(); // Ejecutar sin retorno para otros casos
                    }
                }
            }
        }
    }
}
