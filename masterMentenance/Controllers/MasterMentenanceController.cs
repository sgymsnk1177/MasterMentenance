using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Collections;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Oracle.ManagedDataAccess.Client;

namespace MasterMentenance.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MasterMentenanceController : ControllerBase
    {
        private static string dataSource, connectionString;
        private readonly ILogger<MasterMentenanceController> _logger;

        public MasterMentenanceController(ILogger<MasterMentenanceController> logger)
        {
            _logger = logger;

            // DB情報設定
            dataSource = "";
            connectionString = "" + dataSource;
        }

        [HttpGet]
        public Hashtable Get()
        {
            var result = new Hashtable() { { "MSG", "NG" } };
            string TYPE = Request.Query["TYPE"],
                   DATA_KBN = Request.Query["DATA_KBN"];
            try
            {
                if (TYPE.Equals("GET"))
                {
                    var list = gfGetMasterDataFromDB(DATA_KBN);
                    result = new Hashtable() { { "MSG", "OK" }, { "LIST", list } };
                }

                if (TYPE.Equals("GET_DATA_KBN"))
                {
                    var list = gfGetDataKbn();
                    result = new Hashtable() { { "MSG", "OK" }, { "LIST", list } };
                }
                return result;
            }
            catch(Exception ex)
            {
                result["EXCEPTION"] = ex.ToString();
                return result;
            }
        }

        [HttpPost]
        public Hashtable Post()
        {
            //[FromBody] object ojb の形で受け取っても良いかも(保留)

            //Request.Body.Seek(0, System.IO.SeekOrigin.Begin);
            //using(var stream = new System.IO.StreamReader(Request.Body))
            //{
            //    string body = stream.ReadToEnd();
            //}
            return gfMainProcess();
        }

        //　httpresponsemessageで返却
        //[HttpPost]
        //public HttpResponseMessage Post()
        //{
        //    var response = new HttpResponseMessage();
        //    var list = getMasterDataFromDB();
        //    var result = new Hashtable() { { "MSG", "OK" }, { "LIST", list } };
        //    response.StatusCode = System.Net.HttpStatusCode.OK;
        //    response.Content = new StringContent(JsonConvert.SerializeObject(result), System.Text.Encoding.UTF8, "application/json");

        //    return response;
        //}

        private async Task<Hashtable[]> gfGetMasterDataFromWebApi()
        {
            var client = new HttpClient();
            //var list = new List<Hashtable>();

            var response = await client.GetAsync("http://192.168.1.212/WebApi/EpalKyotenRegWebApi/api/GetHaisoList?haiso_kana=123");
            var json = await response.Content.ReadAsStringAsync();
            
            if (string.IsNullOrEmpty(json))
            {
                return null;
            }

            var data = JsonConvert.DeserializeObject<Hashtable>(json);
            var jArray = (JArray)data["LIST"];
            var list = jArray.Select(x => x.ToObject<Hashtable>()).ToArray();

            return list.ToArray();
        }

        private Hashtable gfMainProcess()
        {
            var result = new Hashtable() { { "MSG", "NG" } };
            var TYPE = Request.Form["TYPE"].FirstOrDefault();
            var ID = Request.Form["ID"].FirstOrDefault();
            var JSON_ITEM = Request.Form["ITEM"].FirstOrDefault();
            try
            {
                bool res;
                if (!string.IsNullOrEmpty(JSON_ITEM))
                {
                    var ITEM = JsonConvert.DeserializeObject<Hashtable>(JSON_ITEM);
                    if (TYPE.Equals("INSERT"))
                    {
                        res = gfInsertMasterData(ref ITEM);
                        result = new Hashtable() { { "MSG", "OK" }, { "RES", res }, { "ITEM", ITEM } };
                    }
                    if (TYPE.Equals("UPDATE"))
                    {
                        res = gfUpdateMasterData(ITEM);
                        result = new Hashtable() { { "MSG", "OK" }, { "RES", res } };
                    }
                }
                if (TYPE.Equals("DELETE"))
                {
                    res = gfDeleteMasterData(ID);
                    result = new Hashtable() { { "MSG", "OK" }, { "RES", res } };
                }
                return result;
            }
            catch
            {
                return result;
            }
        }

        private static Hashtable[] gfGetMasterDataFromDB(string DATA_KBN = "0")
        {            
            string sql = @"select ID,DATA_KBN,USER_NAME,MAIL_ADDRESS,BIKO,HYOJI_JUN
                            from m_mailing_list a
                            where nvl(a.delete_flg,'0') != '1'
                            and a.data_kbn = '" + DATA_KBN + @"'
                        ";
            var list = gfGetList(sql);
            return list;
        }

        private static Hashtable[] gfGetDataKbn()
        {
            string sql = @"select distinct a.data_kbn
                            from m_mailing_list a
                            where nvl(a.delete_flg,'0') != '1'                            
                        ";
            var list = gfGetList(sql);
            return list;
        }

        private static bool gfInsertMasterData(ref Hashtable ITEM)
        {
            OracleTransaction tr = null;

            try
            {
                using (OracleConnection con = new OracleConnection(connectionString))
                {
                    con.Open();
                    tr = con.BeginTransaction();

                    ITEM["ID"] = gfGetNextVal(con);
                    ITEM["HYOJI_JUN"] = ITEM["ID"];

                    string sqlKey = default;
                    string sqlVal = default;

                    foreach (var key in ITEM.Keys)
                    {
                        sqlKey += Convert.ToString(key) + ",";

                        double numdata = 0;
                        if (double.TryParse(ITEM[key].ToString(), out numdata))
                        {
                            sqlVal += numdata + ",";
                        }
                        else
                            sqlVal += "'" + Convert.ToString(ITEM[key]) + "',";
                    }
                    sqlKey += "create_date";
                    sqlVal += "sysdate";

                    var sql = "insert into m_mailing_list (" + sqlKey  + ") values (" + sqlVal + ")";

                    OracleCommand command = new OracleCommand(sql);
                    command.Connection = con;
                    var result = command.ExecuteNonQuery();
                    if (result != 1)
                    {
                        throw new Exception("error");
                    }
                    tr.Commit();
                }
                return true;
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.ToString());
                if (tr != null)
                {
                    tr.Rollback();
                }
                return false;
            }
        }

        private static bool gfUpdateMasterData(Hashtable ITEM)
        {
            OracleTransaction tr = null;

            try
            {
                using (OracleConnection con = new OracleConnection(connectionString))
                {
                    con.Open();
                    tr = con.BeginTransaction();

                    var id = ITEM["ID"].ToString();
                    var data = (Hashtable)ITEM.Clone();
                    data.Remove("ID");

                    var array = new List<string>();
                    foreach (DictionaryEntry d in data)
                    {
                        array.Add(d.Key.ToString() + " = '" + d.Value.ToString() + "'");                        
                    }
                    var sqlUpdate = string.Join(",", array);

                    string sql = @"update m_mailing_list
                                   set " + sqlUpdate + @"
                                        ,update_date = sysdate
                                   where id = '" + id + @"'
                                 ";

                    OracleCommand command = new OracleCommand(sql);
                    command.Connection = con;
                    var result = command.ExecuteNonQuery();
                    if (result != 1)
                    {
                        throw new Exception("error");
                    }
                    tr.Commit();
                }
                return true;
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.ToString());
                if (tr != null)
                {
                    tr.Rollback();
                }
                return false;
            }
        }

        private static bool gfDeleteMasterData(string ID)
        {
            OracleTransaction tr = null;

            try
            {
                using (OracleConnection con = new OracleConnection(connectionString))
                {
                    con.Open();
                    tr = con.BeginTransaction();

                    string sql = @"update m_mailing_list a
                                    set delete_flg = '1'
                                       ,update_date = sysdate
                                        where nvl(a.delete_flg,'0') != '1'
                                        and a.id = " + ID + @"
                                     ";
                    OracleCommand command = new OracleCommand(sql);
                    command.Connection = con;
                    var result = command.ExecuteNonQuery();
                    if (result != 1)
                    {
                        throw new Exception("error");
                    }
                    tr.Commit();                    
                }
                return true;
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.ToString());
                if (tr != null)
                {
                    tr.Rollback();
                }
                return false;
            }
        }

        private static string gfGetNextVal (OracleConnection connection)
        {
            var list = gfGetList("select seq_m_mailing_list_id.nextval from dual");
            if (list.Any())
            {
                var h = list.First();
                var nextVal = Convert.ToString(h["NEXTVAL"]);
                return nextVal;
            }
            throw new Exception("Sequence取得エラー");
        }

        private static Hashtable[] gfGetList(string sql)
        {
            var list = new List<Hashtable>();
            using (OracleConnection con = new OracleConnection(connectionString))
            {
                try
                {
                    con.Open();
                    OracleCommand command = new OracleCommand(sql);
                    command.Connection = con;
                    var reader = command.ExecuteReader();

                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            var row = new Hashtable();
                            for (int i = 0; i <= reader.FieldCount - 1; i++)
                            {
                                row[reader.GetName(i)] = reader.GetValue(i);
                            }
                            list.Add(row);
                        }
                    }
                }
                catch (Exception exception)
                {
                    Console.WriteLine(exception.ToString());
                    return null;
                }
            }

            return list.ToArray();
        }

    }
}
