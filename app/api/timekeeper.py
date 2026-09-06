from datetime import datetime

class Timekeeper:
    def __init__(self):
        self._active = False
        self._current_section = None
        self._current_speaker = None
        self._start_time = None
        self._intended_duration = None

    def start(self, section, speaker, intended_duration):
        self._current_section = section
        self._current_speaker = speaker
        self._intended_duration = intended_duration
        self._start_time = datetime.now()
        self._active = True

    def stop(self):
        if not self._active:
            return None
        
        self._active = False
        return (
            self._current_section,
            self._current_speaker,
            self._intended_duration,
            self._start_time.strftime("%Y-%m-%d"),
            self._start_time.strftime("%H:%M:%S"),
            (datetime.now() - self._start_time).total_seconds()
            )