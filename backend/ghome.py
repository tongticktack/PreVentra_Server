import os
import time
import http.server
import socket
import threading

import pychromecast
from gtts import gTTS

# ip address of Google Home must be in same network with the server
ghome_ip = '192.168.0.13'
lang = 'ko'


say = '''
어이
''' 
# get my local ip address
with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.connect(('8.8.8.8', 80))
    local_ip, _ = s.getsockname()

# set up a simple server
PORT = 8000

class StoppableHTTPServer(http.server.HTTPServer):
    def run(self):
        try:
            print('Server started at %s:%s!' % (local_ip, self.server_address[1]))
            self.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            self.server_close()

# start server in background
server = StoppableHTTPServer(('', PORT), http.server.SimpleHTTPRequestHandler)
thread = threading.Thread(None, server.run)
thread.start()

# connect to Google Home
ghome = pychromecast.Chromecast(ghome_ip)
print(ghome)
ghome.wait()
print("1")
# set volume level, no beep sound
volume = ghome.status.volume_level
ghome.set_volume(0)
print("2")
# create tts mp3
os.makedirs('cache', exist_ok=True)
fname = 'cache/cache.mp3'
#fname = '/preventra/backend/cache/cache.mp3'
print("3")
tts = gTTS(say, lang=lang)
tts.save(fname)
print("4")
# ready to serve the mp3 file from server
mc = ghome.media_controller
print("5")
mp3_path = 'http://%s:%s/%s' % (local_ip, PORT, fname)
mc.play_media(mp3_path, 'audio/mp3')
#mc.play_media('https://drive.google.com/file/d/1naqICJ3io89Hn-DRvcsn3sOMfdKqHmFB/view?usp=sharing', 'audio/mp3')
# mc.play_media('http://www.hochmuth.com/mp3/Tchaikovsky_Nocturne__orch.mp3', 'audio/mp3')
print("6")
# pause atm
mc.block_until_active()
mc.pause()
print("7")
# volume up
time.sleep(1.5)
ghome.set_volume(volume)
time.sleep(1.5)
print("8")
# play
mc.play()
print("9")
while not mc.status.player_is_idle:
    time.sleep(1)
print("10")
# kill all
mc.stop()
ghome.quit_app()
server.shutdown()
os.remove(fname)
thread.join()
print("11")