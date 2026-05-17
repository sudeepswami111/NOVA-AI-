# This program trains a strong beginner-friendly neural network to recognize handwritten digits from MNIST.
import tensorflow as tf
import numpy as np


# This block makes the results more repeatable when you run the program more than once.
tf.keras.utils.set_random_seed(42)


# This block loads the MNIST dataset, which contains handwritten digit images and their correct labels.
# TensorFlow downloads the data automatically the first time you run this file.
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()


# This block changes pixel values from 0-255 into 0-1 so the model can learn faster and more reliably.
x_train = x_train.astype("float32") / 255.0
x_test = x_test.astype("float32") / 255.0


# This block adds one color channel because CNN layers expect images shaped like height, width, and channels.
x_train = np.expand_dims(x_train, axis=-1)
x_test = np.expand_dims(x_test, axis=-1)


# This block prints the data shapes so beginners can see exactly what is being sent into the model.
print("Training images shape:", x_train.shape)
print("Training labels shape:", y_train.shape)
print("Test images shape:", x_test.shape)
print("Test labels shape:", y_test.shape)


# This block builds a stronger image model using simple CNN layers that learn patterns like edges and curves.
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(28, 28, 1)),

    tf.keras.layers.RandomRotation(0.08),
    tf.keras.layers.RandomTranslation(0.08, 0.08),
    tf.keras.layers.RandomZoom(0.08),

    tf.keras.layers.Conv2D(32, kernel_size=(3, 3), activation="relu", padding="same"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Conv2D(32, kernel_size=(3, 3), activation="relu", padding="same"),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
    tf.keras.layers.Dropout(0.25),

    tf.keras.layers.Conv2D(64, kernel_size=(3, 3), activation="relu", padding="same"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Conv2D(64, kernel_size=(3, 3), activation="relu", padding="same"),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
    tf.keras.layers.Dropout(0.25),

    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.40),
    tf.keras.layers.Dense(10, activation="softmax")
])


# This block tells the model how to learn, how to measure mistakes, and what score to report.
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# This block trains the model for 10 epochs and shows progress after each epoch.
print("\nTraining the model...")
history = model.fit(
    x_train,
    y_train,
    epochs=10,
    validation_split=0.2,
    batch_size=128,
    verbose=1
)


# This block tests the trained model on images it did not see during training.
print("\nEvaluating the model on test data...")
test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
print(f"Final test accuracy: {test_accuracy:.4f} ({test_accuracy * 100:.2f}%)")


# This block asks the model to predict one test image and compares the prediction with the real label.
sample_index = 0
sample_image = x_test[sample_index:sample_index + 1]
sample_prediction = model.predict(sample_image, verbose=0)
predicted_label = int(np.argmax(sample_prediction[0]))
actual_label = int(y_test[sample_index])
confidence = float(np.max(sample_prediction[0]))

print(f"Sample prediction: {predicted_label}")
print(f"Actual label: {actual_label}")
print(f"Prediction confidence: {confidence:.4f} ({confidence * 100:.2f}%)")


# This block prints the validation accuracy from the last epoch so you can compare training and testing.
final_validation_accuracy = history.history["val_accuracy"][-1]
print(f"Final validation accuracy: {final_validation_accuracy:.4f} ({final_validation_accuracy * 100:.2f}%)")


# This block saves the trained model so the website can load it later and make predictions.
model.save("mnist_digit_model.keras")
print("Model saved as mnist_digit_model.keras")


# This block prints a summary of the model architecture so you can see each layer and its parameters.
print("\nModel architecture summary:")
model.summary()
