from app import createApp
import sys

app = createApp()

if __name__ == "__main__":
    app.run(debug=(len(sys.argv) > 1 and sys.argv[1] == "debug"))