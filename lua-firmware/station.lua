file.open("config.json", "r")
local json = cjson.decode(file.readline())

wifi.setmode(wifi.STATION)
wifi.sta.config(json["wS"], json["wP"], 1)
wifi.sta.connect()
file.close()

function handler(conn, payload)
    loadstring(payload)()
end

function printc(s)
    client:send(s .. "\n")
end

client = nil

srv=net.createServer(net.TCP, 3600) 
srv:listen(23,function(conn) 
    client = conn
    conn:on("receive",function(conn,payload) 
        if pcall(handler, conn, payload) then
            conn:send("OK\n")
        else
            conn:send("ERROR\n")
        end
    end)
end)