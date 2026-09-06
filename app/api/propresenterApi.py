import requests
from .exceptions import *

class PropresenterApi:
    def __init__(self, port: int = None, timer: str = None, timeout: float = 0.5):
        try:
            self.port = port
        except Exception:
            self._port = None

        try:
            self.timer = timer
        except Exception:
            self._timer = None

        self.timeout = timeout
        
    #TODO: May need to modify json
    def set_and_start_timer(self, minutes, seconds):
        payload = {
            "id": {
                "uuid": self._timer
            },
            "allows_overrun": True,
            "countdown": {
                "duration": minutes * 60 + seconds
            }
        }
        try:
            response = requests.put(f"{self.url}/v1/timer/{self._timer}/start", json=payload)
            response.raise_for_status()
            return
        except requests.exceptions.HTTPError as e:
            error_code = e.response.status_code
            if error_code == 400:
                raise InvalidTimerSet("Attempted to set timer with invalid format")
        except PropresenterNotFound as e:
            raise e
        raise PropresenterNotFound("Could not find propresenter when editing and starting timer")

    #DONE
    def stop_timer(self):
        try:
            response = requests.get(f"{self.url}/v1/timer/{self._timer}/stop")
            response.raise_for_status()
            return
        except:
            pass

        raise PropresenterNotFound("Could not find propresenter when stopping timer")

    #DONE
    def get_timers(self):
        try:
            response = requests.get(f"{self.url}/v1/timers", timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            timers = [
                {
                    "id": timer["id"]["uuid"],
                    "name": timer["id"]["name"]
                }
                for timer in data
            ]
            return timers
        except Exception:
            pass

        raise PropresenterNotFound("Could not find propresenter when requesting timers")

    @property
    def port(self):
        return self._port

    #TODO: Remove test 123
    @port.setter
    def port(self, value):
        if value == 123:
            return
        port_old = self._port
        self._port = value
        try:
            response = requests.get(f"{self.url}/version", timeout=self.timeout)
            response.raise_for_status()

            data = response.json()

            if data["host_description"].lower() == "propresenter":
                return
        except:
            pass

        self._port = port_old
        raise PropresenterNotFound(f"Could not locate Propresenter at port {value}")

    #DONE
    @property
    def timer(self):
        return self._timer

    #DONE
    @timer.setter
    def timer(self, value):
        try:
            response = requests.get(f"{self.url}/v1/timer/{value}", timeout=self.timeout)
            response.raise_for_status()
            self._timer = value
            return "success"
        except:
            pass

        raise TimerNotFound(f"Could not find timer with UUID {value}")
    #DONE
    @property
    def url(self):
        if self._port is None:
            raise PropresenterNotFound("Please enter a valid port")
        return f"http://localhost:{self._port}/"