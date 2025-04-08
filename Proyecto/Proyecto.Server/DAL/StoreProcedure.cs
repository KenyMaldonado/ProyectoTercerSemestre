using System.Data;
using MySql.Data.MySqlClient;

namespace Proyecto.Server.DAL
{
    public class StoreProcedure
    {

        private readonly string _conexionString;

        public StoreProcedure(IConfiguration configuration)
        {
            _conexionString = configuration.GetConnectionString("MiConexion");
        }

        public object EjecutarProcedimientoAlmacenado(string nombreSP, CommandType tipoComando, Dictionary<string, object> parametrosEntrada, List<MySqlParameter> parametrosSalida = null)
        {
            using (MySqlConnection conexion = new MySqlConnection(_conexionString))
            {
                conexion.Open();
                using (MySqlCommand cmd = new MySqlCommand(nombreSP, conexion))
                {
                    cmd.CommandType = tipoComando;

                    if (parametrosEntrada != null)
                    {
                        foreach (var param in parametrosEntrada)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value);
                        }
                    }

                    if (parametrosSalida != null)
                    {
                        cmd.Parameters.AddRange(parametrosSalida.ToArray());
                    }

                    if (tipoComando == CommandType.StoredProcedure)
                    {
                        using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            adapter.Fill(dt);
                            return dt; 
                        }
                    }
                    else if (tipoComando == CommandType.Text)
                    {
                        using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            adapter.Fill(dt);
                            return dt;
                        }
                    }
                    else
                    {
                        return cmd.ExecuteNonQuery();
                    }
                }
            }
        }
    }
}
