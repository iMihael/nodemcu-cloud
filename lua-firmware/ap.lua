wifi.setmode(wifi.SOFTAP)
wifi.ap.config({
    ssid = "esp" .. node.chipid(),
    pwd = "1234567890"
})

srv=net.createServer(net.TCP) 
srv:listen(80,function(conn) 
    conn:on("receive",function(conn,payload) 
        -- print(payload) 
        
        if string.match(payload, "wS=(.+)&wP=(.+)&dI=(.+)&dP=(.+)") then
            local wS = string.match(payload, "wS=(.+)&wP")
            local wP = string.match(payload, "wP=(.+)&dI")
            local dI = string.match(payload, "dI=(.+)&dP")
            local dP = string.match(payload, "dP=(.+)")

            local json = cjson.encode({
                wS = wS,
                wP = wP,
                dI = dI,
                dP = dP
            })

            file.open("config.json", "w+")
            file.write(json)
            file.close()
            node.restart()
         end
        
        file.open("hello.min.html", "r")
        while true do
            local str = file.read(8)
            if (str == nil) then break end
            conn:send(str)
        end
        
        file.close()
        conn:close()
    end)
end)
