local l = file.list();
for name,size in pairs(l) do
  print(name)
  if name == "config.json" then 
    dofile("station.lua")
    return
  end
end


print("Config file not found.");
dofile("ap.lua")