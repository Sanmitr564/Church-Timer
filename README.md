# Church Timer

A web-based timer management application built with Python and Flask that integrates with ProPresenter through its local API. Meant to help manage timers for any stage of the service, and automatically log time taken for each stage.

## Features

- **Timer Management**
  - Create and remove timers.
  - Edit timer names, speakers, and intended durations.
  - Reorder timers to match the order of a service.
  - Merge adjacent timers when needed.
  - Track the currently active timer.

- **ProPresenter Integration**
  - Connect to ProPresenter through its local API.
  - Retrieve available ProPresenter timers.
  - Select, start, and stop ProPresenter timers through the application.

- **Timekeeping**
  - Track the start time and elapsed time of each session.
  - Associate timers with a section and speaker.
  - Record completed sessions in a CSV file.

## Technologies

- Python
- Flask
- Requests
- JavaScript
- HTML/CSS
- CSV

## Project Structure

```text
Church-Timer/
├── app/
│   ├── api/
│   │   ├── errors.py
│   │   ├── exceptions.py
│   │   ├── propresenterApi.py
│   │   ├── routes.py
│   │   └── timekeeper.py
│   ├── main/
│   │   └── routes.py
│   ├── static/
│   │   ├── app.js
│   │   └── style.css
│   ├── templates/
│   │   └── index.html
│   └── __init__.py
└── wsgi.py
```

## Installation

### Requirements

- Python 3
- ProPresenter with its network functionality enabled

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Sanmitr564/Church-Timer.git
   cd Church-Timer
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   ```

   On Windows:

   ```bash
   venv\Scripts\activate
   ```

   On macOS/Linux:

   ```bash
   source venv/bin/activate
   ```

3. Install the dependencies:

   ```bash
   pip install Flask requests
   ```

4. Start the application:

   ```bash
   python wsgi.py
   ```

5. Open the application in your browser:

   ```text
   http://127.0.0.1:5000
   ```

(Optional): Can alternatively be deployed using a WSGI server. See https://flask.palletsprojects.com/en/stable/deploying/ for more info

## ProPresenter Configuration

Church Timer communicates with ProPresenter through its local API.

Before connecting:

1. Start ProPresenter.
2. Enable the network functionality in ProPresenter.
3. Locate the port used by the ProPresenter API.
4. Enter the API port in Church Timer and connect.

The application currently requires the API port to be entered manually.

**ProPresenter version:** The specific version used during development has not yet been confirmed.

## API Endpoints

The Flask application exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/timers` | Retrieve available ProPresenter timers. |
| PUT | `/api/timers/select/<timer_id>` | Select a ProPresenter timer. |
| PUT | `/api/timers/start` | Start a timer and begin tracking a session. |
| PUT | `/api/timers/stop` | Stop the active timer and record the session. |
| GET | `/api/port/get` | Retrieve the configured ProPresenter API port. |
| PUT | `/api/port/set/<port>` | Set the ProPresenter API port. |

### Starting a Timer

The `/api/timers/start` endpoint accepts a JSON payload containing the section, speaker, and intended duration.

Example:

```json
{
    "section": "Sermon",
    "person": "Speaker Name",
    "minutes": 30,
    "seconds": 0
}
```

## Session Logging

Completed sessions are recorded in a CSV file (`timekeeping.csv`), allowing timing information to be reviewed after a service.

Recorded information includes:

- Section
- Speaker
- Intended duration
- Session date
- Start time
- Actual elapsed time

## Development Notes

- The application was developed and tested with ProPresenter's network functionality enabled.

<!-- - The specific ProPresenter version used during development has not been confirmed.
- The application runs successfully from a fresh installation.-->

## Future Improvements

Potential areas for improvement include:

- Automatic discovery of the ProPresenter API port.
- More robust error handling and connection feedback.
- Additional session history and reporting features.
- Automated tests for API endpoints and timekeeping functionality.
- Improved persistence and configuration management.
- Mock api to facilitate testing when Propresenter api unavailable.

## License

This project is not currently distributed under an open-source license. All rights are reserved by the author.