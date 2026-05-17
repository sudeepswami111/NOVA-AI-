# This program runs a local multi-model AI website for your MNIST model and future model connectors.
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


# This block reduces extra TensorFlow warning messages so the server output is easier to read.
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
import tensorflow as tf


# This block stores the important file and server settings in one easy-to-change place.
PROJECT_DIR = Path(__file__).parent
MODEL_PATH = PROJECT_DIR / "mnist_digit_model.keras"
HTML_PATH = PROJECT_DIR / "index.html"
HOST = "localhost"
PORT = 8000


# This block keeps the loaded digit model in memory after the first prediction.
digit_model = None


# This block describes every model shown in the website sidebar.
def get_models():
    digit_ready = MODEL_PATH.exists()

    return [
        {
            "id": "local-guide",
            "name": "Local Guide",
            "kind": "Text",
            "status": "ready",
            "details": "A small built-in assistant for this project."
        },
        {
            "id": "digit-recognizer",
            "name": "MNIST Digit Recognizer",
            "kind": "Vision",
            "status": "ready" if digit_ready else "needs_training",
            "details": "Your TensorFlow/Keras handwritten digit model."
        },
        {
            "id": "cloud-chat",
            "name": "GPT / Cloud Chat",
            "kind": "Text",
            "status": "not_connected",
            "details": "Connect an API key before using a cloud chat model."
        },
        {
            "id": "local-llm",
            "name": "Llama / Mistral",
            "kind": "Text",
            "status": "not_connected",
            "details": "Connect a local LLM server before using this model."
        },
        {
            "id": "image-generator",
            "name": "Stable Diffusion",
            "kind": "Image",
            "status": "not_connected",
            "details": "Connect an image generation server before using this model."
        },
        {
            "id": "speech-to-text",
            "name": "Whisper",
            "kind": "Audio",
            "status": "not_connected",
            "details": "Connect a speech recognition service before using this model."
        }
    ]


# This block loads the saved MNIST model from disk when the website needs a digit prediction.
def load_digit_model():
    global digit_model

    if digit_model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                "Model file not found. Run python neural_network.py first to create mnist_digit_model.keras."
            )

        digit_model = tf.keras.models.load_model(MODEL_PATH)

    return digit_model


# This block converts the 784 numbers from the website into the shape expected by the MNIST model.
def prepare_pixels(pixels):
    image = np.array(pixels, dtype="float32")

    if image.size != 784:
        raise ValueError("The image must contain exactly 784 pixels.")

    image = np.clip(image, 0.0, 1.0)
    image = image.reshape(1, 28, 28, 1)
    return image


# This block predicts a handwritten digit from the website drawing data.
def predict_digit(pixels):
    image = prepare_pixels(pixels)
    model = load_digit_model()
    prediction = model.predict(image, verbose=0)[0]

    digit = int(np.argmax(prediction))
    confidence = float(np.max(prediction))
    probabilities = [float(value) for value in prediction]

    return {
        "digit": digit,
        "confidence": confidence,
        "probabilities": probabilities
    }


# This block creates a simple project assistant response without needing an external API.
def local_guide_response(message):
    cleaned = message.strip().lower()

    if not cleaned:
        return "Ask me about your model, training, accuracy, website, or next integration step."

    if "digit" in cleaned or "mnist" in cleaned or "draw" in cleaned:
        return (
            "Your MNIST model is connected in the Vision workspace. Draw a digit, press Predict, "
            "and the backend will send a 28 by 28 grayscale image into mnist_digit_model.keras."
        )

    if "gpt" in cleaned or "chatgpt" in cleaned or "llama" in cleaned or "mistral" in cleaned:
        return (
            "This website has slots for cloud chat and local LLM models. To make them live, you need "
            "either an API key for a cloud model or a running local LLM server."
        )

    if "stable" in cleaned or "image" in cleaned:
        return (
            "The image generation slot is ready in the interface, but it needs a Stable Diffusion "
            "server or another image API before it can generate pictures."
        )

    if "whisper" in cleaned or "voice" in cleaned or "audio" in cleaned:
        return (
            "The speech-to-text slot is ready in the interface, but it needs a speech model backend "
            "before audio transcription will work."
        )

    if "accuracy" in cleaned or "train" in cleaned:
        return (
            "Train the model with python neural_network.py. When training finishes, it saves "
            "mnist_digit_model.keras, which this website loads for predictions."
        )

    return (
        "The fully working model in this app is your MNIST digit recognizer. The other model slots "
        "are prepared as honest connectors so you can add real APIs or local model servers next."
    )


# This block defines how the local website responds to browser requests.
class MultiModelHandler(BaseHTTPRequestHandler):
    # This block serves the main website and simple API data.
    def do_GET(self):
        if self.path in ["/", "/index.html"]:
            self.send_html()
            return

        if self.path == "/api/models":
            self.send_json({"models": get_models()})
            return

        self.send_error(404, "Page not found")

    # This block receives chat and model prediction requests from the website.
    def do_POST(self):
        try:
            data = self.read_json()

            if self.path in ["/api/digit", "/predict"]:
                self.send_json(predict_digit(data["pixels"]))
                return

            if self.path == "/api/chat":
                selected_model = data.get("model", "local-guide")
                message = data.get("message", "")
                self.send_json(handle_chat(selected_model, message))
                return

            self.send_error(404, "Page not found")
        except Exception as error:
            self.send_json({"error": str(error)}, status_code=400)

    # This block reads JSON data sent by the browser.
    def read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))
        request_body = self.rfile.read(content_length)
        return json.loads(request_body.decode("utf-8"))

    # This block sends the main HTML file to the browser.
    def send_html(self):
        html = HTML_PATH.read_text(encoding="utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    # This block sends JSON data back to the website.
    def send_json(self, data, status_code=200):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    # This block keeps the server output cleaner by hiding normal request log lines.
    def log_message(self, format, *args):
        return


# This block routes chat messages to the selected model connector.
def handle_chat(selected_model, message):
    if selected_model == "local-guide":
        return {
            "reply": local_guide_response(message),
            "status": "ready"
        }

    if selected_model == "digit-recognizer":
        return {
            "reply": "Use the drawing panel on the right for the MNIST model, then press Predict.",
            "status": "ready"
        }

    return {
        "reply": (
            "This model slot is not connected yet. The interface and backend route are ready, "
            "but this model needs an API key, a local model server, or a model file before it can run."
        ),
        "status": "not_connected"
    }


# This block starts the local multi-model website server.
if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), MultiModelHandler)
    print(f"AI model website running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop the website.")
    server.serve_forever()
